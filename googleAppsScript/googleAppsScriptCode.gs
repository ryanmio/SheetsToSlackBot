/**
 * Slack Bot for Google Sheets Readout
 * Version: 2.0.0
 * Author: Ryan Mioduski
 *
 * Important:
 * Before using the bot, you need to configure it with the correct Slack channel ID and
 * the data range from which to fetch data in your Google Sheets document. Optionally,
 * you can also specify a Slack thread URL to direct the message to a specific thread,
 * a notes range for including flags at the top of the readouts, and ranges for copying
 * and pasting values within the sheet as part of the operation.
 *
 * For full documentation, please visit the GitHub repository:
 * https://github.com/ryanmio/SheetsToSlackBot
 */

// Configuration 
const SLACK_CHANNEL_ID = 'U0127C7UF16'; // Update this with your channel ID
const DATA_RANGE_START = 'B35'; // Update this if you want to start from a different cell
const SLACK_THREAD_URL = ''; // Optional: Update this with your thread URL if you want to post to a specific thread
const NOTES_RANGE = 'E43:E'; // Optional: Update this with your notes range
const COPY_RANGE = 'B14:U17'; // Optional: Update this with your copy range
const PASTE_RANGE = 'B26:U29'; // Optional: Update this with your paste range
// End Configuration

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Slack Bot')
    .addItem('Send Readout to Slack', 'sendSlackMessage')
    .addToUi();
}

function getNotes() {
  if (!NOTES_RANGE) return []; // Return an empty array if NOTES_RANGE is not configured

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const notesRange = sheet.getRange(NOTES_RANGE);
  const notesValues = notesRange.getValues();
  
  // Regular expression to match emoji patterns like :word:
  const emojiPattern = /^:[a-zA-Z0-9_]+:/;

  // Filter out empty rows and format notes
  const notes = notesValues
    .filter(note => note[0].trim() !== '') // Remove empty notes
    .map(note => {
      // Check if the note starts with an emoji pattern
      const startsWithEmoji = emojiPattern.test(note[0].trim());
      if (startsWithEmoji) {
        // If it starts with an emoji, use it as is
        return note[0].trim();
      } else {
        // If not, prefix the note with the :warning: emoji
        return `:warning: ${note[0].trim()}`;
      }
    });
  
  return notes;
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
  const notes = getNotes();

  // If there are notes, add them to the top of the message
  if (notes.length > 0) {
    notes.forEach(note => {
      message += `${note}\n`; // Add each note to the message
    });
    message += "\n"; // Add a newline after the notes section
  }

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

  // Use the Properties Service to securely store and access the OAuth token
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
  let replyBroadcast = false; // Default to not broadcasting
  if (SLACK_THREAD_URL) {
    threadTs = extractThreadTsFromUrl(SLACK_THREAD_URL);
    replyBroadcast = true; // Set to true to broadcast the reply to the channel
  }

  // Construct the payload with Block Kit blocks
  const payload = {
    channel: SLACK_CHANNEL_ID, 
    ...(threadTs && { thread_ts: threadTs }), // Include the thread_ts in the payload if it exists
    ...(threadTs && { reply_broadcast: replyBroadcast }), // Include reply_broadcast if thread_ts is present
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
          "text": message // pre-formatted markdown message payload
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

  // Sending the message to Slack
  console.log("Sending message to Slack");
  const response = UrlFetchApp.fetch(slackApiUrl, options);
  const responseJson = JSON.parse(response.getContentText());

  // Check if the Slack message was successfully sent
  let slackMessageSuccess = true;
  if (!responseJson.ok) {
    console.error(`Failed to send message to Slack: ${responseJson.error}`);
    slackMessageSuccess = false;
  }

  // Perform copy-paste operation after sending the message
  const copyPasteSuccess = copyPasteValues();

  // Provide feedback to the user based on the operation outcomes
  if (slackMessageSuccess && copyPasteSuccess) {
    SpreadsheetApp.getUi().alert("Readout Complete!");
  } else if (!slackMessageSuccess) {
    SpreadsheetApp.getUi().alert("Failed to send message to Slack. Please check the logs for more details.");
  } else if (!copyPasteSuccess) {
    SpreadsheetApp.getUi().alert("Readout sent to Slack, but there was an error with the copy-paste operation. Please check the logs for more details.");
  }
}

function extractThreadTsFromUrl(url) {
  const matches = url.match(/thread_ts=(\d+\.\d+)/);
  return matches ? matches[1] : null;
}

function copyPasteValues() {
  if (!COPY_RANGE || !PASTE_RANGE) {
    console.log("Copy-Paste ranges are not configured. Skipping this step.");
    return true; // Return true since this isn't an error, just a skipped operation
  }

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const sourceRange = sheet.getRange(COPY_RANGE);
    const targetRange = sheet.getRange(PASTE_RANGE);

    // Copy values from source to target
    const values = sourceRange.getValues();
    targetRange.setValues(values);

    console.log("Values copied successfully.");
    return true;
  } catch (error) {
    console.error("Error during copy-paste operation: ", error);
    return false;
  }
}