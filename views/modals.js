const fileABug = function (description = '') {
  return {
    type: 'modal',
    callback_id: 'fileABugModal',
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
        block_id: 'form_description',
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
        block_id: 'block_title',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Title'
        },
        element: {
          action_id: 'input_title',
          type: 'plain_text_input'
        }
      },
      {
        block_id: 'block_priority',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Priority'
        },
        element: {
          type: 'static_select',
          action_id: 'input_priority',
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
        block_id: 'block_description',
        type: 'input',
        label: {
          type: 'plain_text',
          text: 'Long description'
        },
        element: {
          action_id: 'input_description',
          type: 'plain_text_input',
          multiline: true,
          initial_value: description
        }
      }
    ]
  }
}

module.exports = {
  fileABug
}
