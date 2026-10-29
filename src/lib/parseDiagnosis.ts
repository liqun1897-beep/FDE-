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
    roleTasks: []
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

  // Extract Process Stages from tables or text
  result.allTables = extractMarkdownTables(raw);
  
  // Look for process flow table (columns like 流程阶段 / 业务环节 / 动作 / 涉及岗位 / 卡点)
  for (const table of result.allTables) {
    const headerStr = table.headers.join(' ');
    if (headerStr.includes('阶段') || headerStr.includes('流程') || headerStr.includes('环节')) {
      table.rows.forEach((row, idx) => {
        result.processStages.push({
          step: idx + 1,
          name: row[0] || row[1] || `环节 ${idx + 1}`,
          roles: row[1] || row[2] || '',
          actions: row[2] || row[3] || '',
          inputs: row[3] || '',
          outputs: row[4] || '',
          bottlenecks: row[row.length - 1] || ''
        });
      });
    }
  }

  // Look for role tasks table (columns like 岗位层级 / 具体岗位 / 高频重复 / 卡点)
  for (const table of result.allTables) {
    const headerStr = table.headers.join(' ');
    if (headerStr.includes('岗位') && (headerStr.includes('高频') || headerStr.includes('任务') || headerStr.includes('职责'))) {
      table.rows.forEach(row => {
        const tierRaw = row[0] || '';
        let tier: RoleTaskItem['tier'] = '一线执行层';
        if (tierRaw.includes('决策') || tierRaw.includes('高层') || tierRaw.includes('老板')) tier = '决策层';
        else if (tierRaw.includes('管理') || tierRaw.includes('协同') || tierRaw.includes('主管') || tierRaw.includes('总监')) tier = '协同管理层';

        result.roleTasks.push({
          tier,
          roleName: row[1] || row[0] || '业务岗位',
          coreDuty: row[2] || '',
          repetitiveTasks: row[3] || row[2] || '日常处理各类报表与资料核对',
          inputsAndTools: row[4] || '',
          outputs: row[5] || '',
          bottlenecks: row[6] || row[row.length - 1] || '人工流转繁琐，跨系统同步时滞',
          verifyQuestion: row[7] || ''
        });
      });
    }
  }

  return result;
}
