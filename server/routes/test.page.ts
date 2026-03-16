import { BaseTestPage } from '../../integration_tests/pages/baseTestPage'

export class DocumentGenerationHomepage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /localhost:3007\/?(\?group=\w+)?$/,
      title: 'Document generation - DPS',
      heading: 'Document generation',
    })
  }
}
