export function lowerCaseToCamelCase(value: string) {
  let result = value
  if (value.match("_")) {
    const splitted: string[] = value.split("_")

    splitted.map((value, index) => {
      if (index !== 0) {
        result += value.substring(0, 1).toUpperCase() + value.substring(1, value.length)
      } else {
        result = value
      }
    })
  }
  return result
}

export function camelCaseToLowerCase(value: string) {
  let result = value
  const matched = value.match(/[A-Z]/g)

  if (matched) {
    matched.map((value, index) => {
      result = result.replace(value, `_${value.toLowerCase()}`)
    })
  }
  return result
}
