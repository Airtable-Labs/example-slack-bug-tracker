// Load validated Config object from config.js (which uses dotenv to read from the local .env file)
const { EnvVars } = require('./configs/environment_variables')
const { Fields, SystemFields } = require('./configs/fields')

// Load Bolt app, a Slack application framework which wraps Express
const { App } = require('@slack/bolt')

// Load Airtable.js, a wrapper for the Airtable API
const Airtable = require('airtable')

// Load util stdlib for full object logging
const util = require('util')

// Load helper functions
const helpers = require('./helpers')
const modals = require('./views/modals')
const messages = require('./views/messages')
const appHome = require('./views/app_home')

// Call some helper functions in preparation for runtime
const fieldToPrefillForMessageShortcut = helpers.determineFieldNameForMessageShortcutPrefill(Fields)

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

// == SLACK BOLT LISTENERS ==
// Listen for global shortcut
app.shortcut('create_record_from_global_shortcut', async ({ shortcut, ack, client }) => {
  // Acknowledge shortcut request
  await ack()

  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  const view = modals.createRecordForm(Fields)
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view
  })
})

// Listen for message shortcut
app.shortcut('create_record_from_message_shortcut', async ({ ack, shortcut, client }) => {
  await ack()

  // Create a copy of the Fields map and prefill it with the value from the message shortcut
  const copyOfFieldsWithPrefill = new Map(Fields)
  copyOfFieldsWithPrefill.set(fieldToPrefillForMessageShortcut, { value: shortcut.message.text, ...Fields.get(fieldToPrefillForMessageShortcut) })

  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  const view = modals.createRecordForm(copyOfFieldsWithPrefill)
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view
  })
})

// Listen for form/modal submission
app.view('create_record_submission', async ({ ack, body, view, client, logger }) => {
  // Extract values from view submission payload and validate them/generate errors
  const fieldsWithValues = await helpers.extractInputsFromViewSubmissionPayload({ view }, Fields)
  const errors = helpers.validateInputs(fieldsWithValues)
  logger.debug({ fieldsWithValues, errors })

  // If there are errors, respond to Slack with errors; otherwise, respond with a confirmation
  if (Object.keys(errors).length > 0) {
    await ack({
      response_action: 'errors',
      errors
    })
  } else {
    // If there are no validation errors, close the modal and DM the user a confirmation
    await ack()

    const { blocks: recordCreationRequestReceivedBlocks } = messages.recordCreationRequestReceived(fieldsWithValues, body.user.id)
    const initialDmToSubmitter = await client.chat.postMessage({
      channel: body.user.id,
      blocks: recordCreationRequestReceivedBlocks
    })

    // Create object to be inserted into Airtable table
    // Start with fields that are not editable by Slack users
    const newRecordFields = {
      [SystemFields.get('submitter_slack_uid').airtableFieldName]: body.user.id,
      [SystemFields.get('submitter_slack_name').airtableFieldName]: body.user.name
    }
    // Add fields from view submission payload
    Object.keys(fieldsWithValues).forEach((fieldName) => {
      const fieldWithValue = fieldsWithValues[fieldName]
      newRecordFields[fieldWithValue.airtableFieldName] = fieldWithValue.value
    })

    // Depending on success/failure from Airtable API, update DM to submitter
    let recordCreationResultBlocks
    try {
      const newRecord = await airtableTable.create([{ fields: newRecordFields }])
      const newRecordId = newRecord[0].getId()
      const newRecordPrimaryFieldValue = newRecord[0].get(EnvVars.AIRTABLE_PRIMARY_FIELD_NAME)
      recordCreationResultBlocks = messages.recordCreationSuccessful(EnvVars.AIRTABLE_BASE_ID, EnvVars.AIRTABLE_TABLE_ID, newRecordId, newRecordPrimaryFieldValue).blocks
    } catch (error) {
      recordCreationResultBlocks = messages.simpleMessage(`:bangbang: An error occured while saving your record to Airtable: ${helpers.objectStringifiedAsMardownCodeBlock(error)}`).blocks
    }

    // Update initial DM to submitter
    recordCreationRequestReceivedBlocks.pop() // remove last block
    const updatedRecordCreationRequestReceivedBlocks = recordCreationRequestReceivedBlocks.concat(recordCreationResultBlocks)
    await client.chat.update({
      channel: initialDmToSubmitter.channel,
      ts: initialDmToSubmitter.ts,
      blocks: updatedRecordCreationRequestReceivedBlocks
    })
  }
})

// Listen for users opening App Home
app.event('app_home_opened', async ({ event, client }) => {
  // Publish App Home view
  const view = appHome(EnvVars.AIRTABLE_BASE_ID, EnvVars.AIRTABLE_TABLE_ID)
  await client.views.publish({
    user_id: event.user,
    view
  })
})

// Listen for users clicking the new record button from App Home
app.action('create_record', async ({ ack, body, client }) => {
  await ack()

  const view = modals.createRecordForm(Fields)
  await client.views.open({
    trigger_id: body.trigger_id,
    view
  })
})

// Listen for users clicking a button that opens a URL
//   Without this, Slack will show a /!\ warning icon next to buttons
app.action('url_button', async ({ ack }) => {
  await ack()
})

// Listen for users clicking the 'Delete' button from their DMs
app.action('delete_record', async ({ ack, action, client, body, logger }) => {
  await ack()
  const recordId = action.value

  // Attempt to delete record from Airtable
  try {
    // Get current values before deleting the record
    const recordBeforeDeletion = await airtableTable.find(recordId)

    // Attempt to delete the record
    await recordBeforeDeletion.destroy()

    // If successful, update the parent message to user by removing action buttons
    const updatedBlocksForOriginalMessage = body.message.blocks.slice(0, 2) // TODO improve this to be less dependent on the number of blocks
    const { blocks: recordDeletionSuccessfulBlocks } = messages.simpleMessage(`:ghost: Record *${recordBeforeDeletion.get(EnvVars.AIRTABLE_PRIMARY_FIELD_NAME)}* (${recordId}) was successfully deleted. You can recover deleted records from your <https://support.airtable.com/hc/en-us/articles/115014104628-Base-trash|base trash> for a limited amount of time.`)
    updatedBlocksForOriginalMessage.push(...recordDeletionSuccessfulBlocks)
    await client.chat.update({
      blocks: updatedBlocksForOriginalMessage,
      channel: body.channel.id,
      ts: body.message.ts
    })
  } catch (error) {
    // If not successful, thread a message to the user with the error
    const { blocks: recordDeletionFailedBlocks } = messages.simpleMessage(`<@${body.user.id}> An error occured while trying to delete this record (it may have been already deleted by someone else): ${helpers.objectStringifiedAsMardownCodeBlock(error)}`)
    await client.chat.postMessage({
      blocks: recordDeletionFailedBlocks,
      channel: body.channel.id,
      thread_ts: body.message.ts
    })
  }
})

// Listen for users clicking the 'Edit' button from their DMs
app.action('edit_record', async ({ ack, action, client, body, logger }) => {
  await ack()

  // Retrieve latest record values from Airtable
  const recordId = action.value

  let view
  try {
    // Try to retrieve the record from Airtable and generate blocks
    const recordBeforeEditing = await airtableTable.find(recordId)
    const privateMetadataAsString = JSON.stringify({ recordId, channelId: body.channel.id, threadTs: body.message.ts })

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
    view = modals.updateRecordForm(copyOfFieldsWithPrefill, privateMetadataAsString)
  } catch (error) {
    view = modals.simpleMessage(`:bangbang: Sorry, but an error occured and this record cannot be edited at this time. Most likely, the record has been deleted. Error details: ${helpers.objectStringifiedAsMardownCodeBlock(error)}`)
  }

  // Open modal
  await client.views.open({
    trigger_id: body.trigger_id,
    view
  })
})

// Listen for form/modal submission
app.view('update_record_submission', async ({ ack, body, view, client, logger }) => {
  // Extract user-submitted values from view submission object
  const privateMetadataAsString = view.private_metadata
  const { recordId, channelId, threadTs } = JSON.parse(privateMetadataAsString)

  // Extract values from view submission payload and validate them/generate errors
  const fieldsWithValues = await helpers.extractInputsFromViewSubmissionPayload({ view }, Fields)
  const errors = helpers.validateInputs(fieldsWithValues)
  logger.debug({ fieldsWithValues, errors })

  // If there are errors, respond to Slack with errors; otherwise, respond with a confirmation
  if (Object.keys(errors).length > 0) {
    await ack({
      response_action: 'errors',
      errors
    })
  } else {
    // If there are no validation errors, close the modal and update the thread
    await ack()

    const { blocks: recordUpdateRequestReceived } = messages.recordUpdateRequestReceived(fieldsWithValues)
    await client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      blocks: recordUpdateRequestReceived
    })

    // Determine payload for Airtable record update
    const fieldsToUpdate = {
      [SystemFields.get('updater_slack_uid').airtableFieldName]: body.user.id,
      [SystemFields.get('updater_slack_uid').airtableFieldName]: body.user.name
    }
    Object.keys(fieldsWithValues).forEach((fieldName) => {
      const fieldWithValue = fieldsWithValues[fieldName]
      fieldsToUpdate[fieldWithValue.airtableFieldName] = fieldWithValue.value
    })

    // Depending on success/failure from Airtable API, send DM to submitter (to existing thread)
    let updateToSubmitter
    try {
      const updatedRecord = await airtableTable.update(recordId, fieldsToUpdate)
      updateToSubmitter = messages.simpleMessage(`:white_check_mark: Your <https://airtable.com/${EnvVars.AIRTABLE_BASE_ID}/${EnvVars.AIRTABLE_TABLE_ID}/${recordId}|record> has been updated. The primary field value is now *${updatedRecord.get(EnvVars.AIRTABLE_PRIMARY_FIELD_NAME)}*`).blocks
    } catch (error) {
      updateToSubmitter = messages.simpleMessage(`:bangbang: An error occured while updating your <https://airtable.com/${EnvVars.AIRTABLE_BASE_ID}/${EnvVars.AIRTABLE_TABLE_ID}/${recordId}|record> details in Airtable:  ${helpers.objectStringifiedAsMardownCodeBlock(error)}`).blocks
    }

    // Thread update to DM thread
    await client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      blocks: updateToSubmitter,
      unfurl_links: false
    })
  }
})

app.error((error) => {
  console.error('An error was caught by Bolt app.error:')
  console.log(util.inspect(error, false, null, true))
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
