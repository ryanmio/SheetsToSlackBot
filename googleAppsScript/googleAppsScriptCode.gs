/**
 * Slack Bot for Google Sheets Readout
 * 
 * Author: Ryan Mioduski
 *
 * Important:
 * Before using the bot, you need to configure it with the correct Slack channel ID and
 * the data range from which to fetch data in your Google Sheets document. Optionally,
 * you can also specify a Slack thread URL to direct the message to a specific thread.
 *
 * For full documentation, please visit the GitHub repository:
 * https://github.com/ryanmio/SheetsToSlackBot
 */

// Configuration 
const SLACK_CHANNEL_ID = 'U0127C7UF16'; // Update this with your channel ID
const DATA_RANGE_START = 'D13'; // Update this if you want to start from a different cell
const SLACK_THREAD_URL = ''; // Optional: Update this with your thread URL if you want to post to a specific thread

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Slack Bot')
    .addItem('Send Readout to Slack', 'sendSlackMessage')
    .addToUi();
}

function getSheetData() {
    console.log("Fetching active sheet data");
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
    // Dynamically calculate the range based on DATA_RANGE_START
    const lastRow = sheet.getLastRow();
    const rangeStartColumn = DATA_RANGE_START.charAt(0);
    const rangeEndColumn = String.fromCharCode(rangeStartColumn.charCodeAt(0) + 1);
    const range = sheet.getRange(`${DATA_RANGE_START}:${rangeEndColumn}${lastRow}`);
    console.log(`Defined range: ${range.getA1Notation()}`);
  
    const values = range.getValues();
    
    let filteredValues = [];
    let currentSection = [];
    let isCurrentSectionValid = false;
  
    values.forEach((row, index) => {
      // Check if row is the start of a new section or the end of the data
      if (row[0].startsWith('*') || index === values.length - 1) {
        // At the start of a new section, decide if the previous section should be added
        if (currentSection.length > 0 && isCurrentSectionValid) {
          // Add the previous section if it was valid
          filteredValues = filteredValues.concat(currentSection);
        }
        // Reset for the new section
        currentSection = [];
        isCurrentSectionValid = false; // Reset flag
      }
  
      // Add row to the current section
      currentSection.push(row);
  
      // Check if the current row has meaningful data (not blank and not zero)
      if (row[1] !== '' && row[1] !== 0 && row[1] !== '0.00%' && row[1] !== null) {
        isCurrentSectionValid = true;
      }
  
      // Special case for the last row of the data
      if (index === values.length - 1 && isCurrentSectionValid) {
        filteredValues = filteredValues.concat(currentSection);
      }
    });
  
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

  // Iterate through each row of the data
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
  const token = scriptProperties.getProperty('SLACK_OAUTH_TOKEN'); 
  console.log("SLACK_OAUTH_TOKEN retrieved successfully");

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const documentTitle = spreadsheet.getName(); // Get the document title
  const sheetUrl = spreadsheet.getUrl(); // Get the URL of the active spreadsheet

  // Get the email address of the person running the script
  const userEmail = Session.getActiveUser().getEmail();

  // Get today's date and format it
  const today = new Date();
  const month = today.toLocaleString('default', { month: 'short' }); // 'Feb'
  const day = today.getDate(); // 20
  const formattedDate = `${month} ${day}`; // 'Feb 20'

  // Extract the thread_ts from the URL if provided
  let threadTs = null;
  if (SLACK_THREAD_URL) {
    threadTs = extractThreadTsFromUrl(SLACK_THREAD_URL);
  }

  // Construct the payload with Block Kit blocks
  const payload = {
    channel: SLACK_CHANNEL_ID, 
    ...(threadTs && { thread_ts: threadTs }), // Include the thread_ts in the payload if it exists
    blocks: [
      {
        "type": "header",
        "text": {
          "type": "plain_text",
          "text": `${documentTitle} Readout - ${formattedDate}`, // Append the formatted date to the title
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
function extractThreadTsFromUrl(url) {
  const matches = url.match(/thread_ts=(\d+\.\d+)/);
  return matches ? matches[1] : null;
}
