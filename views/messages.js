const initialMessageToSubmitter = function (fieldsWithValues) {
  const fields = Object.keys(fieldsWithValues).map(fieldName => {
    const fieldWithValue = fieldsWithValues[fieldName]
    return slackSectionFieldGenerator(fieldWithValue.slackInputLabel, fieldWithValue.value)
  })

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
      fields
    }
  ]
}

const slackSectionFieldGenerator = (key, value) => {
  return {
    type: 'mrkdwn',
    text: `*${key}:*\n${value}`
  }
}
const successfullySavedToAirtable = function (baseId, tableId, recordId, recordPrimaryFieldValue) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `:white_check_mark: Your bug report has been saved to Airtable. The new record's primary field value is *${recordPrimaryFieldValue}* and the record ID is ${recordId}.`
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
