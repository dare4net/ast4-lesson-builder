"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Play, RefreshCw, Lock } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { ScoredRenderer, ScoredRenderProps } from "./base/scored-renderer"
import type { Component } from "@/types/lesson"

interface CodeEditorRendererProps {
  title?: string
  initialCode?: string
  language?: string
  readOnly?: boolean
  testCases?: {
    id: string
    input: string
    expectedOutput: string
  }[]
  points?: number
  isEditing?: boolean
  scoreContext?: {
    score: number
    totalPossible: number
    addPoints: (points: number) => void
  }
  mode?: 'practice' | 'live'
  state?: 'active' | 'disabled'
  disabled?: boolean
  savedState?: any
  setComponentState?: (state: any) => void
  id?: string
  status?: string
}

type CodeEditorState = {
  code: string
  output: string
  testResults: Record<string, boolean>
  isSubmitted: boolean
  status?: string
}

function CodeEditorContent({
  title,
  initialCode,
  language = "javascript",
  readOnly,
  testCases,
  points,
  state,
  setState,
  handleScore,
  handleRetry,
  isLive,
  isDisabled: disabledProp,
  props
}: ScoredRenderProps<CodeEditorState> & {
  title: string
  initialCode: string
  language: string
  readOnly: boolean
  testCases: CodeEditorRendererProps['testCases']
  points: number
  isDisabled: boolean
  props: CodeEditorRendererProps
}) {
  const [mounted, setMounted] = useState(false)
  const [isRunning, setIsRunning] = useState(false)

  const {
    code,
    output,
    testResults,
    isSubmitted,
    status
  } = state

  useEffect(() => {
    setMounted(true)
  }, [])

  // If initialCode changes and we haven't edited (or check if savedState is different?),
  // effectively reset logic if needed.
  // The original used `useEffect` to reset if `initialCode` changed.
  // We can replicate that logic but be careful not to overwrite user work.
  // Original: `if (initialCode !== savedState?.code) ...`
  // Here `state` comes from `savedState` or `initialState`.
  // If `initialCode` prop changes dynamically, we might want to reset.
  // But typically `initialCode` is static config.

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value
    setState(prev => ({ ...prev, code: newCode }))
  }

  const runCode = () => {
    setIsRunning(true)
    setState(prev => ({ ...prev, output: "" }))

    try {
      // Simple JavaScript evaluation for demo purposes
      if (language === "javascript") {
        const userFunction = new Function(
          "console",
          `
          const log = [];
          const consoleObj = {
            log: (...args) => {
              log.push(args.map(arg => String(arg)).join(' '));
            },
            error: (...args) => {
              log.push('Error: ' + args.map(arg => String(arg)).join(' '));
            },
            warn: (...args) => {
              log.push('Warning: ' + args.map(arg => String(arg)).join(' '));
            }
          };
          try {
            ${code}
            return log.join('\\n');
          } catch (error) {
            return 'Error: ' + error.message;
          }
        `,
        )

        const result = userFunction({})
        setState(prev => ({ ...prev, output: result || "No output", status: 'completed' }))
      } else {
        setState(prev => ({ ...prev, output: `Running ${language} code is not supported in this demo.`, status: 'completed' }))
      }
    } catch (error) {
      setState(prev => ({ ...prev, output: `Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`, status: 'completed' }))
    }

    setIsRunning(false)
  }

  const runTests = () => {
    setIsRunning(true)
    setState(prev => ({ ...prev, output: "" }))
    const results: Record<string, boolean> = {}
    let allPassed = true
    const testCasesList = testCases || []

    try {
      if (testCasesList.length === 0) throw new Error("No test cases defined")

      testCasesList.forEach((testCase) => {
        if (language === "javascript") {
          try {
            const userFunction = new Function(
              "input",
              "console",
              `
              const log = [];
              const consoleObj = {
                log: (...args) => {
                  log.push(args.map(arg => String(arg)).join(' '));
                }
              };
              try {
                ${code}
                return log.join('\\n');
              } catch (error) {
                return 'Error: ' + error.message;
              }
            `,
            )
            const result = userFunction(testCase.input, {})
            const passed = result.trim() === testCase.expectedOutput.trim()
            results[testCase.id] = passed
            if (!passed) allPassed = false
          } catch (error) {
            results[testCase.id] = false
            allPassed = false
          }
        } else {
          results[testCase.id] = false
          allPassed = false
        }
      })

      // Scoring (Using standardized handleScore)
      if (allPassed && !isSubmitted) {
        handleScore(true)
      }

      const passedCount = Object.values(results).filter(Boolean).length
      // const allTestsPassed = passedCount === testCasesList.length

      setState(prev => ({
        ...prev,
        testResults: results,
        isSubmitted: true,
        output: allPassed // allTestsPassed
          ? "You Rock! 🎉 All tests passed successfully!"
          : isLive
            ? `${passedCount} of ${testCasesList.length} tests passed. Continue to improve!`
            : `${passedCount} of ${testCasesList.length} tests passed. Try again!`,
        status: isLive ? 'completed' : 'active'
      }))

    } catch (error) {
      setState(prev => ({ ...prev, output: `Error running tests: ${error instanceof Error ? error.message : 'An unknown error occurred'}` }))
    }

    setIsRunning(false)
  }

  const onLocalRetry = () => {
    handleRetry() // Centralized handler
    setState({
      code: initialCode,
      output: "",
      testResults: {},
      isSubmitted: false,
      status: 'active'
    })
  }

  if (!mounted) return null

  if (state.status === 'completed' && !isSubmitted) {
    // Sync local Submitted state if component is completed?
    // No, let state be source of truth.
  }

  // Editing Mode
  if (props.isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="bg-muted p-2 rounded text-sm font-mono">
          <pre className="whitespace-pre-wrap">
            {initialCode.slice(0, 100)}
            {initialCode.length > 100 ? "..." : ""}
          </pre>
        </div>
        {testCases && testCases.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {testCases.length} test case{testCases.length !== 1 ? "s" : ""} defined
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(
      "w-full h-full flex-1 flex flex-col bg-white overflow-hidden group/code transition-all duration-300 px-6",
      disabledProp && "opacity-75"
    )}>
      {/* Visual Accent */}
      <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />

      {/* Header */}
      <div className="shrink-0 relative flex items-center justify-between pt-2">
        <div className="space-y-0.5">
          <span className="text-[8px] font-black text-emerald-600/60 uppercase tracking-[0.2em]">Coding Challenge</span>
          <h3 className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-600 rounded text-[7px] font-black border border-blue-200 uppercase tracking-widest">
              <CheckCircle2 className="h-2.5 w-2.5" />
              <span>Live</span>
            </div>
          )}
          {disabledProp && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 text-slate-400 rounded text-[7px] font-black uppercase tracking-widest border border-slate-200">
              <Lock className="h-2.5 w-2.5" />
              <span>Locked</span>
            </div>
          )}
        </div>
      </div>

      {/* CENTER SECTION: Editor Stage */}
      <div className="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-2">
        <div className="relative space-y-3 my-auto">
          <div className="relative rounded-2xl border-2 border-slate-900 bg-[#0A0D14] overflow-hidden shadow-xl shadow-black/20">
            <div className="px-4 py-2 bg-slate-900/50 border-b border-slate-800/50 flex items-center justify-between backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-2 mr-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 shadow-lg shadow-rose-500/20" />
                  <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20" />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                </div>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  Execution Environment
                </span>
              </div>
            </div>
            <ScrollArea className="h-[140px]">
              <textarea
                value={code}
                onChange={handleCodeChange}
                className="w-full min-h-[140px] p-4 font-mono text-[12px] bg-transparent text-emerald-400 focus:outline-none resize-none placeholder:text-slate-800 selection:bg-emerald-500/30 leading-relaxed"
                readOnly={readOnly || disabledProp}
                spellCheck={false}
                placeholder="// Enter logic here..."
              />
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Output Panel */}
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Console Output</span>
              <div className="h-20 rounded-xl border-2 border-emerald-50 bg-emerald-50/20 p-3 font-mono text-[11px] relative overflow-hidden shadow-inner">
                <ScrollArea className="h-full">
                  <pre className={cn(
                    "whitespace-pre-wrap leading-tight transition-colors duration-500",
                    output.includes("You Rock!") ? "text-emerald-600 font-black" : "text-slate-600"
                  )}>
                    {output || "// Awaiting..."}
                  </pre>
                </ScrollArea>
              </div>
            </div>

            {/* Test Results Panel */}
            <div className="space-y-1">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Test Results</span>
              <div className="h-20 rounded-xl border-2 border-slate-100 bg-slate-50/50 p-3 overflow-y-auto custom-scrollbar shadow-inner">
                {testCases && testCases.length > 0 && isSubmitted ? (
                  <div className="space-y-1">
                    {testCases.map((testCase, idx) => (
                      <div
                        key={testCase.id}
                        className={cn(
                          "px-2.5 py-1 rounded-lg flex items-center justify-between text-[10px] font-black shadow-sm",
                          testResults[testCase.id] ? "bg-emerald-500 text-white" : "bg-rose-50 text-rose-600 border border-rose-100"
                        )}
                      >
                        <span>T-{idx + 1}</span>
                        {testResults[testCase.id] ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center italic text-[#94A3B8] text-[8px]">Pending...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Control Plane */}
      <div className="shrink-0 space-y-2 pb-4 pt-1">
        <div className="flex gap-2">
          <button
            onClick={runCode}
            disabled={isRunning || disabledProp}
            className="h-10 flex-1 rounded-xl bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest transition-all transform active:scale-95 hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center shadow-lg shadow-emerald-500/20 p-0"
          >
            <Play className="h-3.5 w-3.5 mr-2 stroke-[3]" />
            Run Code
          </button>
          {testCases && testCases.length > 0 && (
            <button
              onClick={runTests}
              disabled={isRunning || (isSubmitted && isLive) || disabledProp}
              className={cn(
                "h-10 flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all transform active:scale-95 flex items-center justify-center p-0 shadow-lg",
                isSubmitted && Object.values(testResults).every(Boolean)
                  ? "bg-emerald-700 text-white shadow-emerald-700/20"
                  : "bg-slate-100 text-slate-400 shadow-black/5"
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-2 stroke-[3]" />
              {isSubmitted ? (Object.values(testResults).every(Boolean) ? "Success" : "Failed") : "Submit Code"}
            </button>
          )}
          <button
            onClick={onLocalRetry}
            disabled={disabledProp || (isLive && isSubmitted)}
            className="h-10 w-10 rounded-xl bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition-all transform active:scale-95 flex items-center justify-center p-0 shadow-sm"
          >
            <RefreshCw className="h-4 w-4 stroke-[3]" />
          </button>
        </div>
        <div className="flex justify-center">
          <div className="px-4 py-1.5 bg-emerald-50/50 border-2 border-emerald-100 rounded-xl text-[9px] font-black text-emerald-600/60 uppercase tracking-widest shadow-sm">
            Score: <span className="text-emerald-700">{points} Points</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CodeEditorRenderer(props: CodeEditorRendererProps & { code?: string }) {
  const {
    title = "Code Editor",
    initialCode: rawInitialCode,
    code: legacyCode,
    language = "javascript",
    readOnly = false,
    testCases = [],
    points = 10,
    isEditing = false,
    scoreContext,
    mode = 'practice',
    state: componentState = 'active',
    disabled = false,
    savedState,
    setComponentState,
    id = 'code-editor-renderer',
    status
  } = props

  const initialCode = rawInitialCode ?? legacyCode ?? "// Write your code here\nconsole.log('Hello, world!');"

  const component: Component = {
    id,
    type: 'codeEditor',
    state: componentState as any,
    status: (status || (savedState as any)?.status || 'uncompleted') as any,
    props: { title, initialCode, language, testCases },
    mode: mode as any
  } as Component

  const initialState: CodeEditorState = {
    code: initialCode,
    output: "",
    testResults: {},
    isSubmitted: false,
    status: 'active'
  }

  return (
    <ScoredRenderer<CodeEditorState>
      component={component}
      initialState={initialState}
      savedState={savedState}
      setComponentState={setComponentState}
      points={points}
      mode={mode}
      disabled={disabled}
      onRender={(renderProps) => (
        <CodeEditorContent
          {...renderProps}
          title={title}
          initialCode={initialCode}
          language={language}
          readOnly={readOnly}
          testCases={testCases}
          points={points}
          isDisabled={disabled || component.state === 'disabled'}
          props={props}
        />
      )}
    />
  )
}
