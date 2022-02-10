This file outlines the steps to take to get the example app up and running in your local development environment.

An overview of this app's functionality can be found in [`../README.md file`](../README.md).

---

**Prerequisites**: A working installation of Node 12+ and a text editor is expected. You'll also need an Airtable account where you can create new bases and a Slack account where you can create a new custom app.

## 0. Setup or identify your "Bugs" table in Airtable

The example code in this project expects the Airtable table you specify (in the next step) to have the following fields: `Short description` (single line text), `Long description` (long text), `Priority` (single select), `Submitter Slack UID` (single line text), `Submitter Slack Name` (single line text), `Updater Slack UID` (single line text), and `Updater Slack Name` (single line text).

You can copy [this sample table](https://airtable.com/shrUnY5ULVeIcOfFr) into your own base if you'd like. Pointers on how which code to modify to adapt this example are below. It's recommended you use this exact schema for your initial test of the example code.


## 1. Create a new Slack App

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

## 2. Setup environment variables

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
# Primary field name for the table
AIRTABLE_PRIMARY_FIELD_NAME=Name

LOG_LEVEL=info # error, warn, info, and debug are valid options
```

## 3. Setup your local project

From your terminal...

1. Clone this project onto your machine
    ```zsh
    git clone https://github.com/airtable-labs/example-slack-bug-tracker.git
    ```

2. Change directory into the project and install dependencies
    ```zsh
    cd example-slack-bug-tracker/ && npm install
    ```

## 4. Start the server to listen for events from Slack
1. From your terminal, run:
    ```zsh
    npm run start
    ```

2. You should see output that looks like the following:
    ```zsh
    ✅ Environment variables validated & loaded
    [INFO]  web-api:WebClient:0 ✅  Connected to Airtable
    [INFO]  web-api:WebClient:0 ✅  Slack Bolt app is running!
    ```

## 5. Test

Your app should be ready to try from Slack 🚀. Check out the Global Shortcut ⚡️, Message Shortcut 💬, and App Home 🏡!

## 6. Iterate and develop
- You can run `npm run watch` (instead of `npm run start`) to have `nodemon` watch code files for changes and automatically restart the server for a quicker iterating.
- To change the fields in the form, update `configs/fields.js`. To update user-facing messages, check out `app.js` and `views/` too.
