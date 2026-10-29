import React, { useState, useEffect } from 'react';
import { ModelConfig } from '../types';
import { fetchConfig, updateConfig, testConnection } from '../lib/api';
import { X, Check, AlertCircle, RefreshCw, Sparkles, Terminal } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<ModelConfig>({
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 4096,
  });
  const [activeTab, setActiveTab] = useState<'model' | 'prompts'>('model');
  const [promptTab, setPromptTab] = useState<'agent1' | 'agent2' | 'dynamic'>('agent1');
  const [customPrompts, setCustomPrompts] = useState<{ [key: string]: string }>({});
  
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      const data = await fetchConfig();
      setConfig(data);
      if (data.defaultPrompts) {
        setCustomPrompts({
          agent1: data.defaultPrompts.agent1,
          agent2: data.defaultPrompts.agent2,
          dynamic: data.defaultPrompts.dynamicDiagnosis,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testConnection({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        model: config.model
      });
      if (res.success) {
        setTestResult({
          success: true,
          message: `连接成功！模型返回：${res.reply}`
        });
      } else {
        setTestResult({
          success: false,
          message: res.error || '测试失败'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || '网络连接超时'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig(config);
      onClose();
    } catch (e: any) {
      alert('保存失败: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-lg">系统与模型配置</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="px-6 pt-3 border-b border-slate-200 bg-slate-50 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('model')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'model'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            大模型参数 (GLM-5.2)
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'prompts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            工作流核心 Prompt 规范
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'model' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Base URL (OpenAI Chat Completions 兼容网关)
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  API Key
                </label>
                <input
                  type="text"
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="sk-... 或 pk_..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">如不修改请保留现有掩码值</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    模型名称
                  </label>
                  <input
                    type="text"
                    value={config.model}
                    onChange={(e) => setConfig({ ...config, model: e.target.value })}
                    placeholder="glm-5.2"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    采样温度 (Temperature: {config.temperature})
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-3"
                  />
                </div>
              </div>

              {/* Test button & status */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTest}
                  disabled={testing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
                  <span>{testing ? '正在测试连通性...' : '测试 API 连通性'}</span>
                </button>

                {testResult && (
                  <div
                    className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                      testResult.success
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setPromptTab('agent1')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    promptTab === 'agent1'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Agent 1 行业与企业情报研究 Prompt
                </button>
                <button
                  onClick={() => setPromptTab('agent2')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    promptTab === 'agent2'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Agent 2 痛点作战卡 Prompt
                </button>
                <button
                  onClick={() => setPromptTab('dynamic')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    promptTab === 'dynamic'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  动态复盘与追问 Prompt
                </button>
              </div>

              <div>
                <textarea
                  readOnly
                  rows={14}
                  value={
                    promptTab === 'agent1'
                      ? customPrompts.agent1
                      : promptTab === 'agent2'
                      ? customPrompts.agent2
                      : customPrompts.dynamic
                  }
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  提示词严格遵循《FDE 售前客户诊断工作流 V1.0》第 5 章规范定义。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
          >
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>

      </div>
    </div>
  );
};
