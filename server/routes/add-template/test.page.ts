import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class AddTemplatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/add-template$/,
      title: 'Add template - Document generation - DPS',
      heading: 'Add template',
    })
  }

  groupInput() {
    return this.dropdown('Group')
  }

  codeInput() {
    return this.textbox('Code')
  }

  nameInput() {
    return this.textbox('Name')
  }

  descriptionInput() {
    return this.textbox('Description (optional)')
  }

  instructionTextInput() {
    return this.textbox('Instruction text (optional)')
  }

  fileInput() {
    return this.page.locator('input[name="file"]')
  }

  variableCheckbox() {
    return this.checkbox('Full name')
  }

  submitButton() {
    return this.button('Save')
  }
}
