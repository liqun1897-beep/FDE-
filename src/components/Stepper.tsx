import React from 'react';
import { Check, Compass, ShieldAlert, Sparkles, MessageSquareQuote } from 'lucide-react';

interface StepperProps {
  currentStep: 1 | 2 | 3 | 4;
  onSelectStep: (step: 1 | 2 | 3 | 4) => void;
  isStepAvailable: (step: 1 | 2 | 3 | 4) => boolean;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, onSelectStep, isStepAvailable }) => {
  const steps = [
    {
      id: 1,
      title: '客户基础输入',
      subtitle: '行业与目标企业信息',
      icon: Compass,
    },
    {
      id: 2,
      title: 'Agent 1：情报研究',
      subtitle: '行业情报与岗位痛点地图',
      icon: Sparkles,
    },
    {
      id: 3,
      title: 'Agent 2：作战卡制作',
      subtitle: '客户共鸣与痛点诊断作战卡',
      icon: ShieldAlert,
    },
    {
      id: 4,
      title: '访谈反馈与动态复盘',
      subtitle: '多轮追问与AI机会判定',
      icon: MessageSquareQuote,
    },
  ];

  return (
    <div className="w-full bg-white border-b border-slate-200/80 shadow-2xs px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between gap-2 sm:gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPassed = currentStep > step.id;
              const available = isStepAvailable(step.id as any);

              return (
                <li key={step.id} className="relative flex-1">
                  <div
                    onClick={() => available && onSelectStep(step.id as any)}
                    title={!available ? `请先完成前置步骤以解锁第 ${step.id} 步` : `切换至第 ${step.id} 步`}
                    className={`group flex items-center p-2 rounded-lg transition-all ${
                      available ? 'cursor-pointer hover:bg-slate-50' : 'cursor-not-allowed opacity-60'
                    } ${isActive ? 'bg-blue-50/70 border border-blue-200' : ''}`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full border-2 transition-all ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                          : isPassed
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-600'
                          : 'border-slate-300 bg-white text-slate-400'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>

                    <div className="ml-3 hidden md:block text-left">
                      <p
                        className={`text-xs font-semibold uppercase tracking-wider ${
                          isActive
                            ? 'text-blue-700'
                            : isPassed
                            ? 'text-emerald-700'
                            : 'text-slate-500'
                        }`}
                      >
                        第 {step.id} 步
                      </p>
                      <p
                        className={`text-sm font-medium leading-snug ${
                          isActive ? 'text-slate-900 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>

                  {/* Divider line between steps */}
                  {idx < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 right-0 w-4 -mr-2 h-0.5 bg-slate-200 transform -translate-y-1/2 pointer-events-none" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};
