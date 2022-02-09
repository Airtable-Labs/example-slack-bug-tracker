const { Modal, Blocks, Elements, Bits, setIfTruthy } = require('slack-block-builder')

// Generate array of input blocks based on Fields config
const recordFormFields = (fieldConfigsWithValuesMaybe) => {
  return Array.from(fieldConfigsWithValuesMaybe, ([fieldName, fieldConfig]) => {
    const formBlocks = Blocks.Input({
      label: fieldConfig.slackInputLabel
    })
      .blockId(fieldName)

    // TODO support additional Slack element types
    switch (fieldConfig.slackElementType) {
      case 'static_select':
        formBlocks.element(
          Elements.StaticSelect()
            .actionId(fieldName)
            .initialOption(setIfTruthy(fieldConfig.value, slackSelectOption(fieldConfig.value)))
            .options(fieldConfig.slackElementOptions.map(slackSelectOption))
        )
        break
      default: // plain_text_input
        formBlocks.element(
          Elements.TextInput()
            .actionId(fieldName)
            .initialValue(fieldConfig.value)
            .multiline(fieldConfig.slackElementMultiLine === true)
        )
    }
    return formBlocks
  })
}

const slackSelectOption = (value) => {
  return Bits.Option({ text: value, value: value })
}

const createRecordForm = (fieldConfigsWithValuesMaybe) => {
  return Modal({ title: 'Create record' })
    .callbackId('create_record_submission')
    .blocks(
      Blocks.Section({ text: 'Please fill out the form below to submit a new bug to the product and engineering team. We will triage it ASAP.' }),
      Blocks.Divider(),
      ...recordFormFields(fieldConfigsWithValuesMaybe)
    )
    .submit('Create :rocket:')
    .buildToObject()
}

const updateRecordForm = (fieldConfigsWithValuesMaybe, privateMetadata) => {
  return Modal({ title: 'Update record' })
    .callbackId('update_record_submission')
    .privateMetaData(privateMetadata)
    .blocks(
      Blocks.Section({ text: 'Use this form to update the bug report.\n\nNote that the values displayed here are the latest values and may differ from when you originally submitted your report.' }),
      Blocks.Divider(),
      ...recordFormFields(fieldConfigsWithValuesMaybe)
    )
    .submit('Update')
    .buildToObject()
}

const simpleMessage = (message) => {
  return Modal({ title: 'Information' })
    .blocks(
      Blocks.Section({ text: message })
    )
    .close('Close')
    .buildToObject()
}

module.exports = {
  createRecordForm,
  updateRecordForm,
  simpleMessage
}
