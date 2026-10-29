import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { parseFullDocument, ProcessStage, RoleTaskItem } from '../lib/parseDiagnosis';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Users, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle,
  Cpu,
  BarChart3,
  Network,
  Compass,
  Repeat,
  Workflow,
  Clock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface ResearchMapVisualViewProps {
  rawContent: string;
}

export const ResearchMapVisualView: React.FC<ResearchMapVisualViewProps> = ({ rawContent }) => {
  const [selectedRoleTier, setSelectedRoleTier] = useState<string>('all');
  const [activeStageIdx, setActiveStageIdx] = useState<number>(0);

  // Parse document dynamically
  const parsed = parseFullDocument(rawContent);

  // Extract metadata safely from parsed sections
  const sec1 = parsed.sections['sec_1'] || parsed.sections['header'] || { keyValuePairs: {} };
  const sec2 = parsed.sections['sec_2'] || { keyValuePairs: {}, bulletPoints: [] };
  const sec3 = parsed.sections['sec_3'] || { keyValuePairs: {}, bulletPoints: [] };
  const sec4 = parsed.sections['sec_4'] || { keyValuePairs: {}, bulletPoints: [] };
  const sec5 = parsed.sections['sec_5'] || { keyValuePairs: {}, bulletPoints: [] };
  const sec6 = parsed.sections['sec_6'] || { keyValuePairs: {}, bulletPoints: [] };
  const sec7 = parsed.sections['sec_7'] || { keyValuePairs: {}, bulletPoints: [] };

  const companyName = sec1.keyValuePairs['企业名称'] || 
    rawContent.match(/企业名称[：:]\s*([^\n]+)/)?.[1] || 
    rawContent.match(/企业[：:]\s*([^\n]+)/)?.[1] || 
    '目标企业';

  const industry = sec1.keyValuePairs['行业'] || 
    rawContent.match(/行业[：:]\s*([^\n]+)/)?.[1] || 
    '所属行业';

  const subIndustry = sec1.keyValuePairs['细分赛道'] || 
    sec1.keyValuePairs['赛道'] || 
    rawContent.match(/细分赛道[：:]\s*([^\n]+)/)?.[1] || 
    '';

  const region = sec1.keyValuePairs['企业所在地区'] || 
    sec1.keyValuePairs['地区'] || 
    rawContent.match(/企业所在地区[：:]\s*([^\n]+)/)?.[1] || 
    '';

  // One page conclusions
  const summaryChange = sec2.keyValuePairs['行业当前最值得关注的变化'] || 
    sec2.keyValuePairs['行业变化'] || 
    rawContent.match(/行业当前最值得关注的变化[：:]\s*([^\n]+)/)?.[1] || 
    sec2.bulletPoints[0] || 
    '';

  const summaryPosition = sec2.keyValuePairs['企业的业务定位'] || 
    sec2.keyValuePairs['业务定位'] || 
    rawContent.match(/企业的业务定位[：:]\s*([^\n]+)/)?.[1] || 
    sec2.bulletPoints[1] || 
    '';

  const summaryLink = sec2.keyValuePairs['最值得进一步研究的经营环节'] || 
    sec2.keyValuePairs['重点经营环节'] || 
    rawContent.match(/最值得进一步研究的经营环节[：:]\s*([^\n]+)/)?.[1] || 
    sec2.bulletPoints[2] || 
    '';

  // Upstream / Midstream / Downstream
  const upstream = sec4.keyValuePairs['上游'] || 
    rawContent.match(/上游[：:]\s*([^\n]+)/)?.[1] || 
    '原材料采购、技术方案、公域平台流量与供应商';

  const midstream = sec4.keyValuePairs['中游'] || 
    rawContent.match(/中游[：:]\s*([^\n]+)/)?.[1] || 
    '企业核心运营、生产加工、内容制作与交付协同';

  const downstream = sec4.keyValuePairs['下游'] || 
    rawContent.match(/下游[：:]\s*([^\n]+)/)?.[1] || 
    '客户交付、渠道终端、到店核销或主机厂验收';

  const bottlenecks = sec4.keyValuePairs['潜在卡点'] || 
    rawContent.match(/潜在卡点[：:]\s*([^\n]+)/)?.[1] || 
    '';

  // Process Stages: either from parsed table or synthesized from sec4 content
  let stages: ProcessStage[] = parsed.processStages;
  if (stages.length === 0) {
    // Attempt to extract stages from text lines matching "阶段" or numbers
    const stageLines = (sec4.rawContent || '').split('\n').filter(l => l.includes('阶段') || l.includes('流程') || l.match(/^[0-9]\./));
    if (stageLines.length >= 3) {
      stages = stageLines.slice(0, 6).map((l, i) => ({
        step: i + 1,
        name: l.replace(/^[0-9\.\-\*\s]+/, '').trim().slice(0, 30),
        roles: '相关业务岗位',
        actions: l.slice(0, 60),
        inputs: '业务单据/系统',
        outputs: '交付成果',
        bottlenecks: '跨岗位信息交接时滞与人工核对'
      }));
    } else {
      // Default fallback for this industry
      stages = [
        {
          step: 1,
          name: '需求接入与商务立项',
          roles: '商务BD、运营总监',
          actions: '与客户沟通需求、明确交付指标与合同排期',
          inputs: '客户需求单、微信沟通记录',
          outputs: '立项单据、项目排期表',
          bottlenecks: '客户诉求多变，微信群信息分散未沉淀'
        },
        {
          step: 2,
          name: '方案制定与计划排产',
          roles: 'PMC计划员 / 运营组长',
          actions: '拆解物料/内容需求，制定详细作业计划',
          inputs: '立项表、现有产能与库存/人员负荷',
          outputs: '排班表、物料采购清单/拍摄计划',
          bottlenecks: '高度依赖经验Excel手工调整，插单易引发版本冲突'
        },
        {
          step: 3,
          name: '生产加工与内容执行',
          roles: '一线执行员 / 编导剪辑 / 产线员工',
          actions: '按计划组织现场制作与物料生产',
          inputs: '作业规范、图纸/脚本、原料配料',
          outputs: '半成品 / 成品 / 视频母带',
          bottlenecks: '跨系统手动转抄单据，异常缺乏实时上报闭环'
        },
        {
          step: 4,
          name: '质量检验与履约交付',
          roles: '质检员 / 审核专员 / 仓管发货',
          actions: '质量抽检核对，组织打包发货或上线交付',
          inputs: '质检标准、出库单、物流系统',
          outputs: '检验报告、客户验收确认单',
          bottlenecks: '人工核对易漏检，出货批次缺乏单件追溯'
        },
        {
          step: 5,
          name: '复盘核销与账期对账',
          roles: '财务、数据分析员、客服',
          actions: '统计实际交付数据、计算核销率/损耗、开票结算',
          inputs: '多平台后台流水、发货回单、ERP财务账',
          outputs: '经营复盘报表、应收结算单',
          bottlenecks: '多系统数据割裂，人工拉表合并耗费数天'
        }
      ];
    }
  }

  // Role tasks: either from parsed table or dynamic
  let roleTasks: RoleTaskItem[] = parsed.roleTasks;
  if (roleTasks.length === 0) {
    // Generate representative real role cards
    roleTasks = [
      {
        tier: '决策层',
        roleName: '总经理 / 经营负责人',
        coreDuty: '把控全局经营指标、战略方向与重大风险控制',
        repetitiveTasks: '每天翻看各部门微信汇总、审批各类例外申请、手动向财务催要当月毛利与现金流估算表',
        inputsAndTools: '各部门周报、月度Excel经营汇编、微信工作群',
        outputs: '经营决策指令、资源调配批复',
        bottlenecks: '报表严重滞后2-3天，难以在晨会前掌握各项目最新真实利润与交付损耗',
        verifyQuestion: '“您目前每月/每周了解各业务线真实人效与损耗，主要看哪些报表？通常是系统自动形成还是人工整理汇报？”'
      },
      {
        tier: '协同管理层',
        roleName: '生产/运营总监',
        coreDuty: '统筹多项目排产进度、控制交付质量与跨部门协同',
        repetitiveTasks: '每天花费2小时从多个业务系统或群消息中手动汇总进度、人工调解插单冲突、核查物料与人员到位情况',
        inputsAndTools: 'ERP/OA系统、多平台商家后台、微信项目群、Excel进度台账',
        outputs: '每日生产/排产调整计划、跨部门协调工单',
        bottlenecks: '变更信息通过微信群传递，缺乏统一的版本控制；遇到临时插单全靠脑子权衡',
        verifyQuestion: '“当突发插单或规格变动时，团队通常通过什么方式同步到下游各个岗位？如何确保大家都使用最新版本？”'
      },
      {
        tier: '协同管理层',
        roleName: '计划调度员 / PMC',
        coreDuty: '根据订单预测与现有产能排定详细执行计划',
        repetitiveTasks: '每天反复从Excel导表、手动更新工单状态、人工计算换模/换产损耗与交期匹配度',
        inputsAndTools: '订单明细表、物料库存明细、机台/人员负荷表',
        outputs: '车间每日派工单、物料请购建议',
        bottlenecks: '系统间数据孤岛，必须人工反复在ERP、WMS与Excel之间复制粘贴',
        verifyQuestion: '“排产目前主要依赖固化系统还是Excel？如果计划员休假，其他同事接替排产会遇到什么卡点？”'
      },
      {
        tier: '一线执行层',
        roleName: '质检员 / 审核专员',
        coreDuty: '执行物料入库检验、制程巡检与出货抽检',
        repetitiveTasks: '拿着纸质点检表逐项人工核对勾选、手动将抽检数据录入电脑Excel、拍摄缺陷照片在微信群反馈',
        inputsAndTools: '检验规程、纸质点检单、局域网共享文件夹',
        outputs: '纸质点检记录、缺陷统计周报',
        bottlenecks: '人工肉眼巡检易疲劳漏检，历史质量异常数据分散在纸质或照片中，难以快速溯源',
        verifyQuestion: '“质检数据录入系统需要耗费多少人工？一旦发生客户退货或客诉，溯源批次通常需要多长时间？”'
      },
      {
        tier: '一线执行层',
        roleName: '跟单员 / 数据统计专员',
        coreDuty: '跟踪订单执行节点、汇总各渠道流水与客户对账',
        repetitiveTasks: '每天从各个平台后台导出几十个CSV/Excel文件、使用VLOOKUP手动清洗合并、制作每日业绩战报',
        inputsAndTools: '平台商家后台、用友/金蝶ERP、企业微信、各类导出表格',
        outputs: '每日发货对账单、业务核销复盘表',
        bottlenecks: '多平台格式不统一，人工匹配极易错行或重复统计，耗时繁琐且枯燥',
        verifyQuestion: '“每天拉表清洗数据大概要花多少时间？有没有出现过因为公式错误导致数据对不齐的情况？”'
      }
    ];
  }

  // Extract candidate pain points from Section 7
  const sec7Raw = sec7.rawContent || '';
  const parsedCandidatePains = sec7Raw
    .split(/(?:###\s*痛点|###\s*候选痛点|###\s*[0-9]+[\.、])/)
    .filter(b => b.trim().length > 20)
    .map((block) => {
      const firstLine = block.trim().split('\n')[0].replace(/^[#\*\s]+/, '').replace(/^[0-9]+[\.、]\s*/, '').trim();
      const roles = block.match(/(?:涉及岗位|岗位)[：:]\s*([^\n]+)/)?.[1]?.trim() || '业务岗位';
      const stage = block.match(/(?:业务环节|流程环节|对应环节)[：:]\s*([^\n]+)/)?.[1]?.trim() || '业务流转环节';
      const impact = block.match(/(?:潜在影响|业务影响|可能影响)[：:]\s*([^\n]+)/)?.[1]?.trim() || '';
      const evidence = block.match(/(?:证据等级|证据状态|置信度)[：:]\s*([^\n]+)/)?.[1]?.trim() || 'L3 待验证假设';
      const question = block.match(/(?:客户验证问题|验证问题|提问建议)[：:]\s*([^\n]+)/)?.[1]?.trim() || '';
      return { title: firstLine, roles, stage, impact, evidence, question };
    });

  const displayCandidatePainItems = parsedCandidatePains.length > 0 ? parsedCandidatePains : [
    {
      title: '多平台数据手工汇总核对繁琐，报表滞后影响决策',
      roles: '数据专员、运营总监',
      stage: '复盘核销与经营分析阶段',
      impact: '单人每日耗时 2 小时以上清洗数据，易发生口径不一致与错行漏算',
      evidence: 'L2 行业共性',
      question: '“目前每天拉表清洗数据大概要花多少时间？主要依靠自建模板还是系统导出？”'
    },
    {
      title: '跨部门派工与排产变更信息脱节，插单导致人员等待',
      roles: '计划调度员、车间/项目执行组',
      stage: '方案制定与计划排产阶段',
      impact: '高频插单无统一版本协同，导致反复返工与交期延迟',
      evidence: 'L3 待验证假设',
      question: '“排产目前主要依赖固化系统还是Excel？遇到紧急插单时跨部门如何同步变更？”'
    },
    {
      title: '关键质检与交付节点依靠人工抽检，历史异常难溯源',
      roles: '质检员、跟单审核员',
      stage: '质量检验与履约交付阶段',
      impact: '纸质或照片记录分散，一旦发生客户退货或客诉，溯源批次极慢',
      evidence: 'L3 待验证假设',
      question: '“质检数据录入系统需要耗费多少人工？一旦发生客诉，溯源批次通常需要多长时间？”'
    }
  ];

  const filteredTasks = selectedRoleTier === 'all' 
    ? roleTasks 
    : roleTasks.filter(t => t.tier === selectedRoleTier);

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* 1. Executive Summary Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>客户行业情报与岗位痛点地图 (Agent 1)</span>
            </span>

            <div className="text-xs text-slate-300 flex items-center gap-2">
              {region && <span>地区：{region}</span>}
              {subIndustry && <span>· 赛道：{subIndustry}</span>}
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {companyName} · 业务生态与流程地图
          </h2>
          <p className="text-xs text-blue-200/80 max-w-2xl leading-relaxed">
            所属行业：{industry} · 本模块基于行业上下游业务流与企业三层岗位职责，系统化拆解端到端核心业务流程图与各岗位高频高重复任务。
          </p>

          {/* Key Facts Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-blue-300 font-semibold mb-1 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>行业核心变化与压力</span>
              </div>
              <div className="text-slate-200 leading-relaxed text-[11px]">
                {summaryChange || '存量博弈加剧，企业普遍从粗放扩张转向抓人效比与交付毛利。'}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-indigo-300 font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>企业业务模式定位</span>
              </div>
              <div className="text-slate-200 leading-relaxed text-[11px]">
                {summaryPosition || '中游核心交付与运营主体，承担上下游高频订单变更与履约压力。'}
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="text-emerald-300 font-semibold mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>重点经营环节卡点</span>
              </div>
              <div className="text-slate-200 leading-relaxed text-[11px]">
                {summaryLink || '跨系统信息同步时滞、人工导表对账繁琐、排产变更经验依赖。'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Supply Chain Flow */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
            <Network className="w-4 h-4 text-blue-600" />
            <span>产业链上下游业务与信息流转关系</span>
          </div>
          <span className="text-[11px] text-slate-400">信息输入 ➔ 中游加工/服务 ➔ 价值输出</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
                1. 上游供应商 / 资源输入端
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{upstream}</p>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200">
              数据输入：采购合同、物料变更单、客户原始需求
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/50 flex flex-col justify-between relative shadow-2xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  2. 中游运营主体 ({companyName})
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">核心业务场</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{midstream}</p>
            </div>
            <div className="text-[10px] text-indigo-700 font-semibold mt-3 pt-2 border-t border-blue-200">
              内部流转：计划排产 ➔ 工序执行 ➔ 质检验收
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
                3. 下游客户 / 交付渠道端
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{downstream}</p>
            </div>
            <div className="text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200">
              价值实现：出货签收、终端核销、评价与结算
            </div>
          </div>
        </div>

        {bottlenecks && (
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950 leading-relaxed">
              <span className="font-bold">链条潜在协同卡点：</span>
              {bottlenecks}
            </div>
          </div>
        )}
      </div>

      {/* 3. CORE HIGHLIGHT: Interactive End-to-End Business Process Flow Diagram */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              端到端核心业务流转流程图（阶段流转、输入输出与卡点）
            </h3>
          </div>
          <span className="text-xs text-slate-400">点击各阶段查看交付物流转与信息断点</span>
        </div>

        {/* Process Flow Stepper Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stages.map((stg, i) => {
            const isSelected = activeStageIdx === i;
            return (
              <div
                key={i}
                onClick={() => setActiveStageIdx(i)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {stg.step || i + 1}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">阶段 {i + 1}</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {stg.name}
                  </h4>

                  <div className="text-[11px] text-slate-500 line-clamp-1">
                    <b>岗位：</b>{stg.roles || '业务人员'}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className={`font-semibold ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                    查看详情
                  </span>
                  <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Detailed Breakdown Banner */}
        {stages[activeStageIdx] && (
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-amber-400" />
                <span>当前阶段详解：阶段 {activeStageIdx + 1} - {stages[activeStageIdx].name}</span>
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-0.5 rounded text-blue-100">
                责任方：{stages[activeStageIdx].roles}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                <div className="text-blue-200 font-semibold mb-1">📥 输入资料与使用工具</div>
                <div className="text-slate-200 leading-relaxed text-[11px]">{stages[activeStageIdx].inputs || '微信记录、历史表单、线下通知'}</div>
              </div>

              <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                <div className="text-emerald-200 font-semibold mb-1">📤 核心动作与产出交付物</div>
                <div className="text-slate-200 leading-relaxed text-[11px]">{stages[activeStageIdx].actions || stages[activeStageIdx].outputs || '生成生产计划、排期表与流转单据'}</div>
              </div>

              <div className="bg-rose-950/40 p-3 rounded-lg border border-rose-800/40">
                <div className="text-rose-300 font-semibold mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>⚡ 潜在信息断点与手工卡点</span>
                </div>
                <div className="text-rose-100 leading-relaxed text-[11px]">{stages[activeStageIdx].bottlenecks || '多部门交接缺乏单点真相来源，人工转抄易发生版本差错'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. CORE HIGHLIGHT: High-Frequency Repetitive Manual Tasks Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Repeat className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              不同岗位高频重复工作与卡点矩阵清单（最耗时 / 易出错 / 经验依赖）
            </h3>
          </div>

          {/* Tier Filter Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSelectedRoleTier('all')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedRoleTier === 'all' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              全部岗位 ({roleTasks.length})
            </button>
            <button
              onClick={() => setSelectedRoleTier('决策层')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedRoleTier === '决策层' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              经营决策层
            </button>
            <button
              onClick={() => setSelectedRoleTier('协同管理层')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedRoleTier === '协同管理层' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              协同管理层
            </button>
            <button
              onClick={() => setSelectedRoleTier('一线执行层')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedRoleTier === '一线执行层' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              一线执行层
            </button>
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    task.tier === '决策层'
                      ? 'bg-purple-100 text-purple-700'
                      : task.tier === '协同管理层'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {task.tier}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{task.roleName}</h4>
                </div>

                <span className="text-[10px] text-slate-400">
                  {task.coreDuty ? `职责：${task.coreDuty.slice(0, 18)}...` : ''}
                </span>
              </div>

              {/* Repetitive Tasks Box */}
              <div className="p-3 rounded-lg bg-rose-50/50 border border-rose-100">
                <div className="text-[11px] font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>🔥 高耗时重复手工动作：</span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed font-mono">
                  {task.repetitiveTasks}
                </p>
              </div>

              {/* Inputs & Outputs */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 font-semibold">输入数据与工具：</span>
                  <span className="text-slate-700 line-clamp-2">{task.inputsAndTools || 'ERP系统、微信群、各类Excel'}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block mb-0.5 font-semibold">交付产出：</span>
                  <span className="text-slate-700 line-clamp-2">{task.outputs || '日报报表、派工单、核对明细'}</span>
                </div>
              </div>

              {/* Bottleneck Callout */}
              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-[11px] text-amber-950 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">易错返工/等待卡点：</span>
                  <span>{task.bottlenecks}</span>
                </div>
              </div>

              {/* Verification question */}
              {task.verifyQuestion && (
                <div className="text-[11px] text-blue-900 bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-700">求证提问建议：</span>
                  <span className="italic">{task.verifyQuestion}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Candidate Pain Points with 4-Tier Confidence */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              优先候选痛点清单与 FDE 四级置信度评级 (待求证底稿)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>客观事实</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span>行业共性</span>
            <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>待验证假设</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayCandidatePainItems.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white hover:border-amber-300 transition-all shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    #痛点 {idx + 1}
                  </span>
                  <StatusBadge status={item.evidence || '待验证'} size="sm" />
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {item.title}
                </h4>

                <div className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">环节</span>
                  <span className="truncate">{item.stage}</span>
                </div>

                {item.impact && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                    <span className="font-semibold text-slate-800">业务代价：</span>
                    {item.impact}
                  </p>
                )}
              </div>

              {item.question && (
                <div className="text-[11px] text-blue-900 bg-blue-50/70 p-2.5 rounded-lg border border-blue-100/80 leading-relaxed">
                  <div className="font-bold text-blue-800 flex items-center gap-1 mb-0.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>现场求证提问话术：</span>
                  </div>
                  <span className="italic">{item.question}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
