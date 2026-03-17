import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class DownloadDocumentPage extends BaseTestPage {
  async verifyContent(templateName: string) {
    return this.verify({
      pageUrl: /\/download-document\/[\w-]*/,
      title: 'Download document - Document generation - DPS',
      heading: `Create a ${templateName}`,
    })
  }

  submitButton() {
    return this.button('Generate and download')
  }
}
