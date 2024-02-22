# Slack Bot for Google Sheets Readout Documentation

## Overview
This Slack Bot sends a formatted readout from a Google Sheets document to a specified Slack channel or thread. It dynamically fetches data from the sheet, formats it into a readable message, and posts it to Slack.

## Configuration
Before using the bot, you need to configure it with the correct Slack channel ID, the data range from which to fetch data in your Google Sheets document, and optionally, a Slack thread URL and notes range.

### Setting Up Slack Channel ID, Data Range, and Optional Configurations
1. **Open the Google Apps Script File:** Navigate to Extensions > Apps Script from within your Google Sheets document.
2. **Configure Constants:**
   At the top of the `googleAppsScriptCode.gs` file, you'll find configurable constants:
   - `SLACK_CHANNEL_ID`: Replace `'U0127C7UF16'` with the ID of your target Slack channel.
   - `DATA_RANGE_START`: Replace `'A1'` with the starting cell of your data range. The script will automatically extend this range to column D and the last row with data.
   - `SLACK_THREAD_URL`: (Optional) Replace with your thread URL if you want to post to a specific thread. Leave blank to post directly to the channel.
   - `NOTES_RANGE`: (Optional) Replace `'A1:A'` with the range from which to fetch notes. Leave blank if not used.
   ```javascript
   // Configurable constants
   const SLACK_CHANNEL_ID = 'YOUR_SLACK_CHANNEL_ID'; // Update this with your actual channel ID
   const DATA_RANGE_START = 'A1'; // Update this if you want to start from a different cell
   const SLACK_THREAD_URL = ''; // Optional: Update this with your thread URL
   const NOTES_RANGE = 'A1:A'; // Optional: Update this with your notes range
   ```
3. **Save Changes:** After making the necessary changes, save the script file.

### Obtaining Slack Channel ID
To find your Slack channel ID:
1. Open Slack and navigate to the channel you want to post messages to.
2. Click on the channel name at the top to open the channel details.
3. Look for the channel ID in the URL or in the "About" section of the channel details.

## Usage
After configuring the bot, you can trigger the readout to be sent to Slack directly from your Google Sheets document.
1. **Open the Google Sheets Document:** Ensure you're in the document configured with the bot.
2. **Send Readout to Slack:** Navigate to the custom menu item Slack Bot > Send Readout to Slack. Clicking this will execute the bot, fetching the data from the specified range, formatting it, and sending it to the configured Slack channel or thread.

### Including Notes in Your Readout
If you have configured a `NOTES_RANGE`, the script will fetch each note from this range and include it at the top of your Slack message. Notes starting with an emoji pattern (`:word:`) will retain their custom emoji. Otherwise, notes will be prefixed with a :warning: emoji to highlight them.

### Posting to a Specific Thread
If you have provided a `SLACK_THREAD_URL` in the configuration, the message will be sent as a reply to the specified thread. To post to a different thread, simply update the `SLACK_THREAD_URL` with the new thread's URL. Leave `SLACK_THREAD_URL` blank to post directly to the channel.