import _ from 'lodash'

export const removeEmpty = (obj) => {
  return _.pickBy(obj, (v) => {
    if (_.isArray(v)) return v.length > 0
    if (_.isObject(v)) return !_.isEmpty(v)
    return v !== '' && v != null
  })
}
