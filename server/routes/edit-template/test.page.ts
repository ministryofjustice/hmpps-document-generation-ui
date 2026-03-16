import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class EditTemplatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/edit-template\/[\w-]*$/,
      title: 'Edit template - Document generation - DPS',
      heading: 'Edit template',
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
