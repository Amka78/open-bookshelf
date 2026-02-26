const directMap: Record<string, string> = {
  "やまだ たろう": "yamada tarou",
  たろう: "tarou",
  "ヤマダ ハナコ": "yamada hanako",
}

export const toRomaji = (str: string): string => {
  let result = str

  Object.entries(directMap).forEach(([key, value]) => {
    result = result.replace(new RegExp(key, "g"), value)
  })

  return result
}
