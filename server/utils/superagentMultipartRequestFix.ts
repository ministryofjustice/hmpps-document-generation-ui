import { Request } from 'superagent'

// TODO: remove this temporary workaround for JSON content in multipart form after the shared library is fixed

const { hasOwn } = Object

/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-syntax */

// @ts-expect-error unsupported function types
// eslint-disable-next-line func-names
Request.prototype.field = function (name, value, options) {
  // name should be either a string or an object.
  if (name === null || undefined === name) {
    throw new Error('.field(name, val) name can not be empty')
  }
  // @ts-expect-error unknown prop
  if (this._data) {
    throw new Error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()")
  }

  if (Array.isArray(value)) {
    for (const i in value) {
      // @ts-expect-error unknown value[i] type
      if (hasOwn(value, i)) this.field(name, value[i])
    }

    return this
  }

  if (typeof value === 'object') {
    this.field(name, JSON.stringify(value), { contentType: 'application/json' })
    return this
  }

  // val should be defined now
  if (value === null || undefined === value) {
    throw new Error('.field(name, val) val can not be empty')
  }

  if (typeof value === 'boolean') {
    // eslint-disable-next-line no-param-reassign
    value = String(value)
  }

  // @ts-expect-error unknown prop
  if (options) this._getFormData().append(name, value, options)
  // @ts-expect-error unknown prop
  else this._getFormData().append(name, value)

  return this
}
