type LowerToUpperToLowerCaseMapper = {
  a: "A"
  b: "B"
  c: "C"
  d: "D"
  e: "E"
  f: "F"
  g: "G"
  h: "H"
  i: "I"
  j: "J"
  k: "K"
  l: "L"
  m: "M"
  n: "N"
  o: "O"
  p: "P"
  q: "Q"
  r: "R"
  s: "S"
  t: "T"
  u: "U"
  v: "V"
  w: "W"
  x: "X"
  y: "Y"
  z: "Z"
}

type UpperToLowerCaseMapper = {
  A: "a"
  B: "b"
  C: "c"
  D: "d"
  E: "e"
  F: "f"
  G: "g"
  H: "h"
  I: "i"
  J: "j"
  K: "k"
  L: "l"
  M: "m"
  N: "n"
  O: "o"
  P: "p"
  Q: "q"
  R: "r"
  S: "s"
  T: "t"
  U: "u"
  V: "v"
  W: "w"
  X: "x"
  Y: "y"
  Z: "z"
}

type HeadLetter<T> = T extends `${infer FirstLetter}${infer _Rest}` ? FirstLetter : never
type TailLetters<T> = T extends `${infer _FirstLetter}${infer Rest}` ? Rest : never

type LetterToUpper<T> = T extends `${infer FirstLetter}${infer _Rest}`
  ? FirstLetter extends keyof LowerToUpperToLowerCaseMapper
    ? LowerToUpperToLowerCaseMapper[FirstLetter]
    : FirstLetter
  : T

type LetterToLower<T> = T extends `${infer FirstLetter}${infer _Rest}`
  ? FirstLetter extends keyof UpperToLowerCaseMapper
    ? UpperToLowerCaseMapper[FirstLetter]
    : FirstLetter
  : T

type ToLowerCase<T> = T extends ""
  ? T
  : `${LetterToLower<HeadLetter<T>>}${ToLowerCase<TailLetters<T>>}`

// First letter is upper rest is lower
type ToSentenceCase<T> = `${LetterToUpper<HeadLetter<T>>}${ToLowerCase<TailLetters<T>>}`

type ToPascalCase<T> = T extends ``
  ? T
  : T extends `${infer FirstWord}_${infer RestLetters}`
    ? `${ToSentenceCase<FirstWord>}${ToPascalCase<RestLetters>}`
    : ToSentenceCase<T>

export type lowerCaseToCamelCase<T> = `${ToLowerCase<HeadLetter<T>>}${TailLetters<ToPascalCase<T>>}`
