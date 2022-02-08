const { Message, Blocks, Elements } = require('slack-block-builder')

const initialMessageToSubmitter = function (fieldsWithValues, slackUserId) {
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

const successfullySavedToAirtable = function (baseId, tableId, recordId, recordPrimaryFieldValue) {
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
            // TODO figure out confirm object
            // .confirm({
            //   confirm: 'Are you sure?',
            //   deny: 'Cancel',
            //   text: 'Are you sure you want to delete this record? This action cannot be undone.',
            //   title: 'Delete record'
            // })
        )
    )
    .buildToObject()
}

const recordUpdateConfirmation = function (fieldsWithValues) {
  return Message()
    .blocks(
      Blocks.Section()
        .text('Your request to update the record has been received.'),
      Blocks.Section()
        .fields(fieldsWithValuesToSlackSectionFields(fieldsWithValues))
    )
    .buildToObject()
}

const simpleMessage = function (message) {
  return Message()
    .blocks(
      Blocks.Section()
        .text(message)
    )
    .buildToObject()
}

// Helper functions related to block kit generation
const fieldsWithValuesToSlackSectionFields = function (fieldsWithValues) {
  return Object.keys(fieldsWithValues).map(fieldName => {
    const fieldWithValue = fieldsWithValues[fieldName]
    return slackSectionFieldGenerator(fieldWithValue.slackInputLabel, fieldWithValue.value)
  })
}

const slackSectionFieldGenerator = (key, value) => {
  return `*${key}:*\n${value}`
}

module.exports = {
  initialMessageToSubmitter,
  successfullySavedToAirtable,
  recordUpdateConfirmation,
  simpleMessage
}
