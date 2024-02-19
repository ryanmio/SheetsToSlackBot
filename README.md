# Google Sheets to Slack Bot

This project provides a solution to send updates from a Google Sheet to a Slack channel or user, triggered either by a time-based schedule or by user interaction within Google Sheets or Slack. It leverages Google Apps Script to read data from Sheets and the Slack API to post messages.

## Features

- Fetch specific cell data from a Google Sheet.
- Format the data into a readable message.
- Send the message to a designated Slack channel or user.
- Trigger the message sending through a time-based schedule or by user actions in Google Sheets or Slack.

## Prerequisites

- Access to Google Sheets and the ability to create and run Google Apps Scripts.
- A Slack workspace with permissions to create apps and generate API tokens or set up incoming webhooks.
- Basic knowledge of JavaScript and familiarity with JSON.

## Setup Instructions

### Setting Up Google Apps Script

1. Open your Google Sheet.
2. Navigate to Extensions > Apps Script.
3. Replace the content of the script editor with the provided code (see `googleAppsScriptCode.gs`).
4. Save and name your project.

### Creating a Slack App

1. Go to the [Slack API](https://api.slack.com/apps) and create a new app.
2. Add permissions to send messages (`chat:write`).
3. Generate your OAuth token or set up an incoming webhook.

### Integrating Slack with Google Apps Script

1. In your Apps Script, use `UrlFetchApp` to make a POST request to the Slack API with your message payload.
2. Set up OAuth2 for Slack in Apps Script if required ([OAuth2 library](https://github.com/googleworkspace/apps-script-oauth2)).

### Triggering Mechanisms

#### Time-based Trigger

- Set a time-driven trigger in Apps Script to run your function every morning.

#### User Interaction in Google Sheets

- Add a custom menu item or button that runs your script.

#### User Interaction in Slack

- Consider using Slack's interactive components like buttons or slash commands, which may require additional setup and a lightweight web service to handle requests.

## Usage

- **Time-based Updates**: Once the time-based trigger is set, the script will automatically run at the specified time and send the update to Slack.
- **Manual Trigger in Google Sheets**: Users can manually send updates by clicking on the custom button or menu item in the Google Sheet.
- **Slack Interaction**: If set up, users can trigger updates directly from Slack using the configured components.

## Contributing

Contributions to this project are welcome! Please fork the repository and submit a pull request with your proposed changes.

## License

This project is open-sourced under the [MIT License](LICENSE).

## Acknowledgments

- Google Apps Script Documentation
- Slack API Documentation
