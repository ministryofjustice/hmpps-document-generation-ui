const properCase = (word: string): string =>
  word.length >= 1 ? word[0]!.toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str?: string | null): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence?: string | null): string =>
  isBlank(sentence) ? '' : sentence!.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string | null): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0]?.[0]}. ${array.reverse()[0]}`
}

interface SelectOption {
  text: string
  value: string | number
  selected?: boolean
  attributes?: Record<string, string>
}

export const setSelectedValue = (items: SelectOption[] | null, selected: string | number): SelectOption[] | null => {
  if (!items) return null
  return items.map(entry => ({ ...entry, selected: entry && entry.value === selected }))
}

export const setCheckedValue = (
  items: SelectOption[] | null,
  selected: (string | number)[] | (string | number),
): SelectOption[] | null => {
  if (!items) return null
  return items.map(entry => ({
    ...entry,
    checked: entry && Array.isArray(selected) ? selected.includes(entry.value) : entry.value === selected,
  }))
}
