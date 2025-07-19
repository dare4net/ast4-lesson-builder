"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Play, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

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
  savedState?: {
    code?: string
    output?: string
    testResults?: Record<string, boolean>
    isSubmitted?: boolean
    status?: 'active' | 'completed'
  }
  setComponentState?: (state: any) => void
}

export function CodeEditorRenderer({
  title = "Code Editor",
  initialCode = "",
  language = "javascript",
  readOnly = false,
  testCases = [],
  points = 10,
  isEditing = false,
  scoreContext,
  mode = 'practice',
  state = 'active',
  disabled = false,
  savedState,
  setComponentState,
}: CodeEditorRendererProps) {
  const [mounted, setMounted] = useState(false)
  const [code, setCode] = useState(() => savedState?.code ?? initialCode)
  const [output, setOutput] = useState(() => savedState?.output ?? "")
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>(() => savedState?.testResults ?? {})
  const [isSubmitted, setIsSubmitted] = useState(() => savedState?.isSubmitted ?? false)
  
  const isDisabled = disabled || state === 'disabled'
  const isLiveMode = mode === 'live'

  // Debug logs
  useEffect(() => {
    console.log('Code Editor Mode:', mode);
    console.log('Is Live Mode:', isLiveMode);
    console.log('Saved State:', savedState);
  }, [mode, isLiveMode, savedState]);

  // Handle initial mount and state persistence
  useEffect(() => {
    setMounted(true)
    if (!savedState && setComponentState) {
      // Persist initial state
      setComponentState({
        code: initialCode,
        output: "",
        testResults: {},
        isSubmitted: false,
        status: 'active'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist state changes
  useEffect(() => {
    if (!mounted) return
    if (setComponentState) {
      setComponentState({
        code,
        output,
        testResults,
        isSubmitted,
        status: isLiveMode || Object.values(testResults).every(Boolean) ? 'completed' : 'active'
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, output, testResults, isSubmitted])

  useEffect(() => {
    if (initialCode !== savedState?.code) {
      setCode(initialCode)
      setOutput("")
      setIsRunning(false)
      setTestResults({})
      setIsSubmitted(false)
    }
  }, [initialCode, savedState?.code])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const runCode = () => {
    setIsRunning(true)
    setOutput("")

    try {
      // Simple JavaScript evaluation for demo purposes
      // In a real implementation, this would use a sandboxed environment
      if (language === "javascript") {
        // Create a function from the code
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
        setOutput(result || "No output")
      } else {
        setOutput(`Running ${language} code is not supported in this demo.`)
      }
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'An unknown error occurred'}`)
    }

    setIsRunning(false)
  }

  const runTests = () => {
    setIsRunning(true)
    setOutput("")
    const results: Record<string, boolean> = {}
    let allPassed = true

    try {
      // For each test case, run the code with the input and check the output
      testCases.forEach((testCase) => {
        // In a real implementation, this would use a sandboxed environment
        // and properly handle different languages
        if (language === "javascript") {
          try {
            // Create a function from the code that takes input
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

      // Only add points in live mode when all tests pass
      if (allPassed && isLiveMode && scoreContext && !isSubmitted) {
        scoreContext.addPoints(points)
      }

      const passedCount = Object.values(results).filter(Boolean).length
      const allTestsPassed = passedCount === testCases.length

      // Update all state at once to minimize re-renders
      const newState = {
        testResults: results,
        isSubmitted: true,
        output: allTestsPassed
          ? "You Rock! 🎉 All tests passed successfully!"
          : isLiveMode 
            ? `${passedCount} of ${testCases.length} tests passed. Continue to improve!` 
            : `${passedCount} of ${testCases.length} tests passed. Try again!`,
        status: isLiveMode || allTestsPassed ? 'completed' : 'active'
      }

      setTestResults(results)
      setIsSubmitted(true)
      setOutput(newState.output)

      // Persist state immediately after test completion
      setComponentState?.({
        ...newState,
        code
      })
    } catch (error) {
      setOutput(`Error running tests: ${error instanceof Error ? error.message : 'An unknown error occurred'}`)
    }

    setIsRunning(false)
  }

  const resetEditor = () => {
    const newState = {
      code: initialCode,
      output: "",
      testResults: {},
      isSubmitted: false,
      status: 'active'
    }
    
    setCode(initialCode)
    setOutput("")
    setTestResults({})
    setIsSubmitted(false)

    // Persist reset state
    setComponentState?.(newState)
  }

  // In editing mode, show a simplified version
  if (isEditing) {
    return (
      <div className="border p-4 rounded-md">
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="bg-muted p-2 rounded text-sm font-mono">
          <pre className="whitespace-pre-wrap">
            {initialCode.slice(0, 100)}
            {initialCode.length > 100 ? "..." : ""}
          </pre>
        </div>
        {testCases.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            {testCases.length} test case{testCases.length !== 1 ? "s" : ""} defined
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={cn(
      isDisabled && "opacity-75",
      isLiveMode && "border-blue-500"
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {isLiveMode && (
            <div className="flex items-center gap-2 text-sm text-blue-500">
              <span>Live Mode</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md">
          <div className="bg-muted px-3 py-2 border-b text-sm font-medium">
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </div>
          <ScrollArea className="h-[200px]">
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full h-full p-3 font-mono text-sm focus:outline-none resize-none"
              readOnly={readOnly}
              spellCheck={false}
            />
          </ScrollArea>
        </div>

        {output && (
          <div className="border rounded-md">
            <div className="bg-muted px-3 py-2 border-b text-sm font-medium">Output</div>
            <ScrollArea className="h-[100px]">
              <pre className={cn(
                "p-3 text-sm whitespace-pre-wrap",
                output.includes("You Rock!") && "bg-[#E8F5E9] text-[#2E7D32]"
              )}>{output}</pre>
            </ScrollArea>
          </div>
        )}

        {testCases.length > 0 && isSubmitted && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Test Results</h4>
            {testCases.map((testCase) => (
              <div
                key={testCase.id}
                className={cn(
                  "p-2 rounded-md flex items-center justify-between",
                  testResults[testCase.id]
                    ? "bg-[#E8F5E9] text-[#2E7D32] border border-[#4CAF50]"
                    : "bg-destructive/20 text-destructive border border-destructive"
                )}
              >
                <div>
                  <span className="font-medium">Test {testCases.indexOf(testCase) + 1}</span>
                  <span className="ml-2 text-sm opacity-80">
                    Input: {testCase.input.length > 20 ? `${testCase.input.slice(0, 20)}...` : testCase.input}
                  </span>
                </div>
                {testResults[testCase.id] ? (
                  <CheckCircle2 className="h-5 w-5 text-[#4CAF50]" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button onClick={runCode} disabled={isRunning}>
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
          {testCases.length > 0 && (
            <Button
              onClick={runTests}
              disabled={isRunning || (isSubmitted && isLiveMode) || isDisabled}
              className={cn(
                isSubmitted && Object.values(testResults).every(Boolean)
                  ? "bg-success text-success-foreground"
                  : ""
              )}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              {isSubmitted ? (
                Object.values(testResults).every(Boolean) ? "Complete! 🎉" : "Complete"
              ) : (
                "Submit"
              )}
            </Button>
          )}
          <Button 
            onClick={resetEditor} 
            variant="outline"
            disabled={isDisabled || (isLiveMode && isSubmitted)}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        {points > 0 && (
          <div className={cn(
            "text-sm",
            isLiveMode ? "text-blue-500" : "text-muted-foreground"
          )}>
            Points: {points}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
