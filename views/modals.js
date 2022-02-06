// Generate array of input blocks based on Fields config
const recordFormFields = function (fieldConfigsWithValuesMaybe) {
  const inputBlocks = []
  fieldConfigsWithValuesMaybe.forEach((fieldConfig, fieldName) => {
    const inputBlock = {
      block_id: fieldName,
      type: 'input',
      label: {
        type: 'plain_text',
        text: fieldConfig.slackInputLabel
      },
      element: {
        action_id: fieldName,
        type: fieldConfig.slackElementType,
        // If options are provided, use them
        ...(fieldConfig.slackElementOptions && {
          options: fieldConfig.slackElementOptions.map(slackSelectOption)
        }),
        // If multiLine is true, use a textarea
        ...(fieldConfig.slackElementMultiLine && { multiline: true }),
        // If the element type is plain_text_input and a value is set, use the initial value
        ...(fieldConfig.slackElementType === 'plain_text_input' && fieldConfig.value && {
          initial_value: fieldConfig.value
        }),
        // If the element type is static_select and a value is set, use the initial value
        ...(fieldConfig.slackElementType === 'static_select' && fieldConfig.value && {
          initial_option: slackSelectOption(fieldConfig.value)
        })
      }
    }
    inputBlocks.push(inputBlock)
  })
  return inputBlocks
}

const slackSelectOption = function (value) {
  return {
    text: {
      type: 'plain_text',
      text: value,
      emoji: true
    },
    value: value
  }
}

const createRecordForm = function (fieldConfigsWithValuesMaybe) {
  return {
    type: 'modal',
    callback_id: 'create_record_submission',
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
      ...recordFormFields(fieldConfigsWithValuesMaybe)
    ]
  }
}

const updateRecordForm = function (fieldConfigsWithValuesMaybe, privateMetadata) {
  return {
    type: 'modal',
    callback_id: 'update_record_submission',
    private_metadata: privateMetadata,
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
      ...recordFormFields(fieldConfigsWithValuesMaybe)
    ]
  }
}

const simpleMessage = function (message) {
  return {
    type: 'modal',
    title: {
      type: 'plain_text',
      text: 'Message',
      emoji: true
    },
    close: {
      type: 'plain_text',
      text: 'Close',
      emoji: true
    },
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  }
}

module.exports = {
  createRecordForm,
  updateRecordForm,
  simpleMessage
}
