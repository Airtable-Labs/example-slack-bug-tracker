# Example Airtable+Slack App: Bug Tracker

## Overview

This is an example [Slack App](https://api.slack.com/) app built with the [Bolt for JavaScript framework](https://slack.dev/bolt-js) that has a [Global Shortcut](https://api.slack.com/interactivity/shortcuts/using#global_shortcuts) which displays a [modal](https://api.slack.com/surfaces/modals#:~:text=Modals%20provide%20focused%20spaces%20ideal,of%20any%20other%20interface%20element.) (aka form). Form submissions undergo validation and are sent to an [Airtable](https://airtable.com) base using [airtable.js](https://github.com/airtable/airtable.js) to call [Airtable's REST API](https://support.airtable.com/hc/en-us/articles/203313985-Public-REST-API).

The example code makes use of Slack [Socket Mode](https://api.slack.com/apis/connections/socket) which uses WebSockets (instead of HTTP) to receive events from Slack.

This app has a few entry points and features to help you quickly send information to Airtable without leaving Slack:

| Name and Description 	| Visual 	|
|------------------------	|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------	|
| **1. Global Shortcut** ⚡️ <br> You can use the global shortcut :zap: to file a bug from almost anywhere in Slack.     <ol type="a"><li>Trigger the modal with a [global shortcut](https://slackhq.com/speed-up-work-with-apps-for-slack) and enter your bug report in the form</li><li>Submitted values will be validated</li><li>The bot will send you a confirmation DM and let you know if any errors occured</li></ol> 	| [![](docs/global_shortcut.gif)](docs/global_shortcut.gif) |
| **2. Message Shortcut** 💬<br> You can also open the form by acting on a message using the [Message Shortcut](https://slack.com/help/articles/360004063011-Work-with-apps-in-Slack-using-shortcuts#message-shortcuts). The message you selected will be used to populate the details text area. 	| [![](docs/message_shortcut.gif)](docs/message_shortcut.gif) |
| **3. App Home** 🏡<br> Visit the app's [App Home](https://api.slack.com/surfaces/tabs) for buttons to file a new bug or open the Airtable base in a browser.	| [![](docs/app_home.png)](docs/app_home.png) |

---

The software made available from this repository is not supported by Formagrid Inc (Airtable) or part of the Airtable Service. It is made available on an "as is" basis and provided without express or implied warranties of any kind.

---

## Running locally

### 0. Setup or identify your "Bugs" table in Airtable

The example code in this project expects the Airtable table you specify (in the next step) to have the following fields: `Short description` (single line text), `Long description` (long text), `Priority` (single select), `Submitter Slack UID` (single line text), and `Submitter Slack Name` (single line text).

You can copy [this sample table](https://airtable.com/shrUnY5ULVeIcOfFr) into your own base if you'd like. Pointers on how which code to modify to adapt this example are below. It's recommended you use this exact schema for your initial test of the example code.


### 1. Create a new Slack App

1. Visit https://api.slack.com/apps
2. Click **Create New App**
3. Select **From an app manifest**
4. Choose a workspace
5. Copy and paste the contents of this repo's [`manifest.yaml`](manifest.yaml) into the textarea
6. Click **Create**
7. You now have a new Slack app and it's time to install it. Click **Install to Workspace** and follow the prompts to **Allow** your new app to be installed to the workspace you chose in step 4.
8. Finally, scroll to the bottom of the **Basic Information** page for your app and click **Generate Token and Scopes**. 
    - Name your app-token something descriptive such as "local dev"
    - Add the two scopes (`connections:write` and `authorizations:read`)
    - Click **Generate**

You now have a Slack app installed into your workspace with a bot token and app-level token you'll need in the next step.

### 2. Setup environment variables

Copy `.env.example` to `.env` and paste your unique values:

```zsh
cp .env.example .env
```

The environment variables you'll need to define in your new `.env` filer are:

```zsh
## Slack...
# Bot token from the 'OAuth & Permissions' > 'OAuth Tokens for Your Workspace' section of your Slack app config off of api.slack.com/apps
SLACK_BOT_TOKEN=xoxb-...
# App token from the 'Basic Information' > 'App-Level Tokens' section of your Slack app config off of api.slack.com/apps
SLACK_APP_TOKEN=xapp-...

## Airtable...
# API key from https://airtable.com/account
AIRTABLE_API_KEY=key...
# Base ID from API docs or https://support.airtable.com/hc/en-us/articles/4405741487383
AIRTABLE_BASE_ID=app...
# Table ID from https://support.airtable.com/hc/en-us/articles/4405741487383
AIRTABLE_TABLE_ID=tbl...

LOG_LEVEL=info # error, warn, info, and debug are valid options
```

### 3. Setup your local project

From your terminal...

1. Clone this project onto your machine
    ```zsh
    git clone https://github.com/airtable-labs/example-slack-bug-tracker.git
    ```

2. Change directory into the project and install dependencies
    ```zsh
    cd example-slack-bug-tracker/ && npm install
    ```

### 4. Start the server to listen for events from Slack
1. From your terminal, run:
    ```zsh
    npm run start
    ```

2. You should see output that looks like the following:
    ```zsh
    [INFO]  web-api:WebClient:0 ✅  Connected to Airtable
    [INFO]  web-api:WebClient:0 ✅  Slack Bolt app is running!
    ```

### 5. Test

Your app should be ready to try from Slack 🚀. Check out the Global Shortcut ⚡️, Message Shortcut 💬, and App Home 🏡!

### 6. Iterate and develop
- You can run `npm run watch` (instead of `npm run start`) to have `nodemon` watch code files for changes and automatically restart the server for a quicker iterating.
- To change the fields in the form, update `views/modals.js` and `views/message.js` to include valid Block Kit JSON (as Node objects) and update the `app.shortcut` listeners in `app.js` to expect and use the new Slack BlockKit `block_ids` and `action_ids`

## Contributing

New issues and PRs are encouraged!


## History/Credit
This repository began as a mirror of the [slackapi/bolt-js-getting-started-app](https://github.com/slackapi/bolt-js-getting-started-app) which can still be found on [this branch](https://github.com/airtable-labs/example-slack-bug-tracker/tree/original-from_bolt-js-getting-started-app). The blog post accompanying the original code can be found [here](https://slack.dev/bolt-js/tutorial/getting-started).
