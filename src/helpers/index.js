export function bindFormChange(e) {
  let { currentTarget, detail } = e
  let { dataset } = currentTarget
  let form_key = dataset.form_key
  let value = detail.value
  return {
    form_key,
    value
  }
}