declare module "bun:test" {
  export const afterAll: typeof afterAll
  export const afterEach: typeof afterEach
  export const beforeAll: typeof beforeAll
  export const beforeEach: typeof beforeEach
  export const describe: typeof describe
  export const expect: typeof expect
  export const jest: typeof jest
  export const mock: {
    module(modulePath: string, factory: () => unknown): void
  }
  export const test: typeof test
}
