import React, { useState } from 'react';
import { CaseSession, InterviewFeedback, PainPointStatus } from '../types';
import { MarkdownViewer } from './MarkdownViewer';
import { StatusBadge } from './StatusBadge';
import { FEEDBACK_PRESETS } from '../lib/presets';
import { 
  MessageSquareQuote, 
  BrainCircuit, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  RefreshCw, 
  Send, 
  Layers, 
  FileCheck2, 
  Sparkles,
  CheckCircle,
  FileDown,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  X,
  Printer
} from 'lucide-react';

interface Step4InterviewFeedbackProps {
  currentCase: CaseSession;
  reasoning: string;
  streamingContent: string;
  isStreaming: boolean;
  onSubmitFeedback: (feedback: Partial<InterviewFeedback>) => void;
  onUpdatePainPoints: (list: any[]) => void;
  onOpenExportPdf?: () => void;
}

export const Step4InterviewFeedback: React.FC<Step4InterviewFeedbackProps> = ({
  currentCase,
  reasoning,
  streamingContent,
  isStreaming,
  onSubmitFeedback,
  onUpdatePainPoints,
  onOpenExportPdf
}) => {
  const [showReasoning, setShowReasoning] = useState(false);
  const [showPocModal, setShowPocModal] = useState(false);
  const [copiedPoc, setCopiedPoc] = useState(false);

  // Feedback form state
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [targetRole, setTargetRole] = useState(currentCase.contactRole || '生产运营总监');
  const [discussedPainPoints, setDiscussedPainPoints] = useState('');
  const [clientQuotes, setClientQuotes] = useState('');
  const [confirmedFacts, setConfirmedFacts] = useState('');
  const [deniedFacts, setDeniedFacts] = useState('');
  const [clientData, setClientData] = useState('');
  const [openQuestions, setOpenQuestions] = useState('');
  const [advisorRequests, setAdvisorRequests] = useState('下一步应该追问什么？这个痛点是否值得继续挖？是否值得进一步评估 AI？');

  // Pain points list
  const painPoints = currentCase.painPointsList || [
    { id: '1', name: '工程变更(ECN)跨部门流转时滞导致返工呆料', status: '客户陈述' },
    { id: '2', name: '高频插单下的排产经验依赖与瓶颈不可见', status: '待验证' },
    { id: '3', name: '质检毛坯外观瑕疵人工抽检漏检', status: '已否定' },
  ];

  // Generate or extract PoC memo text
  const generatePocMemo = (): string => {
    const activePain = painPoints.find(p => p.status === '证据支持' || p.status === '客户陈述') || painPoints[0];
    const painName = discussedPainPoints || activePain?.name || '跨部门业务流程手工流转与数据搬运卡点';

    // If dynamic diagnosis output contains Section 6, extract it
    const sec6Match = (displayContent || '').match(/## 6\.\s*《1-2周低风险 PoC 验证备忘录》([\s\S]*?)(?=(##|$))/);
    if (sec6Match && sec6Match[1]?.trim().length > 60) {
      return `【FDE 1-2周低风险概念验证 (PoC) 备忘录】\n客户单位：${currentCase.companyName || '目标客户'}\n所属行业：${currentCase.industry || '未指定'}\n建议日期：${new Date().toLocaleDateString()}\n\n${sec6Match[1].trim()}`;
    }

    // Standard high-reliability FDE PoC memo template
    return `【FDE 1-2周低风险概念验证 (PoC) 备忘录】
客户单位：${currentCase.companyName || '目标客户'}
方案编制：武汉仓藤科技
建议日期：${new Date().toLocaleDateString()}

一、验证背景与聚焦痛点
本次验证严格聚焦双方初步交流中确认的业务堵点：
👉「${painName}」
核心原则：不改变现有生产与管理机制、不接入生产数据库，仅以小切口验证 AI 辅助解决高频重复劳动与决策提效的可行性。

二、验证目标与交付成果 (周期：1-2 周)
1. 核心目标：评估基于脱敏样本的 AI/自动化助手在信息提取、规则核对与初稿生成上的实际人效与准确率。
2. 预期改善指标：将该环节日常人工耗时压缩 50% 以上，关键识别准确率基线达 85% 以上。
3. FDE 团队交付成果：
   - 1 套可直观交互体验的轻量级功能原型（离线 Demo 或飞书插件测试版）；
   - 1 份《脱敏样本实测效果对比与投资回报 (ROI) 测算评估报告》。

三、客户所需提供材料 (严格数据安全与脱敏原则)
🔒 零安全风险承诺：
- 零系统侵入：无需对接客户内部 ERP/CRM 或核心数据库，无需提供后台账号密码；
- 脱敏样本量极小：仅需提供 10~20 份历史已公开或完全脱敏的单据、文本或 Excel 表格（如历史带货脚本、脱敏派工单）；
- 商业隐私隔离：所有敏感字段（如客户真实姓名、真实报价、财务账户）均在客户本地隐去。

四、成功判定标准 (Pass / Fail 指标)
- ✅ 验收通过标准：样本测试准确率 ≥ 85%，一线业务代表反馈该助手能实质减轻日常机械搬运负担。
- ❌ 零沉没成本退出机制：若验证效果低于此基线，双方立即友好终止该课题，客户不产生任何软件购买或系统改造成本。

五、建议的下一步协同安排
建议本周内安排一次 30 分钟线上简短沟通，双方对齐 10-20 份脱敏样本格式，随即由 FDE 团队进入为期 5 个工作日的离线原型搭建。`;
  };

  const handleCopyPocMemo = () => {
    const text = generatePocMemo();
    navigator.clipboard.writeText(text);
    setCopiedPoc(true);
    setTimeout(() => setCopiedPoc(false), 2500);
  };

  const handleApplyPreset = (preset: typeof FEEDBACK_PRESETS[0]) => {
    setDiscussedPainPoints(preset.discussedPainPoints);
    setClientQuotes(preset.clientQuotes);
    setConfirmedFacts(preset.confirmedFacts);
    setDeniedFacts(preset.deniedFacts);
    setClientData(preset.clientData);
    setOpenQuestions(preset.openQuestions);
    setAdvisorRequests(preset.advisorRequests);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitFeedback({
      date,
      targetRole,
      discussedPainPoints,
      clientQuotes,
      confirmedFacts,
      deniedFacts,
      clientData,
      openQuestions,
      advisorRequests
    });
  };

  const handleStatusChange = (id: string, newStatus: PainPointStatus) => {
    const updated = painPoints.map(p => p.id === id ? { ...p, status: newStatus } : p);
    onUpdatePainPoints(updated);
  };

  const handleDownloadFullDossier = () => {
    const divider = '\n\n---\n\n';
    let full = `# FDE 售前客户诊断全景卷宗｜${currentCase.companyName || '企业'}\n`;
    full += `> 行业：${currentCase.industry || ''} | 诊断日期：${new Date().toLocaleDateString()}\n\n`;
    
    if (currentCase.researchResult) {
      full += `## 第一阶段：Agent 1 行业与企业情报研究\n\n${currentCase.researchResult}${divider}`;
    }
    if (currentCase.combatCardResult) {
      full += `## 第二阶段：Agent 2 客户共鸣与痛点诊断作战卡\n\n${currentCase.combatCardResult}${divider}`;
    }
    if (displayContent) {
      full += `## 第三阶段：客户访谈复盘与动态诊断报告\n\n${displayContent}`;
    }

    const blob = new Blob([full], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FDE_客户诊断全景卷宗_${currentCase.companyName || '企业'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayContent = isStreaming 
    ? streamingContent 
    : (currentCase.dynamicDiagnosisResult || streamingContent);

  return (
    <div className="max-w-7xl mx-auto py-4 px-2 sm:px-4 space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">
              客户现场访谈反馈与动态复盘诊断
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-mono">
              闭环收敛阶段
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            将客户真实回答回传 Agent 2，动态校准痛点真伪（待验证 / 客户陈述 / 证据支持 / 试点验证 / 已否定），收敛聚焦高价值 AI 机会。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowPocModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 rounded-lg shadow-2xs transition-all"
            title="生成可直接发给客户关键决策人的轻量PoC验证备忘录"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>生成 1-2周低风险 PoC 验证备忘录</span>
          </button>
          {onOpenExportPdf && (
            <button
              onClick={onOpenExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg shadow-2xs transition-all border border-rose-200"
              title="导出 A4 矢量 PDF 诊断方案"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              <span>导出诊断报告 (PDF)</span>
            </button>
          )}
          <button
            onClick={handleDownloadFullDossier}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all"
            title="导出涵盖三阶段的完整诊断卷宗"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>导出全阶段诊断卷宗 (.md)</span>
          </button>
        </div>
      </div>

      {/* Pain Point Status Kanban / Tagger */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              痛点证据等级跟踪矩阵（五级标准）
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            客户反馈优先于最初假设 · 客户否定时应果断标记并止损
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {painPoints.map((p) => (
            <div key={p.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">修改验证状态：</span>
                <select
                  value={p.status}
                  onChange={(e) => handleStatusChange(p.id, e.target.value as any)}
                  className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
                >
                  <option value="待验证">待验证</option>
                  <option value="客户陈述">客户陈述</option>
                  <option value="证据支持">证据支持</option>
                  <option value="试点验证">试点验证</option>
                  <option value="已否定">已否定</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Form + Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>录入客户访谈实况</span>
            </h3>

            {/* Quick Fill presets */}
            <div className="relative group">
              <button
                type="button"
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                快速填充预设反馈 ▾
              </button>
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 hidden group-hover:block z-50">
                {FEEDBACK_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="w-full text-left p-2 text-xs hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg transition-colors"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">访谈日期</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">沟通对象岗位</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">本次讨论的痛点名称</label>
              <input
                type="text"
                value={discussedPainPoints}
                onChange={(e) => setDiscussedPainPoints(e.target.value)}
                placeholder="例如：ECN跨部门流转、排产小批量多频插单..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">客户原话或典型回答</label>
              <textarea
                rows={3}
                value={clientQuotes}
                onChange={(e) => setClientQuotes(e.target.value)}
                placeholder="记录客户原话，如：'上个月技术改了螺栓规格，图纸没到采购手上，产线直接干了3天废品...'"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-emerald-800 mb-1">客户已确认的事实</label>
                <textarea
                  rows={2}
                  value={confirmedFacts}
                  onChange={(e) => setConfirmedFacts(e.target.value)}
                  placeholder="客户口头或材料证实的情况..."
                  className="w-full px-2.5 py-1.5 bg-emerald-50/40 border border-emerald-200 rounded-lg text-[11px]"
                />
              </div>

              <div>
                <label className="block font-medium text-rose-800 mb-1">客户明确否定的情况</label>
                <textarea
                  rows={2}
                  value={deniedFacts}
                  onChange={(e) => setDeniedFacts(e.target.value)}
                  placeholder="客户明确说不适用或已有成熟方案的情况..."
                  className="w-full px-2.5 py-1.5 bg-rose-50/40 border border-rose-200 rounded-lg text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">涉及的系统、数据或样本材料</label>
              <input
                type="text"
                value={clientData}
                onChange={(e) => setClientData(e.target.value)}
                placeholder="例如：泛微OA、用友U9 ERP，图纸都在微信群流转..."
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">尚未搞清的问题 / 待核实卡点</label>
              <input
                type="text"
                value={openQuestions}
                onChange={(e) => setOpenQuestions(e.target.value)}
                placeholder="例如：图纸是3D CAD还是二维PDF？库房领料校验卡在谁手里？"
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">顾问希望获得的支持与判断</label>
              <input
                type="text"
                value={advisorRequests}
                onChange={(e) => setAdvisorRequests(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isStreaming}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isStreaming ? 'Agent 2 正在复盘诊断中...' : '提交反馈，由 Agent 2 动态校准诊断'}</span>
            </button>
          </form>
        </div>

        {/* Right Output: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Model Reasoning */}
          {(reasoning || isStreaming) && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 overflow-hidden">
              <button
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Agent 2 复盘逻辑与状态跃迁推导 {isStreaming && '(分析中...)'}</span>
                </div>
                {showReasoning ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showReasoning && (
                <div className="px-4 py-3 border-t border-emerald-100 text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-52 overflow-y-auto bg-white/70 leading-relaxed">
                  {reasoning || '正在核对客户反馈与原痛点假设...'}
                </div>
              )}
            </div>
          )}

          {/* Dynamic Diagnosis Report Box */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 min-h-[500px]">
            {isStreaming && !displayContent ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                <p className="text-sm font-medium text-slate-600">Agent 2 正在比对客户真实反馈...</p>
                <p className="text-xs text-slate-400 mt-1">更新痛点验证状态，剔除伪痛点，收敛聚焦真实 AI 机会</p>
              </div>
            ) : !displayContent ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <MessageSquareQuote className="w-10 h-10 text-slate-300 mb-3" />
                <p className="text-sm font-medium text-slate-600">等待提交客户访谈实况</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                  在左侧填写客户沟通原话、确认或否定的事实，Agent 2 将生成《客户访谈复盘与动态诊断报告》。
                </p>
              </div>
            ) : (
              <MarkdownViewer content={displayContent} />
            )}
          </div>

        </div>

      </div>

      {/* PoC Proposal Modal */}
      {showPocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50/70 to-teal-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    FDE 1-2周低风险概念验证 (PoC) 备忘录
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    针对已确认痛点，以“零系统侵入、样本脱敏、达标才推进”原则直面客户决策人
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPocModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Text Area Preview */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold">FDE 实战心法：</span>
                绝不要在未验证前向客户承诺做“全盘系统替换”。用这份备忘录向客户明确：仅需 10-20 份脱敏样本，1-2 周内验证，达不到预期零沉没成本即刻退出。
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={15}
                  value={generatePocMemo()}
                  className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl leading-relaxed focus:outline-none select-all"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                可直接作为微信消息、飞书文档或邮件正文发送
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPocModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={handleCopyPocMemo}
                  className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl text-white shadow-xs transition-all ${
                    copiedPoc ? 'bg-teal-600' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {copiedPoc ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>已复制到剪贴板！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>一键复制微信/邮件格式</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
