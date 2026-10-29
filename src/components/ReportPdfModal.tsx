import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CaseSession } from '../types';
import { parseFullDocument } from '../lib/parseDiagnosis';
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
  AlertTriangle, 
  Clock, 
  Workflow,
  Cpu,
  CheckCircle2,
  Lock,
  ArrowRight,
  Briefcase
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
  // Default to pure client-facing proposal (zero internal sales OS)
  const [exportMode, setExportMode] = useState<'clientProposal' | 'internalCombat'>('clientProposal');

  if (!isOpen) return null;

  const companyName = currentCase.companyName || '目标客户企业';
  const industry = currentCase.industry || '行业未指定';
  const reportDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Parse research and combat documents
  const parsedResearch = parseFullDocument(currentCase.researchResult || '');
  const parsedCombat = parseFullDocument(currentCase.combatCardResult || '');

  // Extract Section 2 key conclusions
  const sec2 = parsedResearch.sections['sec_2'] || { keyValuePairs: {}, bulletPoints: [] };
  const industryTrend = sec2.keyValuePairs['行业当前最值得关注的变化'] || 
    sec2.bulletPoints[0] || 
    '当前行业正在从传统规模扩张与长交期，全面转向“小单快反、柔性敏捷与全渠道精准交付”。跨部门数据滞后与手工重复转抄正成为核心制约瓶颈。';

  const businessPosition = sec2.keyValuePairs['企业的业务定位'] || 
    sec2.bulletPoints[1] || 
    `${companyName} 在产业链中承担中游关键研发、制造与协同履约职责，兼具柔性响应与规模化品控双重考验。`;

  // Extract Upstream / Downstream
  const sec4 = parsedResearch.sections['sec_4'] || { rawContent: '', keyValuePairs: {} };
  const upstream = sec4.keyValuePairs['上游'] || 
    currentCase.researchResult?.match(/上游[：:]\s*([^\n]+)/)?.[1] || 
    '原料/供应商协同、物料计划与客户原始需求输入';

  const midstream = sec4.keyValuePairs['中游'] || 
    currentCase.researchResult?.match(/中游[：:]\s*([^\n]+)/)?.[1] || 
    `${companyName} 核心业务运营、排产调度、工艺执行与品控管理`;

  const downstream = sec4.keyValuePairs['下游'] || 
    currentCase.researchResult?.match(/下游[：:]\s*([^\n]+)/)?.[1] || 
    '终端渠道交付、客户签收、批量对账与资金结算';

  // Extract candidate AI solutions from Section 8
  const sec8Raw = parsedResearch.sections['sec_8']?.rawContent || 
    currentCase.researchResult?.match(/##\s*8\.\s*AI\s*机会初筛([\s\S]*?)(?=##\s*9|$)/)?.[1] || '';

  const aiScenarioBlocks = sec8Raw
    .split(/(?:-\s*\*\*候选(?:AI)?场景\s*[0-9一二三四五][:：]?|###\s*候选(?:AI)?场景)/)
    .filter(b => b.trim().length > 30)
    .map((block, idx) => {
      const firstLine = block.trim().split('\n')[0].replace(/^[#\*\s]+/, '').replace(/\*\*.*$/, '').trim();
      const roles = block.match(/(?:对应岗位|目标岗位)[：:]\s*([^\n]+)/)?.[1]?.replace(/\*\*/g, '').trim() || '业务与管理团队';
      const value = block.match(/(?:业务价值假设|预期改善方向|业务价值)[：:]\s*([^\n]+)/)?.[1]?.replace(/\*\*/g, '').trim() || '消除跨系统手工重复劳动，提升流转时效';
      const dataReq = block.match(/(?:数据需求|所需数据与系统条件)[：:]\s*([^\n]+)/)?.[1]?.replace(/\*\*/g, '').trim() || '业务系统导出表单或标准化中间库接口';
      const advice = block.match(/(?:初步建议|实施建议)[：:]\s*([^\n]+)/)?.[1]?.replace(/\*\*/g, '').trim() || '建议作为第一期低风险切口进行原型验证';
      return {
        title: firstLine || `AI 场景赋能方案 ${idx + 1}`,
        roles,
        value,
        dataReq,
        advice
      };
    });

  // Fallback AI Scenarios if not explicitly parsed
  const aiSolutions = aiScenarioBlocks.length > 0 ? aiScenarioBlocks : [
    {
      title: '多源异构数据自动化聚合与决策日报生成 (RPA + 数据集成)',
      roles: '运营总监、数据对账员、业务主管',
      value: '将每日1-2小时的手工导表合并压缩至数分钟内自动完成，确保管理层当日实时掌握真实履约损耗。',
      dataReq: '业务后台、ERP工单报表或脱敏Excel历史台账',
      advice: '优先级最高。从解决多系统导表这一显性耗时点切入，见效快且不改动现有生产架构。'
    },
    {
      title: '基于自然语言解析的业务工单敏捷协同与异常预警 (NLP + 流程自动化)',
      roles: '项目经理、计划调度员(PMC)、执行团队',
      value: '自动抓取与结构化沉淀跨部门群消息中的流转变更，减少口头与微信沟通信息差，降低排产返工。',
      dataReq: '标准需求模板、沟通流转记录样本',
      advice: '优先规范表单字段与交接节点，再推行自动化辅助，避免流程噪音。'
    },
    {
      title: '跨平台结算账单自动化对账与差异预警 (智能规则引擎)',
      roles: '财务核销员、跟单员、一线执行专员',
      value: '自动匹配多平台结算单据与内部ERP订单流水，毫米级标记对账差异，杜绝人工漏对与错行。',
      dataReq: '各平台历史结算对账样本',
      advice: '适合作为轻量级脱敏 PoC 首选项目，2周内即可量化核对准确率。'
    }
  ];

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Generate clean client proposal markdown
  const generateClientProposalMarkdown = () => {
    let md = `# 【${companyName}】数字化转型与 AI 智能协同诊断建议书\n\n`;
    md += `> 所属赛道：${industry} | 编制日期：${reportDate} | 方案编制：武汉仓藤科技\n\n`;
    md += `## 一、项目背景与数字化演进趋势\n\n`;
    md += `- **行业新周期特征：** ${industryTrend}\n`;
    md += `- **目标企业业务定位：** ${businessPosition}\n`;
    md += `- **数字化升级驱动力：** 打破跨部门“信息孤岛”与人工重复导表转抄，从粗放依赖经验转向数据驱动的敏捷柔性协同。\n\n`;

    md += `## 二、端到端核心业务流程图与流转断点梳理\n\n`;
    md += `### 2.1 产业链上下游流转关系\n`;
    md += `- **上游资源输入：** ${upstream}\n`;
    md += `- **中游主体 (${companyName})：** ${midstream}\n`;
    md += `- **下游渠道交付：** ${downstream}\n\n`;

    if (parsedResearch.processStages.length > 0) {
      md += `### 2.2 端到端核心业务流程标准矩阵\n\n`;
      md += `| 阶段序号 | 流程阶段名称 | 责任岗位与协作方 | 核心业务动作 | 输入系统与工具栈 | 输出交付成果 | 潜在协同断点与效率瓶颈 |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      parsedResearch.processStages.forEach(stg => {
        md += `| 阶段 ${stg.step} | ${stg.name} | ${stg.roles} | ${stg.actions} | ${stg.inputs} | ${stg.outputs} | ${stg.bottlenecks} |\n`;
      });
      md += `\n`;
    }

    md += `## 三、核心岗位高耗时手工任务与效率瓶颈剖析\n\n`;
    if (parsedResearch.roleTasks.length > 0) {
      md += `| 岗位层级 | 具体岗位名称 | 核心业务职责 | 🔥高频重复手工任务 (最耗时) | 输入数据与系统 | 输出交付物 | 业务等待与易错卡点 |\n`;
      md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      parsedResearch.roleTasks.forEach(task => {
        md += `| ${task.tier} | ${task.roleName} | ${task.coreDuty} | ${task.repetitiveTasks} | ${task.inputsAndTools} | ${task.outputs} | ${task.bottlenecks} |\n`;
      });
      md += `\n`;
    }

    if (Object.keys(parsedResearch.roleTierAnalyses).length > 0) {
      md += `### 3.1 现场作业实录与深度剖析\n\n`;
      Object.entries(parsedResearch.roleTierAnalyses).forEach(([title, content]) => {
        md += `#### ${title}\n${content}\n\n`;
      });
    }

    md += `## 四、业务场景化 AI 与自动化赋能解决方案设计\n\n`;
    aiSolutions.forEach((sol, i) => {
      md += `### 4.${i + 1} ${sol.title}\n`;
      md += `- **赋能对象：** ${sol.roles}\n`;
      md += `- **核心业务价值：** ${sol.value}\n`;
      md += `- **数据与接口要求：** ${sol.dataReq}\n`;
      md += `- **落地推进建议：** ${sol.advice}\n\n`;
    });

    md += `## 五、敏捷推进路径与 1-2 周低风险概念验证 (PoC) 实施框架\n\n`;
    md += `- **阶段一：1~2 周低风险轻量 PoC（原型验证）：** 使用 10~20 份完全脱敏的历史业务样本，验证自动化清洗或智能解析准确率。零生产系统侵入，不改变现有组织结构。准确率达标（≥85%）才推进下一阶段；若不达预期，双方即刻友好终止，客户无需承担任何改造成本。\n`;
    md += `- **阶段二：单一业务单元/试点产线试运行（1~2 个月）：** 在特定业务小组进行闭环上线，跑通上下游工单协同，沉淀操作规范。\n`;
    md += `- **阶段三：企业级全面推广与私域知识库沉淀（3~6 个月）：** 形成企业级智能协同枢纽，沉淀私域业务资产。\n\n`;

    md += `## 六、企业级数据安全与私域合规保障承诺\n\n`;
    md += `- **零系统侵入原则：** 前期验证无需直连客户生产数据库，杜绝生产安全隐患。\n`;
    md += `- **数据严格脱敏原则：** 所有测试样本均在客户确认下抹除客户名称、手机号、价格等敏感隐私。\n`;
    md += `- **保密义务：** 方案团队遵循严格保密协议 (NDA)，绝不将客户数据用于第三方模型公域训练。\n\n`;

    md += `## 七、建议的下一步行动计划\n\n`;
    md += `1. 共同选定 1 个痛点最明确、见效最快的切口场景作为首期 PoC 验证主题。\n`;
    md += `2. 客户侧提供 10~20 份历史脱敏单据/表格样本。\n`;
    md += `3. 武汉仓藤科技团队在 7 个工作日内完成原型构建与实测 ROI 测算汇报。\n`;

    return md;
  };

  // Generate internal combat dossier
  const generateInternalDossierMarkdown = () => {
    let full = `# FDE 内部售前作战全景卷宗｜${companyName}\n`;
    full += `> 仅限内部顾问团队使用 · 包含自然共鸣开场白、五层追问雷达与现场应对策略\n\n`;
    if (currentCase.researchResult) full += `## 模块一：情报地图 (Agent 1)\n\n${currentCase.researchResult}\n\n---\n\n`;
    if (currentCase.combatCardResult) full += `## 模块二：售前作战卡与追问路径 (Agent 2)\n\n${currentCase.combatCardResult}\n\n---\n\n`;
    if (currentCase.dynamicDiagnosisResult) full += `## 模块三：客户访谈复盘 (Step 4)\n\n${currentCase.dynamicDiagnosisResult}\n`;
    return full;
  };

  // Download Markdown
  const handleDownloadMarkdown = () => {
    const text = exportMode === 'clientProposal' 
      ? generateClientProposalMarkdown() 
      : generateInternalDossierMarkdown();
    const filename = exportMode === 'clientProposal'
      ? `【建议方案】${companyName}_数字化转型与AI智能协同诊断建议书.md`
      : `【内部卷宗】${companyName}_FDE售前作战全景卷宗.md`;

    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Text
  const handleCopyText = () => {
    const text = exportMode === 'clientProposal' 
      ? generateClientProposalMarkdown() 
      : generateInternalDossierMarkdown();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* ================= SCREEN PREVIEW MODAL ================= */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-slate-100 rounded-2xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden">
          
          {/* Top Control Bar */}
          <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <span>诊断方案导出 · A4 矢量 PDF / 方案交付</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    A4 纸张规范
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {companyName} ({industry}) · {exportMode === 'clientProposal' ? '面向客户直读 · 无内部员工建议与OS' : '内部顾问专用 · 含售前攻防话术'}
                </p>
              </div>
            </div>

            {/* Mode Switcher & Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Deliverable Mode Toggle */}
              <div className="flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setExportMode('clientProposal')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                    exportMode === 'clientProposal'
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="生成给企业客户直接阅读的高保真建议书，去除一切内部话术和售前套路"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>客户交付版建议书 (无内部OS)</span>
                </button>
                <button
                  onClick={() => setExportMode('internalCombat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                    exportMode === 'internalCombat'
                      ? 'bg-indigo-600 text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="供顾问团队内部复盘与作战准备使用，包含开场白与追问脚本"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>内部顾问作战卷宗</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyText}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  title="复制方案全文"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                  <span>{copied ? '已复制' : '复制全文'}</span>
                </button>

                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                  title="导出 Markdown 格式方案"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>导出 .md</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition-all"
                  title="直接调起浏览器打印 / 另存为高清矢量 PDF"
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
          </div>

          {/* Document Preview Canvas (Scrollable A4 Paper look) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/80 space-y-6 flex flex-col items-center">
            
            {/* Notice Banner */}
            <div className="w-full max-w-[210mm] bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  当前为<b>【{exportMode === 'clientProposal' ? '客户交付版建议书' : '内部顾问作战卷宗'}】</b>。
                  点击右上角<b>「打印 / 另存为 PDF」</b>，目标打印机选择<b>「另存为 PDF」</b>，页边距建议<b>「无」或「默认」</b>即可生成高清矢量方案。
                </span>
              </span>
            </div>

            {/* A4 Paper Document Container */}
            <div className="w-full max-w-[210mm] bg-white shadow-xl rounded-sm p-8 sm:p-14 space-y-10 text-slate-800 font-sans border border-slate-300">
              
              {/* ========================================================= */}
              {/* VIEW 1: CLIENT-FACING PROPOSAL (NO INTERNAL SALES OS)   */}
              {/* ========================================================= */}
              {exportMode === 'clientProposal' ? (
                <>
                  {/* COVER PAGE (封面) */}
                  <div className="pb-12 border-b-2 border-slate-900 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold tracking-wider uppercase">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>数字化转型与智能协同诊断咨询方案 · 专属交付报告</span>
                    </div>

                    <div className="space-y-3 pt-4">
                      <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
                        【{companyName}】<br />
                        数字化转型与 AI 智能协同诊断建议书
                      </h1>
                      <p className="text-base text-slate-600 font-medium max-w-xl mx-auto">
                        端到端业务主流程卡点诊断 · 核心岗位手工耗时剖析 · 场景化 AI 赋能蓝图与敏捷实施路径
                      </p>
                    </div>

                    <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-slate-200 max-w-2xl mx-auto text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold">服务企业：</span>
                        <span className="font-bold text-slate-900">{companyName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">所属赛道：</span>
                        <span className="font-bold text-slate-900">{industry}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">方案编制：</span>
                        <span className="font-bold text-slate-900">武汉仓藤科技</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">报告日期：</span>
                        <span className="font-bold text-slate-900">{reportDate}</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-500 bg-slate-50 p-3.5 rounded-lg border border-slate-200 max-w-2xl mx-auto leading-relaxed text-left">
                      <b>方案准则：</b>先理解业务，再谈 AI；先量化痛点，再落地场景。本方案聚焦企业日常高频重复劳动与跨部门信息时滞，旨在以 1-2 周极低风险的原型验证方式，协助企业实现敏捷、安全、务实的人效与协同升级。
                    </div>
                  </div>

                  {/* SECTION 1: 背景与演进趋势 */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                      <h2 className="text-base font-bold text-slate-900">
                        一、项目背景与行业数字化演进趋势
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                        <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span>宏观行业转型新周期</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {industryTrend}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                        <span className="font-bold text-indigo-900 block flex items-center gap-1.5">
                          <Target className="w-4 h-4 text-indigo-600" />
                          <span>企业业务模式与升级诉求</span>
                        </span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {businessPosition}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: 端到端业务流程与断点 */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                      <h2 className="text-base font-bold text-slate-900">
                        二、端到端核心业务流程图与协同断点梳理
                      </h2>
                    </div>

                    {/* Supply Chain Box */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                        产业链上下游业务流与信息流转关系
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-blue-700 block mb-1">1. 上游资源输入端</span>
                          <p className="text-slate-600 text-[11px]">{upstream}</p>
                        </div>
                        <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                          <span className="font-bold text-indigo-700 block mb-1">2. 中游运营主体 ({companyName})</span>
                          <p className="text-slate-800 text-[11px]">{midstream}</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <span className="font-bold text-emerald-700 block mb-1">3. 下游客户交付端</span>
                          <p className="text-slate-600 text-[11px]">{downstream}</p>
                        </div>
                      </div>
                    </div>

                    {/* Process Stages Matrix */}
                    {parsedResearch.processStages.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                          端到端核心业务流程标准矩阵（阶段流转、交付物与卡点）
                        </span>
                        <div className="border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                          <table className="w-full text-left text-xs divide-y divide-slate-200">
                            <thead className="bg-slate-100 font-bold text-slate-800">
                              <tr>
                                <th className="p-2.5">阶段序号</th>
                                <th className="p-2.5">业务流程阶段</th>
                                <th className="p-2.5">责任岗位与协作方</th>
                                <th className="p-2.5">输入资料与工具栈</th>
                                <th className="p-2.5">输出交付成果</th>
                                <th className="p-2.5">⚡ 潜在信息断点/协同卡点</th>
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
                  </div>

                  {/* SECTION 3: 岗位手工高耗时与效率瓶颈 */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                      <h2 className="text-base font-bold text-slate-900">
                        三、核心岗位高耗时手工任务与效率损耗剖析
                      </h2>
                    </div>

                    {parsedResearch.roleTasks.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {parsedResearch.roleTasks.map((task, i) => (
                          <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                              <span className="font-bold text-slate-900 text-xs">{task.roleName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">{task.tier}</span>
                            </div>
                            {task.coreDuty && (
                              <p className="text-[11px] text-slate-500">
                                <b>核心职责：</b>{task.coreDuty}
                              </p>
                            )}
                            <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
                              <span className="text-[11px] font-bold text-rose-900 block mb-0.5">🔥 高耗时重复手工任务：</span>
                              <p className="text-[11px] text-rose-950 font-mono leading-relaxed">{task.repetitiveTasks}</p>
                            </div>
                            <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                              <b>业务卡点与损耗：</b>{task.bottlenecks}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Detailed field notes if extracted */}
                    {Object.keys(parsedResearch.roleTierAnalyses).length > 0 && (
                      <div className="space-y-3 pt-2">
                        <span className="text-xs font-bold text-slate-800 block">各层级现场调研深度实录：</span>
                        {Object.entries(parsedResearch.roleTierAnalyses).map(([t, c], idx) => (
                          <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                            <span className="font-bold text-slate-900 block mb-2 text-xs">【{t}】</span>
                            <div className="prose prose-slate max-w-none prose-p:text-xs prose-p:my-1 prose-ul:text-xs prose-ul:my-1 prose-ul:pl-4 prose-li:my-0.5 prose-strong:text-slate-900">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {c}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* SECTION 4: 业务场景化 AI 解决方案规划 */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 border-b-2 border-blue-600 pb-2">
                      <span className="w-6 h-6 rounded-md bg-blue-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                      <h2 className="text-base font-bold text-slate-900">
                        四、业务场景化 AI 与自动化赋能解决方案设计
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 text-xs">
                      {aiSolutions.map((sol, i) => (
                        <div key={i} className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between border-b border-blue-100 pb-1.5">
                            <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
                              <Cpu className="w-4 h-4 text-blue-600" />
                              <span>方案 {i + 1}：{sol.title}</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                              赋能岗位：{sol.roles}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] pt-1">
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block font-semibold mb-0.5">🎯 核心业务价值：</span>
                              <span className="text-slate-800 leading-relaxed">{sol.value}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block font-semibold mb-0.5">🛠️ 系统数据条件：</span>
                              <span className="text-slate-800 leading-relaxed">{sol.dataReq}</span>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-400 block font-semibold mb-0.5">💡 推进建议：</span>
                              <span className="text-slate-800 leading-relaxed">{sol.advice}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SECTION 5: 实施路径与 1-2 周低风险 PoC */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 border-b-2 border-emerald-600 pb-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">5</span>
                      <h2 className="text-base font-bold text-slate-900">
                        五、敏捷推进路径与 1-2 周低风险概念验证 (PoC) 实施框架
                      </h2>
                    </div>

                    <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/40 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                        <span className="font-bold text-emerald-950 text-sm">
                          低风险渐进式演进方案：先脱敏验证，效果达标才进入试点
                        </span>
                        <span className="px-2.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-bold text-[10px]">
                          零生产系统侵入 · 零试错成本
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 leading-relaxed text-[11px]">
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
                          <span className="font-bold text-emerald-800 block">第一阶段：1-2 周轻量 PoC</span>
                          <p className="text-slate-600">使用 10-20 份完全脱敏的历史业务表单/文本，离线验证自动化清洗或智能工单提取的准确率与提效比。</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
                          <span className="font-bold text-emerald-800 block">第二阶段：单一产线试运行</span>
                          <p className="text-slate-600">PoC 达标后，在 1 个生产小组或业务单元进行深度试运行（1-2个月），跑通上下游跨部门闭环。</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-1">
                          <span className="font-bold text-emerald-800 block">第三阶段：企业级全面协同</span>
                          <p className="text-slate-600">在全企业推广落地，连接多业务系统，形成自动化数据与业务流转枢纽，持续积累私域数据资产。</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 6: 数据安全与隐私合规承诺 */}
                  <div className="space-y-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-2 border-b-2 border-slate-700 pb-2">
                      <span className="w-6 h-6 rounded-md bg-slate-800 text-white text-xs font-bold flex items-center justify-center">6</span>
                      <h2 className="text-base font-bold text-slate-900">
                        六、企业级数据安全与私域合规保障承诺
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                        <span className="font-bold text-slate-900 block flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                          <span>零系统直连风险</span>
                        </span>
                        <p className="text-slate-600 text-[11px]">前期验证完全使用离线脱敏副本，绝不要求直连客户核心 ERP/财务数据库，消除生产中断隐患。</p>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                        <span className="font-bold text-slate-900 block flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                          <span>敏感信息严格脱敏</span>
                        </span>
                        <p className="text-slate-600 text-[11px]">客户名称、联系方式、具体单价与财务机密在输入前均可进行哈希或模糊化处理，杜绝泄露。</p>
                      </div>

                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                        <span className="font-bold text-slate-900 block flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-600" />
                          <span>双向 NDA 保密约束</span>
                        </span>
                        <p className="text-slate-600 text-[11px]">签署具备法律效力的保密协议，承诺所有数据绝不用于任何第三方公共大模型的公开训练。</p>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 7: 下一步协同建议 */}
                  <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 text-xs">
                    <span className="font-bold text-sm block">七、建议的下一步协同行动</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-300">
                      <div>
                        <span className="font-bold text-white block mb-0.5">1. 选定切口场景：</span>
                        <span>由双方共同选定 1 个最耗时且规则相对清晰的环节（如日报自动化），明确验证指标。</span>
                      </div>
                      <div>
                        <span className="font-bold text-white block mb-0.5">2. 准备脱敏样本：</span>
                        <span>客户侧提供 10~20 份脱敏历史业务表单作为测试基准集。</span>
                      </div>
                      <div>
                        <span className="font-bold text-white block mb-0.5">3. 7天原型实测：</span>
                        <span>武汉仓藤科技交付团队在 7 个工作日内完成原型构建，并出具准确率对比与实测 ROI 测算报告。</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* ========================================================= */
                /* VIEW 2: INTERNAL CONSULTANT DOSSIER (INCLUDES SCRIPTS)    */
                /* ========================================================= */
                <>
                  <div className="pb-8 border-b-2 border-indigo-900 text-center space-y-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-900 text-white text-xs font-bold uppercase tracking-wider">
                      内部顾问作战卷宗 (Internal Sales & Tactical Dossier)
                    </span>
                    <h1 className="text-2xl font-bold text-slate-950">
                      【{companyName}】售前客户诊断作战全景卷宗
                    </h1>
                    <p className="text-xs text-slate-500">
                      包含自然共鸣开场白、五层追问推进路径、现场应对策略与技术 PoC 备忘录
                    </p>
                  </div>

                  {/* Combat Opening */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white space-y-2 text-xs">
                    <span className="font-bold text-blue-200 block">🎯 自然共鸣开场白（求教姿态 · 不断言）</span>
                    <p className="italic bg-white/10 p-3 rounded-lg border border-white/10 leading-relaxed">
                      “我们最近接触了许多同行，发现大家都在从卷规模转向精细化运营，很多团队在跨系统跑数据与排产时特别耗人工。想向您请教一下，咱们目前在类似环节是怎么分工处理的？”
                    </p>
                  </div>

                  {/* 5-Layer Probing Radar */}
                  <div className="space-y-2 text-xs">
                    <span className="font-bold text-slate-900 uppercase tracking-wider block">
                      FDE 五层追问推进路径（由浅入深）
                    </span>
                    <div className="grid grid-cols-5 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50">
                        <span className="font-bold text-blue-800 block text-[10px]">1. 现状层</span>
                        <p className="text-slate-700 mt-1">“目前流程怎么分工处理的？”</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50">
                        <span className="font-bold text-indigo-800 block text-[10px]">2. 频率层</span>
                        <p className="text-slate-700 mt-1">“多久发生一次？通常在什么场景？”</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                        <span className="font-bold text-amber-800 block text-[10px]">3. 影响层</span>
                        <p className="text-slate-700 mt-1">“一旦出现偏差，导致什么业务代价？”</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50">
                        <span className="font-bold text-emerald-800 block text-[10px]">4. 现存手段</span>
                        <p className="text-slate-700 mt-1">“目前团队是否有自建模板在支持？”</p>
                      </div>
                      <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50">
                        <span className="font-bold text-purple-800 block text-[10px]">5. 改善目标</span>
                        <p className="text-slate-700 mt-1">“如果能改善，最看重人效还是准确度？”</p>
                      </div>
                    </div>
                  </div>

                  {/* Process & Roles summary */}
                  <div className="space-y-3 pt-2 text-xs">
                    <span className="font-bold text-slate-900 block">业务主流程与岗位矩阵速查：</span>
                    {parsedResearch.processStages.length > 0 && (
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                          <thead className="bg-slate-100 font-bold">
                            <tr>
                              <th className="p-2">阶段</th>
                              <th className="p-2">名称</th>
                              <th className="p-2">责任岗位</th>
                              <th className="p-2">⚡ 痛点卡点</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedResearch.processStages.map((s, idx) => (
                              <tr key={idx}>
                                <td className="p-2 font-bold">{s.step || idx + 1}</td>
                                <td className="p-2 font-medium">{s.name}</td>
                                <td className="p-2 text-slate-600">{s.roles}</td>
                                <td className="p-2 text-rose-700">{s.bottlenecks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

            </div>

          </div>

        </div>
      </div>

      {/* ================= PURE PRINT ROOT (FOR BROWSER PRINT ENGINE ONLY) ================= */}
      {createPortal(
        <div id="fde-pdf-report-root">
          {exportMode === 'clientProposal' ? (
          /* Client proposal print layout */
          <div className="p-8 space-y-8 text-slate-900 font-sans">
            {/* Page 1: Cover */}
            <div className="print-page-break p-10 text-center space-y-8 min-h-[250mm] flex flex-col justify-between">
              <div className="pt-10">
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-8">
                  数字化转型与智能协同诊断咨询方案 · 交付报告
                </div>

                <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight mt-6">
                  【{companyName}】<br />
                  数字化转型与 AI 智能协同诊断建议书
                </h1>
                <p className="text-base text-slate-600 mt-4 max-w-xl mx-auto">
                  端到端业务主流程卡点诊断 · 核心岗位手工耗时剖析 · 场景化 AI 赋能蓝图与敏捷实施路径
                </p>
              </div>

              <div className="max-w-lg mx-auto w-full border-t border-b border-slate-300 py-6 my-8 grid grid-cols-2 gap-4 text-left text-xs">
                <div>
                  <span className="text-slate-500 block font-semibold">服务企业：</span>
                  <span className="font-bold text-slate-900 text-sm">{companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">所属赛道：</span>
                  <span className="font-bold text-slate-900 text-sm">{industry}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">方案编制：</span>
                  <span className="font-bold text-slate-900">武汉仓藤科技</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-semibold">编制日期：</span>
                  <span className="font-bold text-slate-900">{reportDate}</span>
                </div>
              </div>

              <div className="pb-10 text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                <b>方案准则：</b>先理解业务，再谈 AI；先量化痛点，再落地场景。<br />
                本方案聚焦企业日常高频重复劳动与跨部门信息时滞，旨在以 1-2 周极低风险的原型验证方式，协助企业实现敏捷、安全、务实的人效与协同升级。
              </div>
            </div>

            {/* Page 2: Section 1 & 2 */}
            <div className="print-page-break p-6 space-y-6">
              <div className="border-b-2 border-blue-600 pb-2 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  一、项目背景与端到端核心业务流程图
                </h2>
                <span className="text-xs text-slate-400">客户：{companyName}</span>
              </div>

              <div className="p-3 border border-slate-200 rounded-lg text-xs space-y-2 print-avoid-break">
                <span className="font-bold text-slate-900 block">产业链流转定位：</span>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <b>上游输入：</b>{upstream}
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <b>中游运营 ({companyName})：</b>{midstream}
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded">
                    <b>下游交付：</b>{downstream}
                  </div>
                </div>
              </div>

              {parsedResearch.processStages.length > 0 && (
                <div className="space-y-1.5 print-avoid-break">
                  <span className="font-bold text-xs text-slate-900 block">端到端核心业务流程标准矩阵：</span>
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
            </div>

            {/* Page 3: Section 3 & 4 */}
            <div className="print-page-break p-6 space-y-6">
              <div className="border-b-2 border-blue-600 pb-2 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  二、岗位手工耗时分析与场景化 AI 解决方案规划
                </h2>
                <span className="text-xs text-slate-400">客户：{companyName}</span>
              </div>

              {parsedResearch.roleTasks.length > 0 && (
                <div className="space-y-1.5 print-avoid-break">
                  <span className="font-bold text-xs text-slate-900 block">各层级岗位日常手工高耗时任务：</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {parsedResearch.roleTasks.slice(0, 6).map((task, i) => (
                      <div key={i} className="p-2 border border-slate-200 rounded space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{task.roleName}</span>
                          <span className="text-slate-500 font-normal">{task.tier}</span>
                        </div>
                        <p className="text-rose-900"><b>🔥高频手工：</b>{task.repetitiveTasks}</p>
                        <p className="text-slate-600"><b>卡点损耗：</b>{task.bottlenecks}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 print-avoid-break pt-2">
                <span className="font-bold text-xs text-slate-900 block">业务场景化 AI 与自动化赋能方案：</span>
                <div className="space-y-2 text-[10px]">
                  {aiSolutions.map((sol, i) => (
                    <div key={i} className="p-2.5 border border-blue-200 rounded bg-blue-50/20 space-y-1">
                      <div className="flex justify-between font-bold text-blue-900">
                        <span>方案 {i + 1}：{sol.title}</span>
                        <span>{sol.roles}</span>
                      </div>
                      <p><b>业务价值：</b>{sol.value}</p>
                      <p className="text-slate-500"><b>数据要求：</b>{sol.dataReq} | <b>推进建议：</b>{sol.advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Page 4: PoC Roadmap & Security */}
            <div className="p-6 space-y-6">
              <div className="border-b-2 border-emerald-600 pb-2 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">
                  三、1-2 周低风险 PoC 验证框架与数据安全承诺
                </h2>
                <span className="text-xs text-slate-400">客户：{companyName}</span>
              </div>

              <div className="p-4 border-2 border-emerald-400 bg-emerald-50/30 rounded-lg text-xs space-y-2.5 print-avoid-break">
                <div className="flex justify-between font-bold text-emerald-950 border-b border-emerald-200 pb-1">
                  <span>1-2 周低风险概念验证 (PoC) 实施准则</span>
                  <span>零生产系统侵入 · 达标才推进</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] leading-relaxed">
                  <div>
                    <b>验证目标：</b>在 1-2 周内验证 AI 辅助脱敏单据/数据处理的提效与准确度。
                  </div>
                  <div>
                    <b>数据安全：</b>无需对接生产数据库，仅需 10-20 份脱敏历史样本。
                  </div>
                  <div>
                    <b>交付成果：</b>1 份可直观体验的交互原型，以及《实测效果对比与 ROI 评估报告》。
                  </div>
                  <div>
                    <b>退出机制：</b>准确率达标才推进下一阶段；未达标零成本即刻友好终止。
                  </div>
                </div>
              </div>

              <div className="pt-4 text-center text-[10px] text-slate-400">
                【{companyName}】数字化转型与 AI 智能协同诊断建议书 · {reportDate}
              </div>
            </div>
          </div>
        ) : (
          /* Internal dossier print layout */
          <div className="p-8 space-y-6 text-slate-900">
            <h1 className="text-xl font-bold">FDE 内部售前作战全景卷宗 · {companyName}</h1>
            <p className="text-xs text-slate-500">包含开场白、追问雷达与内部应对策略</p>
          </div>
        )}
      </div>,
      document.body
    )}
    </>
  );
};
