import { describe, expect, test } from "bun:test"
import { computeDigestHeader, generateCnonce, parseDigestChallenge } from "./digestAuth"

describe("parseDigestChallenge", () => {
  test("parses a standard Digest challenge", () => {
    const header = 'Digest realm="calibre", nonce="abc123", qop="auth", algorithm=MD5'
    const result = parseDigestChallenge(header)

    expect(result).not.toBeNull()
    expect(result?.realm).toBe("calibre")
    expect(result?.nonce).toBe("abc123")
    expect(result?.qop).toBe("auth")
    expect(result?.algorithm).toBe("MD5")
  })

  test("parses challenge with opaque parameter", () => {
    const header =
      'Digest realm="calibre", nonce="abc123", qop="auth", algorithm=MD5, opaque="xyz789"'
    const result = parseDigestChallenge(header)

    expect(result).not.toBeNull()
    expect(result?.opaque).toBe("xyz789")
  })

  test("picks the first qop option from a comma-separated list", () => {
    const header = 'Digest realm="calibre", nonce="abc123", qop="auth,auth-int", algorithm=MD5'
    const result = parseDigestChallenge(header)

    expect(result).not.toBeNull()
    expect(result?.qop).toBe("auth")
  })

  test("defaults algorithm to MD5 when absent", () => {
    const header = 'Digest realm="calibre", nonce="abc123", qop="auth"'
    const result = parseDigestChallenge(header)

    expect(result).not.toBeNull()
    expect(result?.algorithm).toBe("MD5")
  })

  test("returns null for Basic scheme", () => {
    const header = 'Basic realm="calibre"'
    const result = parseDigestChallenge(header)

    expect(result).toBeNull()
  })

  test("returns null for invalid header", () => {
    const result = parseDigestChallenge("")
    expect(result).toBeNull()
  })
})

describe("computeDigestHeader", () => {
  test("computes a correct Digest header with qop=auth", () => {
    const challenge = {
      realm: "calibre",
      nonce: "testnonce123",
      qop: "auth",
      algorithm: "MD5",
    }

    const header = computeDigestHeader(
      challenge,
      "testuser",
      "testpass",
      "GET",
      "/interface-data/update?1234567",
      1,
      "fixedcnonce",
    )

    expect(header).toContain('Digest username="testuser"')
    expect(header).toContain('realm="calibre"')
    expect(header).toContain('nonce="testnonce123"')
    expect(header).toContain('uri="/interface-data/update?1234567"')
    expect(header).toContain("algorithm=MD5")
    expect(header).toContain("qop=auth")
    expect(header).toContain("nc=00000001")
    expect(header).toContain('cnonce="fixedcnonce"')
    expect(header).toContain("response=")
  })

  test("produces a deterministic response hash", () => {
    const challenge = {
      realm: "calibre",
      nonce: "testnonce",
      qop: "auth",
      algorithm: "MD5",
    }

    const h1 = computeDigestHeader(challenge, "user", "pass", "GET", "/path", 1, "cnonce1")
    const h2 = computeDigestHeader(challenge, "user", "pass", "GET", "/path", 1, "cnonce1")

    expect(h1).toBe(h2)
  })

  test("different nonce counts produce different responses", () => {
    const challenge = {
      realm: "calibre",
      nonce: "testnonce",
      qop: "auth",
      algorithm: "MD5",
    }

    const h1 = computeDigestHeader(challenge, "user", "pass", "GET", "/path", 1, "cnonce1")
    const h2 = computeDigestHeader(challenge, "user", "pass", "GET", "/path", 2, "cnonce1")

    expect(h1).not.toBe(h2)
  })

  test("omits qop/nc/cnonce when qop is undefined", () => {
    const challenge = {
      realm: "calibre",
      nonce: "testnonce",
      algorithm: "MD5",
    }

    const header = computeDigestHeader(challenge, "user", "pass", "GET", "/path", 1, "cnonce1")

    expect(header).not.toContain("qop=")
    expect(header).not.toContain("nc=")
    expect(header).not.toContain("cnonce=")
  })

  test("includes opaque when present in challenge", () => {
    const challenge = {
      realm: "calibre",
      nonce: "testnonce",
      qop: "auth",
      algorithm: "MD5",
      opaque: "opaque_value",
    }

    const header = computeDigestHeader(challenge, "user", "pass", "GET", "/path", 1, "cnonce1")

    expect(header).toContain('opaque="opaque_value"')
  })
})

describe("generateCnonce", () => {
  test("returns a 16-character hex string", () => {
    const cnonce = generateCnonce()
    expect(cnonce).toMatch(/^[0-9a-f]{16}$/)
  })

  test("generates unique values", () => {
    const values = new Set(Array.from({ length: 20 }, () => generateCnonce()))
    expect(values.size).toBe(20)
  })
})
