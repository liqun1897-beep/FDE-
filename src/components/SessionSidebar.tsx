import React, { useState } from 'react';
import { CaseSession } from '../types';
import { Search, Trash2, Clock, CheckCircle2, FileText, ChevronRight, X } from 'lucide-react';

interface SessionSidebarProps {
  cases: CaseSession[];
  activeId?: string;
  onSelectCase: (c: CaseSession) => void;
  onDeleteCase: (id: string, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  cases,
  activeId,
  onSelectCase,
  onDeleteCase,
  isOpen,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = cases.filter(c => 
    (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStepText = (step: number) => {
    switch (step) {
      case 1: return '基础输入';
      case 2: return '情报地图已生成';
      case 3: return '作战卡已制作';
      case 4: return '动态复盘进行中';
      default: return '进行中';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 w-80 bg-white border-r border-slate-200 z-40 transform transition-transform duration-200 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm text-slate-800">客户诊断库 ({cases.length})</span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-slate-600 rounded lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索企业或行业..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              未找到匹配的诊断案例
            </div>
          ) : (
            filtered.map((item) => {
              const isSelected = item.id === activeId;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectCase(item);
                    onClose();
                  }}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                      : 'hover:bg-slate-50/80 border-transparent hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 line-clamp-1">
                      {item.companyName || '未命名企业'}
                    </h4>
                    <button
                      onClick={(e) => onDeleteCase(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity"
                      title="删除案例"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {item.industry || '未指定行业'}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      {getStepText(item.currentStep || 1)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
