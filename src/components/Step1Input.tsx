import React, { useState } from 'react';
import { CaseSession } from '../types';
import { CASE_PRESETS } from '../lib/presets';
import { fetchRecruitmentData } from '../lib/api';
import { 
  Sparkles, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Lightbulb,
  Search,
  Users,
  CheckCircle2,
  Workflow,
  Clock,
  Briefcase
} from 'lucide-react';

interface Step1InputProps {
  currentCase: Partial<CaseSession>;
  onChange: (fields: Partial<CaseSession>) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const Step1Input: React.FC<Step1InputProps> = ({
  currentCase,
  onChange,
  onSubmit,
  isLoading
}) => {
  const [showAdvanced, setShowAdvanced] = useState(
    !!(currentCase.website || currentCase.region || currentCase.coreBusiness || currentCase.contactRole || currentCase.backgroundNotes)
  );
  const [recruitmentLoading, setRecruitmentLoading] = useState(false);
  const [recruitmentData, setRecruitmentData] = useState<any>(null);

  const isSubmitDisabled = !currentCase.industry?.trim() || !currentCase.companyName?.trim() || isLoading;

  const handleFetchRecruitment = async () => {
    if (!currentCase.companyName && !currentCase.industry) {
      alert('请先输入行业或企业名称');
      return;
    }
    setRecruitmentLoading(true);
    try {
      const data = await fetchRecruitmentData(currentCase.companyName || '', currentCase.industry || '');
      setRecruitmentData(data);
      // Automatically enrich backgroundNotes if empty
      if (!currentCase.backgroundNotes) {
        const rolesList = data.roles.map((r: any) => `${r.title}(${r.department})`).join('、');
        onChange({
          backgroundNotes: `【招聘网站在招岗位】：${rolesList}。\n【常用工具系统】：${data.roles[0]?.toolsAndSystems?.join('、') || '行业SaaS'}。`
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRecruitmentLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>FDE 售前顾问第一步：输入核心主体与真实岗位锚点</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            行业与目标企业基础信息
          </h2>
          <p className="mt-2 text-sm text-blue-100/80 leading-relaxed max-w-2xl">
            输入<b>行业</b>与<b>企业名称</b>，系统将结合<b>招聘平台 (BOSS直聘/猎聘) 真实职位描述 (JD)</b>，精准定位企业真实在招岗位、常用工具栈、跨部门流转断点与日常高负荷重复劳动。
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-blue-200">
            <span className="font-semibold text-white">快速导入示例：</span>
            {CASE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChange(p);
                  setRecruitmentData(null);
                }}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              >
                {p.companyName?.slice(0, 10)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Core required fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              目标行业与细分赛道 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentCase.industry || ''}
              onChange={(e) => onChange({ industry: e.target.value })}
              placeholder="例如：本地生活服务 / 抖音MCN代运营 / 汽车零部件制造"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              目标企业完整名称 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={currentCase.companyName || ''}
              onChange={(e) => onChange({ companyName: e.target.value })}
              placeholder="例如：武汉仓藤传媒有限公司"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Recruitment Data Grounding Bar */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-900">招聘网站真实岗位 (JD) 与工作量洞察</span>
                <p className="text-[11px] text-slate-500">从招聘需求挖掘真实岗位编制、高频手工作业与工具系统</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFetchRecruitment}
              disabled={recruitmentLoading || (!currentCase.companyName && !currentCase.industry)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors shrink-0 disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{recruitmentLoading ? '正在分析在招岗位...' : '检索/载入招聘平台岗位数据'}</span>
            </button>
          </div>

          {/* Recruitment Data Preview */}
          {recruitmentData && (
            <div className="pt-2 border-t border-blue-200/60 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-[11px] text-blue-900">
                <span className="font-semibold">来源：{recruitmentData.source}</span>
                <span className="text-emerald-700 font-bold">已捕获 {recruitmentData.roles?.length || 0} 个核心在招岗位</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recruitmentData.roles?.map((r: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-white border border-blue-100 text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{r.title}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono">{r.department}</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <b>常用工具：</b>{r.toolsAndSystems?.join('、')}
                    </div>
                    <div className="text-[11px] text-rose-700 line-clamp-1">
                      <b>🔥高频重复：</b>{r.highFrequencyRepetitiveTasks?.[0] || '日常数据汇编'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Accordion for optional fields */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1"
          >
            <span>{showAdvanced ? '收起补充背景选项' : '展开补充背景选项（企业官网、联系人岗位、前期背景等）'}</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 pt-2 border-t border-slate-100 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    企业官网或公开资料链接（选填）
                  </label>
                  <input
                    type="url"
                    value={currentCase.website || ''}
                    onChange={(e) => onChange({ website: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    企业所在地区 / 业务辐射（选填）
                  </label>
                  <input
                    type="text"
                    value={currentCase.region || ''}
                    onChange={(e) => onChange({ region: e.target.value })}
                    placeholder="例如：湖北武汉 / 全国"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    已知主营业务或拳头产品（选填）
                  </label>
                  <input
                    type="text"
                    value={currentCase.coreBusiness || ''}
                    onChange={(e) => onChange({ coreBusiness: e.target.value })}
                    placeholder="例如：抖音本地推代运营、餐饮文旅到店引流"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    客户首轮对接人岗位角色（选填）
                  </label>
                  <input
                    type="text"
                    value={currentCase.contactRole || ''}
                    onChange={(e) => onChange({ contactRole: e.target.value })}
                    placeholder="例如：生产运营总监 / 运营副总"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  顾问已掌握的背景笔记 / 前期调研线索（选填）
                </label>
                <textarea
                  rows={3}
                  value={currentCase.backgroundNotes || ''}
                  onChange={(e) => onChange({ backgroundNotes: e.target.value })}
                  placeholder="记录顾问在前期接触、招聘平台、客户交流中掌握的特定卡点，例如：跨平台数据统计手工拉表耗时、插单协同频繁等..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* FDE Principles Callout */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">FDE 真实性法则：</span>
            招聘职位描述（JD）是企业真实岗位分工与日常痛点的“一面镜子”。Agent 将以招聘数据作为事实底稿，精准还原跨部门协作链路，拒绝通用泛化套话。
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-md transition-all ${
              isSubmitDisabled
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25 hover:shadow-lg'
            }`}
          >
            <span>{isLoading ? '正在基于真实招聘与岗位数据进行深度研究...' : '启动 Agent 1：情报与痛点地图研究'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
