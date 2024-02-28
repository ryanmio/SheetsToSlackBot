# Setting Up the Slack Bot for Google Sheets Readout

This guide will walk you through the process of setting up the Slack Bot for Google Sheets Readout in your Slack workspace.

## Prerequisites

Before you begin, ensure you have:
- Configured the bot with the correct Slack channel ID, data range, and other optional configurations as described in the `README.md` and `googleAppsScriptCode.gs` files.
- Set up an OAuth token as a script property for authentication with the Slack API.

## Adding the Bot to Your Slack Channel

1. **Open Slack:** Navigate to the Slack workspace where you want to add the bot.

2. **Go to the Channel:** Open the channel you want to post messages to.

3. **Open Channel Settings:** Click on the channel name at the top to open the channel details.

4. **Add Apps:** In the channel details, find and click on the "Add apps" option.

5. **Find the Readout Bot:** In the "Add apps" section, search for the "Readout Bot" that you have configured for your Google Sheets.

6. **Add to Channel:** Once you find the bot, click on the "Add" button to add it to your channel.

## Obtaining a Slack OAuth Token

To authenticate your Slack Bot with the Slack API and enable it to post messages, you need to obtain an OAuth token. Follow these steps to create a new Slack app and obtain the OAuth token:

1. **Create a New Slack App:**
   - Navigate to [https://api.slack.com/apps](https://api.slack.com/apps).
   - Click on "Create New App".
   - Choose "From scratch".
   - Enter a name for your app and select the Slack workspace where you want to install the app.
   - Click "Create App".

2. **Add OAuth Scopes:**
   - In your app settings, navigate to "OAuth & Permissions" under the "Features" section.
   - Scroll down to the "Scopes" section.
   - Under "Bot Token Scopes", click "Add an OAuth Scope".
   - Add the following scopes to enable your bot to post messages:
     - `chat:write`
     - `chat:write.public`
     - (Optional) `files:write` if your bot will share files in the channel.

3. **Install App to Workspace:**
   - At the top of the "OAuth & Permissions" page, click "Install to Workspace".
   - Review the permissions and click "Allow".
   - You will be redirected to a page with your "Bot User OAuth Access Token".
   - Copy this token; you will need it to set up the OAuth token as a script property in your Google Apps Script project.

4. **Set Up OAuth Token as a Script Property:**
   - Go to the Google Apps Script editor by navigating to Extensions > Apps Script from within your Google Sheets document.
   - Click on `File` > `Project properties` > `Script properties`.
   - Click `Add row`.
   - Enter `SLACK_OAUTH_TOKEN` as the property name.
   - Paste your Slack OAuth token as the value.
   - Click `Save`.

Your Slack Bot is now authenticated to post messages to your Slack workspace using the OAuth token.
