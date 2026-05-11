'use client'
import {useState, useEffect} from 'react'

// shape of one tool entry
type ToolEntry = {
    tool: string
    plan: string
    seats: number
    monthlySpend: number
}
// shape of entire form
type FormState = {
    tools: ToolEntry[]
    teamSize: number
    useCase: string
}
// starting blank state before user uses it
const defaultState: FormState = {
    tools: [{tool: '', plan: '', seats: 1, monthlySpend: 0}],
    teamSize: 1,
    useCase: 'mixed'
}

export default function StepOne({ onSubmit }: { onSubmit: (data: FormState) => void}) {
    const [formData, setFormData] = useState<FormState>(defaultState)
    useEffect(() => {
        const saved = localStorage.getItem('auditFormData')
        if(saved) {
            setFormData(JSON.parse(saved))
        }
    }, [])
    useEffect(() => {
        localStorage.setItem('auditFormData', JSON.stringify(formData))
    }, [formData])
    function updateTool(index: number, field: keyof ToolEntry, value: string | number) {
        const updated = [...formData.tools]
        updated[index] = {...updated[index], [field]: value}
        setFormData({...formData, tools: updated})
    }
    //new blank row
    function addTool() {
        setFormData({
            ...formData,
            tools: [...formData.tools, {tool: '', plan:'', seats: 1, monthlySpend: 0}]
        })
    }
    function removeTool(index: number) {
        const updated = formData.tools.filter((_, i) => i !== index)
        setFormData({...formData, tools: updated})
    }

    return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-2">Quick questions first</h2>
      <p className="text-gray-500 mb-6">This helps us give you accurate recommendations</p>

      {/* Loop through each tool the user has added */}
      {formData.tools.map((entry, index) => (
        <div key={index} className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium">Tool {index + 1}</span>
            {formData.tools.length > 1 && (
              <button onClick={() => removeTool(index)} className="text-red-500 text-sm">
                Remove
              </button>
            )}
          </div>

          {/* Tool selector */}
          <select
            value={entry.tool}
            onChange={(e) => updateTool(index, 'tool', e.target.value)}
            className="w-full border rounded p-2 mb-3"
          >
            <option value="">Select a tool...</option>
            <option value="cursor">Cursor</option>
            <option value="github_copilot">GitHub Copilot</option>
            <option value="claude">Claude</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="anthropic_api">Anthropic API (direct)</option>
            <option value="openai_api">OpenAI API (direct)</option>
            <option value="gemini">Gemini</option>
            <option value="windsurf">Windsurf</option>
          </select>

          {/* Plan selector — changes based on which tool is selected */}
          <select
            value={entry.plan}
            onChange={(e) => updateTool(index, 'plan', e.target.value)}
            className="w-full border rounded p-2 mb-3"
          >
            <option value="">Select a plan...</option>
            <option value="free">Free / Hobby</option>
            <option value="pro">Pro / Individual</option>
            <option value="team">Team / Business</option>
            <option value="enterprise">Enterprise</option>
            <option value="api">API Direct</option>
          </select>

          {/* Number of seats */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm text-gray-600">Number of seats</label>
              <input
                type="number"
                min={1}
                value={entry.seats}
                onChange={(e) => updateTool(index, 'seats', parseInt(e.target.value) || 1)}
                className="w-full border rounded p-2 mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-gray-600">Monthly spend ($)</label>
              <input
                type="number"
                min={0}
                value={entry.monthlySpend}
                onChange={(e) => updateTool(index, 'monthlySpend', parseFloat(e.target.value) || 0)}
                className="w-full border rounded p-2 mt-1"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add another tool */}
      <button
        onClick={addTool}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500 hover:border-blue-400 hover:text-blue-500 mb-6"
      >
        + Add another tool
      </button>

      {/* Team size and use case */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="text-sm font-medium">Team size</label>
          <input
            type="number"
            min={1}
            value={formData.teamSize}
            onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) || 1 })}
            className="w-full border rounded p-2 mb-3 text-gray-800 bg-white"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium">Primary use case</label>
          <select
            value={formData.useCase}
            onChange={(e) => setFormData({ ...formData, useCase: e.target.value })}
            className="w-full border rounded p-2 mb-3 text-gray-800 bg-white"
          >
            <option value="coding">Coding</option>
            <option value="writing">Writing</option>
            <option value="data">Data</option>
            <option value="research">Research</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={() => onSubmit(formData)}
        className="w-full bg-blue-600 text-white rounded-lg p-3 font-semibold hover:bg-blue-700"
      >
        Run My Audit →
      </button>
    </div>
  )
}