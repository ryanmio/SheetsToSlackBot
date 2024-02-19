// googleAppsScript/googleAppsScriptCode.gs
function sendReadoutsToSlack() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Readouts");
  var range = sheet.getRange("A1:B" + sheet.getLastRow());
  var data = range.getValues();
  
  // Filter out empty rows
  var filteredData = data.filter(function(row) {
    return row[0] !== "" && row[1] !== "";
  });
  
  // Format the data into a message
  var message = "Readouts Update:\n";
  filteredData.forEach(function(row) {
    message += row[0] + ": " + row[1] + "\n";
  });
  
  // Placeholder for sending the message to Slack
  // sendToSlack(message);
}

// Placeholder function for sending messages to Slack
function sendToSlack(message) {
  // Slack API integration code will go here
}
