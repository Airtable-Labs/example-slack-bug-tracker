const { Message, Blocks, Elements, ConfirmationDialog } = require('slack-block-builder')

const recordCreationRequestReceived = (fieldsWithValues, slackUserId) => {
  return Message()
    .blocks(
      Blocks.Section()
        .text(`<@${slackUserId}> Thank you for your report! The team will triage it ASAP.`),
      Blocks.Section()
        .fields(fieldsWithValuesToSlackSectionFields(fieldsWithValues)),
      Blocks.Section()
        .text('_This message will update once your submission is saved to Airtable._')
    )
    .buildToObject()
}

const recordCreationSuccessful = (baseId, tableId, recordId, recordPrimaryFieldValue) => {
  return Message()
    .blocks(
      Blocks.Section()
        .text(`:white_check_mark: Your record has been saved to Airtable. The new record's primary field value is *${recordPrimaryFieldValue}* and the record ID is ${recordId}.`),
      Blocks.Actions()
        .elements(
          Elements.Button({
            text: ':link: Open in browser',
            emoji: true
          })
            .actionId('url_button')
            .url(`https://airtable.com/${baseId}/${tableId}/${recordId}`)
            .primary(),
          Elements.Button({
            text: ':writing_hand: Edit',
            emoji: true
          })
            .actionId('edit_record')
            .value(recordId),
          Elements.Button({
            text: ':x: Delete',
            emoji: true
          })
            .actionId('delete_record')
            .value(recordId)
            .danger()
            .confirm(
              ConfirmationDialog({
                title: 'Are you sure?',
                text: ':bangbang: Are you sure you want to delete this record from Airtable?',
                confirm: 'Yes, delete record',
                deny: 'Cancel'
              })
            )
        )
    )
    .buildToObject()
}

const recordUpdateRequestReceived = (fieldsWithValues) => {
  return Message()
    .blocks(
      Blocks.Section()
        .text('Your request to update the record has been received.'),
      Blocks.Section()
        .fields(fieldsWithValuesToSlackSectionFields(fieldsWithValues))
    )
    .buildToObject()
}

const simpleMessage = (message) => {
  return Message()
    .blocks(
      Blocks.Section()
        .text(message)
    )
    .buildToObject()
}

// Helper functions related to block kit generation
const fieldsWithValuesToSlackSectionFields = (fieldsWithValues) => {
  return Object.keys(fieldsWithValues).map(fieldName => {
    const fieldWithValue = fieldsWithValues[fieldName]
    return slackSectionFieldGenerator(fieldWithValue.slackInputLabel, fieldWithValue.value)
  })
}

const slackSectionFieldGenerator = (key, value) => {
  return `*${key}:*\n${value}`
}

module.exports = {
  recordCreationRequestReceived,
  recordCreationSuccessful,
  recordUpdateRequestReceived,
  simpleMessage
}
