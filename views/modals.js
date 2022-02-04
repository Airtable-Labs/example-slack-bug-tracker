const bugFormFields = function (title = '', priority = null, description = '') {
  return [
    {
      block_id: 'block_title',
      type: 'input',
      label: {
        type: 'plain_text',
        text: 'Title'
      },
      element: {
        action_id: 'input_title',
        type: 'plain_text_input',
        initial_value: title
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
        ...(priority && {
          initial_option: {
            value: priority,
            text: {
              type: 'plain_text',
              text: priority
            }
          }
        }
        ),
        options: [
          {
            text: {
              type: 'plain_text',
              text: 'High',
              emoji: true
            },
            value: 'High'
          },
          {
            text: {
              type: 'plain_text',
              text: 'Medium',
              emoji: true
            },
            value: 'Medium'
          },
          {
            text: {
              type: 'plain_text',
              text: 'Low',
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

const newBug = function (title = '', priority = null, description = '') {
  return {
    type: 'modal',
    callback_id: 'create_bug',
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
      text: 'File a new bug  (dev local)'
    },
    blocks: [
      {
        block_id: 'form_description',
        type: 'section',
        text: {
          type: 'plain_text',
          text: 'Please fill out the form below to submit a new bug to the product and engineering team. We will triage it ASAP.'
        }
      },
      {
        type: 'divider'
      },
      ...bugFormFields(title, priority, description)
    ]
  }
}

module.exports = {
  newBug
}
