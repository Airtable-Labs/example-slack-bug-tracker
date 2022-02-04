// List of fields that can be edited using this integration
// This configuration/mapping allows us to use different field names/labels in the app versus how they are defined in Airtable

const Fields = new Map()

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
  airtableFieldName: 'Short description',
  slackInputLabel: 'Description',
  slackElementType: 'plain_text_input',
  slackElementMultiLine: true,
  validationFn: (value) => {
    if (value.length < 10) {
      return 'Description must be at least 10 characters'
    } else { // return true if there are no errors
      return true
    }
  }
})

module.exports = {
  Fields
}
