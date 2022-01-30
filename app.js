// Load environment variables from your .env file (if it exists)
require('dotenv').config()

// Load Bolt app, a Slack application framework which wraps Express
const { App } = require('@slack/bolt')

// Load Airtable.js, a wrapper for the Airtable API
const Airtable = require('airtable')

// Load helper functions
const { fileABugModalPayload } = require('./views/modals')
const { messageToSubmitter } = require('./views/messages')

/*
This sample slack application uses SocketMode
For the companion getting started setup guide,
see: https://slack.dev/bolt-js/tutorial/getting-started
*/

// Initializes your app with your bot token and app token
const app = new App({
  socketMode: true,
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: process.env.LOG_LEVEL || 'debug'
})

// Initialize Airtable client
const airtableClient = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
const airtableBase = airtableClient.base(process.env.AIRTABLE_BASE_ID)
const airtableTable = airtableBase(process.env.AIRTABLE_TABLE_NAME_OR_ID)

// Listen for 'File a bug' global shortcut
app.shortcut('fileABugGlobalShortcut', async ({ shortcut, ack, client, logger }) => {
  // Acknowledge shortcut request
  await ack()

  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: fileABugModalPayload()
  })
})

// Listen for 'File a bug' message shortcut
app.shortcut('fileABugMessageShortcut', async ({ shortcut, ack, client, logger }) => {
  // Acknowledge shortcut request
  await ack()

  logger.debug({ shortcut })
  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: fileABugModalPayload(shortcut.message.text)
  })
})

// Listen for form/modal submission
app.view('fileABugModal', async ({ ack, body, view, client, logger, respond }) => {
  // Extract user-submitted values from view submission object
  const {
    block_title: { input_title: { value: title } },
    block_priority: { input_priority: { selected_option: { value: priority } } },
    block_description: { input_description: { value: description } }
  } = view.state.values
  logger.debug('User submitted values: ', { title, priority, description })

  // Validate inputs
  const errors = {}
  if (description.length < 10) {
    errors.block_description = 'Description must be at least 10 characters'
  }

  // If there are errors, respond to Slack with errors; otherwise, respond with a confirmation
  if (Object.keys(errors).length > 0) {
    console.warn('errors: ', errors)
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
      blocks: messageToSubmitter(title, priority)
    })
    // Add work-in-progress reaction
    await client.reactions.add({
      channel: dmToSubmitter.channel,
      name: 'construction',
      timestamp: dmToSubmitter.ts
    })
    // Thread full description to DM thread (in case submission fails)
    await client.chat.postMessage({
      channel: dmToSubmitter.channel,
      thread_ts: dmToSubmitter.ts,
      text: '*Description:* \n> ' + description.split('\n').join('\n> ')
    })

    // Create object to be inserted into Airtable table
    const newRecordFields = {
      'Short description': title,
      'Long description': description,
      Priority: priority,
      'Submitter Slack UID': body.user.id,
      'Submitter Slack Name': body.user.name
    }

    // Depending on success/failure from Airtable API, update DM to submitter
    let updateToSubmitter = ''
    let reactionToAdd = ''
    try {
      const newRecord = await airtableTable.create([{ fields: newRecordFields }])
      const newRecordUrl = newRecord[0].get('AT Record URL')
      updateToSubmitter = `:white_check_mark: Your bug report has been submitted. You can view it <${newRecordUrl}|here>`
      reactionToAdd = 'white_check_mark'
    } catch (error) {
      updateToSubmitter = `:x: <@${body.user.id}> Sorry, but an error occured while sending your report to Airtable. \nError details: \`\`\`${JSON.stringify(error, null, 2)}\`\`\``
      reactionToAdd = 'x'
    }

    // Thread update to DM thread
    await client.chat.postMessage({
      channel: dmToSubmitter.channel,
      thread_ts: dmToSubmitter.ts,
      text: updateToSubmitter
    })

    // Add reaction to DM thread (and remove work-in-progress reaction)
    await client.reactions.add({
      channel: dmToSubmitter.channel,
      name: reactionToAdd,
      timestamp: dmToSubmitter.ts
    })
    await client.reactions.remove({
      channel: dmToSubmitter.channel,
      name: 'construction',
      timestamp: dmToSubmitter.ts
    })
  }
})

// Listens to any incoming messages
app.message(/.+/, async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `Hey there <@${message.user}>!`
        }
      }
    ],
    text: `Hey there <@${message.user}>!`
  })
});

(async () => {
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
