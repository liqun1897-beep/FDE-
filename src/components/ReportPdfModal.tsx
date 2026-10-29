import React, { useState } from 'react';
import { CaseSession } from '../types';
import { parseFullDocument } from '../lib/parseDiagnosis';
import { MarkdownViewer } from './MarkdownViewer';
import { StatusBadge } from './StatusBadge';
import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  X, 
  Building2, 
  FileText, 
  ShieldCheck, 
  Sparkles, 
  Target, 
  Layers, 
  Repeat, 
  HelpCircle, 
  AlertTriangle, 
  Clock, 
  MessageSquare,
  Workflow
} from 'lucide-react';

interface ReportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCase: CaseSession;
}

export const ReportPdfModal: React.FC<ReportPdfModalProps> = ({
  isOpen,
  onClose,
  currentCase
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const companyName = currentCase.companyName || '目标客户企业';
  const industry = currentCase.industry || '未指定赛道';
  const reportDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Parse Agent 1 research document
  const parsedResearch = parseFullDocument(currentCase.researchResult || '');
  // Parse Agent 2 combat card document
  const parsedCombat = parseFullDocument(currentCase.combatCardResult || '');

  // Handle direct browser vector PDF printing
  const handlePrint = () => {
    window.print();
  };

  // Download raw markdown dossier
  const handleDownloadMarkdown = () => {
    const divider = '\n\n---\n\n';
    let full = `# FDE 售前客户诊断全景咨询报告｜${companyName}\n`;
    full += `> 行业赛道：${industry} | 诊断日期：${reportDate} | 编制团队：FDE现场交付工程团队\n\n`;

    if (currentCase.researchResult) {
      full += `## 第一阶段：Agent 1 行业与企业情报研究\n\n${currentCase.researchResult}${divider}`;
    }
    if (currentCase.combatCardResult) {
      full += `## 第二阶段：Agent 2 客户共鸣与痛点诊断作战卡\n\n${currentCase.combatCardResult}${divider}`;
    }
    if (currentCase.dynamicDiagnosisResult) {
      full += `## 第三阶段：客户访谈复盘与动态诊断报告\n\n${currentCase.dynamicDiagnosisResult}`;
    }

    const blob = new Blob([full], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FDE_客户诊断全景报告_${companyName}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy full report text
  const handleCopyText = () => {
    let full = `【FDE 售前客户诊断全景咨询报告】\n企业：${companyName}\n行业：${industry}\n日期：${reportDate}\n\n`;
    if (currentCase.researchResult) full += `\n=== 模块一：行业与企业情报 ===\n` + currentCase.researchResult;
    if (currentCase.combatCardResult) full += `\n\n=== 模块二：售前作战卡与五层追问 ===\n` + currentCase.combatCardResult;
    if (currentCase.dynamicDiagnosisResult) full += `\n\n=== 模块三：访谈复盘与PoC备忘录 ===\n` + currentCase.dynamicDiagnosisResult;

    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract candidate pain points for display
  const sec7 = parsedResearch.sections['sec_7'] || { rawContent: '' };
  const candidatePains = (sec7.rawContent || '')
    .split(/(?:###\s*痛点|###\s*候选痛点|###\s*[0-9]+[\.、])/)
    .filter(b => b.trim().length > 20)
    .map((block) => {
      const title = block.trim().split('\n')[0].replace(/^[#\*\s]+/, '').replace(/^[0-9]+[\.、]\s*/, '').trim();
      const roles = block.match(/(?:涉及岗位|岗位)[：:]\s*([^\n]+)/)?.[1]?.trim() || '业务岗位';
      const stage = block.match(/(?:业务环节|流程环节)[：:]\s*([^\n]+)/)?.[1]?.trim() || '业务流转环节';
      const impact = block.match(/(?:潜在影响|业务影响)[：:]\s*([^\n]+)/)?.[1]?.trim() || '';
      const evidence = block.match(/(?:证据等级|证据状态)[：:]\s*([^\n]+)/)?.[1]?.trim() || '待验证';
      const question = block.match(/(?:客户验证问题|提问建议)[：:]\s*([^\n]+)/)?.[1]?.trim() || '';
      return { title, roles, stage, impact, evidence, question };
    });

  return (
    <>
      {/* ================= SCREEN PREVIEW MODAL ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
          
          {/* Top Control Bar */}
          <div className="px-6 py-3.5 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>FDE 售前客户诊断全景报告 · A4 矢量 PDF 导出</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                    A4 纸张规范
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {companyName} ({industry}) · 遵循咨询级物理分页与矢量字体渲染
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyText}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="复制整篇报告文本"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? '已复制' : '复制全文'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="下载 Markdown 原文卷宗"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>导出 .md</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-sm transition-all"
                title="直接调起浏览器打印 / 另存为矢量 PDF"
              >
                <Printer className="w-4 h-4" />
                <span>打印 / 另存为 PDF</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors ml-1"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Document Preview Canvas (Scrollable A4 Paper look) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 space-y-6 flex flex-col items-center">
            
            {/* Notice Banner */}
            <div className="w-full max-w-[210mm] bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-amber-600 shrink-0" />
                <span><b>打印建议：</b>点击右上角<b>「打印 / 另存为 PDF」</b>，在打印窗口的目标打印机选择<b>「另存为 PDF」</b>，页边距建议选择<b>「无」或「默认」</b>即可生成高清矢量文档。</span>
              </span>
            </div>

            {/* A4 Paper Container */}
            <div className="w-full max-w-[210mm] bg-white shadow-xl rounded-sm p-8 sm:p-14 space-y-10 text-slate-800 font-sans border border-slate-300">
              
              {/* COVER PAGE (封面) */}
              <div className="pb-12 border-b-2 border-slate-900 text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wider uppercase">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>商业机密 · 现场诊断专属报告 (Strictly Confidential)</span>
                </div>

                <div className="space-y-3 pt-4">
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                    【{companyName}】<br />
                    业务痛点诊断与 AI 改造机会评估方案
                  </h1>
                  <p className="text-base text-slate-600 font-medium">
                    FDE 售前客户诊断工作流 · 双 Agent 协同深度研报
                  </p>
                </div>

                <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200 max-w-2xl mx-auto text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold">目标企业：</span>
                    <span className="font-bold text-slate-900">{companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">所属赛道：</span>
                    <span className="font-bold text-slate-900">{industry}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">诊断团队：</span>
                    <span className="font-bold text-slate-900">FDE 工程交付团队</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">报告日期：</span>
                    <span className="font-bold text-slate-900">{reportDate}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200 max-w-2xl mx-auto leading-relaxed">
                  <b>FDE 核心原则：</b>先理解业务，再谈 AI；先验证痛点，再提出方案 · 本报告严格区分客观事实、行业共性与待验证假设，支持以 1-2 周脱敏小切口进行低风险原型验证。
                </div>
              </div>

              {/* MODULE 1: 行业与企业情报研究 (Agent 1) */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-2">
                  <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <h2 className="text-lg font-bold text-slate-900">
                    第一部分：行业情报、业务流程与岗位痛点地图 (Agent 1)
                  </h2>
                </div>

                {/* Supply Chain Box */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Workflow className="w-4 h-4 text-blue-600" />
                    <span>产业链上下游业务与协同卡点</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-blue-700 block mb-1">1. 上游供应商 / 资源输入</span>
                      <p className="text-slate-600 text-[11px]">物料单据、采购合同、客户需求变更原始输入</p>
                    </div>
                    <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                      <span className="font-bold text-indigo-700 block mb-1">2. 中游运营主体 ({companyName})</span>
                      <p className="text-slate-800 text-[11px]">方案制定 ➔ 排产排班 ➔ 加工制作 ➔ 质检审核</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <span className="font-bold text-emerald-700 block mb-1">3. 下游客户 / 交付核销</span>
                      <p className="text-slate-600 text-[11px]">终端交付、批量对账、核销履约与客户结算</p>
                    </div>
                  </div>
                </div>

                {/* Business Stages */}
                {parsedResearch.processStages.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      端到端核心业务主流程图 (5-6 阶段)
                    </h3>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs divide-y divide-slate-200">
                        <thead className="bg-slate-100 font-bold text-slate-800">
                          <tr>
                            <th className="p-2.5">阶段序号</th>
                            <th className="p-2.5">流程阶段</th>
                            <th className="p-2.5">责任岗位</th>
                            <th className="p-2.5">输入与工具</th>
                            <th className="p-2.5">交付物</th>
                            <th className="p-2.5">⚡ 潜在信息断点</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {parsedResearch.processStages.map((stg, i) => (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-blue-600">阶段 {stg.step || i + 1}</td>
                              <td className="p-2.5 font-semibold text-slate-900">{stg.name}</td>
                              <td className="p-2.5 text-slate-600">{stg.roles}</td>
                              <td className="p-2.5 text-slate-600">{stg.inputs}</td>
                              <td className="p-2.5 text-slate-600">{stg.outputs}</td>
                              <td className="p-2.5 text-rose-700 font-medium">{stg.bottlenecks}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Role Repetitive Task Matrix */}
                {parsedResearch.roleTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Repeat className="w-4 h-4 text-rose-600" />
                      <span>各岗位高频重复工作与卡点清单</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {parsedResearch.roleTasks.slice(0, 6).map((task, i) => (
                        <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                            <span className="font-bold text-slate-900">{task.roleName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">{task.tier}</span>
                          </div>
                          <p className="text-[11px] text-rose-900 bg-rose-50/60 p-2 rounded border border-rose-100 font-mono">
                            <b>🔥高频手工：</b>{task.repetitiveTasks}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            <b>工具/交付：</b>{task.inputsAndTools} ➔ {task.outputs}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Candidate Pain Points */}
                {candidatePains.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      优先候选痛点清单与 FDE 四级置信度评级
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {candidatePains.map((p, i) => (
                        <div key={i} className="p-3 rounded-lg border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-slate-900 leading-snug">{p.title}</span>
                            <StatusBadge status={p.evidence} size="sm" />
                          </div>
                          <p className="text-[11px] text-slate-500"><b>影响：</b>{p.impact || '跨岗位手工协作耗时'}</p>
                          {p.question && (
                            <p className="text-[11px] text-blue-800 bg-blue-50/50 p-1.5 rounded italic">
                              提问：{p.question}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* MODULE 2: 客户共鸣与痛点诊断作战卡 (Agent 2) */}
              <div className="space-y-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 border-b-2 border-indigo-600 pb-2">
                  <span className="w-6 h-6 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <h2 className="text-lg font-bold text-slate-900">
                    第二部分：售前共鸣、五层追问与跨部门 AI 方案矩阵 (Agent 2)
                  </h2>
                </div>

                {/* Natural Opening */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span className="font-bold">🎯 针对业务负责人的自然共鸣开场白（直读/参考）</span>
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded">求教姿态 · 不断言</span>
                  </div>
                  <p className="text-xs leading-relaxed italic bg-white/10 p-3 rounded-lg border border-white/10">
                    “我们最近接触了许多同行，发现大家都在从卷规模转向精细化运营，很多团队在跨系统跑数据与排产时特别耗人工。想向您请教一下，咱们目前在类似环节是怎么分工处理的？”
                  </p>
                </div>

                {/* 5-Layer Questioning */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>FDE 五层追问推进路径表</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/40">
                      <span className="font-bold text-blue-800 block text-[10px]">1. 现状层</span>
                      <p className="text-[11px] text-slate-700 mt-1">“目前流程是怎么分工处理的？”</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/40">
                      <span className="font-bold text-indigo-800 block text-[10px]">2. 频率层</span>
                      <p className="text-[11px] text-slate-700 mt-1">“多久发生一次？通常出现在什么场景？”</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/40">
                      <span className="font-bold text-amber-800 block text-[10px]">3. 影响层</span>
                      <p className="text-[11px] text-slate-700 mt-1">“一旦出现偏差，通常会导致什么业务代价？”</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
                      <span className="font-bold text-emerald-800 block text-[10px]">4. 现存手段</span>
                      <p className="text-[11px] text-slate-700 mt-1">“目前团队是否有自建模板或工具在支持？”</p>
                    </div>
                    <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/40">
                      <span className="font-bold text-purple-800 block text-[10px]">5. 改善目标</span>
                      <p className="text-[11px] text-slate-700 mt-1">“如果能改善，您最希望先提升人效还是准确度？”</p>
                    </div>
                  </div>
                </div>

                {/* AI Solution Matrix */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>各部门高频重复劳动与建议 AI / 自动化改造方案</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900">数据投放 / 运营交付部</span>
                      <p className="text-[11px] text-slate-600"><b>痛点：</b>每日手动从多后台导出 CSV 合并报表，公式易错行</p>
                      <p className="text-[11px] text-indigo-700"><b>AI 建议：</b>多源数据自动同步与日报汇编脚本，自动对齐口径</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-900">商务执行 / 项目协调部</span>
                      <p className="text-[11px] text-slate-600"><b>痛点：</b>微信群碎片化沟通，节点催促容易遗漏</p>
                      <p className="text-[11px] text-indigo-700"><b>AI 建议：</b>工单状态自动化催办助手，节点交付物自动归档</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* MODULE 3: 客户访谈复盘与 PoC 实施备忘录 */}
              <div className="space-y-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 border-b-2 border-emerald-600 pb-2">
                  <span className="w-6 h-6 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <h2 className="text-lg font-bold text-slate-900">
                    第三部分：建议推进的 1-2 周低风险概念验证 (PoC) 实施备忘录
                  </h2>
                </div>

                <div className="p-5 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <span className="font-bold text-emerald-950 text-sm">
                      FDE 1-2周低风险 PoC 验证实施框架
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                      零系统侵入 · 达标才推进
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 leading-relaxed">
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">📌 验证目标：</span>
                      <p className="text-slate-700 text-[11px]">
                        针对已确认的核心断点，在 1-2 周内验证 AI 辅助处理脱敏单据/文本的准确度与提效比率。
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">🔒 数据安全承诺：</span>
                      <p className="text-slate-700 text-[11px]">
                        无需对接客户生产 ERP/数据库，仅需提供 10~20 份完全脱敏的历史业务样本，绝不触碰核心商业机密。
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">🛠️ 交付成果清单：</span>
                      <p className="text-slate-700 text-[11px]">
                        交付 1 套可直观操作体验的交互式轻量原型，以及 1 份《脱敏样本实测效果对比与 ROI 测算报告》。
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block mb-0.5">🎯 成功判定与退出机制：</span>
                      <p className="text-slate-700 text-[11px]">
                        样本处理准确率达到 ≥ 85% 为通过标准；若效果不达预期，双方立即终止探讨，客户无需承担任何改造成本。
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer disclaimer */}
                <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>报告编制：FDE 售前客户诊断工作流系统 V1.0</span>
                  <span>严禁未经授权复制或向第三方扩散 · 仅限客户现场交流使用</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ================= PURE PRINT ROOT (VISIBLE ONLY DURING WINDOW.PRINT) ================= */}
      <div id="fde-pdf-report-root" className="hidden">
        
        {/* PAGE 1: COVER */}
        <div className="print-page-break p-8 text-center space-y-8 min-h-[250mm] flex flex-col justify-between">
          <div className="pt-10">
            <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-8">
              商业机密 · 现场诊断专属报告 (Strictly Confidential)
            </div>

            <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight mt-6">
              【{companyName}】<br />
              业务痛点诊断与 AI 改造机会评估方案
            </h1>
            <p className="text-base text-slate-600 mt-4">
              FDE 售前客户诊断工作流 · 双 Agent 协同深度研报
            </p>
          </div>

          <div className="max-w-lg mx-auto w-full border-t border-b border-slate-300 py-6 my-8 grid grid-cols-2 gap-4 text-left text-xs">
            <div>
              <span className="text-slate-500 block font-semibold">目标企业：</span>
              <span className="font-bold text-slate-900 text-sm">{companyName}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">所属赛道：</span>
              <span className="font-bold text-slate-900 text-sm">{industry}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">交付团队：</span>
              <span className="font-bold text-slate-900">FDE 现场工程交付团队</span>
            </div>
            <div>
              <span className="text-slate-500 block font-semibold">编制日期：</span>
              <span className="font-bold text-slate-900">{reportDate}</span>
            </div>
          </div>

          <div className="pb-10 text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            <b>设计原则：</b>先理解业务，再谈 AI；先验证痛点，再提出方案。<br />
            本报告旨在帮助顾问与客户决策人建立业务共鸣，聚焦高价值真实卡点。
          </div>
        </div>

        {/* PAGE 2: MODULE 1 */}
        <div className="print-page-break p-6 space-y-6">
          <div className="border-b-2 border-blue-600 pb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              第一部分：行业情报、端到端业务流程与岗位痛点地图 (Agent 1)
            </h2>
            <span className="text-xs text-slate-400">客户：{companyName}</span>
          </div>

          {/* Supply chain */}
          <div className="p-3 border border-slate-200 rounded-lg text-xs space-y-2 print-avoid-break">
            <span className="font-bold text-slate-900 block">产业链上下游业务流与信息流转：</span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <b>上游资源输入：</b>物料合同、需求工单、规格参数
              </div>
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <b>中游主体 ({companyName})：</b>排产、派工、制作、质检验收
              </div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                <b>下游渠道交付：</b>终端签收、平台对账、资金结算
              </div>
            </div>
          </div>

          {/* Process stages */}
          {parsedResearch.processStages.length > 0 && (
            <div className="space-y-1.5 print-avoid-break">
              <span className="font-bold text-xs text-slate-900 block">端到端核心业务流程阶段：</span>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="p-2 border-b border-slate-300">序号</th>
                    <th className="p-2 border-b border-slate-300">阶段名称</th>
                    <th className="p-2 border-b border-slate-300">责任岗位</th>
                    <th className="p-2 border-b border-slate-300">输入工具</th>
                    <th className="p-2 border-b border-slate-300">交付物</th>
                    <th className="p-2 border-b border-slate-300">⚡ 协同卡点</th>
                  </tr>
                </thead>
                <tbody className="text-[10px]">
                  {parsedResearch.processStages.map((stg, i) => (
                    <tr key={i} className="border-b border-slate-200">
                      <td className="p-1.5 font-bold">{stg.step || i + 1}</td>
                      <td className="p-1.5 font-semibold">{stg.name}</td>
                      <td className="p-1.5">{stg.roles}</td>
                      <td className="p-1.5">{stg.inputs}</td>
                      <td className="p-1.5">{stg.outputs}</td>
                      <td className="p-1.5 text-rose-700">{stg.bottlenecks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Role Repetitive Task Matrix */}
          {parsedResearch.roleTasks.length > 0 && (
            <div className="space-y-1.5 print-avoid-break pt-2">
              <span className="font-bold text-xs text-slate-900 block">各岗位高频重复工作与卡点：</span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {parsedResearch.roleTasks.slice(0, 6).map((task, i) => (
                  <div key={i} className="p-2 border border-slate-200 rounded space-y-1">
                    <div className="flex justify-between font-bold">
                      <span>{task.roleName}</span>
                      <span className="text-slate-500 font-normal">{task.tier}</span>
                    </div>
                    <p className="text-rose-900"><b>🔥高频手工：</b>{task.repetitiveTasks}</p>
                    <p className="text-slate-600"><b>卡点：</b>{task.bottlenecks}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PAGE 3: MODULE 2 & 3 */}
        <div className="p-6 space-y-6">
          <div className="border-b-2 border-indigo-600 pb-2 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              第二部分：售前共鸣、五层追问与 1-2 周 PoC 实施备忘录 (Agent 2)
            </h2>
            <span className="text-xs text-slate-400">客户：{companyName}</span>
          </div>

          {/* Natural Opening */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs space-y-1 print-avoid-break">
            <span className="font-bold text-slate-900">开场白参考：</span>
            <p className="italic text-slate-700 text-[11px]">
              “我们最近接触了许多同行，发现大家都在从卷规模转向精细化运营，很多团队在跨系统跑数据与排产时特别耗人工。想向您请教一下，咱们目前在类似环节是怎么分工处理的？”
            </p>
          </div>

          {/* 5-Layer Questions */}
          <div className="space-y-1.5 print-avoid-break">
            <span className="font-bold text-xs text-slate-900">FDE 五层追问路径规范：</span>
            <div className="grid grid-cols-5 gap-1.5 text-[10px]">
              <div className="p-2 border border-slate-200 rounded">
                <b>1. 现状：</b>了解真实流程怎么运转
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <b>2. 频率：</b>多久发生一次，多大规模
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <b>3. 影响：</b>导致什么连锁业务代价
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <b>4. 手段：</b>目前有无工具/自建模板
              </div>
              <div className="p-2 border border-slate-200 rounded">
                <b>5. 目标：</b>改善最在乎哪个关键指标
              </div>
            </div>
          </div>

          {/* PoC Memo Box */}
          <div className="p-4 border-2 border-emerald-400 bg-emerald-50/30 rounded-lg text-xs space-y-2.5 print-avoid-break">
            <div className="flex justify-between font-bold text-emerald-950 border-b border-emerald-200 pb-1">
              <span>FDE 1-2 周低风险概念验证 (PoC) 实施备忘录</span>
              <span>零系统侵入 · 达标才推进</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
              <div>
                <b>验证目标：</b>在 1-2 周内验证 AI 辅助脱敏单据/数据的处理提效与准确度。
              </div>
              <div>
                <b>数据安全：</b>无需对接生产数据库，仅需 10-20 份脱敏样本，绝不触碰机密。
              </div>
              <div>
                <b>交付成果：</b>1 份可操作体验的轻量原型，以及《实测效果对比与 ROI 评估报告》。
              </div>
              <div>
                <b>退出机制：</b>准确率 ≥ 85% 达标才推进；未达标零沉没成本即刻友好终止。
              </div>
            </div>
          </div>

          <div className="pt-4 text-center text-[10px] text-slate-400">
            FDE 售前客户诊断工作流系统 · 商业咨询交付专用 · {reportDate}
          </div>
        </div>

      </div>
    </>
  );
};
