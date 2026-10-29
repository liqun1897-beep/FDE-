/**
 * Robust Dynamic Parser for FDE Pre-sales Diagnosis Reports
 * Extracts actual sections, key-value pairs, tables, business processes, and role task matrices
 * directly from model-generated text without hardcoded fallbacks.
 */

export interface ParsedSection {
  title: string;
  rawContent: string;
  subsections: { title: string; content: string }[];
  tables: { headers: string[]; rows: string[][] }[];
  keyValuePairs: Record<string, string>;
  bulletPoints: string[];
}

export interface ProcessStage {
  step: number;
  name: string;
  roles: string;
  actions: string;
  inputs: string;
  outputs: string;
  bottlenecks: string;
}

export interface RoleTaskItem {
  tier: '决策层' | '协同管理层' | '一线执行层' | '通用岗位';
  roleName: string;
  coreDuty: string;
  repetitiveTasks: string;
  inputsAndTools: string;
  outputs: string;
  bottlenecks: string;
  verifyQuestion: string;
}

export interface ParsedDiagnosisReport {
  title: string;
  sections: Record<string, ParsedSection>;
  allTables: { title?: string; headers: string[]; rows: string[][] }[];
  processStages: ProcessStage[];
  roleTasks: RoleTaskItem[];
  roleTierAnalyses: Record<string, string>;
}

/**
 * Extracts Markdown tables into structured JSON
 */
export function extractMarkdownTables(text: string): { headers: string[]; rows: string[][] }[] {
  const tables: { headers: string[]; rows: string[][] }[] = [];
  const lines = text.split('\n');
  let currentTableLines: string[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      currentTableLines.push(trimmed);
    } else {
      if (inTable && currentTableLines.length >= 2) {
        // parse current table
        const parsed = parseSingleTable(currentTableLines);
        if (parsed) tables.push(parsed);
        currentTableLines = [];
      }
      inTable = false;
    }
  }

  if (inTable && currentTableLines.length >= 2) {
    const parsed = parseSingleTable(currentTableLines);
    if (parsed) tables.push(parsed);
  }

  return tables;
}

function parseSingleTable(lines: string[]): { headers: string[]; rows: string[][] } | null {
  if (lines.length < 2) return null;
  const parseRow = (rowStr: string) => 
    rowStr.slice(1, -1).split('|').map(c => c.trim());

  const headers = parseRow(lines[0]);
  // skip line 1 (the separator |---|---|)
  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    if (lines[i].includes('---')) continue;
    rows.push(parseRow(lines[i]));
  }
  return { headers, rows };
}

/**
 * Comprehensive parser for Agent 1 and Agent 2 documents
 */
export function parseFullDocument(raw: string): ParsedDiagnosisReport {
  const result: ParsedDiagnosisReport = {
    title: '',
    sections: {},
    allTables: [],
    processStages: [],
    roleTasks: [],
    roleTierAnalyses: {}
  };

  if (!raw) return result;

  const lines = raw.split('\n');
  let currentSectionKey = 'header';
  let currentSectionTitle = '基本概要';
  let sectionLines: Record<string, string[]> = { [currentSectionKey]: [] };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect Title
    if (i === 0 && line.startsWith('#') || line.includes('作战卡') || line.includes('痛点地图')) {
      result.title = line.replace(/^[#\s]+/, '').trim();
    }

    // Detect section headers: "## 1. ...", "## 2. ...", "1. 本次沟通目标", "一、行业整体情况"
    const headerMatch = line.match(/^(?:##\s*|\b)([0-9]{1,2}\.|\([0-9]{1,2}\)|[一二三四五六七八九十]{1,2}、)\s*(.+)$/);
    if (headerMatch && !line.startsWith('###')) {
      const num = headerMatch[1];
      const title = headerMatch[2].trim();
      currentSectionKey = `sec_${num.replace(/[^0-9a-zA-Z一二三四五六七八九十]/g, '')}`;
      currentSectionTitle = title;
      if (!sectionLines[currentSectionKey]) {
        sectionLines[currentSectionKey] = [];
      }
      continue;
    }

    if (!sectionLines[currentSectionKey]) {
      sectionLines[currentSectionKey] = [];
    }
    sectionLines[currentSectionKey].push(line);
  }

  // Parse each section
  for (const [key, linesArr] of Object.entries(sectionLines)) {
    const rawText = linesArr.join('\n');
    const tables = extractMarkdownTables(rawText);
    const kvPairs: Record<string, string> = {};
    const bullets: string[] = [];

    for (const l of linesArr) {
      const trimmed = l.trim();
      // kv match: "- **企业：** xxx" or "企业：xxx"
      const kv = trimmed.match(/^(?:[-*]\s*)?(?:\*\*)?([^：:\*\n]+)(?:\*\*)?[：:]\s*(.+)$/);
      if (kv && kv[1].length < 30) {
        kvPairs[kv[1].trim()] = kv[2].replace(/\*\*$/g, '').trim();
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        bullets.push(trimmed.replace(/^[-*]\s*/, '').trim());
      }
    }

    result.sections[key] = {
      title: currentSectionTitle,
      rawContent: rawText,
      subsections: [],
      tables,
      keyValuePairs: kvPairs,
      bulletPoints: bullets
    };
  }

  // Extract Process Stages from tables or text with smart header matching
  result.allTables = extractMarkdownTables(raw);
  
  for (const table of result.allTables) {
    const headerStr = table.headers.join(' ');
    // Detect Process Table
    if ((headerStr.includes('阶段') || headerStr.includes('流程') || headerStr.includes('环节')) && 
        (headerStr.includes('动作') || headerStr.includes('输入') || headerStr.includes('交付') || headerStr.includes('断点') || headerStr.includes('卡点'))) {
      
      const stepCol = table.headers.findIndex(h => /序号|步骤|编号/.test(h));
      const nameCol = table.headers.findIndex(h => /(?:流程阶段|业务阶段|阶段名称|业务环节|环节)/.test(h) && !/序号/.test(h));
      const roleCol = table.headers.findIndex(h => /(?:责任岗位|协作方|岗位|角色|部门)/.test(h));
      const actCol  = table.headers.findIndex(h => /(?:核心业务动作|核心动作|动作|工作内容)/.test(h));
      const inCol   = table.headers.findIndex(h => /(?:输入资料|输入系统|工具栈|输入|系统)/.test(h));
      const outCol  = table.headers.findIndex(h => /(?:输出交付|输出|成果|交付物)/.test(h));
      const botCol  = table.headers.findIndex(h => /(?:断点|卡点|协同卡点|瓶颈|潜在)/.test(h));

      table.rows.forEach((row, idx) => {
        const stepNum = stepCol >= 0 && parseInt(row[stepCol], 10) ? parseInt(row[stepCol], 10) : idx + 1;
        const nameVal = (nameCol >= 0 ? row[nameCol] : '') || row[1] || row[0] || `业务环节 ${idx + 1}`;
        const roleVal = (roleCol >= 0 ? row[roleCol] : '') || row[2] || '';
        const actVal  = (actCol >= 0 ? row[actCol] : '') || row[3] || '';
        const inVal   = (inCol >= 0 ? row[inCol] : '') || row[4] || '';
        const outVal  = (outCol >= 0 ? row[outCol] : '') || row[5] || '';
        const botVal  = (botCol >= 0 ? row[botCol] : '') || row[row.length - 1] || '';

        result.processStages.push({
          step: stepNum,
          name: nameVal,
          roles: roleVal,
          actions: actVal,
          inputs: inVal,
          outputs: outVal,
          bottlenecks: botVal
        });
      });
    }

    // Detect Role Tasks Table
    if (headerStr.includes('岗位') && (headerStr.includes('高频') || headerStr.includes('任务') || headerStr.includes('职责') || headerStr.includes('手工'))) {
      const tierCol = table.headers.findIndex(h => /(?:层级|梯队)/.test(h));
      const roleCol = table.headers.findIndex(h => /(?:岗位名称|具体岗位|角色|岗位)/.test(h) && !/层级/.test(h));
      const dutyCol = table.headers.findIndex(h => /(?:核心职责|日常职责|主要职责|职责)/.test(h));
      const taskCol = table.headers.findIndex(h => /(?:高频重复|手工任务|最耗时|高频|重复)/.test(h));
      const inCol   = table.headers.findIndex(h => /(?:输入数据|系统|工具)/.test(h));
      const outCol  = table.headers.findIndex(h => /(?:输出交付|交付物|产出)/.test(h));
      const botCol  = table.headers.findIndex(h => /(?:典型卡点|卡点|等待|返工|瓶颈)/.test(h));
      const qCol    = table.headers.findIndex(h => /(?:建议验证|求证|提问|建议)/.test(h));

      table.rows.forEach((row, idx) => {
        const tierRaw = (tierCol >= 0 ? row[tierCol] : '') || row[0] || '';
        let tier: RoleTaskItem['tier'] = '一线执行层';
        if (tierRaw.includes('决策') || tierRaw.includes('高层') || tierRaw.includes('经营')) tier = '决策层';
        else if (tierRaw.includes('管理') || tierRaw.includes('协同') || tierRaw.includes('主管') || tierRaw.includes('总监')) tier = '协同管理层';

        result.roleTasks.push({
          tier,
          roleName: (roleCol >= 0 ? row[roleCol] : '') || row[1] || row[0] || `核心岗位 ${idx + 1}`,
          coreDuty: (dutyCol >= 0 ? row[dutyCol] : '') || row[2] || '',
          repetitiveTasks: (taskCol >= 0 ? row[taskCol] : '') || row[3] || '日常处理各类报表与资料核对',
          inputsAndTools: (inCol >= 0 ? row[inCol] : '') || row[4] || '',
          outputs: (outCol >= 0 ? row[outCol] : '') || row[5] || '',
          bottlenecks: (botCol >= 0 ? row[botCol] : '') || row[6] || row[row.length - 1] || '人工流转繁琐，跨系统同步时滞',
          verifyQuestion: (qCol >= 0 ? row[qCol] : '') || row[7] || ''
        });
      });
    }
  }

  // Extract detailed in-depth section paragraphs for roles (e.g. 6.2, 6.3, 6.4)
  const roleAnalysisRegex = /###\s*(?:6\.[2-4]\s*)?([^#\n]+(?:决策层|协同|管理|执行层|总监|经理|一线)[^#\n]*)\n([\s\S]*?)(?=(?:###|##|$))/g;
  let match;
  while ((match = roleAnalysisRegex.exec(raw)) !== null) {
    const title = match[1].trim();
    const content = match[2].trim();
    if (content.length > 30) {
      result.roleTierAnalyses[title] = content;
    }
  }

  return result;
}
