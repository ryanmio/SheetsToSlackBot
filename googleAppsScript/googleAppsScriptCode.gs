function onOpen() {
  const ui = SpreadsheetApp.getUi();
  // Adds a custom menu to the Google Sheets UI
  ui.createMenu('Slack Bot')
    .addItem('Send Update to Slack', 'sendSlackMessage')
    .addToUi();
}

function getSheetData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // Define the range you want to read from, e.g., "A1:C3"
  const range = sheet.getRange('A1:C3');
  const values = range.getValues();
  
  // Placeholder for data processing/formatting logic
  const formattedData = formatDataForSlack(values);
  return formattedData;
}

function formatDataForSlack(data) {
  // Placeholder for transforming sheet data into a Slack message format
  let message = "Campaign Performance: \n";
  data.forEach(row => {
    // Assuming row[0] is the metric name and row[1] is the value
    message += ` - ${row[0]}: ${row[1]} \n`;
  });

  return message;
}

function sendSlackMessage() {
  const message = getSheetData();
  const slackApiUrl = 'https://slack.com/api/chat.postMessage';

  // Use the Properties Service to securely store and access sensitive data like OAuth tokens
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('SLACK_OAUTH_TOKEN'); // Ensure you have set this property beforehand
  const channelId = 'YOUR_CHANNEL_ID'; // Replace with your actual channel ID

  const payload = JSON.stringify({
    channel: channelId,
    text: message
  });

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    payload: payload
  };

  // Sending the message to Slack using the chat.postMessage API
  UrlFetchApp.fetch(slackApiUrl, options);
}
