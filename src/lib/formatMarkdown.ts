/**
 * Pre-processes markdown text from LLMs:
 * 1. Converts unhashed numbered section headers like "1. 本次沟通目标" or "一、行业整体情况" into standard "## 1. 本次沟通目标"
 * 2. Ensures blank lines around headers, tables, and lists so Markdown parsers render them properly
 * 3. Highlights key-value prefixes and callouts
 */
export function formatMarkdownContent(raw: string): string {
  if (!raw) return '';

  let lines = raw.split('\n');
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Check if line is title without #
    if (i === 0 && !line.startsWith('#') && (line.includes('作战卡') || line.includes('痛点地图') || line.includes('报告'))) {
      result.push('# ' + line.trim());
      result.push('');
      continue;
    }

    // Convert section headers like "1. 本次沟通目标", "2. 客户业务理解", "一、行业整体情况", etc. to "## "
    const sectionMatch = line.match(/^(\s*)([0-9]{1,2}\.|\([0-9]{1,2}\)|[一二三四五六七八九十]{1,2}、)\s*([^:：\n]+)$/);
    if (sectionMatch && !line.startsWith('#')) {
      const title = sectionMatch[3].trim();
      // Ensure there's a blank line before heading
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('');
      }
      result.push(`## ${sectionMatch[2]} ${title}`);
      result.push('');
      continue;
    }

    // Convert subheaders like "3.1 痛点假设" or "痛点 1：" to "### "
    const subMatch = line.match(/^(\s*)([0-9]{1,2}\.[0-9]{1,2}|痛点\s*[0-9一二三四五1-5][:：]|【[^】]+】)\s*(.+)$/);
    if (subMatch && !line.startsWith('#') && !line.startsWith('-') && !line.startsWith('*')) {
      if (result.length > 0 && result[result.length - 1] !== '') {
        result.push('');
      }
      result.push(`### ${subMatch[2]} ${subMatch[3]}`);
      result.push('');
      continue;
    }

    // Format key-value pairs at root: ensure they are bullets if not already
    // e.g. "企业：武汉仓藤传媒有限公司" -> "- **企业：** 武汉仓藤传媒有限公司"
    const kvMatch = line.match(/^(\s*)(企业|行业|沟通对象|对方岗位|本次交流目标|当前信息状态|企业业务模式|当前经营重点|所属产业链位置|本次沟通对象可能关注的目标|已确认事实|尚待核实的信息|涉及岗位|业务环节|痛点假设|潜在影响|证据等级|验证问题|候选 AI 机会|自然开场|为什么这样切入|需要避免的表达)[:：]\s*(.+)$/);
    if (kvMatch && !line.trim().startsWith('-') && !line.trim().startsWith('*')) {
      result.push(`- **${kvMatch[2]}：** ${kvMatch[3]}`);
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}
