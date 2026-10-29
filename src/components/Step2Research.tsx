import React, { useState } from 'react';
import { CaseSession } from '../types';
import { MarkdownViewer } from './MarkdownViewer';
import { ResearchMapVisualView } from './ResearchMapVisualView';
import { 
  Sparkles, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  LayoutGrid,
  FileText,
  Printer
} from 'lucide-react';

interface Step2ResearchProps {
  currentCase: CaseSession;
  reasoning: string;
  streamingContent: string;
  isStreaming: boolean;
  onRegenerate: () => void;
  onProceedToAgent2: () => void;
  onUpdateChecks: (checks: Record<string, boolean>) => void;
  onOpenExportPdf?: () => void;
}

const CHECKLIST_ITEMS = [
  { id: 'companyVerified', label: '企业信息是否对应正确的目标企业？' },
  { id: 'sourcesReliable', label: '重要行业信息与数据是否有来源或年份依据？' },
  { id: 'factsVsAssumptions', label: '是否清楚区分已确认事实、行业共性与待核实假设？' },
  { id: 'supplyChainClear', label: '产业链上下游及信息流/交付协同卡点是否解释清楚？' },
  { id: 'processMapped', label: '岗位和业务流程是否符合该企业的实际运营模式？' },
  { id: 'painPointsActionable', label: '痛点是否具体到岗位任务，而非泛泛宏观问题？' },
  { id: 'questionsReady', label: '是否给出了可用于后续客户访谈求证的具体问题？' },
  { id: 'noFabrication', label: '是否避免了编造企业内部系统、规模与虚假案例？' },
];

export const Step2Research: React.FC<Step2ResearchProps> = ({
  currentCase,
  reasoning,
  streamingContent,
  isStreaming,
  onRegenerate,
  onProceedToAgent2,
  onUpdateChecks,
  onOpenExportPdf
}) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'markdown'>('visual');

  const checks = currentCase.agent1ReviewChecks || {};

  const handleToggleCheck = (id: string) => {
    const next = { ...checks, [id]: !checks[id] };
    onUpdateChecks(next);
  };

  const handleDownload = () => {
    const text = isStreaming ? streamingContent : (currentCase.researchResult || streamingContent);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `客户行业情报与岗位痛点地图_${currentCase.companyName || '企业'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayContent = isStreaming 
    ? streamingContent 
    : (currentCase.researchResult || streamingContent);

  const checkedCount = CHECKLIST_ITEMS.filter(item => !!checks[item.id]).length;

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900">
              Agent 1：行业与企业情报研究成果
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
              {currentCase.industry} · {currentCase.companyName}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            标准化产出《客户行业情报与岗位痛点地图》，为下游 Agent 2 作战卡提供扎实的事实与假设底稿。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'visual' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>结构化地图看板</span>
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'markdown' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Markdown 报告</span>
            </button>
          </div>

          <button
            onClick={handleDownload}
            disabled={!displayContent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            title="导出 Markdown 文件"
          >
            <Download className="w-3.5 h-3.5" />
            <span>导出 .md</span>
          </button>

          {onOpenExportPdf && (
            <button
              onClick={onOpenExportPdf}
              disabled={!displayContent}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200 shadow-2xs disabled:opacity-50"
              title="导出 A4 矢量 PDF 诊断方案"
            >
              <Printer className="w-3.5 h-3.5 text-rose-600" />
              <span>导出 PDF</span>
            </button>
          )}

          <button
            onClick={onRegenerate}
            disabled={isStreaming}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
            title="重新生成研究"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
            <span>重新研究</span>
          </button>

          <button
            onClick={onProceedToAgent2}
            disabled={isStreaming || !displayContent}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <span>制作 Agent 2 诊断作战卡</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Reasoning / Thought Box */}
      {(reasoning || isStreaming) && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 overflow-hidden">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-indigo-900 hover:bg-indigo-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span>GLM-5.2 深度推演与思考过程 {isStreaming && '(思考与撰写中...)'}</span>
            </div>
            {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showReasoning && (
            <div className="px-4 py-3 border-t border-indigo-100 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto bg-white/70 leading-relaxed">
              {reasoning || '正在梳理产业链与岗位卡点...'}
            </div>
          )}
        </div>
      )}

      {/* Main Content Layout: Report + Human Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 cols: Visual Map or Markdown Report */}
        <div className="lg:col-span-3 space-y-4">
          {isStreaming && !displayContent ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-3" />
              <p className="text-sm font-medium text-slate-600">Agent 1 正在深度研究行业生态与岗位痛点...</p>
              <p className="text-xs text-slate-400 mt-1">分析产业链、企业画像、经营压力与三层岗位业务流</p>
            </div>
          ) : viewMode === 'visual' ? (
            <ResearchMapVisualView rawContent={displayContent} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 min-h-[500px]">
              <MarkdownViewer content={displayContent} />
            </div>
          )}
        </div>

        {/* Right 1 col: Human Quality Checklist */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-xs text-slate-900">顾问人机协同核验</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                {checkedCount} / {CHECKLIST_ITEMS.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 my-2.5 leading-relaxed">
              根据《规范》第 8 章，顾问在向下游传递前需快速通读确认：
            </p>

            <div className="space-y-2 mt-3">
              {CHECKLIST_ITEMS.map((item) => {
                const checked = !!checks[item.id];
                return (
                  <label
                    key={item.id}
                    onClick={() => handleToggleCheck(item.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      checked ? 'bg-blue-50/60 text-blue-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span className="leading-snug">{item.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={onProceedToAgent2}
                disabled={isStreaming || !displayContent}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <span>下一步：制作诊断作战卡</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
