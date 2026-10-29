import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { CaseSession, InterviewFeedback } from './types';
import { 
  fetchCases, 
  saveCase, 
  removeCase, 
  streamRequest 
} from './lib/api';
import { CASE_PRESETS } from './lib/presets';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { SessionSidebar } from './components/SessionSidebar';
import { SettingsModal } from './components/SettingsModal';
import { Step1Input } from './components/Step1Input';
import { Step2Research } from './components/Step2Research';
import { Step3CombatCard } from './components/Step3CombatCard';
import { Step4InterviewFeedback } from './components/Step4InterviewFeedback';
import { ReportPdfModal } from './components/ReportPdfModal';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 shadow-sm max-w-xl mx-auto my-12 space-y-4">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">视图解析遇到异常</h3>
          <p className="text-xs text-slate-500 font-mono bg-slate-50 p-3 rounded-lg border border-slate-200 text-left">
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
          >
            刷新并重载页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const DEFAULT_BLANK_CASE: CaseSession = {
  id: 'case_' + Date.now(),
  title: '新客户诊断',
  industry: '',
  companyName: '',
  currentStep: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export default function App() {
  const [cases, setCases] = useState<CaseSession[]>([]);
  const [currentCase, setCurrentCase] = useState<CaseSession>(DEFAULT_BLANK_CASE);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [reasoning, setReasoning] = useState('');

  // Initial load
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await fetchCases();
      setCases(data);
      if (data.length > 0) {
        setCurrentCase(data[0]);
        setCurrentStep((data[0].currentStep as any) || 1);
      }
    } catch (err) {
      console.error('加载案例失败:', err);
    }
  };

  const handleNewCase = () => {
    const fresh: CaseSession = {
      id: 'case_' + Date.now(),
      title: '新客户诊断',
      industry: '',
      companyName: '',
      currentStep: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentCase(fresh);
    setCurrentStep(1);
    setStreamingContent('');
    setReasoning('');
  };

  const handleSelectCase = (c: CaseSession) => {
    setCurrentCase(c);
    setCurrentStep((c.currentStep as any) || 1);
    setStreamingContent('');
    setReasoning('');
  };

  const handleDeleteCase = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定删除该诊断案例吗？')) return;
    try {
      await removeCase(id);
      const remaining = cases.filter(c => c.id !== id);
      setCases(remaining);
      if (currentCase?.id === id) {
        if (remaining.length > 0) {
          handleSelectCase(remaining[0]);
        } else {
          handleNewCase();
        }
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSelectPreset = (preset: Partial<CaseSession>) => {
    const updated: CaseSession = {
      ...currentCase,
      ...preset,
      id: currentCase?.id || ('case_' + Date.now()),
      title: preset.title || `${preset.companyName} 诊断`,
      currentStep: 1,
      createdAt: currentCase?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as CaseSession;

    setCurrentCase(updated);
    setCurrentStep(1);
    setStreamingContent('');
    setReasoning('');
  };

  const updateCurrentCase = (fields: Partial<CaseSession>) => {
    if (!currentCase) return;
    const updated = { ...currentCase, ...fields, updatedAt: new Date().toISOString() };
    setCurrentCase(updated);
  };

  const persistCurrentCase = async (extraFields: Partial<CaseSession> = {}) => {
    if (!currentCase) return null;
    const toSave = { ...currentCase, ...extraFields, updatedAt: new Date().toISOString() };
    try {
      const saved = await saveCase(toSave);
      setCurrentCase(saved);
      setCases(prev => {
        const idx = prev.findIndex(c => c.id === saved.id);
        if (idx >= 0) {
          const cp = [...prev];
          cp[idx] = saved;
          return cp;
        }
        return [saved, ...prev];
      });
      return saved;
    } catch (err) {
      console.error('保存失败:', err);
      return null;
    }
  };

  // STEP 1 -> STEP 2 (Agent 1 Research)
  const handleStep1Submit = async () => {
    if (!currentCase?.industry || !currentCase?.companyName) return;

    await persistCurrentCase({
      title: `${currentCase.companyName} 售前诊断`,
      currentStep: 2
    });
    setCurrentStep(2);
    setStreamingContent('');
    setReasoning('');
    setIsStreaming(true);

    let accumulatedContent = '';

    await streamRequest(
      '/api/generate/research',
      {
        caseId: currentCase.id,
        industry: currentCase.industry,
        companyName: currentCase.companyName,
        website: currentCase.website,
        region: currentCase.region,
        coreBusiness: currentCase.coreBusiness,
        contactRole: currentCase.contactRole,
        backgroundNotes: currentCase.backgroundNotes
      },
      {
        onReasoning: (delta) => setReasoning(prev => prev + delta),
        onContent: (delta) => {
          accumulatedContent += delta;
          setStreamingContent(prev => prev + delta);
        },
        onDone: (full) => {
          setIsStreaming(false);
          updateCurrentCase({ researchResult: full || accumulatedContent });
          loadCases();
        },
        onError: (err) => {
          setIsStreaming(false);
          alert('Agent 1 生成异常: ' + err);
        }
      }
    );
  };

  // STEP 2 -> STEP 3 (Trigger Agent 2 Combat Card)
  const handleStep2Proceed = () => {
    setCurrentStep(3);
    if (!currentCase?.combatCardResult) {
      handleStep3Generate({
        contactRole: currentCase?.contactRole || '生产运营总监',
        meetingGoal: currentCase?.meetingGoal || '验证核心痛点与业务卡点',
        backgroundNotes: currentCase?.backgroundNotes || ''
      });
    }
  };

  // STEP 3 Generate Combat Card
  const handleStep3Generate = async (ctx: { contactRole: string; meetingGoal: string; backgroundNotes: string }) => {
    if (!currentCase?.researchResult && !streamingContent) {
      alert('请先完成 Agent 1 的行业情报研究');
      return;
    }

    const researchDoc = currentCase?.researchResult || streamingContent;

    await persistCurrentCase({
      contactRole: ctx.contactRole,
      meetingGoal: ctx.meetingGoal,
      backgroundNotes: ctx.backgroundNotes,
      currentStep: 3
    });

    setStreamingContent('');
    setReasoning('');
    setIsStreaming(true);

    let accumulatedContent = '';

    await streamRequest(
      '/api/generate/combat-card',
      {
        caseId: currentCase?.id,
        researchResult: researchDoc,
        contactRole: ctx.contactRole,
        meetingGoal: ctx.meetingGoal,
        backgroundNotes: ctx.backgroundNotes
      },
      {
        onReasoning: (delta) => setReasoning(prev => prev + delta),
        onContent: (delta) => {
          accumulatedContent += delta;
          setStreamingContent(prev => prev + delta);
        },
        onDone: (full) => {
          setIsStreaming(false);
          updateCurrentCase({ combatCardResult: full || accumulatedContent });
          loadCases();
        },
        onError: (err) => {
          setIsStreaming(false);
          alert('Agent 2 生成异常: ' + err);
        }
      }
    );
  };

  // STEP 4 Submit feedback to Agent 2 for dynamic diagnosis
  const handleStep4SubmitFeedback = async (feedback: Partial<InterviewFeedback>) => {
    if (!currentCase) return;

    setStreamingContent('');
    setReasoning('');
    setIsStreaming(true);

    let accumulatedContent = '';

    await streamRequest(
      '/api/generate/dynamic-diagnosis',
      {
        caseId: currentCase.id,
        researchResult: currentCase.researchResult,
        combatCardResult: currentCase.combatCardResult,
        interviewFeedback: feedback
      },
      {
        onReasoning: (delta) => setReasoning(prev => prev + delta),
        onContent: (delta) => {
          accumulatedContent += delta;
          setStreamingContent(prev => prev + delta);
        },
        onDone: (full) => {
          setIsStreaming(false);
          updateCurrentCase({ dynamicDiagnosisResult: full || accumulatedContent });
          loadCases();
        },
        onError: (err) => {
          setIsStreaming(false);
          alert('动态复盘分析异常: ' + err);
        }
      }
    );
  };

  const isStepAvailable = (step: 1 | 2 | 3 | 4) => {
    if (step === 1) return true;
    if (step === 2) return !!(currentCase?.industry && currentCase?.companyName);
    if (step === 3) return !!(currentCase?.researchResult);
    if (step === 4) return !!(currentCase?.combatCardResult);
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        onNewCase={handleNewCase}
        onSelectPreset={handleSelectPreset}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExportPdf={() => setIsExportPdfOpen(true)}
        currentTitle={currentCase?.companyName ? `${currentCase.companyName} (${currentCase.industry})` : undefined}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 4-Step Stepper Bar */}
      <Stepper
        currentStep={currentStep}
        onSelectStep={(s) => setCurrentStep(s)}
        isStepAvailable={isStepAvailable}
      />

      {/* Main Content Area + Responsive Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar */}
        <SessionSidebar
          cases={cases}
          activeId={currentCase?.id}
          onSelectCase={handleSelectCase}
          onDeleteCase={handleDeleteCase}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Step View */}
        <main className="flex-1 overflow-y-auto lg:pl-80">
          <div className="p-4 sm:p-6 lg:p-8">
            <ErrorBoundary>
              {currentStep === 1 && (
                <Step1Input
                  currentCase={currentCase}
                  onChange={(f) => updateCurrentCase(f)}
                  onSubmit={handleStep1Submit}
                  isLoading={isStreaming}
                />
              )}

              {currentStep === 2 && (
                <Step2Research
                  currentCase={currentCase}
                  reasoning={reasoning}
                  streamingContent={streamingContent}
                  isStreaming={isStreaming}
                  onRegenerate={handleStep1Submit}
                  onProceedToAgent2={handleStep2Proceed}
                  onOpenExportPdf={() => setIsExportPdfOpen(true)}
                  onUpdateChecks={(checks) => {
                    updateCurrentCase({ agent1ReviewChecks: checks });
                    persistCurrentCase({ agent1ReviewChecks: checks });
                  }}
                />
              )}

              {currentStep === 3 && (
                <Step3CombatCard
                  currentCase={currentCase}
                  reasoning={reasoning}
                  streamingContent={streamingContent}
                  isStreaming={isStreaming}
                  onGenerate={handleStep3Generate}
                  onProceedToStep4={() => setCurrentStep(4)}
                  onOpenExportPdf={() => setIsExportPdfOpen(true)}
                  onUpdateChecks={(checks) => {
                    updateCurrentCase({ agent2ReviewChecks: checks });
                    persistCurrentCase({ agent2ReviewChecks: checks });
                  }}
                />
              )}

              {currentStep === 4 && (
                <Step4InterviewFeedback
                  currentCase={currentCase}
                  reasoning={reasoning}
                  streamingContent={streamingContent}
                  isStreaming={isStreaming}
                  onSubmitFeedback={handleStep4SubmitFeedback}
                  onOpenExportPdf={() => setIsExportPdfOpen(true)}
                  onUpdatePainPoints={(list) => {
                    updateCurrentCase({ painPointsList: list });
                    persistCurrentCase({ painPointsList: list });
                  }}
                />
              )}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Full Dossier A4 PDF Export & Print Modal */}
      <ReportPdfModal
        isOpen={isExportPdfOpen}
        onClose={() => setIsExportPdfOpen(false)}
        currentCase={currentCase}
      />

    </div>
  );
}
