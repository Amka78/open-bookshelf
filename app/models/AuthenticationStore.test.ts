import { AuthenticationStoreModel } from "./AuthenticationStore"

describe("AuthenticationStore", () => {
  const testUserId = "userId"
  const testPassword = "password"
  const testToken = "dXNlcklkOnBhc3N3b3Jk"
  test("Login information must be retained at login.", () => {
    const store = AuthenticationStoreModel.create({})

    store.login(testUserId, testPassword)

    expect(store.userId).toBe(testUserId)
    expect(store.password).toBe(testPassword)
    expect(store.token).toBe(testToken)
    expect(store.isAuthenticated).toBe(true)
    expect(store.getHeader()).toEqual({
      Authorization: `Basic ${testToken}`,
    })
    expect(store.AuthenticationHeader).toEqual({
      Authorization: `Basic ${testToken}`,
    })
  })

  test("That information is deleted when logging out.", () => {
    const store = AuthenticationStoreModel.create({
      userId: testUserId,
      password: testPassword,
      token: testToken,
    })

    store.logout()

    expect(store.userId).toBe("")
    expect(store.password).toBe("")
    expect(store.token).toBeUndefined()
  })
})
