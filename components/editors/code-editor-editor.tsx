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
        <Label className="text-[#2E7D32]">Programming Language</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="border-[#4CAF50] text-[#2E7D32] hover:border-[#4CAF50] focus:ring-[#4CAF50]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript" className="text-[#2E7D32] hover:bg-[#E8F5E9]">JavaScript</SelectItem>
            <SelectItem value="python" className="text-[#2E7D32] hover:bg-[#E8F5E9]">Python</SelectItem>
            <SelectItem value="java" className="text-[#2E7D32] hover:bg-[#E8F5E9]">Java</SelectItem>
            <SelectItem value="csharp" className="text-[#2E7D32] hover:bg-[#E8F5E9]">C#</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "code" | "tests")}>
        <TabsList className="grid grid-cols-2 bg-[#E8F5E9]">
          <TabsTrigger 
            value="code" 
            className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9]/80"
          >
            Initial Code
          </TabsTrigger>
          <TabsTrigger 
            value="tests" 
            className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9]/80"
          >
            Test Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="m-0 space-y-4">
          <div className="space-y-2">
            <Label className="text-[#2E7D32]">Initial Code</Label>
            <Textarea
              value={initialCode}
              onChange={handleCodeChange}
              placeholder="Enter initial code..."
              rows={10}
              className="font-mono border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
            />
          </div>
        </TabsContent>

        <TabsContent value="tests" className="m-0">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-[#2E7D32]">Test Cases</Label>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={addTestCase}
              className="border-[#4CAF50] text-[#2E7D32] hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:border-[#4CAF50]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Test Case
            </Button>
          </div>

          {testCases.length > 0 ? (
            <Card className="border-[#4CAF50]">
              <CardContent className="p-4">
                <Tabs 
                  value={activeTestIndex.toString()} 
                  onValueChange={(value) => setActiveTestIndex(Number.parseInt(value))}
                >
                  <ScrollArea className="h-[60px] w-full mb-4">
                    <TabsList className="w-full h-auto flex-wrap bg-[#E8F5E9]">
                      {testCases.map((test, index) => (
                        <TabsTrigger
                          key={test.id}
                          value={index.toString()}
                          className="h-8 data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32] hover:text-[#2E7D32] hover:bg-[#E8F5E9]/80"
                        >
                          Test Case {index + 1}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>

                  {testCases.map((test, index) => (
                    <TabsContent key={test.id} value={index.toString()} className="m-0 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-[#2E7D32]">Test Case {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteTestCase(index)}
                          className="text-[#4CAF50] hover:bg-[#E8F5E9] hover:text-[#2E7D32]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#2E7D32]">Input</Label>
                        <Textarea
                          value={test.input}
                          onChange={(e) => updateTestCase(index, "input", e.target.value)}
                          placeholder="Test input"
                          rows={3}
                          className="font-mono border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[#2E7D32]">Expected Output</Label>
                        <Textarea
                          value={test.expectedOutput}
                          onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                          placeholder="Expected output"
                          rows={3}
                          className="font-mono border-[#4CAF50] focus:ring-[#4CAF50] focus:border-[#4CAF50] text-[#2E7D32] placeholder-[#4CAF50]/50"
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed border-[#4CAF50] rounded-lg bg-[#E8F5E9]">
              <p className="text-[#2E7D32] mb-2">No test cases yet</p>
              <Button 
                variant="outline" 
                onClick={addTestCase}
                className="border-[#4CAF50] text-[#2E7D32] hover:bg-[#E8F5E9] hover:text-[#2E7D32] hover:border-[#4CAF50]"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Test Case
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
