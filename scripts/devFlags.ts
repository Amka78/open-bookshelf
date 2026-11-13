/**
 * bun run start / dev:web が共有する起動フラグの解析。
 *
 * 対応フラグは --dev-client / --debug / --perf[=mode]。parseDevFlags は
 * これらのフラグを args から取り除き、残りの引数は expo start へそのまま渡す。
 */
export type DevFlags = {
  devClient: boolean
  logLevel?: string
  perfMode?: string
}

export function parseDevFlags(args: string[]): DevFlags {
  const take = (name: string): string | true | undefined => {
    const exact = args.indexOf(name)
    if (exact >= 0) {
      args.splice(exact, 1)
      return true
    }
    for (let i = 0; i < args.length; i++) {
      if (args[i].startsWith(`${name}=`)) {
        const value = args[i].slice(name.length + 1)
        args.splice(i, 1)
        return value
      }
    }
    return undefined
  }

  const debug = take("--debug")
  const perf = take("--perf")

  return {
    devClient: take("--dev-client") === true,
    logLevel: debug === true ? "debug" : undefined,
    perfMode: typeof perf === "string" ? perf : perf === true ? "search" : undefined,
  }
}
