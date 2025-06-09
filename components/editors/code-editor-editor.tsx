"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TestCase {
  id: string
  input: string
  expectedOutput: string
}

interface CodeEditorEditorProps {
  initialCode: string
  language: string
  testCases: TestCase[]
  onInitialCodeChange: (code: string) => void
  onLanguageChange: (language: string) => void
  onTestCasesChange: (testCases: TestCase[]) => void
}

export function CodeEditorEditor({
  initialCode,
  language,
  testCases,
  onInitialCodeChange,
  onLanguageChange,
  onTestCasesChange,
}: CodeEditorEditorProps) {
  const [activeTab, setActiveTab] = useState<"code" | "tests">("code")
  const [activeTestIndex, setActiveTestIndex] = useState(0)

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInitialCodeChange(e.target.value)
  }

  const handleLanguageChange = (value: string) => {
    onLanguageChange(value)
  }

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: `test-${Date.now()}`,
      input: "",
      expectedOutput: "",
    }
    const updatedTestCases = [...testCases, newTestCase]
    onTestCasesChange(updatedTestCases)
    setActiveTestIndex(updatedTestCases.length - 1)
  }

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updatedTestCases = [...testCases]
    updatedTestCases[index] = {
      ...updatedTestCases[index],
      [field]: value,
    }
    onTestCasesChange(updatedTestCases)
  }

  const deleteTestCase = (index: number) => {
    const updatedTestCases = [...testCases]
    updatedTestCases.splice(index, 1)
    onTestCasesChange(updatedTestCases)

    if (activeTestIndex >= index && activeTestIndex > 0) {
      setActiveTestIndex(activeTestIndex - 1)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Programming Language</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="csharp">C#</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "tests")}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="code">Initial Code</TabsTrigger>
          <TabsTrigger value="tests">Test Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-2">
          <Label>Starter Code</Label>
          <Textarea
            value={initialCode}
            onChange={handleCodeChange}
            placeholder="Enter starter code here..."
            className="font-mono h-[300px]"
          />
        </TabsContent>

        <TabsContent value="tests" className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Test Cases</Label>
            <Button size="sm" variant="outline" onClick={addTestCase}>
              <Plus className="h-4 w-4 mr-1" />
              Add Test Case
            </Button>
          </div>

          {testCases.length > 0 ? (
            <ScrollArea className="h-[300px] border rounded-md p-2">
              <Tabs
                value={activeTestIndex.toString()}
                onValueChange={(value) => setActiveTestIndex(Number.parseInt(value))}
              >
                <TabsList className="h-9 overflow-x-auto w-auto">
                  {testCases.map((testCase, index) => (
                    <TabsTrigger key={testCase.id} value={index.toString()} className="px-3 h-8">
                      Test {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {testCases.map((testCase, index) => (
                  <TabsContent key={testCase.id} value={index.toString()} className="m-0 space-y-4">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">Test Case {index + 1}</h4>
                          <Button variant="ghost" size="icon" onClick={() => deleteTestCase(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label>Input</Label>
                          <Textarea
                            value={testCase.input}
                            onChange={(e) => updateTestCase(index, "input", e.target.value)}
                            placeholder="Test input"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Expected Output</Label>
                          <Textarea
                            value={testCase.expectedOutput}
                            onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                            placeholder="Expected output"
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </ScrollArea>
          ) : (
            <div className="text-center p-4 border rounded-md text-muted-foreground">
              <p>No test cases added yet</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={addTestCase}>
                Add Test Case
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
