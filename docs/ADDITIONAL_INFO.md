# Additional information

This file contains additional information about the code base. 

## See also:
- An overview of this app's functionality can be found in [`../README.md file`](../README.md)
- Step-by-step instructions for setting up your Airtable base, Slack app, and to get the app up-and-running in your local development environment can be found in [`docs/LOCAL_SETUP.md`](docs/LOCAL_SETUP.md)

---

## Slack scopes required
The principal of least privilege has been considered and the following Slack scopes are required:
- [Bot token](https://api.slack.com/authentication/token-types#bot) scopes
  - [`commands`](https://api.slack.com/scopes/commands) - for adding the global and message shortcut
  - [`chat:write`](https://api.slack.com/scopes/chat:write) - for sending DMs to a user
- [App token](https://api.slack.com/authentication/token-types#app) scopes - both required for connecting using [Slack Socket Mode](https://api.slack.com/apis/connections/socket) 
  - [`connections:write`](https://api.slack.com/scopes/connections:write)
  - [`authorizations:read`](https://api.slack.com/scopes/authorizations:read)


## Third-party dependencies
In addition to relying on Airtable's and Slack's SaaS platforms, the code in this repository require the following third party Node packages (see [`package.json`](../package.json) for minimum versions):
- [@slack/bolt](https://www.npmjs.com/package/@slack/bolt) - Framework by Slack to build Slack apps. This repo uses this to connect to the Slack platform to both receive events and respond to them through.
- [airtable](https://www.npmjs.com/package/airtable) - Library by Airtable to interact with the [Airtable REST API](https://support.airtable.com/hc/en-us/articles/203313985-Public-REST-API) in order to create, retrieve, update, and delete records.
- [dotenv](https://www.npmjs.com/package/dotenv) - Loads `.env` file into `process.env` for convenient management of environment variables during development.
- [envalid](https://www.npmjs.com/package/envalid) - Validates the right environment variables are set before attempting to start the Bolt application server
- [slack-block-builder](https://www.npmjs.com/package/slack-block-builder) - Helps with the definition and of [Slack BlockKit](https://api.slack.com/block-kit) JSON, the Slack-specific format for formatting interactive messages, modals, and home tabs.
- [standard](https://www.npmjs.com/package/standard) - Helps enforce consistent code style while developing locally
- [nodemon](https://www.npmjs.com/package/nodemon) - Used by `npm run watch` to reload application server as code files are updated

## Application state / multi-tenancy  
The code, as is, does not require saving state between events received from Slack. This is partially due to the fact that a single Slack workspace's bot token and Slack/Airtable API keys are stored in environment variables for a single-tenant setup.

If you want to support more than one Slack workspace and associated Airtable API keys, you will want to consider implementing an [OAuth flow](https://slack.dev/bolt-js/concepts#authenticating-oauth) as well as a way to ask installer(s) from workspaces to specify their Airtable API key.