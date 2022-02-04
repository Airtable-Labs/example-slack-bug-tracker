// List of fields that can be edited using this integration
// This configuration/mapping allows us to use different field names/labels in the app versus how they are defined in Airtable

const Fields = new Map()

/* Example
Fields.set('example', { // Key name -- never exposed to a user in Slack or Airtable
  airtableFieldName: 'Short description', // Field name in Airtable (important: this needs to be an exact match)
  slackInputLabel: 'Title', // Label for the input field in Slack
  slackElementType: 'plain_text_input', // Type of Slack element to use for the input field (plain_text_input, and static_select have been tested)
  slackElementOptions: ['High', 'Medium', 'Low'], // Options for the static_select element, if applicable
  messageShortcutPrefill: true, // Set to true to prefill this field with the text of the selected message
  validationFn: (value) => { // Value that returns true if the value is valid and an error string if it's not
    if (value) {
      return 'Description must be at least 10 characters'
    } else { // return true if there are no errors
      return true
    }
  }
})
*/

Fields.set('short_description', {
  airtableFieldName: 'Short description',
  slackInputLabel: 'Title',
  slackElementType: 'plain_text_input'
})

Fields.set('priority', {
  airtableFieldName: 'Priority',
  slackInputLabel: 'Priority',
  slackElementType: 'static_select',
  slackElementOptions: ['High', 'Medium', 'Low']
})

Fields.set('long_description', {
  airtableFieldName: 'Long description',
  slackInputLabel: 'Description',
  slackElementType: 'plain_text_input',
  slackElementMultiLine: true,
  messageShortcutPrefill: true, // only one field should have this set to true
  validationFn: (value) => {
    if (value.length < 10) {
      return 'Description must be at least 10 characters'
    } else { // return true if there are no errors
      return true
    }
  }
})

// These system fields are meant to be used by the app and are not shown to the user
const SystemFields = new Map()
SystemFields.set('submitter_slack_uid', {
  airtableFieldName: 'Submitter Slack UID'
})
SystemFields.set('submitter_slack_name', {
  airtableFieldName: 'Submitter Slack Name'
})
SystemFields.set('updater_slack_name', {
  airtableFieldName: 'Updater Slack Name'
})
SystemFields.set('updater_slack_uid', {
  airtableFieldName: 'Updater Slack UID'
})

module.exports = {
  Fields,
  SystemFields
}
