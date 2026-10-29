import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const CASES_FILE = path.join(DATA_DIR, 'cases.json');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const DEFAULT_CONFIG = {
  baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.MODEL_NAME || 'gpt-4o',
  temperature: 0.3,
  maxTokens: 4096,
};

export function getConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return DEFAULT_CONFIG;
  }
  try {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const stored = JSON.parse(raw);
    return {
      ...DEFAULT_CONFIG,
      ...stored,
      apiKey: stored.apiKey || process.env.OPENAI_API_KEY || ''
    };
  } catch (e) {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
}

export function getAllCases() {
  if (!fs.existsSync(CASES_FILE)) {
    const initial = getPresetDemoCases();
    saveCases(initial);
    return initial;
  }
  try {
    const raw = fs.readFileSync(CASES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = getPresetDemoCases();
      saveCases(initial);
      return initial;
    }
    return parsed;
  } catch (e) {
    const initial = getPresetDemoCases();
    saveCases(initial);
    return initial;
  }
}

export function getCaseById(id) {
  const cases = getAllCases();
  return cases.find(c => c.id === id) || null;
}

export function saveCases(cases) {
  fs.writeFileSync(CASES_FILE, JSON.stringify(cases, null, 2), 'utf-8');
}

export function upsertCase(caseData) {
  const cases = getAllCases();
  const index = cases.findIndex(c => c.id === caseData.id);
  const now = new Date().toISOString();
  
  if (index >= 0) {
    cases[index] = { ...cases[index], ...caseData, updatedAt: now };
  } else {
    cases.unshift({
      ...caseData,
      id: caseData.id || ('case_' + Date.now()),
      createdAt: now,
      updatedAt: now,
      currentStep: caseData.currentStep || 1
    });
  }
  saveCases(cases);
  return getCaseById(caseData.id || cases[0].id);
}

export function deleteCase(id) {
  let cases = getAllCases();
  cases = cases.filter(c => c.id !== id);
  saveCases(cases);
  return true;
}

export function getPresetDemoCases() {
  return [
    {
      id: 'demo_auto_parts',
      title: '宁波精工汽配制造有限公司 售前诊断',
      industry: '高端装备制造 / 汽车零部件',
      companyName: '宁波某汽车零部件精密制造有限公司',
      website: 'http://example.com/autoparts',
      region: '浙江宁波',
      coreBusiness: '发动机及底盘高精度铝合金冲压与压铸件，主要客户为上汽、吉利及造车新势力',
      contactRole: '副总经理兼生产运营总监',
      backgroundNotes: '客户近两年主机厂订单增加，但主机厂频繁插单、技术变更（ECN）频繁，月均ECN达30+次；目前车间排产主要靠Excel结合老厂长经验，部门间通过微信群传递变更，经常发生呆滞料或模具未同步改造导致的返工。',
      currentStep: 3,
      agent1ReviewChecks: {
        companyVerified: true,
        sourcesReliable: true,
        factsVsAssumptions: true,
        supplyChainClear: true,
        processMapped: true,
        painPointsActionable: true,
        questionsReady: true,
        noFabrication: true
      },
      agent2ReviewChecks: {
        painPointsFiltered: true,
        openingNatural: true,
        deepQuestionsReady: true,
        fiveLayersCovered: true,
        responseBranchesReady: true,
        hypothesesDistinguished: true,
        aiConditionsClear: true,
        nextStepsActionable: true
      },
      painPointsList: [
        {
          id: 'pp-1',
          name: '工程技术变更（ECN）跨部门同步迟滞导致产线返工与呆料',
          roles: '技术部、生产部、采购部、仓管',
          status: '待验证',
          description: '主机厂下发ECN后，图纸及BOM版本在多系统与纸质流转中存在2-3天时滞，老版本仍在装配。'
        },
        {
          id: 'pp-2',
          name: '小批量多品种高频插单下的排产经验依赖与瓶颈不可见',
          roles: 'PMC计划员、车间主任',
          status: '待验证',
          description: '压铸机台与模具换模成本高，人工Excel排产无法动态权衡交期违约金与模具切换损耗。'
        },
        {
          id: 'pp-3',
          name: '精密压铸毛坯外观瑕疵人工抽检漏检与追溯困难',
          roles: '品控质检员、售后质量工程师',
          status: '待验证',
          description: '质检员肉眼巡检疲劳，气孔、裂纹等微小缺陷流入后道机加，引发客户索赔与整批退货。'
        }
      ],
      createdAt: '2026-10-25T14:30:00.000Z',
      updatedAt: '2026-10-26T10:20:00.000Z'
    }
  ];
}
