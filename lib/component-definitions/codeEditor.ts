import type { ComponentDefinition } from "@/types/lesson"

export const codeEditorDefinition: ComponentDefinition = {
    type: "codeEditor",
    label: "Code Editor",
    category: "interactive",
    description: "Write and test code...",
    icon: "👨‍💻",
    defaultProps: {
      title: "Code Editor",
      initialCode: "// Write your code here\nconsole.log('Hello, world!');",
      language: "javascript",
      readOnly: false,
      testCases: [
        {
          id: "test1",
          input: "",
          expectedOutput: "Hello, world!",
        },
      ],
      points: 10,
      mode: "practice",
      state: "active",
    },
    propDefinitions: [
      {
        name: "title",
        label: "Title",
        type: "string",
        required: false,
        defaultValue: "Code Editor",
      },
      {
        name: "initialCode",
        label: "Initial Code",
        type: "string",
        required: true,
        defaultValue: "// Write your code here\nconsole.log('Hello, world!');",
      },
      {
        name: "language",
        label: "Programming Language",
        type: "select",
        required: true,
        defaultValue: "javascript",
        options: [
          { label: "JavaScript", value: "javascript" },
          { label: "Python", value: "python" },
          { label: "Java", value: "java" },
          { label: "C#", value: "csharp" },
        ],
      },
      {
        name: "readOnly",
        label: "Read Only",
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      {
        name: "testCases",
        label: "Test Cases",
        type: "componentArray",
        required: false,
        defaultValue: [
          {
            id: "test1",
            input: "",
            expectedOutput: "Hello, world!",
          },
        ],
      },
      {
        name: "points",
        label: "Points",
        type: "number",
        required: false,
        defaultValue: 10,
        min: 0,
        max: 100,
      },
      {
        name: "mode",
        label: "Mode",
        type: "select",
        required: false,
        defaultValue: "practice",
        options: [
          { label: "Practice Mode", value: "practice" },
          { label: "Live Mode", value: "live" },
        ],
      },
      {
        name: "state",
        label: "State",
        type: "select",
        required: false,
        defaultValue: "active",
        options: [
          { label: "Active", value: "active" },
          { label: "Disabled", value: "disabled" },
        ],
      },
      {
        name: "timeLimit",
        label: "Time Limit (Seconds)",
        type: "number",
        required: false,
        defaultValue: 30,
        min: 5,
        max: 300,
      },
    ],
  }
