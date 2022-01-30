// Load environment variables from your .env file (if it exists)
require('dotenv').config();

const { App } = require('@slack/bolt');

/* 
This sample slack application uses SocketMode
For the companion getting started setup guide, 
see: https://slack.dev/bolt-js/tutorial/getting-started 
*/

// Initializes your app with your bot token and app token
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

// Listens to incoming messages that contain "hello"
app.message(/.+/, async ({ message, say }) => {
  // say() sends a message to the channel where the event was triggered
  await say({
    blocks: [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `Hey there <@${message.user}>!`
        },
        // "accessory": {
        //   "type": "button",
        //   "text": {
        //     "type": "plain_text",
        //     "text": "Click Me"
        //   },
        //   "action_id": "button_click"
        // }
      }
    ],
    text: `Hey there <@${message.user}>!`
  });
});

// app.action('button_click', async ({ body, ack, say }) => {
//   // Acknowledge the action
//   await ack();
//   await say(`<@${body.user.id}> clicked the button`);
// });

(async () => {
  // Start your app
  await app.start();

  console.log('⚡️ Bolt app is running!');
})();