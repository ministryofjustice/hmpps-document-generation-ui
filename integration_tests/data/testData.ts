import { components } from '../../server/@types/documentGeneration'

const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const randomChar = () => uppercaseChars.charAt(Math.floor(Math.random() * 26))

export const randomPrisonNumber = () =>
  randomChar() + String(Math.random()).substring(2, 6) + randomChar() + randomChar()

export const testPrisonerDetails = {
  prisonerNumber: 'A9965EA',
  bookingId: '1223167',
  bookNumber: '59862A',
  firstName: 'PRISONER-NAME',
  lastName: 'PRISONER-SURNAME',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  youthOffender: false,
  status: 'ACTIVE IN',
  lastMovementTypeCode: 'ADM',
  lastMovementReasonCode: '24',
  inOutStatus: 'IN',
  prisonId: 'LEI',
  lastPrisonId: 'LEI',
  prisonName: 'Leeds (HMP)',
  cellLocation: '2-1-005',
  aliases: [],
  alerts: [
    {
      alertType: 'L',
      alertCode: 'LCE',
      active: true,
      expired: false,
    },
  ],
  legalStatus: 'REMAND',
  imprisonmentStatus: 'RECEP_REM',
  imprisonmentStatusDescription: 'On remand (reception)',
  convictedStatus: 'Remand',
  recall: false,
  indeterminateSentence: false,
  receptionDate: '2024-11-26',
  locationDescription: 'Leeds (HMP)',
  restrictedPatient: false,
  currentIncentive: {
    level: {
      code: 'STD',
      description: 'Standard',
    },
    dateTime: '2024-11-26T14:12:29',
    nextReviewDate: '2025-02-26',
  },
  addresses: [],
  emailAddresses: [],
  phoneNumbers: [],
  identifiers: [],
  allConvictedOffences: [],
}

export const testGroups: components['schemas']['TemplateGroups'] = {
  groups: [
    {
      code: 'EXTERNAL_MOVEMENT',
      name: 'External movement templates',
      description:
        'Document templates associated with external movements in general. These require a person to be selected',
      roles: ['EXTERNAL_MOVEMENTS_TAP_RO', 'EXTERNAL_MOVEMENTS_TAP_RW'],
    },
    {
      code: 'TEMPORARY_ABSENCE',
      name: 'Temporary absence templates',
      description:
        'Document templates associated with temporary absences. These require a person and a temporary absence to be selected',
      roles: ['EXTERNAL_MOVEMENTS_TAP_RO', 'EXTERNAL_MOVEMENTS_TAP_RW'],
    },
  ],
}

export const testTemplates: components['schemas']['TemplateGroupTemplates'] = {
  group: {
    code: 'EXTERNAL_MOVEMENT',
    name: 'External movement templates',
    description:
      'Document templates associated with external movements in general. These require a person to be selected',
    roles: ['EXTERNAL_MOVEMENTS_TAP_RO', 'EXTERNAL_MOVEMENTS_TAP_RW'],
  },
  templates: [
    {
      id: 'template-1',
      code: 'ROTL_LIC1',
      name: 'ROTL 18 licence document',
      description: 'ROTL licence',
    },
    {
      id: 'template-2',
      code: 'LISP_3',
      name: 'LISP 3',
      description: 'ROTL licence',
    },
  ],
}

export const testVariables: components['schemas']['TemplateVariables'] = {
  domains: [
    {
      code: 'PERSON',
      description: 'Prisoner details',
      variables: [
        {
          code: 'PERSON__NAME',
          description: 'Name',
          type: 'STRING',
        },
      ],
    },
    {
      code: 'TEMPORARY_ABSENCE',
      description: 'Absence information',
      variables: [
        {
          code: 'TEMPORARY_ABSENCE__START_DATE',
          description: 'Temporary absence commences on',
          type: 'STRING',
        },
      ],
    },
  ],
}
