import { md5 } from "js-md5"
import parseAuthenticate from "./AuthenticateParser"

export type DigestChallenge = {
  realm: string
  nonce: string
  qop?: string
  algorithm?: string
  opaque?: string
}

export function parseDigestChallenge(wwwAuthenticate: string): DigestChallenge | null {
  try {
    const parsed = parseAuthenticate(wwwAuthenticate)
    if (parsed.scheme.toLowerCase() !== "digest") return null

    const qopRaw = parsed.params.qop
    const qop = typeof qopRaw === "string" ? qopRaw.split(",").map((s) => s.trim())[0] : undefined

    const toStr = (v: string | string[] | undefined): string =>
      Array.isArray(v) ? (v[0] ?? "") : (v ?? "")

    return {
      realm: toStr(parsed.params.realm),
      nonce: toStr(parsed.params.nonce),
      qop,
      algorithm: toStr(parsed.params.algorithm) || "MD5",
      opaque: parsed.params.opaque ? toStr(parsed.params.opaque) : undefined,
    }
  } catch {
    return null
  }
}

export function computeDigestHeader(
  challenge: DigestChallenge,
  username: string,
  password: string,
  method: string,
  uri: string,
  nc: number,
  cnonce: string,
): string {
  const ncStr = nc.toString(16).padStart(8, "0")
  const ha1 = md5(`${username}:${challenge.realm}:${password}`)
  const ha2 = md5(`${method}:${uri}`)

  let response: string
  if (challenge.qop) {
    response = md5(`${ha1}:${challenge.nonce}:${ncStr}:${cnonce}:${challenge.qop}:${ha2}`)
  } else {
    response = md5(`${ha1}:${challenge.nonce}:${ha2}`)
  }

  let header =
    `Digest username="${username}", realm="${challenge.realm}"` +
    `, nonce="${challenge.nonce}", uri="${uri}"` +
    `, algorithm=${challenge.algorithm || "MD5"}, response="${response}"`

  if (challenge.qop) {
    header += `, qop=${challenge.qop}, nc=${ncStr}, cnonce="${cnonce}"`
  }

  if (challenge.opaque) {
    header += `, opaque="${challenge.opaque}"`
  }

  return header
}

export function generateCnonce(): string {
  const bytes = new Uint8Array(8)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}
