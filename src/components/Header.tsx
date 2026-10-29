import React from 'react';
import { 
  Building2, 
  Settings, 
  PlusCircle, 
  FolderOpen, 
  Sparkles, 
  Activity, 
  SlidersHorizontal 
} from 'lucide-react';
import { CASE_PRESETS } from '../lib/presets';

interface HeaderProps {
  onNewCase: () => void;
  onSelectPreset: (preset: any) => void;
  onOpenSettings: () => void;
  currentTitle?: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewCase,
  onSelectPreset,
  onOpenSettings,
  currentTitle,
  isSidebarOpen,
  onToggleSidebar
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Branding & Current Case */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
            title="展开/收起案例列表"
          >
            <FolderOpen className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  FDE 售前客户诊断工作流
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200 hidden sm:inline-block">
                  V1.0 双Agent
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md hidden sm:block">
                {currentTitle || '人机协同 · 先理解业务再谈AI · 先验证痛点再出方案'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Model Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-medium text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>glm-5.2 已就绪</span>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>载入样例案例</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 border-b border-slate-100">
                点击快速填充实战案例
              </div>
              {CASE_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => onSelectPreset(preset)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors flex flex-col gap-0.5"
                >
                  <span className="font-medium text-slate-900">{preset.companyName}</span>
                  <span className="text-[11px] text-slate-500">{preset.industry}</span>
                </button>
              ))}
            </div>
          </div>

          {/* New Case Button */}
          <button
            onClick={onNewCase}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-xs transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">新建客户诊断</span>
            <span className="sm:hidden">新建</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            title="模型与系统提示词配置"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
