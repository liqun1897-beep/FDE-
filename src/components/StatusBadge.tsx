import React from 'react';
import { PainPointStatus } from '../types';

interface StatusBadgeProps {
  status: PainPointStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  switch (status) {
    case '待验证':
    case '待验证假设':
    case 'L3 待验证假设':
      style = 'bg-amber-50 text-amber-800 border-amber-200';
      dotColor = 'bg-amber-500';
      break;
    case '客观事实':
    case 'L1 客观事实':
    case '公开事实':
      style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      dotColor = 'bg-emerald-500';
      break;
    case '行业共性':
    case 'L2 行业共性':
      style = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      dotColor = 'bg-indigo-500';
      break;
    case '客户陈述':
    case '客户口头确认':
      style = 'bg-blue-50 text-blue-800 border-blue-200';
      dotColor = 'bg-blue-500';
      break;
    case '证据支持':
    case 'L4 证据支持':
      style = 'bg-purple-50 text-purple-800 border-purple-200';
      dotColor = 'bg-purple-500';
      break;
    case '试点验证':
      style = 'bg-teal-50 text-teal-800 border-teal-200';
      dotColor = 'bg-teal-500';
      break;
    case '已否定':
      style = 'bg-rose-50 text-rose-700 border-rose-200 line-through decoration-rose-400';
      dotColor = 'bg-rose-400';
      break;
    default:
      break;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
};
