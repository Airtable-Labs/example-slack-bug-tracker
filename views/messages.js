const messageToSubmitter = function (title, priority) {
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

module.exports = {
  messageToSubmitter
}
