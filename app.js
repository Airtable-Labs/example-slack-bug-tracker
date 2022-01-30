// Load environment variables from your .env file (if it exists)
require('dotenv').config()

const { App } = require('@slack/bolt')
const { fileABugModalPayload } = require('./views/modals')
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

// Listen for 'File a bug' global shortcut
app.shortcut('globalShortcut_featureRequest', async ({ shortcut, ack, client, logger }) => {
  // Acknowledge shortcut request
  await ack()

  // Open modal using WebClient passed in from middleware.
  //   Uses modal defintion from views/modals.js
  await client.views.open({
    trigger_id: shortcut.trigger_id,
    view: fileABugModalPayload()
  })
})

// Listen for form/modal submission
app.view('fileABugModal', async ({ ack, body, view, client, logger, respond }) => {
  // Extract user-submitted values from view submission object
  const {
    block_priority: { input_priority: { selected_option: { value: priority } } },
    block_title: { input_title: { value: title } },
    block_description: { input_description: { value: description } }
  } = view.state.values
  logger.debug('User submitted values: ', { priority, title, description })

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
      text: 'Thanks for your bug report! We will triage it ASAP.' + '\n' + '\n' +
            '*Priority:* ' + priority + '\n' +
            '*Title:* ' + title + '\n' +
            '*Description:* \n> ' + description.split('\n').join('\n> ')
    })
  }

  // TODO: Save form response to Airtable
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

// app.action('button_click', async ({ body, ack, say }) => {
//   // Acknowledge the action
//   await ack();
//   await say(`<@${body.user.id}> clicked the button`);
// });

(async () => {
  // Start your app
  await app.start()

  console.log('⚡️ Bolt app is running!')
})()
