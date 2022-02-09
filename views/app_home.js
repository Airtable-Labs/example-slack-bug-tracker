const { HomeTab, Blocks, Elements } = require('slack-block-builder')

const appHome = (airtableBaseId, airtableTableId) => {
  return HomeTab()
    .blocks(
      Blocks.Header({ text: 'Welcome to the Bug Tracker' }),
      Blocks.Section({
        text: 'This is an example Slack app that allows you to submit records to Airtable without leaving Slack :sparkles:\n\n'
      }),
      Blocks.Divider(),
      Blocks.Actions()
        .elements(
          Elements.Button({
            type: 'plain_text',
            text: ':new: Create a new record',
            emoji: true
          })
            .actionId('create_record')
            .primary(),
          Elements.Button({
            type: 'plain_text',
            text: ':link: Open Airtable base',
            emoji: true
          })
            .url(`https://airtable.com/${airtableBaseId}/${airtableTableId}`)
            .actionId('url_button')
        ),
      Blocks.Section({
        text: '\n'
      }),
      Blocks.Section({
        text: '\n \nLearn more about this Airtable integration example at https://github.com/airtable-labs/example-slack-bug-tracker'
      })
    )
    .buildToObject()
}

module.exports = appHome
