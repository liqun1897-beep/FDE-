import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { 
  getConfig, 
  saveConfig, 
  getAllCases, 
  getCaseById, 
  upsertCase, 
  deleteCase 
} from './db.js';
import { 
  DEFAULT_AGENT1_PROMPT, 
  DEFAULT_AGENT2_PROMPT, 
  DEFAULT_DYNAMIC_DIAGNOSIS_PROMPT 
} from './defaultPrompts.js';
import { getRecruitmentData } from './recruitmentService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8088;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper: Call LLM with SSE streaming
async function streamLLM({ messages, res, onChunk, onDone }) {
  const cfg = getConfig();
  const url = `${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model || 'glm-5.2',
        messages,
        temperature: cfg.temperature ?? 0.3,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      res.write(`data: ${JSON.stringify({ type: 'error', error: `LLM API Error (${response.status}): ${errText}` })}\n\n`);
      res.end();
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulatedContent = '';
    let accumulatedReasoning = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '').trim();
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          const choice = parsed.choices?.[0];
          if (!choice) continue;

          // Check reasoning_content
          if (choice.delta?.reasoning_content) {
            const rDelta = choice.delta.reasoning_content;
            accumulatedReasoning += rDelta;
            res.write(`data: ${JSON.stringify({ type: 'reasoning', delta: rDelta })}\n\n`);
          }

          // Check standard content
          if (choice.delta?.content) {
            const cDelta = choice.delta.content;
            accumulatedContent += cDelta;
            res.write(`data: ${JSON.stringify({ type: 'content', delta: cDelta })}\n\n`);
            if (onChunk) onChunk(cDelta);
          }
        } catch (e) {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }

    if (onDone) {
      onDone({ content: accumulatedContent, reasoning: accumulatedReasoning });
    }

    res.write(`data: ${JSON.stringify({ 
      type: 'done', 
      fullContent: accumulatedContent, 
      fullReasoning: accumulatedReasoning 
    })}\n\n`);
    res.end();

  } catch (error) {
    console.error('LLM stream error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message || '网络连接错误' })}\n\n`);
    res.end();
  }
}

// ----------------- API ROUTES -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Config API
app.get('/api/config', (req, res) => {
  const cfg = getConfig();
  res.json({
    baseUrl: cfg.baseUrl,
    model: cfg.model,
    apiKey: cfg.apiKey ? `${cfg.apiKey.slice(0, 6)}...${cfg.apiKey.slice(-4)}` : '',
    temperature: cfg.temperature,
    maxTokens: cfg.maxTokens,
    defaultPrompts: {
      agent1: DEFAULT_AGENT1_PROMPT,
      agent2: DEFAULT_AGENT2_PROMPT,
      dynamicDiagnosis: DEFAULT_DYNAMIC_DIAGNOSIS_PROMPT
    }
  });
});

app.post('/api/config', (req, res) => {
  const current = getConfig();
  const nextConfig = {
    ...current,
    baseUrl: req.body.baseUrl || current.baseUrl,
    model: req.body.model || current.model,
    temperature: req.body.temperature ?? current.temperature,
    maxTokens: req.body.maxTokens ?? current.maxTokens,
  };
  if (req.body.apiKey && !req.body.apiKey.includes('...')) {
    nextConfig.apiKey = req.body.apiKey;
  }
  saveConfig(nextConfig);
  res.json({ success: true, message: '配置已更新' });
});

// Test Config
app.post('/api/config/test', async (req, res) => {
  const { baseUrl, apiKey, model } = req.body;
  const current = getConfig();
  const targetUrl = (baseUrl || current.baseUrl).replace(/\/+$/, '') + '/chat/completions';
  let targetKey = apiKey && !apiKey.includes('...') ? apiKey : current.apiKey;
  if (targetKey) targetKey = targetKey.trim().split(/\s+/)[0];
  const targetModel = model || current.model;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  try {
    const testResp = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${targetKey}`
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: '请回复“连接成功”四个字' }],
        temperature: 0.1,
        max_tokens: 20
      }),
      signal: controller.signal
    });

    clearTimeout(timer);

    if (!testResp.ok) {
      const errText = await testResp.text();
      return res.status(testResp.status).json({ success: false, error: `模型接口错误 (${testResp.status}): ${errText}` });
    }

    const data = await testResp.json();
    const reply = data.choices?.[0]?.message?.content || '连接正常';
    res.json({ success: true, reply, raw: data });
  } catch (err) {
    clearTimeout(timer);
    res.status(500).json({ success: false, error: err.name === 'AbortError' ? '请求超时 (15s)' : (err.message || '网络连接异常') });
  }
});

// Cases CRUD
app.get('/api/cases', (req, res) => {
  const cases = getAllCases();
  res.json(cases);
});

app.get('/api/cases/:id', (req, res) => {
  const item = getCaseById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Case not found' });
  res.json(item);
});

app.post('/api/cases', (req, res) => {
  const item = upsertCase(req.body);
  res.json(item);
});

app.put('/api/cases/:id', (req, res) => {
  const item = upsertCase({ ...req.body, id: req.params.id });
  res.json(item);
});

app.delete('/api/cases/:id', (req, res) => {
  deleteCase(req.params.id);
  res.json({ success: true });
});

// ----------------- LLM STREAMING ENDPOINTS -----------------

// Recruitment Search API
app.post('/api/recruitment/search', (req, res) => {
  const { companyName, industry } = req.body;
  const data = getRecruitmentData(companyName, industry);
  res.json(data);
});

// 1. Agent 1: 行业与企业情报研究
app.post('/api/generate/research', async (req, res) => {
  const { 
    caseId, 
    industry, 
    companyName, 
    website, 
    region, 
    coreBusiness, 
    contactRole, 
    backgroundNotes,
    customPrompt 
  } = req.body;

  if (!industry || !companyName) {
    return res.status(400).json({ error: '必须填写行业与企业名称' });
  }

  // Setup SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const systemPrompt = customPrompt || DEFAULT_AGENT1_PROMPT;

  // Retrieve authentic recruitment / JD benchmark
  const recruit = getRecruitmentData(companyName, industry);
  const recruitSummary = recruit.roles.map(r => 
    `* 【${r.tier}】${r.title}（归属部门：${r.department}）：\n  - 日常职责：${r.dailyResponsibilities.join('；')}\n  - 🔥高频重复手工任务：${r.highFrequencyRepetitiveTasks.join('；')}\n  - 常用工具/系统栈：${r.toolsAndSystems.join('、')}\n  - 常见业务断点：${r.painPointsAndBottlenecks.join('；')}`
  ).join('\n\n');

  const collabSummary = recruit.collaborationChain.map((c, i) => 
    `${i + 1}. 【${c.fromRole}】➔【${c.toRole}】：传递交接[${c.handoffItem}]，核心协同断点[⚡ ${c.bottleneck}]`
  ).join('\n');
  
  const userContent = `【目标企业诊断输入】
- 行业领域：${industry}
- 企业名称：${companyName}
${website ? `- 官网/公开链接：${website}` : ''}
${region ? `- 所在地区：${region}` : ''}
${coreBusiness ? `- 已知主营业务/产品：${coreBusiness}` : ''}
${contactRole ? `- 客户联系人岗位：${contactRole}` : ''}
${backgroundNotes ? `- 顾问已知背景/前期调研：${backgroundNotes}` : ''}

【真实招聘平台 (BOSS直聘/猎聘/智联) 职位描述 (JD) 与岗位编制事实依据】
数据来源：${recruit.source}
真实核心在招岗位与高耗时任务：
${recruitSummary}

跨岗位端到端协作链条：
${collabSummary}

请作为 FDE 行业与企业情报研究 Agent，以这批真实的招聘岗位、日常重复手工动作和协同流转链条为关键事实锚点：
1. 在第 4.2 节绘制完整的【端到端端业务流程流转标准表格】（阶段序号、阶段名称、责任岗位、核心动作、输入系统、输出交付物、协同断点）；
2. 在第 6.1 节详尽列出【各岗位高频高重复工作与卡点矩阵表】（详细拆解每个具体岗位日常最繁琐的手工拉表、跨系统录入、微信催办、人工比对卡点与求证问题）；
3. 输出完整的《客户行业情报与岗位痛点地图｜${industry}｜${companyName}》，确保客观严谨、岗位真实、毫无泛泛空话。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  await streamLLM({
    messages,
    res,
    onDone: ({ content }) => {
      if (caseId) {
        const c = getCaseById(caseId) || { id: caseId };
        upsertCase({
          ...c,
          industry,
          companyName,
          website,
          region,
          coreBusiness,
          contactRole,
          backgroundNotes,
          researchResult: content,
          currentStep: Math.max(c.currentStep || 1, 2)
        });
      }
    }
  });
});

// 2. Agent 2: 客户共鸣与痛点诊断作战卡
app.post('/api/generate/combat-card', async (req, res) => {
  const { 
    caseId, 
    researchResult, 
    contactRole, 
    meetingGoal, 
    backgroundNotes,
    customPrompt 
  } = req.body;

  if (!researchResult) {
    return res.status(400).json({ error: '需要先具备 Agent 1 的行业与企业研究成果' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const systemPrompt = customPrompt || DEFAULT_AGENT2_PROMPT;

  const userContent = `【售前沟通背景信息】
${contactRole ? `- 本次交流客户岗位：${contactRole}` : ''}
${meetingGoal ? `- 本次会谈主要目标：${meetingGoal}` : ''}
${backgroundNotes ? `- 补充沟通背景/已知顾虑：${backgroundNotes}` : ''}

【前序 Agent 1 研究输出（含端到端业务主流程与真实招聘岗位高频重复工作矩阵）】
${researchResult}

请作为 FDE 客户痛点诊断 Agent，深入结合前序各岗位的真实高频重复手工作业与跨部门流转断点：
1. 深入分析整个业务端到端流转流程中哪里存在效率瓶颈与优化空间；
2. 特别在第 6 节详尽输出【各部门高频重复劳动优化与 AI 解决方案矩阵】标准表格（必须包含：部门分类、涉及岗位、当前高负荷重复手工劳动、业务流程卡点、建议的 AI / 自动化改造方案、预期改善人效与价值）；
3. 围绕选定的 3-5 个核心业务痛点，设计自然共鸣的开场白、五层深入追问法、异议应对战术，输出标准的《客户共鸣与痛点诊断作战卡》。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  await streamLLM({
    messages,
    res,
    onDone: ({ content }) => {
      if (caseId) {
        const c = getCaseById(caseId) || { id: caseId };
        upsertCase({
          ...c,
          contactRole: contactRole || c.contactRole,
          meetingGoal,
          combatCardResult: content,
          currentStep: Math.max(c.currentStep || 1, 3)
        });
      }
    }
  });
});

// 3. Agent 2 动态追问与访谈复盘
app.post('/api/generate/dynamic-diagnosis', async (req, res) => {
  const { 
    caseId, 
    researchResult, 
    combatCardResult, 
    interviewFeedback,
    customPrompt 
  } = req.body;

  if (!interviewFeedback) {
    return res.status(400).json({ error: '必须提交客户访谈反馈' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const systemPrompt = customPrompt || DEFAULT_DYNAMIC_DIAGNOSIS_PROMPT;

  const userContent = `【前序背景材料】
--- Agent 1 行业研究摘要 ---
${researchResult ? researchResult.slice(0, 3000) : '未提供'}

--- Agent 2 诊断作战卡摘要 ---
${combatCardResult ? combatCardResult.slice(0, 3000) : '未提供'}

【顾问提交的客户访谈现场反馈】
- 访谈日期/对象：${interviewFeedback.date || '近期'} / ${interviewFeedback.targetRole || '未注'}
- 重点讨论的痛点名称：${interviewFeedback.discussedPainPoints || '未注'}
- 客户原话与典型表达：
${interviewFeedback.clientQuotes || '无'}
- 客户已确认的情况：
${interviewFeedback.confirmedFacts || '无'}
- 客户明确否定或认为不是问题的情况：
${interviewFeedback.deniedFacts || '无'}
- 客户提及的现有系统、数据基础或业务材料：
${interviewFeedback.clientData || '无'}
- 当前尚未搞清楚的关键疑问：
${interviewFeedback.openQuestions || '无'}
- 顾问希望获得的评估支持：
${interviewFeedback.advisorRequests || '下一步应该追问什么？这个痛点是否值得继续挖？是否值得进一步评估 AI？'}

请基于上述真实反馈，更新痛点验证状态（待验证 / 客户陈述 / 证据支持 / 试点验证 / 已否定），输出完整的《客户访谈复盘与动态诊断报告》。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent }
  ];

  await streamLLM({
    messages,
    res,
    onDone: ({ content }) => {
      if (caseId) {
        const c = getCaseById(caseId) || { id: caseId };
        const pastFeedbacks = c.interviewFeedbacks || [];
        upsertCase({
          ...c,
          interviewFeedbacks: [...pastFeedbacks, { ...interviewFeedback, id: 'fb_' + Date.now(), createdAt: new Date().toISOString() }],
          dynamicDiagnosisResult: content,
          currentStep: 4
        });
      }
    }
  });
});

// Serve frontend build if exists
const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FDE Backend Server] Running on http://127.0.0.1:${PORT} and http://localhost:${PORT}`);
});
