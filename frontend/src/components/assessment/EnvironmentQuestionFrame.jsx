import React, { useState } from 'react';
import {
  Code,
  Terminal,
  FileCode,
  Layers,
  Database,
  Cpu,
  Globe,
  Monitor,
  Tablet,
  Smartphone,
  Server,
  Play,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  Cloud,
  CheckSquare,
  BarChart2,
  Table,
  Zap,
  Maximize2,
  Copy,
  Check,
} from 'lucide-react';

export const EnvironmentQuestionFrame = ({
  environment,
  currentQ,
  currentIdx,
  totalQuestions,
  codeSnippet,
  category,
  difficulty,
  marks,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewportMode, setViewportMode] = useState('desktop'); // For frontend: desktop | tablet | mobile

  const handleCopyCode = () => {
    if (!codeSnippet) return;
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const layoutType = environment?.layoutType || 'ide';

  return (
    <div className="space-y-4">
      {/* =============================================================
          1. JAVA / SOFTWARE ENGINEER: CODE LABORATORY IDE FRAME
      ============================================================= */}
      {layoutType === 'ide' && (
        <div className="rounded-2xl border border-slate-700/80 bg-[#0c121e] shadow-2xl overflow-hidden font-mono">
          {/* Top IDE Window Title Bar & Tabs */}
          <div className="bg-[#080d16] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs select-none">
            <div className="flex items-center gap-3">
              {/* Traffic Lights */}
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>

              {/* Active Tab */}
              <div className="flex items-center gap-2 px-3 py-1 bg-[#0c121e] rounded-t-lg border-t border-x border-cyan-500/40 text-cyan-300 font-semibold text-[11px]">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>{environment.theme.editorFile || 'Main.java'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800/60 text-slate-300">
                {environment.hudBadges?.[0] || 'JDK 21 LTS'}
              </span>
              <span className="text-slate-400">UTF-8</span>
            </div>
          </div>

          {/* Code Snippet / Technical Gutter Display */}
          {codeSnippet ? (
            <div className="relative group">
              <div className="flex bg-[#080d16]/90 text-slate-300 text-xs overflow-x-auto p-4 leading-relaxed">
                {/* Line numbers gutter */}
                <div className="pr-4 text-slate-600 select-none text-right font-mono border-r border-slate-800/80">
                  {codeSnippet.split('\n').map((_, i) => (
                    <div key={i} className="text-[11px] leading-5">{i + 1}</div>
                  ))}
                </div>
                {/* Code body */}
                <pre className="pl-4 font-mono text-[11px] sm:text-xs text-cyan-200 leading-5 flex-1 whitespace-pre">
                  {codeSnippet}
                </pre>
              </div>

              {/* Copy Code Button */}
              <button
                onClick={handleCopyCode}
                className="absolute top-3 right-3 px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ) : (
            <div className="px-5 py-3 bg-[#080d16]/50 border-b border-slate-800/60 flex items-center gap-2 text-xs text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Technical Challenge: Read and evaluate the scenario below.</span>
            </div>
          )}

          {/* IDE Bottom Status Bar */}
          <div className="bg-[#060a12] px-4 py-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 select-none">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-cyan-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
              <span>Ln {currentIdx + 1}, Col 1</span>
              <span className="hidden sm:inline">Spaces: 4</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">{environment.statusIndicator || 'JVM: HotSpot 64-Bit'}</span>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          2. PYTHON DEVELOPER: PYTHON INNOVATION STUDIO (NOTEBOOK CELL)
      ============================================================= */}
      {layoutType === 'notebook' && (
        <div className="rounded-2xl border border-sky-500/30 bg-[#08111a] shadow-xl overflow-hidden font-mono">
          {/* Notebook Header Bar */}
          <div className="bg-[#050c14] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-[10px]">
                IPython Notebook
              </span>
              <span className="text-slate-300 font-semibold text-[11px]">{environment.theme.editorFile}</span>
            </div>
            <div className="text-[10px] text-sky-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Python 3.12 (ipykernel) • Idle</span>
            </div>
          </div>

          {/* Notebook In [X]: Code Cell */}
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xs text-sky-400 font-bold select-none pt-0.5">
                In&nbsp;[{currentIdx + 1}]:
              </span>
              <div className="flex-1 rounded-xl bg-[#0b1825] border border-sky-500/20 p-3.5 text-xs text-sky-100 overflow-x-auto">
                {codeSnippet ? (
                  <pre className="whitespace-pre font-mono leading-relaxed">{codeSnippet}</pre>
                ) : (
                  <span className="text-slate-400 italic"># Interactive Python execution cell</span>
                )}
              </div>
            </div>

            {/* Simulated Out [X]: Execution Preview */}
            <div className="flex items-start gap-3">
              <span className="text-xs text-amber-400 font-bold select-none pt-0.5">
                Out[{currentIdx + 1}]:
              </span>
              <div className="flex-1 rounded-xl bg-[#060c14] border border-slate-800 p-2.5 text-[11px] text-amber-200/90 font-mono">
                <code>Evaluating logic and runtime execution behavior...</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =============================================================
          3. FULL STACK DEVELOPER: DIGITAL PRODUCT STUDIO (SPLIT ARCHITECTURE)
      ============================================================= */}
      {layoutType === 'fullstack' && (
        <div className="rounded-2xl border border-cyan-500/30 bg-[#09101d] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#050b14] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white text-[11px]">Full-Stack Product Topology</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-slate-400">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">Client: React</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">API: Node/FastAPI</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">DB: Postgres</span>
            </div>
          </div>

          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Left: Frontend Client Preview */}
            <div className="p-3 rounded-xl bg-[#060c17] border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> Client Tier (State & Components)
              </div>
              <p className="text-[11px] text-slate-300">
                Component rendering, client-side lifecycle, and reactive state management.
              </p>
            </div>

            {/* Right: API Route & Backend Pipeline */}
            <div className="p-3 rounded-xl bg-[#060c17] border border-slate-800 space-y-1.5">
              <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <Server className="w-3 h-3" /> Server Tier (REST & Schema)
              </div>
              <p className="text-[11px] text-slate-300">
                HTTP request handling, relational constraints, and database queries.
              </p>
            </div>
          </div>

          {codeSnippet && (
            <div className="p-4 pt-0">
              <div className="p-3 rounded-xl bg-[#050b14] border border-slate-800 text-xs text-cyan-200 overflow-x-auto">
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          4. FRONTEND DEVELOPER: INTERACTIVE DESIGN STUDIO (BROWSER CANVAS)
      ============================================================= */}
      {layoutType === 'frontend' && (
        <div className="rounded-2xl border border-purple-500/30 bg-[#0e071a] shadow-xl overflow-hidden font-mono">
          {/* Browser Address Bar with Viewport Controls */}
          <div className="bg-[#080410] px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="px-3 py-1 rounded bg-[#150a28] border border-purple-500/30 text-purple-200 text-[11px] flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-purple-400" />
                <span>localhost:3000/design-preview</span>
              </div>
            </div>

            {/* Viewport Switcher */}
            <div className="flex items-center gap-1 bg-[#150a28] p-0.5 rounded-lg border border-purple-500/20 text-[10px]">
              <button
                onClick={() => setViewportMode('desktop')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                  viewportMode === 'desktop' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3 h-3" /> Desktop
              </button>
              <button
                onClick={() => setViewportMode('tablet')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                  viewportMode === 'tablet' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Tablet className="w-3 h-3" /> Tablet
              </button>
              <button
                onClick={() => setViewportMode('mobile')}
                className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                  viewportMode === 'mobile' ? 'bg-purple-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" /> Mobile
              </button>
            </div>
          </div>

          {/* Component Hierarchy & Layout Canvas */}
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-purple-300 border-b border-purple-900/40 pb-2">
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> DOM Tree & CSS Inspect
              </span>
              <span className="text-slate-400">Viewport: {viewportMode === 'desktop' ? '1440 × 900' : viewportMode === 'tablet' ? '768 × 1024' : '375 × 667'}</span>
            </div>

            {codeSnippet ? (
              <div className="p-3.5 rounded-xl bg-[#080410] border border-purple-500/30 text-xs text-purple-200 overflow-x-auto">
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#080410]/60 border border-purple-500/20 text-xs text-slate-300">
                Design Scenario: Analyze user interface interactions and responsive CSS constraints.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          5. BACKEND DEVELOPER: SERVER COMMAND CENTER (API GATEWAY)
      ============================================================= */}
      {layoutType === 'backend' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-[#061411] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#030d0b] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-navy-950 font-bold text-[10px]">
                POST
              </span>
              <span className="text-emerald-300 font-semibold text-[11px]">/api/v1/cluster/service-mesh</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="text-emerald-400">Status: 200 OK</span>
              <span>•</span>
              <span>14ms Latency</span>
            </div>
          </div>

          {codeSnippet && (
            <div className="p-4">
              <div className="p-3.5 rounded-xl bg-[#030d0b] border border-emerald-500/20 text-xs text-emerald-200 overflow-x-auto">
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =============================================================
          6. DATA ANALYST: DATA INTELLIGENCE CENTER (SPREADSHEET & SQL)
      ============================================================= */}
      {layoutType === 'data_analyst' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-[#061511] shadow-xl overflow-hidden font-mono">
          {/* SQL Console Header */}
          <div className="bg-[#030d0a] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white text-[11px]">Data Matrix & SQL Workspace</span>
            </div>
            <span className="text-[10px] text-emerald-400">Dataset: 14,200 Records • Clean</span>
          </div>

          {/* Spreadsheet-like Table Grid Preview */}
          <div className="p-4 space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#030d0a]">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-emerald-950/40 border-b border-slate-800 text-slate-400">
                    <th className="py-1 px-3 w-8 text-center text-slate-600">#</th>
                    <th className="py-1 px-3">Col A: Dimension</th>
                    <th className="py-1 px-3">Col B: Metric Value</th>
                    <th className="py-1 px-3">Col C: Variance %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-1 px-3 text-center text-slate-600">1</td>
                    <td className="py-1 px-3 font-semibold text-white">Segment Alpha</td>
                    <td className="py-1 px-3 text-emerald-400">$1,420,500</td>
                    <td className="py-1 px-3 text-emerald-400">+14.2%</td>
                  </tr>
                  <tr>
                    <td className="py-1 px-3 text-center text-slate-600">2</td>
                    <td className="py-1 px-3 font-semibold text-white">Segment Beta</td>
                    <td className="py-1 px-3 text-emerald-400">$890,200</td>
                    <td className="py-1 px-3 text-amber-400">-2.1%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SQL Snippet if provided */}
            {codeSnippet && (
              <div className="p-3.5 rounded-xl bg-[#030d0a] border border-emerald-500/20 text-xs text-emerald-200 overflow-x-auto">
                <div className="text-[10px] font-bold text-emerald-400 mb-1">SQL Query Formulation:</div>
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          7. DATA SCIENTIST: RESEARCH & ANALYTICS LAB
      ============================================================= */}
      {layoutType === 'data_science' && (
        <div className="rounded-2xl border border-purple-500/30 bg-[#0e0a1f] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#080514] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold text-white text-[11px]">Statistical Hypothesis & Modeling Lab</span>
            </div>
            <span className="text-[10px] text-purple-400">p-value: 0.003 • 95% Confidence</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
              <div className="p-2 rounded-lg bg-[#080514] border border-slate-800">
                <div className="text-purple-300 font-bold">10,000</div>
                <div className="text-slate-500">Sample Size (N)</div>
              </div>
              <div className="p-2 rounded-lg bg-[#080514] border border-slate-800">
                <div className="text-purple-300 font-bold">μ = 72.4, σ = 8.1</div>
                <div className="text-slate-500">Distribution</div>
              </div>
              <div className="p-2 rounded-lg bg-[#080514] border border-slate-800">
                <div className="text-purple-300 font-bold">0.92 AUC</div>
                <div className="text-slate-500">Validation Split</div>
              </div>
            </div>

            {codeSnippet && (
              <div className="p-3.5 rounded-xl bg-[#080514] border border-purple-500/20 text-xs text-purple-200 overflow-x-auto">
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          8. MACHINE LEARNING ENGINEER: ML MODEL EXPERIMENTATION LAB
      ============================================================= */}
      {layoutType === 'ml' && (
        <div className="rounded-2xl border border-amber-500/30 bg-[#140e1d] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#0b0712] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-white text-[11px]">Neural Layer Architecture & Training Loss</span>
            </div>
            <span className="text-[10px] text-amber-400">Loss: 0.0318 • Epoch 48/50</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-2.5 rounded-xl bg-[#0b0712] border border-slate-800 text-[10px] flex items-center justify-between">
              <span className="text-slate-400">Tensor Flow: [Batch, Sequence, 768] ➔ LayerNorm ➔ Softmax</span>
              <span className="text-amber-400 font-bold">FP16 Accelerated</span>
            </div>

            {codeSnippet && (
              <div className="p-3.5 rounded-xl bg-[#0b0712] border border-amber-500/20 text-xs text-amber-200 overflow-x-auto">
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          9. GENERATIVE AI ENGINEER: GENERATIVE AI STUDIO
      ============================================================= */}
      {layoutType === 'genai' && (
        <div className="rounded-2xl border border-purple-500/30 bg-[#0e081e] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#080414] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-bold text-white text-[11px]">LLM Playground & Prompt Workspace</span>
            </div>
            <span className="text-[10px] text-cyan-400">Context: 512 / 8,192 Tokens</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-2.5 rounded-xl bg-[#080414] border border-purple-500/20 text-[11px] text-purple-200 flex items-center justify-between">
              <span>System Prompt: You are an autonomous analytical evaluator.</span>
              <span className="text-cyan-400 text-[10px]">Temp: 0.2</span>
            </div>

            {codeSnippet && (
              <div className="p-3.5 rounded-xl bg-[#080414] border border-slate-800 text-xs text-cyan-200 overflow-x-auto">
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          10. AGENTIC AI ENGINEER: AUTONOMOUS AGENT COMMAND CENTER
      ============================================================= */}
      {layoutType === 'agentic' && (
        <div className="rounded-2xl border border-cyan-500/35 bg-[#080e1a] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#040810] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold text-white text-[11px]">LangGraph Multi-Agent Mesh & Tool Registry</span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-300">ReAct Loop #2 Active</span>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Agent Node Pipeline */}
            <div className="p-2.5 rounded-xl bg-[#040810] border border-cyan-500/20 text-[10px] text-slate-300 flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">[Planner Agent]</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">[Reasoning Engine]</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">[Tool Calling Node]</span>
              <span>➔</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">[Memory Store]</span>
            </div>

            {codeSnippet && (
              <div className="p-3.5 rounded-xl bg-[#040810] border border-slate-800 text-xs text-cyan-200 overflow-x-auto">
                <div className="text-[10px] font-bold text-cyan-400 mb-1">State Graph Implementation:</div>
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          11. CLOUD ENGINEER: CLOUD INFRASTRUCTURE OPERATIONS CENTER
      ============================================================= */}
      {layoutType === 'cloud' && (
        <div className="rounded-2xl border border-orange-500/30 bg-[#120b07] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#090503] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Cloud className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-bold text-white text-[11px]">Cloud VPC Topology & Infrastructure Mesh</span>
            </div>
            <span className="text-[10px] text-orange-400">AWS us-east-1a • Pods: 24/24 Running</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-2.5 rounded-xl bg-[#090503] border border-orange-500/20 text-[10px] text-slate-300 flex items-center justify-between">
              <span>Topology: Internet Gateway ➔ ALB ➔ Private Subnets ➔ K8s Ingress</span>
              <span className="text-emerald-400">HA: 99.99%</span>
            </div>

            {codeSnippet && (
              <div className="p-3.5 rounded-xl bg-[#090503] border border-slate-800 text-xs text-orange-200 overflow-x-auto">
                <div className="text-[10px] font-bold text-orange-400 mb-1">Terraform Declaration:</div>
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =============================================================
          12. QA AUTOMATION ENGINEER: SOFTWARE TESTING LABORATORY
      ============================================================= */}
      {layoutType === 'qa' && (
        <div className="rounded-2xl border border-emerald-500/30 bg-[#07130e] shadow-xl overflow-hidden font-mono">
          <div className="bg-[#040c09] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white text-[11px]">Playwright & Pytest Test Suite Harness</span>
            </div>
            <span className="text-[10px] text-emerald-400">Suite: 24 Passed, 0 Failed • 1.2s</span>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-2.5 rounded-xl bg-[#040c09] border border-emerald-500/20 text-[10px] flex items-center justify-between">
              <span className="text-emerald-300 font-semibold">✓ Test Assertion: expect(response.statusCode).toBe(200)</span>
              <span className="text-slate-400">E2E Regression Guard</span>
            </div>

            {codeSnippet && (
              <div className="p-3.5 rounded-xl bg-[#040c09] border border-slate-800 text-xs text-emerald-200 overflow-x-auto">
                <div className="text-[10px] font-bold text-emerald-400 mb-1">Test Suite Implementation:</div>
                <pre className="whitespace-pre leading-relaxed">{codeSnippet}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnvironmentQuestionFrame;

