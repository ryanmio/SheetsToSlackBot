# Slack Bot for Google Sheets Readout Documentation

## Overview
This Slack Bot is designed to send a formatted readout from a Google Sheets document directly to a specified Slack channel. It dynamically fetches data from the sheet, formats it into a readable message, and posts it to Slack, making it an efficient tool for sharing updates, reports, or any relevant data with your team.

## Features
- **Dynamic Data Fetching:** Automatically fetches data from a specified range in a Google Sheets document.
- **Custom Formatting:** Formats the fetched data into a Slack-friendly message using Slack's Block Kit.
- **Easy Configuration:** Allows for simple configuration of the target Slack channel and data range directly within the script.

## Configuration
Before using the bot, you need to configure it with the correct Slack channel ID and the data range from which to fetch data in your Google Sheets document.

### Setting Up Slack Channel ID and Data Range
1. **Open the Google Apps Script File:** Navigate to Extensions > Apps Script from within your Google Sheets document.
2. **Configure Constants:**
   At the top of the `googleAppsScriptCode.gs` file, you'll find two configurable constants:
   - `SLACK_CHANNEL_ID`: Replace `'U0127C7UF16'` with the ID of your target Slack channel.
   - `DATA_RANGE_START`: Replace `'A1'` with the starting cell of your data range. The script will automatically extend this range to column D and the last row with data.
   ```javascript
   // Configurable constants
   const SLACK_CHANNEL_ID = 'YOUR_SLACK_CHANNEL_ID'; // Update this with your actual channel ID
   const DATA_RANGE_START = 'A1'; // Update this if you want to start from a different cell
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
2. **Send Readout to Slack:** Navigate to the custom menu item Slack Bot > Send Readout to Slack. Clicking this will execute the bot, fetching the data from the specified range, formatting it, and sending it to the configured Slack channel.

## Troubleshooting
- **Invalid Slack Channel ID:** Ensure the channel ID is correct and that the Slack app is installed in the channel.
- **OAuth Token Permissions:** Verify that the Slack OAuth token has the `chat:write` permission and is correctly stored in the script properties.
- **Data Range Issues:** Confirm the `DATA_RANGE_START` is correctly set and that there is data in the specified range.

## Support
For additional help or to report issues, please reach out to your team's technical support or consult the Slack API Documentation.
