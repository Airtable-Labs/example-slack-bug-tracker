const initialMessageToSubmitter = function (title, priority) {
  return [
    {
      type: 'section',
      text: {
        type: 'plain_text',
        text: 'Thank you for your report! The team will triage it ASAP.'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Title:*\n${title}`
        },
        {
          type: 'mrkdwn',
          text: `*Priority:*\n${priority}`
        }
      ]
    }
  ]
}

const successfullySavedToAirtable = function (baseId, tableId, recordId) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:white_check_mark: Your bug report has been submitted. You can view it at <https://airtable.com/${baseId}/${tableId}/${recordId}|here>`
      }
    }
  ]
}

const errorMessage = function (errorObject) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: ':bangbang: Sorry, but an error occured while sending your record details to Airtable. \nError details: ```\' + JSON.stringify(error, null, 2) + \'```'
      }
    }
  ]
}

module.exports = {
  initialMessageToSubmitter,
  errorMessage,
  successfullySavedToAirtable
}
