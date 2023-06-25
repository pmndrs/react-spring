import path from 'path'
import fs from 'fs'

import { fileURLToPath } from 'node:url'
import type {
  Analysis,
  ProblemSummary,
  Problem,
  ResolutionKind,
  ProblemKind,
} from '@arethetypeswrong/core'
import {
  checkTgz,
  summarizeProblems,
  getProblems,
} from '@arethetypeswrong/core'
import React from 'react'
import { render, Text, Box, Static } from 'ink'
import yargs from 'yargs/yargs'

const allResolutionKinds: ResolutionKind[] = [
  'node10',
  'node16-cjs',
  'node16-esm',
  'bundler',
]

const problemEmoji: Record<ProblemKind, string> = {
  Wildcard: '❓',
  NoResolution: '💀',
  UntypedResolution: '❌',
  FalseCJS: '🎭',
  FalseESM: '👺',
  CJSResolvesToESM: '⚠️',
  FallbackCondition: '🐛',
  CJSOnlyExportsDefault: '🤨',
  FalseExportDefault: '❗️',
  UnexpectedESMSyntax: '🚭',
  UnexpectedCJSSyntax: '🚱',
}

const problemShortDescriptions: Record<ProblemKind, string> = {
  Wildcard: `${problemEmoji.Wildcard} Unable to check`,
  NoResolution: `${problemEmoji.NoResolution} Failed to resolve`,
  UntypedResolution: `${problemEmoji.UntypedResolution} No types`,
  FalseCJS: `${problemEmoji.FalseCJS} Masquerading as CJS`,
  FalseESM: `${problemEmoji.FalseESM} Masquerading as ESM`,
  CJSResolvesToESM: `${problemEmoji.CJSResolvesToESM} ESM (dynamic import only)`,
  FallbackCondition: `${problemEmoji.FallbackCondition} Used fallback condition`,
  CJSOnlyExportsDefault: `${problemEmoji.CJSOnlyExportsDefault} CJS default export`,
  FalseExportDefault: `${problemEmoji.FalseExportDefault} Incorrect default export`,
  UnexpectedESMSyntax: `${problemEmoji.UnexpectedESMSyntax} Unexpected ESM syntax`,
  UnexpectedCJSSyntax: `${problemEmoji.UnexpectedCJSSyntax} Unexpected CJS syntax`,
}

const resolutionKinds: Record<ResolutionKind, string> = {
  node10: 'node10',
  'node16-cjs': 'node16 (from CJS)',
  'node16-esm': 'node16 (from ESM)',
  bundler: 'bundler',
}

const moduleKinds = {
  1: '(CJS)',
  99: '(ESM)',
  '': '',
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface Checks {
  analysis: Analysis
  problemSummaries?: ProblemSummary[]
  problems?: Problem[]
}

const rsPackagePath = path.join(__dirname, './web/package.tgz')

const rsPackageTgzBytes = fs.readFileSync(rsPackagePath)

function Header({ text, width }: { text: string; width: number | string }) {
  return (
    <Box borderStyle="single" width={width}>
      <Text color="blue">{text}</Text>
    </Box>
  )
}

function Traces({
  analysis,
  subpaths,
}: {
  analysis: Analysis
  subpaths: string[]
}) {
  if (!('entrypointResolutions' in analysis)) {
    return null
  }

  return (
    <Box flexDirection="column" width="100%">
      {subpaths.map(subpath => {
        const resolutionDetails = Object.entries(
          analysis.entrypointResolutions[subpath]
        )
        return (
          <Box width="100%" key={'traces-' + subpath} flexDirection="column">
            <Text color="blue" bold>
              Traces for Subpath: {subpath}
            </Text>
            {resolutionDetails.map(([resolutionKind, details]) => {
              return (
                <Box
                  width="100%"
                  key={`resolutionDetails-${resolutionKind}-${subpath}`}
                  flexDirection="column"
                >
                  <Text bold>{resolutionKind} Traces:</Text>
                  <Box flexDirection="column">
                    {details.trace.map((traceLine, i) => {
                      return (
                        <Text
                          key={`resolutionDetails-traces-${subpath}-${resolutionKind}-${i}`}
                        >
                          {traceLine}
                        </Text>
                      )
                    })}
                  </Box>
                </Box>
              )
            })}
          </Box>
        )
      })}
    </Box>
  )
}

function ChecksTable(props: { checks?: Checks }) {
  if (!props.checks || !props.checks.analysis.containsTypes) {
    return null
  }

  const { analysis, problems, problemSummaries } = props.checks
  const subpaths = Object.keys(analysis.entrypointResolutions).filter(
    key => !key.includes('package.json')
  )
  const entrypoints = subpaths.map(s =>
    s === '.'
      ? analysis.packageName
      : `${analysis.packageName}/${s.substring(2)}`
  )

  const numColumns = entrypoints.length + 1

  const columnWidth = `${100 / numColumns}%`

  return (
    <Box flexDirection="column" width="100%">
      <Box>
        <Header key={'empty'} text={''} width={columnWidth} />
        {entrypoints.map(text => {
          return <Header key={text} text={text} width={columnWidth} />
        })}
      </Box>
      {allResolutionKinds.map(resolutionKind => {
        return (
          <Box key={resolutionKind} width="100%">
            <Box borderStyle="single" width={columnWidth}>
              <Text>{resolutionKinds[resolutionKind]}</Text>
            </Box>
            {subpaths.map(subpath => {
              const problemsForCell = problems?.filter(
                problem =>
                  problem.entrypoint === subpath &&
                  problem.resolutionKind === resolutionKind
              )
              const resolution =
                analysis.entrypointResolutions[subpath][resolutionKind]
                  .resolution

              let content: React.ReactNode

              if (problemsForCell?.length) {
                content = (
                  <Box flexDirection="column">
                    {problemsForCell.map(problem => {
                      return (
                        <Box key={problem.kind}>
                          <Text>{problemShortDescriptions[problem.kind]}</Text>
                        </Box>
                      )
                    })}
                  </Box>
                )
              } else if (resolution?.isJson) {
                content = <Text>✅ (JSON)</Text>
              } else {
                content = (
                  <Text>
                    {'✅ ' +
                      moduleKinds[resolution?.moduleKind?.detectedKind || '']}
                  </Text>
                )
              }
              return (
                <Box key={subpath} width={columnWidth} borderStyle="single">
                  {content}
                </Box>
              )
            })}
          </Box>
        )
      })}
      {problemSummaries?.map(summary => {
        return (
          <Box width="100%" key={summary.kind} flexDirection="column">
            <Text color="red" bold>
              {summary.kind}: {summary.title}
            </Text>
            {summary.messages.map(message => {
              return (
                <Text key={message.messageText}>{message.messageText}</Text>
              )
            })}
          </Box>
        )
      })}
      <Traces analysis={analysis} subpaths={subpaths} />
    </Box>
  )
}

const { argv } = yargs(process.argv).option('nonErrorProblems', {
  alias: 'n',
  type: 'array',
  description: 'Do not treat these problems as errors for CLI exit codes',
  choices: Object.keys(problemShortDescriptions) as ProblemKind[],
})

interface CLIOptions {
  nonErrorProblems?: ProblemKind[]
}

;(async function main({ nonErrorProblems = [] }: CLIOptions) {
  const analysis = await checkTgz(rsPackageTgzBytes)

  const checks: Checks = {
    analysis,
    problems: undefined,
    problemSummaries: undefined,
  }
  if ('entrypointResolutions' in analysis) {
    const problems = analysis.containsTypes ? getProblems(analysis) : undefined
    checks.problems = problems

    if (problems) {
      const problemSummaries = analysis.containsTypes
        ? summarizeProblems(problems, analysis)
        : undefined
      checks.problemSummaries = problemSummaries
    }
  }

  // Ink will duplicate all of its output if it is longer than the terminal height.
  // Known bug with the underlying rendering: https://github.com/vadimdemedes/ink/issues/48
  // Solution is to mark the entire content as "static" so it won't get updated, but flushed.
  render(
    <Static items={[checks]}>
      {(checks: Checks, index: number) => {
        return <ChecksTable key={`checks-${index}`} checks={checks} />
      }}
    </Static>
  )

  const { problems = [] } = checks

  console.log('\n\nProblem results:')

  if (nonErrorProblems.length) {
    console.log(
      'Treating these problem categories as non-errors: ',
      nonErrorProblems
    )
  }

  const filteredProblems = problems.filter(
    p => !nonErrorProblems.includes(p.kind)
  )

  if (filteredProblems.length) {
    console.error(
      'Remaining problems: ',
      filteredProblems.map(p => p.kind)
    )
  } else {
    console.log('No errors found!')
  }

  const exitCode = filteredProblems.length
  process.exit(exitCode)
})({
  nonErrorProblems: argv.nonErrorProblems as ProblemKind[],
})
