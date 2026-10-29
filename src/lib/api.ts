import { CaseSession, ModelConfig } from '../types';

export async function fetchCases(): Promise<CaseSession[]> {
  const res = await fetch('/api/cases');
  if (!res.ok) throw new Error('获取案例列表失败');
  return res.json();
}

export async function fetchCase(id: string): Promise<CaseSession> {
  const res = await fetch(`/api/cases/${id}`);
  if (!res.ok) throw new Error('获取案例详情失败');
  return res.json();
}

export async function saveCase(caseData: Partial<CaseSession>): Promise<CaseSession> {
  const isUpdate = !!caseData.id;
  const url = isUpdate ? `/api/cases/${caseData.id}` : '/api/cases';
  const method = isUpdate ? 'PUT' : 'POST';
  
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(caseData)
  });
  if (!res.ok) throw new Error('保存案例失败');
  return res.json();
}

export async function removeCase(id: string): Promise<void> {
  const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('删除案例失败');
}

export async function fetchConfig(): Promise<ModelConfig> {
  const res = await fetch('/api/config');
  if (!res.ok) throw new Error('获取模型配置失败');
  return res.json();
}

export async function updateConfig(cfg: Partial<ModelConfig>): Promise<{ success: boolean }> {
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg)
  });
  if (!res.ok) throw new Error('更新配置失败');
  return res.json();
}

export async function testConnection(params: { baseUrl?: string; apiKey?: string; model?: string }) {
  const res = await fetch('/api/config/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function fetchRecruitmentData(companyName: string, industry: string) {
  const res = await fetch('/api/recruitment/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, industry })
  });
  if (!res.ok) throw new Error('获取招聘数据失败');
  return res.json();
}

export interface StreamHandlers {
  onReasoning?: (delta: string) => void;
  onContent?: (delta: string) => void;
  onDone?: (fullContent: string, fullReasoning: string) => void;
  onError?: (err: string) => void;
}

export async function streamRequest(
  url: string,
  body: any,
  handlers: StreamHandlers,
  signal?: AbortSignal
) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal
    });

    if (!res.ok) {
      const errText = await res.text();
      handlers.onError?.(`请求失败 (${res.status}): ${errText}`);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error('无法读取响应流');

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const jsonStr = trimmed.replace(/^data:\s*/, '').trim();

        try {
          const data = JSON.parse(jsonStr);
          if (data.type === 'reasoning') {
            handlers.onReasoning?.(data.delta);
          } else if (data.type === 'content') {
            handlers.onContent?.(data.delta);
          } else if (data.type === 'done') {
            handlers.onDone?.(data.fullContent || '', data.fullReasoning || '');
          } else if (data.type === 'error') {
            handlers.onError?.(data.error || '生成失败');
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      handlers.onError?.('已取消生成');
    } else {
      handlers.onError?.(err.message || '网络连接异常');
    }
  }
}
