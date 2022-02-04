const bugFormFields = function ({ title, priority, description }) {
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

const newBug = function ({ description }) {
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
      text: 'File new bug (dev local)'
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
      ...bugFormFields({ description })
    ]
  }
}

const updateBug = function ({ title, priority, description, recordId }) {
  return {
    type: 'modal',
    callback_id: 'update_bug',
    private_metadata: recordId,
    submit: {
      type: 'plain_text',
      text: 'Update :rocket:',
      emoji: true
    },
    close: {
      type: 'plain_text',
      text: 'Cancel'
    },
    title: {
      type: 'plain_text',
      text: 'Update bug (dev local)'
    },
    blocks: [
      {
        block_id: 'form_description',
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: 'Use this form to update the bug report.\n\nNote that the values displayed here are the latest values and may differ from when you originally submitted your report.'
        }
      },
      {
        type: 'divider'
      },
      ...bugFormFields({ title, priority, description })
    ]
  }
}

module.exports = {
  newBug,
  updateBug
}
