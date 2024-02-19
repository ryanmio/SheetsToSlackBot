function onOpen() {
  console.log("Opening Spreadsheet and adding custom menu");
  const ui = SpreadsheetApp.getUi();
  // Adds a custom menu to the Google Sheets UI
  ui.createMenu('Slack Bot')
    .addItem('Send Update to Slack', 'sendSlackMessage')
    .addToUi();
  console.log("Custom menu added successfully");
}

function getSheetData() {
  console.log("Fetching active sheet data");
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Use the entire A:B range
  const lastRow = sheet.getLastRow(); // Gets the last row with data in the sheet
  const range = sheet.getRange(`A1:B${lastRow}`); // Adjusts the range to go from A1 to B and down to the last row with data
  console.log(`Defined range: ${range.getA1Notation()}`);

  const values = range.getValues();
  
  // Filter out empty rows based on the content of the first cell in each row
  const filteredValues = values.filter(row => row[0] !== '');
  console.log(`Data fetched from sheet: ${JSON.stringify(filteredValues)}`);

  return filteredValues;
}

function formatDataForSlack(data) {
  // Initialize an empty message string
  let message = "";

  // Iterate through each row of your data
  data.forEach((row, index) => {
    // Since your data already includes Slack markdown, you can directly append each row to the message.
    // row[0] might contain the campaign title or a data point, and row[1] might contain the values.
    // Check if the row is a title (assuming titles don't have a second column value)
    if (row[1] === '') {
      message += `*${row[0]}*\n`; // Add emphasis to campaign titles
    } else {
      message += `${row[0]} ${row[1]}\n`; // Append data points directly
    }

    // Add an extra newline after each campaign block for better readability
    if (row[0].startsWith('> *Since Last Update*') || row[0].startsWith('*Live Campaigns Total*')) {
      message += '\n';
    }
  });

  return message;
}

function sendSlackMessage() {
  console.log("Preparing to send Slack message");
  const message = getSheetData();
  const slackApiUrl = 'https://slack.com/api/chat.postMessage';
  console.log(`Message to send: ${message}`);

  // Use the Properties Service to securely store and access sensitive data like OAuth tokens
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('SLACK_OAUTH_TOKEN'); // Ensure you have set this property beforehand
  console.log("SLACK_OAUTH_TOKEN retrieved successfully");
  const userId = 'YOUR_SLACK_USER_ID'; // Replace with your actual Slack User ID

  const payload = JSON.stringify({
    channel: 'U0127C7UF16', // Ensure the channel ID is a string
    text: message
  });
  console.log(`Payload prepared: ${payload}`);

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    payload: payload
  };
  console.log("Options for UrlFetchApp prepared");

  // Sending the message to Slack using the chat.postMessage API
  console.log("Sending message to Slack");
  const response = UrlFetchApp.fetch(slackApiUrl, options);
  console.log(`Slack API response: ${response.getContentText()}`);
}
