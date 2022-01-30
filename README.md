
----
----

ℹ️ This repository contains an example of a [Slack App](https://api.slack.com/) using [SocketMode](https://api.slack.com/apis/connections/socket) that has a [Global Shortcut](https://api.slack.com/interactivity/shortcuts/using#global_shortcuts) which displays a [modal](https://api.slack.com/surfaces/modals#:~:text=Modals%20provide%20focused%20spaces%20ideal,of%20any%20other%20interface%20element.) (aka form). Form submissions are sent directly to an [Airtable](https://airtable.com) base via [Airtable's REST API](https://support.airtable.com/hc/en-us/articles/203313985-Public-REST-API).

This repository began as a mirror of the [slackapi/bolt-js-getting-started-app](https://github.com/slackapi/bolt-js-getting-started-app) which can still be found on [this branch](https://github.com/marks/slack-form-to-airtable/tree/original-from_bolt-js-getting-started-app) for reference.

The rest of this README.md closely mirrors the original repository's README.md:

----
----

# Getting Started ⚡️ Bolt for JavaScript
> Slack app example from 📚 [Getting started with Bolt for JavaScript tutorial][1]

## Overview

This is a Slack app built with the [Bolt for JavaScript framework][2] that showcases
responding to events and interactive buttons.

## Running locally

### 0. Create a new Slack App

- Go to https://api.slack.com/apps
- Click **Create App**
- Choose a workspace
- Enter App Manifest using contents of `manifest.yaml`
- Click **Create**

Once the app is created click **Install to Workspace** 
Then scroll down in Basic Info and click **Generate Token and Scopes** with both scopes

### 1. Setup environment variables

Copy `.env.example` to `.env` and paste your unique values (there are comments in the file with where to find each value)

### 2. Setup your local project

```zsh
# Clone this project onto your machine
git clone https://github.com/slackapi/bolt-js-getting-started-app.git

# Change into the project
cd bolt-js-getting-started-app/

# Install the dependencies
npm install
```

### 3. Start servers
```zsh
npm run start
```

### 4. Test

Go to the installed workspace and type **Hello** in a DM to your new bot. You can also type **Hello** in a channel where the bot is present

## Contributing

New issues and PRs are encouraged!

[1]: https://slack.dev/bolt-js/tutorial/getting-started
[2]: https://slack.dev/bolt-js/
[3]: https://slack.dev/bolt-js/tutorial/getting-started#setting-up-events
[4]: https://github.com/slackapi/bolt-js/issues/new