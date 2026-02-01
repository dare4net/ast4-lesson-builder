"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrayItemEditor } from "./base/ArrayItemEditor"

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

  const handleLanguageChange = (value: string) => {
    onLanguageChange(value)
  }

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: `test-${Date.now()}`,
      input: "",
      expectedOutput: "",
    }
    onTestCasesChange([...testCases, newTestCase])
  }

  const updateTestCase = (index: number, field: keyof TestCase, value: string) => {
    const updatedTestCases = [...testCases]
    updatedTestCases[index] = {
      ...updatedTestCases[index],
      [field]: value,
    }
    onTestCasesChange(updatedTestCases)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-[#2E7D32]">Programming Language</Label>
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="border-[#4CAF50]/30 text-[#2E7D32] hover:border-[#4CAF50] focus:ring-[#4CAF50]">
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
        <TabsList className="grid grid-cols-2 bg-[#E8F5E9]/50 mb-4">
          <TabsTrigger
            value="code"
            className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32]"
          >
            Initial Code
          </TabsTrigger>
          <TabsTrigger
            value="tests"
            className="data-[state=active]:bg-[#4CAF50] data-[state=active]:text-white text-[#2E7D32]"
          >
            Test Cases ({testCases.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="m-0">
          <div className="space-y-2">
            <Textarea
              value={initialCode}
              onChange={(e) => onInitialCodeChange(e.target.value)}
              placeholder="Enter initial code template..."
              rows={12}
              className="font-mono border-[#4CAF50]/30 focus-visible:ring-[#4CAF50] text-[#2E7D32] bg-[#F1F8E9]/30"
            />
          </div>
        </TabsContent>

        <TabsContent value="tests" className="m-0">
          <ArrayItemEditor<TestCase>
            items={testCases}
            onChange={onTestCasesChange}
            onAddItem={addTestCase}
            getItemLabel={(_, index) => `Test Case ${index + 1}`}
            addButtonLabel="Add Test Case"
            renderItem={(test, index) => (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#2E7D32]">Input</Label>
                  <Textarea
                    value={test.input}
                    onChange={(e) => updateTestCase(index, "input", e.target.value)}
                    placeholder="Standard input or function arguments"
                    rows={3}
                    className="font-mono border-[#4CAF50]/30 focus-visible:ring-[#4CAF50] text-[#2E7D32]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#2E7D32]">Expected Output</Label>
                  <Textarea
                    value={test.expectedOutput}
                    onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                    placeholder="Standard output or return value"
                    rows={3}
                    className="font-mono border-[#4CAF50]/30 focus-visible:ring-[#4CAF50] text-[#2E7D32]"
                  />
                </div>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
