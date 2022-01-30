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
