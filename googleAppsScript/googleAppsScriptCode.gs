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
  let message = "";
  let isFirstCampaign = true;

  // Helper function to format numbers with commas
  function formatNumber(number) {
    return parseInt(number, 10).toLocaleString('en-US');
  }

  // Helper function to format currency
  function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // Helper function to format percentage
  function formatPercentage(value) {
    return (parseFloat(value) * 100).toFixed(2) + '%';
  }

  // Iterate through each row of your data
  data.forEach((row) => {
    // Check if it's a campaign name
    if (row[0].startsWith('**') && row[0].endsWith('**')) {
      // Add a newline before each new campaign except the first
      if (!isFirstCampaign) {
        message += "\n";
      }
      isFirstCampaign = false;
      // Format the campaign name with bold markdown
      message += `*${row[0].slice(2, -2)}*\n`;
    } else if (row[0] === '> *Since Last Update*') {
      // Format "Since Last Update" with bold markdown
      message += `>*${row[0].slice(3, -1)}*\n`;
    } else {
      // Check if the row contains "Spent", "Raised", or "Donations" to format accordingly
      if (row[0].includes("Spent") || row[0].includes("Raised")) {
        message += `${row[0]}: ${formatCurrency(row[1])}\n`;
      } else if (row[0].includes("Donations")) {
        // Format Donations as a number with commas
        message += `${row[0]}: ${formatNumber(row[1])}\n`;
      } else if (row[0].includes("ROI")) {
        // Format ROI as a percentage
        message += `${row[0]}: ${formatPercentage(row[1])}\n`;
      } else {
        // Add a data row with the key-value pair
        message += `${row[0]}: ${row[1]}\n`;
      }
    }
  });

  return message.trim(); // Trim the trailing newline character if present
}

function sendSlackMessage() {
  console.log("Preparing to send Slack message");
  const data = getSheetData();
  const message = formatDataForSlack(data); // Get the formatted message

  const slackApiUrl = 'https://slack.com/api/chat.postMessage';
  console.log(`Message to send: ${message}`);

  // Use the Properties Service to securely store and access sensitive data like OAuth tokens
  const scriptProperties = PropertiesService.getScriptProperties();
  const token = scriptProperties.getProperty('SLACK_OAUTH_TOKEN'); // Ensure you have set this property beforehand
  console.log("SLACK_OAUTH_TOKEN retrieved successfully");

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const documentTitle = spreadsheet.getName(); // Get the document title
  const sheetUrl = spreadsheet.getUrl(); // Get the URL of the active spreadsheet

  // Get the email address of the person running the script
  const userEmail = Session.getActiveUser().getEmail();

  // Construct the payload with Block Kit blocks
  const payload = {
    channel: 'U0127C7UF16', // Replace with your actual channel ID
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `${documentTitle} Readout`, // Use the document title with "Readout" appended
          "emoji": true
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": message // Your pre-formatted markdown message
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": "Open Sheet",
              "emoji": true
            },
            "url": sheetUrl,
            "action_id": "button-action"
          }
        ]
      },
      {
        "type": "context",
        "elements": [
          {
            "type": "mrkdwn",
            "text": `Message sent by: ${userEmail}`
          }
        ]
      }
    ]
  };
  console.log(`Payload prepared: ${JSON.stringify(payload)}`);

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    payload: JSON.stringify(payload)
  };
  console.log("Options for UrlFetchApp prepared");

  // Sending the message to Slack using the chat.postMessage API
  console.log("Sending message to Slack");
  const response = UrlFetchApp.fetch(slackApiUrl, options);
  console.log(`Slack API response: ${response.getContentText()}`);
}
