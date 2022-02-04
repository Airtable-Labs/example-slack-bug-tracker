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
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          action_id: 'url_button',
          url: `https://airtable.com/${baseId}/${tableId}/${recordId}`,
          style: 'primary',
          text: {
            type: 'plain_text',
            emoji: true,
            text: ':link: Open in browser'
          }
        },
        {
          type: 'button',
          action_id: 'edit_record',
          value: recordId,
          text: {
            type: 'plain_text',
            emoji: true,
            text: ':writing_hand: Edit'
          }
        },
        {
          type: 'button',
          action_id: 'delete_record',
          value: recordId,
          style: 'danger',
          text: {
            type: 'plain_text',
            emoji: true,
            text: ':x: Delete'
          },
          confirm: {
            title: {
              type: 'plain_text',
              text: 'Are you sure you want to delete this record from Airtable?'
            },
            text: {
              type: 'mrkdwn',
              text: 'This action can only be undone by manually deleting the record from Airtable.'
            },
            confirm: {
              type: 'plain_text',
              text: 'Yes, delete it'
            },
            deny: {
              type: 'plain_text',
              text: "Stop, I've changed my mind!"
            }
          }
        }
      ]
    }

  ]
}

const simpleMessage = function (message) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message
      }
    }
  ]
}

module.exports = {
  initialMessageToSubmitter,
  successfullySavedToAirtable,
  simpleMessage
}
