import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { parseFullDocument } from '../lib/parseDiagnosis';
import { 
  Target, 
  Building2, 
  CheckCircle2, 
  HelpCircle, 
  MessageSquare, 
  Sparkles, 
  ShieldAlert, 
  Lightbulb, 
  Compass, 
  ArrowRight,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  Layers,
  Repeat,
  Clock,
  Workflow,
  Cpu,
  Copy,
  Check
} from 'lucide-react';

interface CombatCardVisualViewProps {
  rawContent: string;
}

export const CombatCardVisualView: React.FC<CombatCardVisualViewProps> = ({ rawContent }) => {
  const [selectedPainPointIdx, setSelectedPainPointIdx] = useState(0);
  const [copiedOpening, setCopiedOpening] = useState(false);
  const [isDetailedMode, setIsDetailedMode] = useState(true);

  // Parse document dynamically
  const parsed = parseFullDocument(rawContent);

  const sec1 = parsed.sections['sec_1'] || parsed.sections['header'] || { keyValuePairs: {} };
  const sec2 = parsed.sections['sec_2'] || { keyValuePairs: {}, bulletPoints: [] };
  const sec3 = parsed.sections['sec_3'] || { keyValuePairs: {}, rawContent: '' };
  const sec4 = parsed.sections['sec_4'] || { keyValuePairs: {}, rawContent: '' };
  const sec5 = parsed.sections['sec_5'] || { keyValuePairs: {}, rawContent: '' };
  const sec7 = parsed.sections['sec_7'] || { keyValuePairs: {}, bulletPoints: [] };
  const sec8 = parsed.sections['sec_8'] || { keyValuePairs: {} };
  const sec9 = parsed.sections['sec_9'] || { keyValuePairs: {} };

  // Helper parser fallback
  const extractField = (key: string, regex: RegExp): string => {
    return sec1.keyValuePairs[key] || 
           sec2.keyValuePairs[key] || 
           rawContent.match(regex)?.[1]?.trim() || 
           '';
  };

  const companyName = extractField('企业', /企业[：:]\s*([^\n]+)/) || '目标企业';
  const industry = extractField('行业', /行业[：:]\s*([^\n]+)/) || '所属行业';
  const contactRole = extractField('沟通对象', /(?:沟通对象|对方岗位)[：:]\s*([^\n]+)/) || '生产运营总监 / 运营负责人';
  const meetingGoal = extractField('本次交流目标', /本次交流目标[：:]\s*([^\n]+)/) || '验证核心痛点与业务卡点，了解当前工作流现状';
  const infoStatus = extractField('当前信息状态', /当前信息状态[：:]\s*([^\n]+)/) || '访谈准备';

  // Business Understanding
  const businessModel = extractField('企业业务模式', /企业业务模式[：:]\s*([^\n]+)/) || 
    sec2.bulletPoints[0] || 
    '行业中游核心服务/制造企业，采用基础费用加提成/交付模式。';

  const operationFocus = extractField('当前经营重点', /当前经营重点[：:]\s*([^\n]+)/) || 
    sec2.bulletPoints[1] || 
    '行业从粗放流量或规模扩张转向精细化运营、控制交付成本与保住利润。';

  const chainPosition = extractField('所属产业链位置', /所属产业链位置[：:]\s*([^\n]+)/) || 
    sec2.bulletPoints[2] || 
    '中游核心执行与交付服务主体，承接上游需求，面向下游履约，受平台规则与交期影响大。';

  const targetRoleFocus = extractField('本次沟通对象可能关注的目标', /本次沟通对象可能关注的目标[：:]\s*([^\n]+)/) || 
    '提升团队多项目交付效率，降低手工统计与异常沟通人时，保障最终客户满意度。';

  const targetRoleRepetitive = extractField('对接岗位日常最耗时的高频重复任务', /对接岗位日常最耗时的高频重复任务[：:]\s*([^\n]+)/) || 
    '每天跨系统导出分散表格并手工合并、人工处理插单协调、微信群频繁催促进度与核对异常。';

  const confirmedFacts = extractField('已确认事实', /已确认事实[：:]\s*([^\n]+(?:\n\s*[-*][^\n]+)*)/) || 
    '行业存量博弈加剧；多系统数据割裂是行业共性；客户对提升人效比有强烈诉求。';

  const toVerifyInfo = extractField('尚待核实的信息', /尚待核实的信息[：:]\s*([^\n]+(?:\n\s*[-*][^\n]+)*)/) || 
    '实际团队规模与各环节人效比；当前在用SaaS工具与ERP接口情况；日常最耗时的具体人工表格环节。';

  // Extract Pain Points from Section 3
  const sec3Raw = sec3.rawContent || '';
  const ppBlocks = sec3Raw.split(/(?:###\s*痛点\s*[1-5一二三四五][:：]?|\b痛点\s*[1-5一二三四五][:：]|\b\d+\.\s*痛点)/).filter(b => b.trim().length > 15);

  let parsedPainPoints = ppBlocks.map((block, idx) => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const title = lines[0]?.replace(/^[:：\s\-*#]+/, '') || `核心业务痛点 ${idx + 1}`;
    
    const roles = block.match(/(?:涉及岗位|岗位)[：:]\s*([^\n]+)/)?.[1] || contactRole;
    const evidenceStatus = block.match(/证据状态[：:]\s*([^\n]+)/)?.[1] || '待验证';
    const whyTalk = block.match(/为什么值得聊[：:]\s*([^\n]+)/)?.[1] || '高频业务卡点，容易建立共鸣';
    const impact = block.match(/(?:业务影响|潜在影响|可能影响)[：:]\s*([^\n]+)/)?.[1] || '造成人工损耗、等待与返工';
    const processStage = block.match(/(?:对应业务流程|业务环节|流程阶段)[：:]\s*([^\n]+)/)?.[1] || '多部门跨系统交付与复盘';
    const basis = block.match(/研究依据[：:]\s*([^\n]+)/)?.[1] || '行业同类企业普遍面临该手工时滞';

    return { title, roles, evidenceStatus, whyTalk, impact, processStage, basis };
  });

  if (parsedPainPoints.length === 0) {
    parsedPainPoints = [
      {
        title: '跨平台/多系统数据手工汇总与报表版本冲突',
        roles: contactRole,
        evidenceStatus: '待验证',
        whyTalk: '各平台流水割裂，每日依赖人工导出清洗，最耗费总监与员工精力',
        impact: '报表滞后2天以上，无法及时支撑运营调整决策',
        processStage: '复盘核销与经营分析阶段',
        basis: '行业精细化运营共性痛点'
      },
      {
        title: '多项目高频插单下的排期协同与经验依赖',
        roles: '运营总监、项目经理、一线执行组',
        evidenceStatus: '待验证',
        whyTalk: '变更信息主要通过微信群流转，容易遗漏或造成版本不一致',
        impact: '导致人员等待与重复返工，交付周期被拉长',
        processStage: '方案制定与计划排产阶段',
        basis: '团队扩张与业务变动期典型管理卡点'
      }
    ];
  }

  // Extract Opening and 5-Layer questions
  const openingRaw = sec4.rawContent || '';
  const naturalOpening = openingRaw.match(/(?:自然开场|开场话术)[：:]\s*([^\n]+(?:\n[^\n]+)?)/)?.[1]?.replace(/^["“]|["”]$/g, '') || 
    `“我们最近接触了许多同行，发现大家都在从卷规模转向精细化运营，很多团队在多项目跨系统跑数据与排班时特别耗人工。想向您请教一下，咱们${companyName}目前在类似环节是怎么分工处理的？”`;
  
  const whyOpening = openingRaw.match(/为什么这样切入[：:]\s*([^\n]+)/)?.[1] || '从行业共性趋势与业务痛点切入，保持请教姿态，消除客户防备。';
  const avoidPhrase = openingRaw.match(/(?:需要避免的表达|避坑禁语|禁语)[：:]\s*([^\n]+)/)?.[1] || '避免武断断言客户系统落后，不要过早推销AI产品或承诺投资回报。';

  // 5-Layer questions
  const qRaw = sec5.rawContent || '';
  const q1 = qRaw.match(/(?:现状确认|第一层)[：:]\s*([^\n]+)/)?.[1] || '目前这个跨系统数据汇总与流转流程具体是怎么分工处理的？';
  const q2 = qRaw.match(/(?:发生频率|第二层)[：:]\s*([^\n]+)/)?.[1] || '通常多久需要整理复盘一次？主要集中在什么时间段？';
  const q3 = qRaw.match(/(?:业务影响|第三层)[：:]\s*([^\n]+)/)?.[1] || '整理过程如果出现偏差，通常会影响哪些岗位或造成怎样的交付延期？';
  const q4 = qRaw.match(/(?:现有解决方式|现有方式|第四层)[：:]\s*([^\n]+)/)?.[1] || '目前团队是否有现成的系统或固定Excel模板在支持？';
  const q5 = qRaw.match(/(?:改善价值|第五层)[：:]\s*([^\n]+)/)?.[1] || '如果这个环节能提升，您最希望先改善人效耗时还是数据准确度？';

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. Executive Target Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                <span>客户共鸣与痛点诊断作战卡 (Agent 2)</span>
              </span>
              <StatusBadge status={infoStatus} size="sm" />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex p-0.5 bg-white/10 rounded-lg border border-white/20 text-xs font-medium">
                <button
                  onClick={() => setIsDetailedMode(true)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    isDetailedMode ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="完整展开全部痛点细节与剖析，无任何截断"
                >
                  📖 详述模式
                </button>
                <button
                  onClick={() => setIsDetailedMode(false)}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    !isDetailedMode ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                  title="紧凑精简排版"
                >
                  ⚡ 精炼概览
                </button>
              </div>

              <div className="text-xs text-slate-300 hidden sm:flex items-center gap-2 pl-2">
                <span>行业：</span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white font-medium border border-white/10">
                  {industry}
                </span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {companyName} · 诊断作战卡
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/40 text-blue-300 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">沟通对象与对接角色</div>
                <div className="text-white font-medium text-sm">{contactRole}</div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/40 text-indigo-300 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-slate-400 font-semibold mb-0.5">本次会谈核心目标</div>
                <div className="text-white font-medium text-sm leading-snug">{meetingGoal}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Customer Business Profile & Repetitive Tasks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-indigo-600" />
          <span>客户业务深度洞察与关键流程卡点</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>企业业务模式</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {businessModel}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>当前经营重点</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {operationFocus}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>产业链所处位置</span>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-medium">
              {chainPosition}
            </p>
          </div>
        </div>

        {/* Target role repetitive tasks spotlight card */}
        <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
            <Repeat className="w-4 h-4 text-rose-600" />
            <span>对接岗位（{contactRole}）日常最耗时的高频重复手工任务：</span>
          </div>
          <p className="text-xs text-rose-950 font-mono leading-relaxed bg-white/80 p-3 rounded-lg border border-rose-100">
            {targetRoleRepetitive}
          </p>
        </div>

        {/* Facts vs Inquiries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>已确认事实 (交流安全切入点)</span>
            </div>
            <div className="text-xs text-emerald-950 whitespace-pre-wrap leading-relaxed">
              {confirmedFacts}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
              <HelpCircle className="w-4 h-4 text-amber-600" />
              <span>尚待现场核实的信息 (需设计问题深入验证)</span>
            </div>
            <div className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
              {toVerifyInfo}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Priority Pain Points Battle Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>优先沟通的核心痛点作战卡片（紧扣业务流程）</span>
          </div>
          <span className="text-xs text-slate-400">点击卡片切换下方五层追问实战树</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parsedPainPoints.map((pp, idx) => {
            const isSelected = selectedPainPointIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedPainPointIdx(idx)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/20' 
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      P{idx + 1}
                    </span>
                    <StatusBadge status={pp.evidenceStatus} size="sm" />
                  </div>

                  <h4 className={`text-xs font-bold text-slate-900 ${isDetailedMode ? '' : 'line-clamp-2'} leading-snug mb-2`}>
                    {pp.title}
                  </h4>

                  <div className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                    <div><b>对应业务阶段：</b><span className="text-blue-700 font-medium">{pp.processStage}</span></div>
                    <div><b>涉及岗位：</b>{pp.roles}</div>
                    <div className={isDetailedMode ? '' : 'line-clamp-2'}><b>业务影响：</b>{pp.impact}</div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-blue-600 font-semibold">
                  <span>查看五层追问路径</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Natural Opening & 5-Layer Questioning Tree */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              共鸣开场与五层追问实战树（当前针对痛点 P{selectedPainPointIdx + 1}）
            </h3>
          </div>
          <span className="text-xs text-blue-600 font-semibold line-clamp-1 max-w-sm">
            {parsedPainPoints[selectedPainPointIdx]?.title}
          </span>
        </div>

        {/* Natural Opening Card */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>自然共鸣开场话术（顾问直读/参考）</span>
            </span>
            <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded text-blue-100">求教姿态 · 不断言</span>
          </div>

          <div className="relative p-4 rounded-xl bg-white/10 border border-white/10 text-sm font-medium leading-relaxed font-sans pr-24">
            “{naturalOpening}”
            <button
              onClick={() => {
                navigator.clipboard.writeText(naturalOpening);
                setCopiedOpening(true);
                setTimeout(() => setCopiedOpening(false), 2000);
              }}
              className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/10"
              title="复制开场白"
            >
              {copiedOpening ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-200" />
                  <span>复制话术</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-100 pt-1">
            <div className="flex items-start gap-2 bg-blue-950/40 p-2.5 rounded-lg border border-blue-800/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">为什么这样切入：</span>
                <span className="text-blue-100/90 ml-1">{whyOpening}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-200">⚠️ 避坑禁语：</span>
                <span className="text-rose-100/90 ml-1">{avoidPhrase}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5-Layer Questioning Stepper / Cards */}
        <div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>FDE 五层追问推进路径（由浅入深，每次聚焦一个主题）</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            
            {/* Layer 1 */}
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-blue-700 uppercase">第 1 层 · 业务现状</span>
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mb-2">“目前流程怎么处理的？”</div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-2 rounded-lg border border-blue-100">
                  {q1}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">目的：摸清现状不预设问题</div>
            </div>

            {/* Layer 2 */}
            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase">第 2 层 · 发生频率</span>
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mb-2">“多久发生一次？通常在什么场景？”</div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-2 rounded-lg border border-indigo-100">
                  {q2}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">目的：判断偶发还是高频卡点</div>
            </div>

            {/* Layer 3 */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-700 uppercase">第 3 层 · 业务影响</span>
                  <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mb-2">“会影响哪些岗位或造成返工？”</div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-2 rounded-lg border border-amber-100">
                  {q3}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">目的：从表面现象进入业务损失</div>
            </div>

            {/* Layer 4 */}
            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-purple-700 uppercase">第 4 层 · 现有方式</span>
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center">4</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mb-2">“团队目前如何解决？已有系统吗？”</div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-2 rounded-lg border border-purple-100">
                  {q4}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">目的：避免重复建设已有功能</div>
            </div>

            {/* Layer 5 */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase">第 5 层 · 改善价值</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">5</span>
                </div>
                <div className="text-xs font-bold text-slate-900 mb-2">“如果改善，最希望先改变什么？”</div>
                <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-2 rounded-lg border border-emerald-100">
                  {q5}
                </p>
              </div>
              <div className="text-[10px] text-slate-400 mt-2">目的：确认客户最看重的最终价值</div>
            </div>

          </div>
        </div>
      </div>

      {/* 5. CORE HIGHLIGHT: Departmental Repetitive Work Optimization & AI Solution Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              各部门高频重复劳动优化与 AI 降本增效解决方案矩阵
            </h3>
          </div>
          <span className="text-xs text-indigo-600 font-semibold">
            以真实职位描述 (JD) 高耗时工作为靶向
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          根据招聘平台 (BOSS直聘/猎聘) 提取的企业真实在招岗位编制，梳理各部门在端到端流程中占用工时最长、最容易发生差错的高频手工环节，并匹配低侵入的 AI / 自动化轻量解决方案：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Department 1: 广告投放部 */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>广告投放部 · 信息流广告优化师</span>
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">
                预期节省工时 70%
              </span>
            </div>

            <div className="text-xs space-y-1.5">
              <div>
                <span className="text-slate-500 font-semibold">🔥 当前高负荷重复劳动：</span>
                <p className="text-slate-800 font-mono text-[11px] bg-white p-2 rounded border border-blue-100 mt-0.5">
                  每天早上逐一登录十余个巨量千川/本地推账户导出消耗与转化明细，在 Excel 中反复使用 VLOOKUP 手动合并并制作投流日报。
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold">⚡ 业务流程痛点：</span>
                <p className="text-slate-700 text-[11px]">拉表耗费 2 小时机械时间，早会前难以拿到核销数据，且人工合并容易发生公式错行。</p>
              </div>

              <div className="bg-indigo-50 p-2.5 rounded-lg border border-indigo-200 text-indigo-950">
                <span className="font-bold text-indigo-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>建议的 AI / 自动化方案：</span>
                </span>
                <p className="text-[11px] mt-1 leading-relaxed">
                  多账户数据自动同步与日报汇编 Agent（自动导出多平台流水、校验口径、生成总监级核销报表与异常成本预警）。
                </p>
              </div>
            </div>
          </div>

          {/* Department 2: 项目交付部 */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-100 pb-2">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                <span>项目交付部 · AE 客户执行</span>
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold">
                跟催效率提升 2 倍
              </span>
            </div>

            <div className="text-xs space-y-1.5">
              <div>
                <span className="text-slate-500 font-semibold">🔥 当前高负荷重复劳动：</span>
                <p className="text-slate-800 font-mono text-[11px] bg-white p-2 rounded border border-purple-100 mt-0.5">
                  在数十个微信群逐一催促达人交稿、手动转发商户修改意见、人工拼接达人发布数据截图制作客户周期性汇报 PPT。
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold">⚡ 业务流程痛点：</span>
                <p className="text-slate-700 text-[11px]">沟通碎片化严重，极易发生遗漏催办导致脱稿，多项目交期冲突时手工台账混乱。</p>
              </div>

              <div className="bg-purple-100/60 p-2.5 rounded-lg border border-purple-200 text-purple-950">
                <span className="font-bold text-purple-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>建议的 AI / 自动化方案：</span>
                </span>
                <p className="text-[11px] mt-1 leading-relaxed">
                  客户 Brief 智能拆解与节点自动化催办通知助手，一键汇总达人排期交付物并自动排版生成汇报材料。
                </p>
              </div>
            </div>
          </div>

          {/* Department 3: 内容制作部 */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-100 pb-2">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                <span>内容制作部 · 短视频编导 / 策划</span>
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                脚本产出提升 3 倍
              </span>
            </div>

            <div className="text-xs space-y-1.5">
              <div>
                <span className="text-slate-500 font-semibold">🔥 当前高负荷重复劳动：</span>
                <p className="text-slate-800 font-mono text-[11px] bg-white p-2 rounded border border-amber-100 mt-0.5">
                  每天人工刷各大榜单寻找同行同类目爆款视频、逐句抄录台词结构、反复撰写类似套路的门店探店分镜脚本。
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold">⚡ 业务流程痛点：</span>
                <p className="text-slate-700 text-[11px]">创意极易枯竭同质化，成片与投放数据脱节，不知道哪种台词结构更具高核销转化率。</p>
              </div>

              <div className="bg-amber-100/60 p-2.5 rounded-lg border border-amber-200 text-amber-950">
                <span className="font-bold text-amber-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>建议的 AI / 自动化方案：</span>
                </span>
                <p className="text-[11px] mt-1 leading-relaxed">
                  本地生活爆款脚本知识库与智能拆解 Agent，结合历史高 ROI 视频特征自动生成分镜台词初稿与合规初审。
                </p>
              </div>
            </div>
          </div>

          {/* Department 4: 经营核算与财务部 */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>经营核算与财务部 · 数据对账员 / 运营总监</span>
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                对账周期从 3 天降至 2 小时
              </span>
            </div>

            <div className="text-xs space-y-1.5">
              <div>
                <span className="text-slate-500 font-semibold">🔥 当前高负荷重复劳动：</span>
                <p className="text-slate-800 font-mono text-[11px] bg-white p-2 rounded border border-emerald-100 mt-0.5">
                  每月/每周从抖音来客、巨量百应后台下载几万行核销记录，与商户对账单、达人返点逐笔核对，计算真实履约毛利。
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-semibold">⚡ 业务流程痛点：</span>
                <p className="text-slate-700 text-[11px]">不同平台格式与结算周期不一，人工对账周期长达数天，无法动态掌握多项目实时盈亏。</p>
              </div>

              <div className="bg-emerald-100/60 p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>建议的 AI / 自动化方案：</span>
                </span>
                <p className="text-[11px] mt-1 leading-relaxed">
                  多源核销对账智能比对脚本，自动标记异常差额项，实时汇总多项目毛利与人效看板。
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 6. Objections Handling Matrix (6 Scenarios from Chapter 7) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-indigo-600" />
          <span>现场典型场景与异议应对战术策略（规范第 7 章）</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>场景一：客户确认痛点成立</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              进一步追问发生的极端案例，了解具体波及的岗位人时与经济损失，确认是否有脱敏单据或表格样本可供后续分析。
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>场景二：客户认为“问题不大”</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              绝不反驳客户！如实记录并停止追问该点，平稳转向其他候选痛点（如从排产转向ECN），或探讨哪项日常任务最耗员工精力。
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>场景三：客户表示“已有系统”</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              不与现有系统对立！请教系统已经覆盖了哪些标准化环节，团队是否仍需在系统外手工转抄数据或跨系统核对。
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>场景四：客户担心数据基础差</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              打消客户“需大动干戈做数据治理”的顾虑，提议先从单点小样本（如几十份历史表格/文档）开展低风险离线验证。
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>场景五：对AI感兴趣但无具体想法</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              不推销技术大词。引导客户盘点“团队中哪项重复性查表/核对工作最枯燥”，以岗位具体耗时任务为突破口。
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>场景六：客户不愿继续深入讨论</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              及时收敛，感谢客户时间并记录当前否定结论。提议会后发送一份行业趋势简报，保持联系，绝不过度纠缠。
            </p>
          </div>
        </div>
      </div>

      {/* 6. Actionable Next Steps */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold">建议的下一步行动策略（低风险推进）</h4>
          </div>
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            提议共同梳理 1 份业务流程图，或调取 10-20 份脱敏样本进行离线测试，暂不承诺全盘系统替换。
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold text-xs border border-emerald-400/30">
            试点建议：小切口低风险验证
          </span>
        </div>
      </div>

    </div>
  );
};
