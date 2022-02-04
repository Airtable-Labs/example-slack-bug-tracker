// Various helper functions

// Helper function and execution to determine the first field that should be prefilled when a message shortcut is used
const determineFieldNameForMessageShortcutPrefill = (fields) => {
  for (const [fieldName, fieldConfig] of fields.entries()) {
    const x = fieldConfig.messageShortcutPrefill ? fieldName : null
    if (x) {
      return x
    }
  }
}

// Extract values from view submission payload
const extractInputsFromViewSubmissionPayload = ({ view }, fieldConfig) => {
  const fieldsWithValues = {}

  // Loop through all values we received from Slack and extract the value depending on field type
  Object.keys(view.state.values).forEach((fieldName) => {
    // fieldName represents the Slack view block_id and action_id (we use the Fields' object key for both)
    const inputReceived = view.state.values[fieldName][fieldName]

    // Make a copy of the field config
    const fieldConfigCopy = Object.assign({}, fieldConfig.get(fieldName))

    // Determine the value
    fieldConfigCopy.value = slackInputViewStateToValue(inputReceived)

    // Add the field config to the fieldsWithValues object
    fieldsWithValues[fieldName] = fieldConfigCopy
  })

  return fieldsWithValues
}
// Extract value from view submission payload
// TODO support additional Slack input element types (https://api.slack.com/reference/block-kit/blocks#input)
const slackInputViewStateToValue = (inputViewState) => {
  switch (inputViewState.type) {
    case 'plain_text_input':
      return inputViewState.value
    case 'static_select':
      return inputViewState.selected_option.value
    default:
      return null
  }
}

// Validate inputs and return error object
const validateInputs = (fieldsWithValues) => {
  const errors = {}

  // Loop through all fields validate the value (if a validation function is defined)
  for (const fieldName of Object.keys(fieldsWithValues)) {
    const fieldConfigWithValue = fieldsWithValues[fieldName]
    if (fieldConfigWithValue.validationFn) {
      const validationError = fieldConfigWithValue.validationFn(fieldConfigWithValue.value)
      if (validationError !== true) { // true means no error
        errors[fieldName] = validationError
      }
    }
  }

  return errors
}

module.exports = {
  determineFieldNameForMessageShortcutPrefill,
  extractInputsFromViewSubmissionPayload,
  validateInputs
}
