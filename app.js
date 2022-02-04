// Load validated Config object from config.js (which uses dotenv to read from the local .env file)
const { EnvVars } = require('./configs/environment_variables')
const { Fields } = require('./configs/fields')

// Load Bolt app, a Slack application framework which wraps Express
const { App } = require('@slack/bolt')

// Load Airtable.js, a wrapper for the Airtable API
const Airtable = require('airtable')

// Load helper functions
const modalBlocks = require('./views/modals')
const messageBlocks = require('./views/messages')
const appHomeBlocks = require('./views/app_home')

/*
This sample slack application uses SocketMode
For the companion getting started setup guide,
see: https://slack.dev/bolt-js/tutorial/getting-started
*/

// Initializes your app with your bot token and app token
const app = new App({
  socketMode: true,
  token: EnvVars.SLACK_BOT_TOKEN,
  appToken: EnvVars.SLACK_APP_TOKEN,
  logLevel: EnvVars.LOG_LEVEL || 'debug'
})

// Initialize Airtable client
const airtableClient = new Airtable({ apiKey: EnvVars.AIRTABLE_API_KEY })
const airtableBase = airtableClient.base(EnvVars.AIRTABLE_BASE_ID)
const airtableTable = airtableBase(EnvVars.AIRTABLE_TABLE_ID)

// == HELPER FUNCTIONS ==
// Extract values from view submission payload
const extractInputsFromViewSubmissionPayload = ({ view }) => {
  const fieldsWithValues = {}

  // Loop through all values we received from Slack and extract the value depending on field type
  Object.keys(view.state.values).forEach((fieldName) => {
    // fieldName represents the Slack view block_id and action_id (we use the Fields' object key for both)
    const inputReceived = view.state.values[fieldName][fieldName]

    // Make a copy of the field config
    const fieldConfig = Object.assign({}, Fields.get(fieldName))

    // TODO support additional Slack input element types (https://api.slack.com/reference/block-kit/blocks#input)
    switch (inputReceived.type) {
      case 'plain_text_input':
        fieldConfig.value = inputReceived.value
        break
      case 'static_select':
        fieldConfig.value = inputReceived.selected_option.value
        break
    }

    // Add the field config to the fieldsWithValues object
    fieldsWithValues[fieldName] = fieldConfig
  })

  return fieldsWithValues
}

// Validate inputs and return error object
const validateInputs = (fieldsWithValues) => {
  const errors = {}

  // Loop through all fields validate the value (if a validation function is defined)
  for (const fieldName of Object.keys(fieldsWithValues)) {
    const fieldConfigWithValue = fieldsWithValues[fieldName]
    if (fieldConfigWithValue.validationFn) {
      const validationError = fieldConfigWithValue.validationFn(fieldConfigWithValue.value)
      if (validationError !== true) { // true means no error
        errors[fieldName] = validationError
      }
    }
  }

  return errors
}

// == SLACK BOLT LISTENERS ==
// Listen for 'File a bug' global shortcut
app.shortcut('create_record_from_global_shortcut', async ({ shortcut, ack, client }) => {
  // Acknowledge shortcut request
  await ack()

  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: modalBlocks.createRecordForm(Fields)
  })
})

// Listen for 'File a bug' message shortcut
app.shortcut('create_record_from_message_shortcut', async ({ ack, shortcut, client }) => {
  await ack()

  // Create a copy of the Fields map and prefill it with the value from the message shortcut
  const copyOfFieldsWithPrefill = new Map(Fields)
  // TODO abstract out 'long_description' fieldName
  copyOfFieldsWithPrefill.set('long_description', { value: shortcut.message.text, ...Fields.get('long_description') })

  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: modalBlocks.createRecordForm(copyOfFieldsWithPrefill)
  })
})

// Listen for form/modal submission
app.view('create_record_submission', async ({ ack, body, view, client, logger }) => {
  // Extract values from view submission payload and validate them/generate errors
  const fieldsWithValues = await extractInputsFromViewSubmissionPayload({ view })
  const errors = validateInputs(fieldsWithValues)
  logger.debug({ fieldsWithValues, errors })

  // If there are errors, respond to Slack with errors; otherwise, respond with a confirmation
  if (Object.keys(errors).length > 0) {
    await ack({
      response_action: 'errors',
      errors
    })
  } else {
    // If there are no errors, close the modal and DM the user a confirmation
    await ack()

    const dmToSubmitter = await client.chat.postMessage({
      channel: body.user.id,
      text: 'Thanks for your bug report! We will triage it ASAP.',
      blocks: messageBlocks.initialMessageToSubmitter(fieldsWithValues)
    })

    // Create object to be inserted into Airtable table
    // TODO - refactor to not use literal strings for Airtable field names
    const newRecordFields = {
      'Short description': fieldsWithValues.short_description.value,
      'Long description': fieldsWithValues.long_description.value,
      Priority: fieldsWithValues.priority.value,
      'Submitter Slack UID': body.user.id,
      'Submitter Slack Name': body.user.name
    }

    // Depending on success/failure from Airtable API, update DM to submitter
    let updateToSubmitter = ''
    try {
      const newRecord = await airtableTable.create([{ fields: newRecordFields }])
      const newRecordId = newRecord[0].getId()
      const newRecordPrimaryFieldValue = newRecord[0].get(EnvVars.AIRTABLE_PRIMARY_FIELD_NAME)
      updateToSubmitter = messageBlocks.successfullySavedToAirtable(EnvVars.AIRTABLE_BASE_ID, EnvVars.AIRTABLE_TABLE_ID, newRecordId, newRecordPrimaryFieldValue)
    } catch (error) {
      updateToSubmitter = messageBlocks.simpleMessage(`:bangbang: Sorry, but an error occured while sending your record details to Airtable. \nError details: \`\`\`${JSON.stringify(error, null, 2)} \`\`\``)
    }

    // Thread update to DM thread
    await client.chat.postMessage({
      channel: dmToSubmitter.channel,
      thread_ts: dmToSubmitter.ts,
      blocks: updateToSubmitter,
      unfurl_links: false,
      reply_broadcast: true // send threaded reply to channel so the user sees it
    })
  }
})

// Listen for users opening App Home
app.event('app_home_opened', async ({ event, client }) => {
  // Publish App Home view
  await client.views.publish({
    user_id: event.user,
    view: {
      type: 'home',
      blocks: appHomeBlocks(EnvVars.AIRTABLE_BASE_ID, EnvVars.AIRTABLE_TABLE_ID)
    }
  })
})

// Listen for users clicking the 'File a bug' button from App Home
app.action('create_record', async ({ ack, body, client }) => {
  await ack()

  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  await client.views.open({
    trigger_id: body.trigger_id,
    view: modalBlocks.createRecordForm(Fields)
  })
})

// Listen for users clicking a button that opens a URL
//   Without this, Slack will show a /!\ warning icon next to buttons
app.action('url_button', async ({ ack }) => {
  await ack()
})

// Listen for users clicking the 'Delete' button from their DMs
app.action('delete_record', async ({ ack, action, respond, body, logger }) => {
  await ack()
  const recordId = action.value

  // Attempt to delete record from Airtable
  let blocks = []
  try {
    const recordBeforeDeletion = await airtableTable.find(recordId)
    await recordBeforeDeletion.destroy()
    logger.debug({ recordBeforeDeletion })
    blocks = messageBlocks.simpleMessage(`Record \`${recordBeforeDeletion.get(EnvVars.AIRTABLE_PRIMARY_FIELD_NAME)}\` (${recordId}) was successfully deleted. \n\nYou can recover deleted records from your <https://support.airtable.com/hc/en-us/articles/115014104628-Base-trash|base trash> for a limited amount of time.`)
  } catch (error) {
    blocks = messageBlocks.simpleMessage(`<@${body.user.id}> There was an error deleting this record (it may have been already deleted by someone else): \`\`\`${JSON.stringify(error, null, 2)} \`\`\``)
  }

  // Respond by deleting the original message and adding a new message to the thread
  await respond({
    blocks,
    replace_original: false,
    delete_original: true,
    response_type: 'in_channel',
    thread_ts: body.message.thread_ts
  })
})

// Listen for users clicking the 'Edit' button from their DMs
app.action('edit_record', async ({ ack, action, client, body }) => {
  await ack()

  // Retrieve latest record values from Airtable
  const recordId = action.value
  const recordBeforeEditing = await airtableTable.find(recordId)

  const privateMetadataAsString = JSON.stringify({ recordId, channelId: body.channel.id, threadTs: body.message.thread_ts })

  // Create a copy of the Fields map and prefill it with the value from the message shortcut
  const copyOfFieldsWithPrefill = new Map(Fields)

  Fields.forEach((fieldConfig, fieldName) => {
    const currentAirtableValue = recordBeforeEditing.get(fieldConfig.airtableFieldName)
    // If there is a value for the current field in the latest version of the record, prefill it
    if (currentAirtableValue) {
      copyOfFieldsWithPrefill.set(fieldName, {
        ...fieldConfig,
        value: currentAirtableValue
      })
    }
  })

  // Open modal and prefill values
  await client.views.open({
    trigger_id: body.trigger_id,
    view: modalBlocks.updateRecordForm(copyOfFieldsWithPrefill, privateMetadataAsString)
  })
})

// Listen for form/modal submission
app.view('update_record_submission', async ({ ack, body, view, client, logger }) => {
  // Extract user-submitted values from view submission object
  const privateMetadataAsString = view.private_metadata
  const { recordId, channelId, threadTs } = JSON.parse(privateMetadataAsString)

  // Extract values from view submission payload and validate them/generate errors
  const fieldsWithValues = await extractInputsFromViewSubmissionPayload({ view })
  const errors = validateInputs(fieldsWithValues)
  logger.debug({ fieldsWithValues, errors })

  // If there are errors, respond to Slack with errors; otherwise, respond with a confirmation
  if (Object.keys(errors).length > 0) {
    await ack({
      response_action: 'errors',
      errors
    })
  } else {
    // If there are no errors, close the modal and update the thread
    await ack()

    // TODO add information about the updated fields values
    await client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: `Your request to update this record (${recordId}) has been received and is being processed.`
    })

    // Update Airtable record
    // TODO - refactor to not use literal strings for Airtable field names
    const fieldsToUpdate = {
      'Short description': fieldsWithValues.short_description.value,
      'Long description': fieldsWithValues.long_description.value,
      Priority: fieldsWithValues.priority.value
    }

    // Depending on success/failure from Airtable API, update DM to submitter
    let updateToSubmitter = ''
    try {
      await airtableTable.update(recordId, fieldsToUpdate)
      updateToSubmitter = messageBlocks.simpleMessage(':white_check_mark: Your record has been updated.')
    } catch (error) {
      updateToSubmitter = messageBlocks.simpleMessage(`:bangbang: Sorry, but an error occured while updating your <https://airtable.com/${EnvVars.AIRTABLE_BASE_ID}/${EnvVars.AIRTABLE_TABLE_ID}/${recordId}|record> details in Airtable. \nError details: \`\`\`${JSON.stringify(error, null, 2)} \`\`\``)
    }

    // Thread update to DM thread
    await client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      blocks: updateToSubmitter,
      unfurl_links: false,
      reply_broadcast: true // send threaded reply to channel
    })
  }
})

// == START SLACK APP SERVER ==
;(async () => {
  // Test connection to Airtable before starting Bolt
  try {
    await airtableTable.select({ maxRecords: 1 }).all()
    app.client.logger.info('✅  Connected to Airtable')
  } catch (error) {
    app.client.logger.error('❌  Bolt NOT started; there was an error connecting to Airtable: ', error)
    process.exit(1)
  }

  // Start Bolt app
  await app.start()
  app.client.logger.info('✅  Slack Bolt app is running!')
})()
