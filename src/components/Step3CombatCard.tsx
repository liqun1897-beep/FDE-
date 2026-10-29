import React, { useState } from 'react';
import { CaseSession } from '../types';
import { MarkdownViewer } from './MarkdownViewer';
import { CombatCardVisualView } from './CombatCardVisualView';
import { 
  ShieldAlert, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Target,
  LayoutGrid,
  FileText,
  Lightbulb,
  Printer
} from 'lucide-react';

interface Step3CombatCardProps {
  currentCase: CaseSession;
  reasoning: string;
  streamingContent: string;
  isStreaming: boolean;
  onGenerate: (context: { contactRole: string; meetingGoal: string; backgroundNotes: string }) => void;
  onProceedToStep4: () => void;
  onUpdateChecks: (checks: Record<string, boolean>) => void;
  onOpenExportPdf?: () => void;
}

const CHECKLIST_ITEMS_AGENT2 = [
  { id: 'painPointsFiltered', label: '是否精选了 3-5 个高价值痛点而非罗列全部？' },
  { id: 'openingNatural', label: '开场是否自然克制，不直接给客户预设存在问题？' },
  { id: 'deepQuestionsReady', label: '问题是否以探讨现状为起点，而非诱导推销？' },
  { id: 'fiveLayersCovered', label: '是否覆盖五层追问（现状、频率、影响、现有手段、改善目标）？' },
  { id: 'responseBranchesReady', label: '是否设计了客户确认/否认/已有系统等不同回答下的应对策略？' },
  { id: 'hypothesesDistinguished', label: '是否严格区分行业推断与客户事实？' },
  { id: 'aiConditionsClear', label: '是否说明了 AI 适用的数据前置条件与不适用情形？' },
  { id: 'nextStepsActionable', label: '下一步建议（如样例梳理、现场走访）是否清晰低风险？' },
];

const ROLE_OPTIONS = [
  '生产运营总监 / 运营副总裁（关注：目标完成、交付人效、质量损耗、异常卡点）',
  '总经理 / 老板（关注：利润增长、经营全局效率、组织协同与风险控制）',
  '部门管理者 / 车间主任（关注：任务分配、信息同步、排产进度、工单闭环）',
  '一线执行负责人 / 质检采购骨干（关注：重复手工录入、资料查找、多系统切换负担）',
  'IT / 数字化总监（关注：数据质量、系统接口、安全性、落地实施门槛）',
];

export const Step3CombatCard: React.FC<Step3CombatCardProps> = ({
  currentCase,
  reasoning,
  streamingContent,
  isStreaming,
  onGenerate,
  onProceedToStep4,
  onUpdateChecks,
  onOpenExportPdf
}) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [viewMode, setViewMode] = useState<'visual' | 'markdown'>('visual');
  
  // Meeting context state
  const [contactRole, setContactRole] = useState(currentCase.contactRole || ROLE_OPTIONS[0]);
  const [meetingGoal, setMeetingGoal] = useState(
    currentCase.meetingGoal || '首轮业务交流：建立行业共鸣，验证核心业务痛点，不推销技术，争取下周深入调研'
  );
  const [backgroundNotes, setBackgroundNotes] = useState(currentCase.backgroundNotes || '');

  const checks = currentCase.agent2ReviewChecks || {};

  const handleToggleCheck = (id: string) => {
    const next = { ...checks, [id]: !checks[id] };
    onUpdateChecks(next);
  };

  const handleDownload = () => {
    const text = isStreaming ? streamingContent : (currentCase.combatCardResult || streamingContent);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `客户共鸣与痛点诊断作战卡_${currentCase.companyName || '企业'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayContent = isStreaming 
    ? streamingContent 
    : (currentCase.combatCardResult || streamingContent);

  const checkedCount = CHECKLIST_ITEMS_AGENT2.filter(item => !!checks[item.id]).length;

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Agent 2：FDE 客户共鸣与痛点诊断作战卡
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono">
              访谈前作战指南
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            将 Agent 1 的行业情报转化为具体沟通切入点、共鸣开场白、五层追问法与异议应对方案。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View mode toggle */}
          <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('visual')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'visual' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>结构化卡片看板</span>
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                viewMode === 'markdown' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
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
            onClick={() => onGenerate({ contactRole, meetingGoal, backgroundNotes })}
            disabled={isStreaming}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isStreaming ? 'animate-spin' : ''}`} />
            <span>重新制作</span>
          </button>

          <button
            onClick={onProceedToStep4}
            disabled={isStreaming || !displayContent}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            <span>记录访谈反馈与动态复盘</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Meeting Context Inputs (Collapsible) */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-4 sm:p-5">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-600" />
          <span>本次沟通情境与目标配置</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              本次交流客户岗位角色
            </label>
            <select
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {ROLE_OPTIONS.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              本次沟通核心目标
            </label>
            <input
              type="text"
              value={meetingGoal}
              onChange={(e) => setMeetingGoal(e.target.value)}
              placeholder="例如：建立业务信任，验证换模排产真实卡点..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60">
          <p className="text-[11px] text-slate-500">
            当前基于：<b>{currentCase.companyName}</b> 的《行业情报与岗位痛点地图》
          </p>
          <button
            onClick={() => onGenerate({ contactRole, meetingGoal, backgroundNotes })}
            disabled={isStreaming}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            {isStreaming ? '正在生成作战卡...' : '⚡ 更新并生成作战卡'}
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
              <span>Agent 2 战术策略与追问路径规划 {isStreaming && '(生成中...)'}</span>
            </div>
            {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showReasoning && (
            <div className="px-4 py-3 border-t border-indigo-100 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto bg-white/70 leading-relaxed">
              {reasoning || '正在规划开场共鸣白与五层追问树...'}
            </div>
          )}
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 cols: Visual Cards or Markdown View */}
        <div className="lg:col-span-3 space-y-4">
          
          {isStreaming && !displayContent ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
              <p className="text-sm font-medium text-slate-600">Agent 2 正在精炼 3-5 个核心痛点并设计追问路径...</p>
              <p className="text-xs text-slate-400 mt-1">定制业务共鸣话术、五层追问法、异议应对与AI准入条件</p>
            </div>
          ) : viewMode === 'visual' ? (
            <CombatCardVisualView rawContent={displayContent} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 min-h-[500px]">
              <MarkdownViewer content={displayContent} />
            </div>
          )}

        </div>

        {/* Right 1 col: Agent 2 Human Review Checklist */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs text-slate-900">顾问作战卡核验</h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                {checkedCount} / {CHECKLIST_ITEMS_AGENT2.length}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 my-2.5 leading-relaxed">
              在带着作战卡面见客户前，顾问核对自检清单：
            </p>

            <div className="space-y-2 mt-3">
              {CHECKLIST_ITEMS_AGENT2.map((item) => {
                const checked = !!checks[item.id];
                return (
                  <label
                    key={item.id}
                    onClick={() => handleToggleCheck(item.id)}
                    className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      checked ? 'bg-indigo-50/60 text-indigo-900' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="mt-0.5 w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="leading-snug">{item.label}</span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                onClick={onProceedToStep4}
                disabled={isStreaming || !displayContent}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
              >
                <span>下一步：记录客户反馈并复盘</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
