/**
 * Slack Bot for Google Sheets Readout - Update Notification
 * Version: 1.0.0
 * Author: Ryan Mioduski
 *
 * This script sends a notification to a specified Slack channel indicating that the
 * Slack Readout Bot has been updated to a new version, along with the change log.
 *
 * Configuration:
 * - SLACK_CHANNEL_ID: The ID of the Slack channel where the update notification will be sent.
 * - BOT_VERSION: The new version number of the bot.
 * - CHANGE_LOG: An array of strings, each representing a change in the latest version.
 */

// Configuration
const UPDATE_NOTIFICATION_SLACK_CHANNEL_ID = 'U0127C7UF16'; // Update this with your channel ID
const BOT_VERSION = 'v3.0.1'; // Update this with the new version number
const CHANGE_LOG = [
  "Skip notes if blank or #N/A",
];
// End Configuration

function sendUpdateNotification() {
  const slackApiUrl = 'https://slack.com/api/chat.postMessage';
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('SLACK_OAUTH_TOKEN'); // Directly using the property name
  
  if (!token) {
    console.error("Slack OAuth token not found. Please set the token in the script properties.");
    return;
  }

  const payload = {
    channel: UPDATE_NOTIFICATION_SLACK_CHANNEL_ID,
    text: `Slack Readout Bot Updated to ${BOT_VERSION}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `Slack Readout Bot Updated to ${BOT_VERSION}`,
          emoji: true
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Change Log:*"
        }
      },
      ...CHANGE_LOG.map(change => ({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `- ${change}`
        }
      })),
      {
        type: "divider"
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Documentation",
              emoji: true
            },
            url: "https://github.com/ryanmio/SheetsToSlackBot/releases/tag/v3.0.0",
            action_id: "view_documentation"
          }
        ]
      }
    ]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    payload: JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(slackApiUrl, options);
    const responseJson = JSON.parse(response.getContentText());
    if (!responseJson.ok) {
      console.error(`Failed to send update notification to Slack: ${responseJson.error}`);
    } else {
      console.log("Update notification sent successfully to Slack.");
    }
  } catch (error) {
    console.error("Error sending update notification to Slack: ", error);
  }
}