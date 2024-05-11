export const isValidHttpUrl = (string: string) => {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)
