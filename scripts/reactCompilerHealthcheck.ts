#!/usr/bin/env bun
/**
 * React Compiler healthcheck.
 *
 * Run: bun run healthcheck (also the last step of `bun run compile`)
 *      bun run healthcheck --strict   exit 1 on rules-of-React violations
 *      bun run healthcheck <glob>     scan a subset
 *
 * React Compiler silently skips ("bails out of") components it cannot compile,
 * so a bailout degrades the app without failing any build. This runs every app
 * source through the compiler and reports what it left behind, split by cause:
 *
 *   rules of React violations  real bugs in our code (e.g. reading a ref during
 *                              render, conditional hooks). `--strict` fails on
 *                              these; `bun run compile` reports only, because
 *                              the current violations are still being cleaned up.
 *   compiler limitations       try/catch and destructuring patterns the compiler
 *                              does not support yet. Informational.
 *
 * `panicThreshold: "none"` makes the plugin report an event per component
 * instead of throwing, so one bad component cannot hide the rest of its file.
 * The official react-compiler-healthcheck 1.0.0 is not used here: it switches on
 * an error-severity enum that babel-plugin-react-compiler 1.0.0 no longer
 * matches, which makes it silently drop compile failures.
 */
import { transformSync } from "@babel/core"
import reactCompiler from "babel-plugin-react-compiler"
import * as fs from "node:fs/promises"

// Stories and tests only run through Vite/esbuild, where this Babel plugin
// never runs, so they are not part of the compiled surface.
const DEFAULT_GLOBS = ["App.tsx", "app/**/*.ts", "app/**/*.tsx"]
const IGNORED = [/\.test\.tsx?$/, /\.stories\.tsx?$/]

type CompilerEvent = {
  kind: "CompileSuccess" | "CompileError" | "CompileDiagnostic" | "PipelineError"
  fnLoc?: { start: { line: number; column: number } } | null
  detail?: {
    severity?: string
    reason?: string
    description?: string
    loc?: { start: { line: number; column: number } } | null
  } | null
}

type Skip = { file: string; loc: string; violation: boolean; reasons: Set<string> }

const args = process.argv.slice(2)
const strict = args.includes("--strict")
const globs = args.filter((arg) => !arg.startsWith("--"))

const files = new Set<string>()
for (const pattern of globs.length > 0 ? globs : DEFAULT_GLOBS) {
  for await (const file of new Bun.Glob(pattern).scan({ cwd: process.cwd() })) {
    if (!IGNORED.some((ignored) => ignored.test(file))) {
      files.add(file)
    }
  }
}

if (files.size === 0) {
  console.error(`healthcheck matched no files: ${globs.join(" ")}`)
  process.exit(1)
}

let compiled = 0
const skips = new Map<string, Skip>()

for (const file of [...files].sort()) {
  const source = await fs.readFile(file, "utf8")
  const onEvent = (event: CompilerEvent) => {
    if (event.kind === "CompileSuccess") {
      compiled += 1
      return
    }
    if (event.kind === "CompileDiagnostic") {
      return
    }
    // A component may report several diagnostics for the same function.
    const start = event.fnLoc?.start ?? event.detail?.loc?.start
    const loc = start ? `${start.line}:${start.column + 1}` : "-"
    const key = `${file}:${start?.line ?? "-"}:${start?.column ?? "-"}`
    const skip = skips.get(key) ?? { file, loc, violation: false, reasons: new Set<string>() }
    if (event.detail?.severity === "Error") {
      skip.violation = true
    }
    skip.reasons.add(event.detail?.reason ?? event.kind)
    skips.set(key, skip)
  }

  try {
    transformSync(source, {
      filename: file,
      configFile: false,
      babelrc: false,
      parserOpts: { plugins: ["typescript", "jsx"], sourceType: "module" },
      plugins: [
        [
          reactCompiler,
          {
            noEmit: true,
            compilationMode: "infer",
            panicThreshold: "none",
            logger: {
              logEvent: (_filename: string | null, event: unknown) =>
                onEvent(event as CompilerEvent),
            },
          },
        ],
      ],
    })
  } catch (error) {
    const key = `${file}:crash`
    skips.set(key, {
      file,
      loc: "-",
      violation: true,
      reasons: new Set([`compiler crashed: ${(error as Error).message.split("\n")[0]}`]),
    })
  }
}

console.log(`React Compiler: ${compiled} of ${compiled + skips.size} components compiled`)

const violations = [...skips.values()].filter((skip) => skip.violation)
if (violations.length > 0) {
  console.log(`${violations.length} skipped (rules of React):`)
  for (const skip of violations) {
    console.log(`  ${skip.file}:${skip.loc}  ${[...skip.reasons].join("; ")}`)
  }
}

const limitationCounts = new Map<string, number>()
for (const skip of skips.values()) {
  if (skip.violation) continue
  for (const reason of skip.reasons) {
    limitationCounts.set(reason, (limitationCounts.get(reason) ?? 0) + 1)
  }
}

if (limitationCounts.size > 0) {
  const total = [...limitationCounts.values()].reduce((sum, count) => sum + count, 0)
  console.log(`${total} skipped (compiler limitations):`)
  for (const [reason, count] of [...limitationCounts].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${count}x ${reason}`)
  }
}

if (strict && violations.length > 0) {
  process.exit(1)
}
