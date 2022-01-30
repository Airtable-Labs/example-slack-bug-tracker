const fileABugModalPayload = function () {
  return {
    type: 'modal',
    submit: {
      type: 'plain_text',
      text: 'Submit :rocket:',
      emoji: true
    },
    close: {
      type: 'plain_text',
      text: 'Cancel'
    },
    title: {
      type: 'plain_text',
      text: 'File a bug  (dev local)'
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'plain_text',
          text: 'Please fill out the form below to submit a bug to the product and engineering team. We will triage it ASAP.'
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Priority'
        },
        element: {
          type: 'static_select',
          placeholder: {
            type: 'plain_text',
            text: 'Select an item',
            emoji: true
          },
          options: [
            {
              text: {
                type: 'plain_text',
                text: ':red_circle: High',
                emoji: true
              },
              value: 'High'
            },
            {
              text: {
                type: 'plain_text',
                text: ':large_blue_circle: Medium',
                emoji: true
              },
              value: 'Medium'
            },
            {
              text: {
                type: 'plain_text',
                text: ':white_circle: Low',
                emoji: true
              },
              value: 'Low'
            }
          ]
        }
      },
      {
        type: 'input',
        element: {
          type: 'plain_text_input',
          action_id: 'plain_text_input-action'
        },
        label: {
          type: 'plain_text',
          text: 'Title',
          emoji: true
        }
      },
      {
        type: 'input',
        element: {
          type: 'plain_text_input',
          multiline: true,
          action_id: 'plain_text_input-action'
        },
        label: {
          type: 'plain_text',
          text: 'Long description',
          emoji: true
        }
      }
    ]
  }
}

module.exports = {
  fileABugModalPayload
}
