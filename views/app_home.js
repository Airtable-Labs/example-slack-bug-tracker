const simpleAppHome = function (airtableBaseId, airtableTableId) {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: "Here's what you can do with this app:"
      }
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: ':new: File a new bug',
            emoji: true
          },
          action_id: 'file_a_bug',
          style: 'primary'
        },
        {
          type: 'button',
          text: {
            type: 'plain_text',
            text: ':link: Visit Airtable base',
            emoji: true
          },
          action_id: 'url_button',
          url: `https://airtable.com/${airtableBaseId}/${airtableTableId}`
        }
      ]
    },
    {
      type: 'context',
      elements: [
        {
          type: 'image',
          image_url: 'https://api.slack.com/img/blocks/bkb_template_images/placeholder.png',
          alt_text: 'placeholder'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'Learn more about this Airtable integration example at https://github.com/airtable-labs/example-slack-bug-tracker'
        }
      ]
    }
  ]
}

module.exports = simpleAppHome
