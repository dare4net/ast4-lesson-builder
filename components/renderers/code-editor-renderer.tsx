"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Check, RefreshCw } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

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
}: CodeEditorRendererProps) {
  const [code, setCode] = useState(initialCode)
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, boolean>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    setCode(initialCode)
    setOutput("")
    setIsRunning(false)
    setTestResults({})
    setIsSubmitted(false)
  }, [initialCode])

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
      setOutput(`Error: ${error.message}`)
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

      // If all tests passed and we have a score context, add points
      if (allPassed && scoreContext && !isSubmitted) {
        scoreContext.addPoints(points)
      }

      setTestResults(results)
      setIsSubmitted(true)

      // Generate output summary
      const passedCount = Object.values(results).filter(Boolean).length
      setOutput(`${passedCount} of ${testCases.length} tests passed.`)
    } catch (error) {
      setOutput(`Error running tests: ${error.message}`)
    }

    setIsRunning(false)
  }

  const resetEditor = () => {
    setCode(initialCode)
    setOutput("")
    setTestResults({})
    setIsSubmitted(false)
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
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
              <pre className="p-3 text-sm whitespace-pre-wrap">{output}</pre>
            </ScrollArea>
          </div>
        )}

        {testCases.length > 0 && isSubmitted && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Test Results</h4>
            {testCases.map((testCase) => (
              <div
                key={testCase.id}
                className={`p-2 rounded-md flex items-center justify-between ${
                  testResults[testCase.id]
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                }`}
              >
                <div>
                  <span className="font-medium">Test {testCases.indexOf(testCase) + 1}</span>
                  <span className="ml-2 text-sm opacity-80">
                    Input: {testCase.input.length > 20 ? `${testCase.input.slice(0, 20)}...` : testCase.input}
                  </span>
                </div>
                {testResults[testCase.id] ? <Check className="h-4 w-4" /> : <span className="text-sm">Failed</span>}
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
              disabled={isRunning || isSubmitted}
              variant={isSubmitted ? "outline" : "default"}
            >
              <Check className="h-4 w-4 mr-1" />
              Submit
            </Button>
          )}
          <Button onClick={resetEditor} variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
        {points > 0 && <div className="text-sm text-muted-foreground">Points: {points}</div>}
      </CardFooter>
    </Card>
  )
}
