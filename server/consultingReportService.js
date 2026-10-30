import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * Finds Chromium-based browser executable on macOS, Linux, or Windows
 */
export function findChromiumBrowser() {
  const candidates = [
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    'google-chrome',
    'google-chrome-stable',
    'chromium-browser',
    'chromium',
    // Windows
    String.raw`C:\Program Files\Google\Chrome\Application\chrome.exe`,
    String.raw`C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`,
    String.raw`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`,
  ];

  for (const c of candidates) {
    if (path.isAbsolute(c) && fs.existsSync(c)) {
      return c;
    }
  }
  return null;
}

/**
 * Compiles HTML to A4 Vector PDF via Headless Chrome without header/footer margins
 */
export async function compileHtmlToPdf(htmlContent, outputPdfPath = null) {
  const browser = findChromiumBrowser();
  if (!browser) {
    throw new Error('未在系统中找到 Chrome 或 Edge 浏览器内核，无法进行 Headless 矢量编译。');
  }

  const tmpDir = os.tmpdir();
  const tmpHtml = path.join(tmpDir, `consulting_report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.html`);
  const finalPdf = outputPdfPath || path.join(tmpDir, `consulting_report_${Date.now()}.pdf`);

  fs.writeFileSync(tmpHtml, htmlContent, 'utf-8');

  try {
    await execFileAsync(browser, [
      '--headless',
      '--disable-gpu',
      `--print-to-pdf=${finalPdf}`,
      '--no-pdf-header-footer',
      tmpHtml
    ], { timeout: 30000 });

    if (fs.existsSync(finalPdf) && fs.statSync(finalPdf).size > 1024) {
      return finalPdf;
    } else {
      throw new Error('Headless 编译生成文件为空或失败');
    }
  } finally {
    try {
      if (fs.existsSync(tmpHtml)) fs.unlinkSync(tmpHtml);
    } catch (e) {
      // ignore tmp cleanup
    }
  }
}

/**
 * Generates the full 10-Chapter McKinsey/Gartner-grade Consulting Proposal HTML
 * adopting WorkBuddy's design system & consulting logic
 */
export function generateConsultingHtml(caseData) {
  const companyName = caseData.companyName || '目标客户企业';
  const industry = caseData.industry || '综合制造与服务';
  const reportDate = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });

  // Fallback defaults tailored to case or garment/manufacturing if not populated
  const isGarment = /服|纺|衣|剪|织/.test(industry) || /服|纺|衣|爱帝/.test(companyName);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>${companyName}｜订单交付协同与数据提效诊断报告</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  html, body { margin: 0; padding: 0; background: #ECEEF1; }
  body {
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Heiti SC", sans-serif;
    color: #2B2B2B; font-size: 10pt; line-height: 1.65;
  }
  .page {
    position: relative; width: 210mm; height: 297mm;
    padding: 16mm 16mm 15mm 16mm; background: #FFFFFF;
    overflow: hidden; page-break-after: always; break-after: page;
    margin: 0 auto 10px auto;
  }
  .page:last-child { page-break-after: auto; break-after: auto; }

  /* footer */
  .foot {
    position: absolute; left: 16mm; right: 16mm; bottom: 8mm;
    display: flex; justify-content: space-between; align-items: center;
    font-size: 7.5pt; color: #9AA1AA; border-top: 0.5px solid #DDE1E6; padding-top: 2.5mm;
  }
  .foot .pg { color: #14365C; font-weight: 600; }

  /* cover */
  .cover { padding: 0; }
  .cover-top { height: 96mm; background: #0F2A47; position: relative; padding: 22mm 16mm 0 16mm; }
  .cover-top::after {
    content: ""; position: absolute; left: 16mm; bottom: 0; width: 26mm; height: 3px; background: #C8882E;
  }
  .brand { font-size: 8pt; letter-spacing: 2.5px; color: #8FA6BF; text-transform: uppercase; }
  .cover h1 { margin: 12mm 0 0 0; font-size: 25pt; line-height: 1.35; color: #FFFFFF; font-weight: 700; letter-spacing: 0.5px; }
  .cover h1 span { color: #E0A33C; }
  .cover-sub { margin-top: 6mm; font-size: 11pt; color: #B9C8DA; letter-spacing: 1px; }
  .cover-body { padding: 14mm 16mm 0 16mm; }
  .cover-lead { font-size: 10.5pt; line-height: 1.9; color: #3A3A3A; border-left: 3px solid #C8882E; padding-left: 5mm; }
  .meta { margin-top: 12mm; width: 100%; border-collapse: collapse; font-size: 9pt; }
  .meta td { padding: 3.2mm 0; border-bottom: 0.5px solid #E3E6EA; vertical-align: top; }
  .meta td:first-child { width: 32mm; color: #7A828C; font-weight: 500; }
  .meta td:last-child { color: #2B2B2B; font-weight: 600; }
  .cover-note { position: absolute; left: 16mm; right: 16mm; bottom: 12mm; font-size: 7.5pt; color: #9AA1AA; }

  /* headings */
  h2.sec { margin: 0 0 5mm 0; font-size: 15pt; color: #0F2A47; font-weight: 700; letter-spacing: 0.5px;
           border-bottom: 1.6px solid #0F2A47; padding-bottom: 2.5mm; display: flex; align-items: baseline; gap: 3mm; }
  h2.sec .num { font-size: 9pt; color: #FFFFFF; background: #14365C; padding: 1.2mm 2.6mm; border-radius: 2px; letter-spacing: 1px; font-weight: 600; }
  h3 { margin: 5mm 0 2.5mm 0; font-size: 11pt; color: #14365C; font-weight: 700; }
  h3::before { content: ""; display: inline-block; width: 2.4mm; height: 2.4mm; background: #C8882E; margin-right: 2.4mm; vertical-align: middle; }
  p { margin: 0 0 2.6mm 0; text-align: justify; }

  /* helpers */
  .lead { font-size: 10.5pt; color: #333; }
  .muted { color: #6B7280; font-size: 8.5pt; }
  strong { color: #0F2A47; }
  .hl { background: #FDF4E6; padding: 0 .8mm; border-radius: 2px; }

  .box { background: #F5F7F9; border-left: 3px solid #14365C; padding: 4mm 5mm; margin: 3.5mm 0; }
  .box.accent { border-left-color: #C8882E; background: #FDF9F2; }
  .box .t { font-size: 9pt; font-weight: 700; color: #0F2A47; margin-bottom: 1.5mm; letter-spacing: .5px; }

  .kv { display: flex; gap: 3mm; margin: 3mm 0; }
  .kv > div { flex: 1; background: #F5F7F9; padding: 4mm; border-top: 2px solid #14365C; }
  .kv > div .n { font-size: 8pt; color: #7A828C; letter-spacing: 1px; }
  .kv > div .v { font-size: 14pt; font-weight: 700; color: #0F2A47; line-height: 1.3; margin-top: 1mm; }
  .kv > div .d { font-size: 8pt; color: #5A626B; margin-top: 1.5mm; }

  /* layers */
  .layer { display: flex; align-items: stretch; margin: 1.6mm 0; background: #F5F7F9; }
  .layer .tag { width: 22mm; display: flex; align-items: center; justify-content: center; font-size: 8.5pt; font-weight: 700; color: #FFF; letter-spacing: 1px; }
  .layer .txt { flex: 1; padding: 3mm 4mm; font-size: 8.8pt; line-height: 1.6; }
  .l1 .tag { background: #0F2A47; } .l2 .tag { background: #2E5A88; } .l3 .tag { background: #6D90B4; }

  /* tables */
  table.t { width: 100%; border-collapse: collapse; font-size: 8pt; margin: 3mm 0; }
  table.t th { background: #0F2A47; color: #FFF; font-weight: 600; text-align: left; padding: 2.2mm 2.4mm; border: 0.5px solid #0F2A47; font-size: 8pt; letter-spacing: .3px; }
  table.t td { padding: 2.1mm 2.4mm; border: 0.5px solid #DFE3E8; vertical-align: top; line-height: 1.5; }
  table.t tbody tr:nth-child(even) td { background: #F7F8FA; }
  table.t td.c { text-align: center; }
  table.t.sm { font-size: 7.4pt; }
  table.t.sm th { padding: 1.8mm 1.8mm; font-size: 7.4pt; }
  table.t.sm td { padding: 1.7mm 1.8mm; }
  .chip { display: inline-block; background: #E8EDF3; color: #14365C; font-size: 7pt; padding: .4mm 1.4mm; border-radius: 2px; margin-right: 1mm; }

  ul { margin: 1.5mm 0 2.5mm 0; padding-left: 5mm; }
  li { margin-bottom: 1.4mm; }

  /* toc */
  .toc { list-style: none; padding: 0; margin: 4mm 0 0 0; }
  .toc li { display: flex; align-items: baseline; border-bottom: 0.4px dotted #C9CFD6; padding: 3.4mm 0; font-size: 10pt; }
  .toc li .k { width: 12mm; color: #C8882E; font-weight: 700; font-size: 9pt; }
  .toc li .v { flex: 1; color: #2B2B2B; }
  .toc li .sub { font-size: 7.8pt; color: #8A929C; margin-left: 3mm; }

  /* bottleneck card */
  .bn { border: 0.5px solid #DFE3E8; border-top: 2.5px solid #14365C; padding: 4mm 4.5mm; margin-bottom: 3.4mm; }
  .bn .hd { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2mm; }
  .bn .hd .ttl { font-size: 10pt; font-weight: 700; color: #0F2A47; }
  .bn .hd .pri { font-size: 7.4pt; padding: .6mm 2mm; border-radius: 2px; color: #FFF; background: #C8882E; letter-spacing: .5px; }
  .bn .row { display: flex; font-size: 8.3pt; margin-bottom: 1.6mm; }
  .bn .row .lb { width: 20mm; color: #7A828C; flex-shrink: 0; }
  .bn .row .ct { flex: 1; }
  .grid2 { display: flex; gap: 4mm; }
  .grid2 > div { flex: 1; }
</style>
</head>
<body>

<!-- ============ 00 封面 ============ -->
<div class="page cover">
  <div class="cover-top">
    <div class="brand">ENTERPRISE EFFICIENCY &amp; AI DIAGNOSTIC PROPOSAL</div>
    <h1>端到端交付协同<br>与数据提效<span>诊断建议书</span></h1>
    <div class="cover-sub">${companyName} · 流程痛点诊断与数字化改进方案</div>
  </div>
  <div class="cover-body">
    <div class="cover-lead">
      企业的生产制造与业务交付能力本身已经成熟，真正的效率损耗往往发生在部门与部门之间的信息交接处。<br>
      本方案沿着主营业务交付主线，系统化识别跨部门协同断点，并给出分阶段、极低风险的落地改进路径。
    </div>
    <table class="meta">
      <tr><td>服务客户</td><td>${companyName}</td></tr>
      <tr><td>所属赛道</td><td>${industry}</td></tr>
      <tr><td>诊断主线</td><td>需求承接 → 计划排产 → 生产执行 → 品控质检 → 交付发货 → 财务对账</td></tr>
      <tr><td>核心结论</td><td>三大跨部门协同瓶颈、三个 AI 与自动化赋能场景、四阶段敏捷演进路径</td></tr>
      <tr><td>方案编制</td><td>武汉仓藤科技</td></tr>
      <tr><td>报告版本</td><td>V1.0 对外交付版（严格保密）</td></tr>
      <tr><td>出具日期</td><td>${reportDate}</td></tr>
    </table>
  </div>
  <div class="cover-note">本建议书基于企业公开经营公开信息与行业实证研报编制，聚焦流程与协同层面的效率提升，具体量化数值以第一阶段脱敏样本盘点校准为准。</div>
</div>

<!-- ============ 目录 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">CONTENTS</span>目　录</h2>
  <ul class="toc">
    <li><span class="k">01</span><span class="v">执行摘要<span class="sub">三层损耗结构 · 核心判断 · 建议路径</span></span></li>
    <li><span class="k">02</span><span class="v">行业背景：传统制造正在经历的三重转变<span class="sub">订单结构 / 竞争门槛 / 交付要求</span></span></li>
    <li><span class="k">03</span><span class="v">业务全景：端到端交付主流程标准矩阵<span class="sub">产业链位置 · 六阶段流程与协同机会点</span></span></li>
    <li><span class="k">04</span><span class="v">数字化现状：系统覆盖率 ≠ 数据贯通率<span class="sub">保护现有 IT 投资 · 建设数据连接层</span></span></li>
    <li><span class="k">05</span><span class="v">关键岗位协同现状与效率矩阵<span class="sub">决策层 / 协同层 / 一线执行层</span></span></li>
    <li><span class="k">06</span><span class="v">三个核心管理瓶颈深度剖析<span class="sub">进度协同 · 日报汇编 · 需求交接</span></span></li>
    <li><span class="k">07</span><span class="v">改进方向与场景化赋能方案<span class="sub">三大场景 · 架构与落地成效</span></span></li>
    <li><span class="k">08</span><span class="v">建议实施路径与 1-2 周轻量 PoC<span class="sub">四阶段 · 阶段成果 · 三条实施原则</span></span></li>
    <li><span class="k">09</span><span class="v">预期成效与价值归属<span class="sub">现状 → 目标量化对照表</span></span></li>
    <li><span class="k">10</span><span class="v">下一步建议与行动计划<span class="sub">联合工作坊 · 三项准备事项</span></span></li>
    <li><span class="k">附</span><span class="v">研究依据与说明</span></li>
  </ul>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">02</span></div>
</div>

<!-- ============ 01 执行摘要 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">01</span>执行摘要</h2>
  <p class="lead">${companyName} 在行业中具有深厚的业务积淀与供应链能力。随着存量市场竞争加剧，企业必须在<strong>品质稳定性、规模化交付、多批次柔性响应</strong>三条战线上同时保持核心竞争力——而三条战线的共同底座，是订单从接单到交付的<strong>信息贯通能力</strong>。</p>

  <h3>一个核心判断</h3>
  <div class="box accent">
    <div class="t">效率损耗集中在"交接处"，而非"能力端"</div>
    企业自身的制造与业务能力已经成熟，真正的效率损耗发生在部门与部门之间的信息交接处。这一判断决定了数字化升级的方向：不必推倒重来，而是在现有系统之上叠加轻量连接层。
  </div>

  <h3>损耗的三个层次</h3>
  <div class="layer l1"><div class="tag">决策层</div><div class="txt">经营数据经"一线 → 主管 → 总监 → 决策层"逐级手工汇编后上报，管理层看到的是滞后的经营快报，对交期延误与物料短缺缺乏事前预警，只能在问题暴露后救火协调。</div></div>
  <div class="layer l2"><div class="tag">协同层</div><div class="txt">进度与变更信息主要依赖群消息与口头传递，台账靠人工维护，变更到达执行端存在时滞，已排产的工单因此发生返工。</div></div>
  <div class="layer l3"><div class="tag">执行层</div><div class="txt">一线数据需在多个系统之间复制粘贴、手工对齐，重复劳动占用了大量本可用于异常处理与质量拦截的时间。</div></div>

  <h3>由此产生的共同结果</h3>
  <div class="box">
    管理层与核心骨干的时间，被大量消耗在<span class="hl">数据搬运与进度催收</span>上，而不是<span class="hl">产能优化与异常根因分析</span>上。
  </div>

  <h3>我们的建议</h3>
  <p>不是"上一套沉重的大系统"，而是沿着订单交付主线，按 <strong>先标准化 → 再自动化 → 最后智能化</strong> 的顺序分步走，优先切入见效最快、体感最强的对账与日报自动化环节，用一个季度内可见的成果建立组织信心，再逐步向协同流转与需求结构化延伸。</p>

  <div class="kv">
    <div><div class="n">日报 / 对账耗时</div><div class="v">1—2小时 → 15分钟</div><div class="d">多源手工导表合并自动完成</div></div>
    <div><div class="n">数据实时性</div><div class="v">日级 → 小时级</div><div class="d">经营看板按需自动刷新</div></div>
    <div><div class="n">异常响应</div><div class="v">事后救火 → 事前预警</div><div class="d">阈值预警驱动管理主动干预</div></div>
  </div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">03</span></div>
</div>

<!-- ============ 02 行业背景 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">02</span>行业背景：三重转变</h2>
  <p>理解企业的管理课题，需要先看清行业正在发生的结构性变化。这些变化不是趋势预测，而是已经发生、并正在重塑竞争格局的现实。</p>

  <h3>正在发生的三重转变</h3>
  <table class="t">
    <thead><tr><th style="width:26mm">变化维度</th><th style="width:62mm">过去</th><th>现在</th></tr></thead>
    <tbody>
      <tr><td><strong>订单结构</strong></td><td>大批量、长交期为主</td><td>小单快反、多批次、多渠道并行履约</td></tr>
      <tr><td><strong>竞争门槛</strong></td><td>单纯拼产能规模与硬件成本</td><td>供应链敏捷性 + 全链路数据透明度</td></tr>
      <tr><td><strong>交付要求</strong></td><td>按部就班按计划交期交付</td><td>交期持续压缩，变更与插单成为常态</td></tr>
    </tbody>
  </table>

  <h3>由此产生的四项经营压力</h3>
  <div class="kv" style="margin-bottom:2mm">
    <div><div class="n">PRESSURE 01</div><div class="v" style="font-size:11pt">原料价格周期波动</div><div class="d">原材料与外协成本波动，采购与排产协同精度直接决定利润</div></div>
    <div><div class="n">PRESSURE 02</div><div class="v" style="font-size:11pt">人工成本刚性上行</div><div class="d">劳动力密集特征减弱，单位人工成本刚性上行，倒逼人效提升</div></div>
  </div>
  <div class="kv">
    <div><div class="n">PRESSURE 03</div><div class="v" style="font-size:11pt">库存与备料平衡风险</div><div class="d">多渠道订单并行，呆滞料与成品库存的平衡难度显著上升</div></div>
    <div><div class="n">PRESSURE 04</div><div class="v" style="font-size:11pt">交付时效极致压缩</div><div class="d">下游快反生态形成倒逼，响应与流转速度成为差异化门槛</div></div>
  </div>

  <h3>行业演进方向</h3>
  <p>柔性敏捷制造、供应链全链路透明化、业财一体化自动对账——三个方向指向同一个结论：<strong>未来的竞争，是数据流转速度与协同精度的竞争。</strong>谁能更快地把一线的真实状态传递给决策层，谁就能更早一步做出正确调整。</p>

  <div class="box accent">
    <div class="t">对企业数字化升级的启示</div>
    已建成的生产产线与信息化园区硬件投入，需要一个与之匹配的<strong>数据流转层</strong>来释放价值。本次诊断正是围绕这一层展开——不是增加多余的系统负担，而是让已有系统真正连起来。
  </div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">04</span></div>
</div>

<!-- ============ 03 业务全景 ============ -->
<div class="page" id="p5">
  <h2 class="sec"><span class="num">03</span>业务全景：端到端交付主流程</h2>
  <h3>3.1 产业链位置与核心流转</h3>
  <p>企业处于产业链<strong>中游核心交付与运营环节</strong>，承接上游原材料与资源输入，面向下游全渠道客户完成履约，天然是信息汇聚与分发的中枢。</p>
  <table class="t">
    <thead><tr><th style="width:24mm">产业链环节</th><th>核心构成与业务输入</th></tr></thead>
    <tbody>
      <tr><td><strong>上游输入</strong></td><td>供应商采购、外协加工、技术工艺规范、客户原始需求工单</td></tr>
      <tr><td><strong>中游主体</strong></td><td><strong>${companyName}</strong>：需求评审 → 生产排产 → 工艺加工 → 质检验收 → 包装入库</td></tr>
      <tr><td><strong>下游交付</strong></td><td>品牌专卖渠道、电商平台履约、B端客户批量交付与结算对账</td></tr>
    </tbody>
  </table>

  <h3>3.2 六阶段业务流程标准矩阵与协同机会点</h3>
  <table class="t sm">
    <thead><tr>
      <th style="width:9mm">阶段</th><th style="width:24mm">业务流程</th><th style="width:32mm">责任岗位</th>
      <th style="width:36mm">核心动作</th><th style="width:38mm">输入 → 输出</th><th>协同机会点</th>
    </tr></thead>
    <tbody>
      <tr><td class="c">1</td><td><strong>需求承接与评审</strong></td><td>业务发起人 → 执行部门</td><td>接收客户需求，评审产能与交期</td><td>客户需求单据、沟通记录 → 确认后的需求单与交期计划</td><td>需求传递以微信群或口头为主，缺少标准化表单，执行端对工艺与数量存在理解偏差空间</td></tr>
      <tr><td class="c">2</td><td><strong>方案设计与排产</strong></td><td>项目经理 → PMC / 车间</td><td>工艺拆解、下达排产工单、分配产线</td><td>项目管理表格、ERP → 生产工单、物料需求清单</td><td>业务变更流转存在时滞，工单下发后临时修改易导致排产返工</td></tr>
      <tr><td class="c">3</td><td><strong>生产制造执行</strong></td><td>车间主管 → 一线工人</td><td>按工单领料、加工作业、进度推进</td><td>ERP 工单明细、流转单 → 在制品、日产进度</td><td>进度通过微信群文字汇报，格式不一，需人工二次整理入台账</td></tr>
      <tr><td class="c">4</td><td><strong>质检与入库审核</strong></td><td>质检员 → 车间负责人</td><td>成品检验、返工判定、入库审核</td><td>质检标准文档、ERP → 质检报告、成品入库单</td><td>次品返工数据与原工单脱节，难以实时掌握真实交付损耗</td></tr>
      <tr><td class="c">5</td><td><strong>交付与物流发货</strong></td><td>交付主管 → 仓储 / 物流</td><td>订单合并、拣选、打包、物流对接</td><td>ERP 发货模块、物流系统 → 发货单、物流单号</td><td>交期变更需跨部门逐层通知，存在漏看消息导致的错发漏发</td></tr>
      <tr><td class="c">6</td><td><strong>复盘与数据对账</strong></td><td>数据对账员 → 运营总监</td><td>汇总各系统数据，核对产量与损耗</td><td>各业务后台、Excel / WPS → 每日交付进度、对账单</td><td>人工合并多表每日耗时 1—2 小时，数据滞后且易出错</td></tr>
    </tbody>
  </table>

  <h3>流程层面的两个结构性课题</h3>
  <div class="grid2">
    <div class="box"><div class="t">课题一 · 变更链路与排产链路分离</div>需求变更是现代制造的常态，但变更的传递路径与排产指令的下达路径通常是两条独立链路，二者的时间差就是返工成本的来源。</div>
    <div class="box accent"><div class="t">课题二 · 多渠道订单归集依赖人工</div>不同销售渠道的订单编码与排产规则不同，合并排产时的数据归集过度依赖计划员个人经验。</div>
  </div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">05</span></div>
</div>

<!-- ============ 04 数字化现状 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">04</span>数字化现状与核心课题</h2>
  <table class="t">
    <thead><tr><th style="width:28mm">维度</th><th>现状事实与诊断发现</th></tr></thead>
    <tbody>
      <tr><td><strong>主营业务模式</strong></td><td>自主研发设计、全渠道销售与大型品牌制造交付并存</td></tr>
      <tr><td><strong>数字化基础设施</strong></td><td>已部署核心业务系统（OA、ERP 等），具备信息化操作底座</td></tr>
      <tr><td><strong>当前核心课题</strong></td><td>跨部门数据仍依赖 Excel 手工打通——“系统已有，数据仍需人工搬运”</td></tr>
      <tr><td><strong>协作沟通机制</strong></td><td>企业微信/工作群承担了大量突发变更与日常催办，非结构化信息难以沉淀</td></tr>
    </tbody>
  </table>

  <h3>一个需要澄清的常见误解</h3>
  <div class="box accent">
    <div class="t">系统覆盖率 ≠ 数据贯通率</div>
    企业已完成核心系统的基础部署，信息化基础设施是健全的；当前的效率损耗不在“有没有系统”，而在<strong>系统与系统之间、系统与人之间仍依赖人工搬运与手工核对</strong>。
  </div>
  <p>这一判断直接决定了投入策略：<strong>数字化提效不必推倒重来</strong>，可以在现有系统基础设施之上叠加自动化连接层，投入更轻、见效更快、对一线作业扰动趋近于零。</p>

  <h3>岗位层级痛点归纳</h3>
  <div class="kv">
    <div><div class="n">决策层痛点</div><div class="v" style="font-size:12pt">数据滞后</div><div class="d">依赖逐级手工报表，缺乏事前预警</div></div>
    <div><div class="n">协同层痛点</div><div class="v" style="font-size:12pt">群消息泥潭</div><div class="d">进度台账人工维护，变更容易脱节</div></div>
    <div><div class="n">执行层痛点</div><div class="v" style="font-size:12pt">重复搬运</div><div class="d">多系统复制粘贴，枯燥且易错行</div></div>
  </div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">06</span></div>
</div>

<!-- ============ 05 关键岗位协同 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">05</span>关键岗位协同现状</h2>
  <h3>5.1 岗位协同与效率矩阵</h3>
  <table class="t sm">
    <thead><tr>
      <th style="width:30mm">岗位层级与名称</th><th style="width:34mm">核心职责</th><th style="width:40mm">当前高频重复手工动作</th>
      <th style="width:26mm">主要工具栈</th><th style="width:26mm">主要输出物</th><th>效率提升空间</th>
    </tr></thead>
    <tbody>
      <tr><td><strong>业务 / 运营总监</strong><br><span class="chip">管理协同层</span></td><td>统筹交付达成；审核跨部门交付物；处理异常升级</td><td>催收各组日报；多系统导出表格手工合并；协调紧急插单</td><td>OA / ERP、Excel汇总表、工作沟通群</td><td>部门运营日报、异常协调单</td><td>从数据汇编中释放时间，投向产能优化与异常根因分析</td></tr>
      <tr><td><strong>项目经理 / 交付主管</strong><br><span class="chip">管理协同层</span></td><td>监控工单排期与节点；对接客户需求与排产计划</td><td>人工维护进度台账；群内催办交付物；传递客户变更</td><td>项目表格、ERP、企业微信</td><td>项目进度台账、变更通知单</td><td>台账自动更新，变更一键同步触达执行端</td></tr>
      <tr><td><strong>计划调度员 (PMC)</strong><br><span class="chip">管理协同层</span></td><td>编制排产计划、物料进度跟进、工单下达</td><td>核对库存与工单需求；手工排班推算；催办物料入库</td><td>ERP、各类Excel排产表</td><td>排产计划表、物料缺料清单</td><td>物料到货信息实时同步，减少排产反复调整</td></tr>
      <tr><td><strong>数据对账员</strong><br><span class="chip">一线执行层</span></td><td>日常数据录入；流水核对与基础报表制作</td><td>从多个后台下载表格手动清洗合并；跨系统复制粘贴</td><td>各业务后台、Excel/WPS、沟通群</td><td>对账明细表、系统核销记录</td><td>重复合并工作自动化，消除错行与漏对</td></tr>
      <tr><td><strong>质检员 / 审核专员</strong><br><span class="chip">一线执行层</span></td><td>工序质量检验、返工与报废登记</td><td>纸质记录缺陷信息；集中录入系统；翻找历史工艺单</td><td>质检单、ERP系统、工艺文档</td><td>质检日报、返工通知单</td><td>移动端便捷录入，批量次品即时预警</td></tr>
      <tr><td><strong>采购与跟单专员</strong><br><span class="chip">一线执行层</span></td><td>物料采购跟进、供应商交期核实、对账</td><td>翻看沟通记录核对单价；手工录入单据；多表比对</td><td>ERP采购模块、沟通群、Excel</td><td>采购订单、入库凭证、对账单</td><td>交期线上化流转，数据直接支撑排产决策</td></tr>
    </tbody>
  </table>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">07</span></div>
</div>

<!-- ============ 05 续 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">05</span>关键岗位协同现状（续）</h2>

  <h3>5.2 决策层：从"滞后数据"到"实时洞察"</h3>
  <p><strong>总经理 / 业务分管副总</strong>面临的典型挑战是：汇报链路长（一线 → 主管 → 总监 → 决策层），且每一级都存在手工汇编环节。结果是决策层看到的经营快报往往反映的是前一天甚至更早的状态，对交期延误风险与物料短缺卡点缺乏事前预警机制，只能在问题爆发后出面扑火协调。</p>
  <div class="box">
    <div class="t">改进方向</div>
    建立面向高管层的数字化经营看板，数据自动汇聚、按小时自动刷新，并对交期风险与物料缺口设置智能阈值预警，将管理动作从<strong>事后救火</strong>前移到<strong>事中精准干预</strong>。
  </div>

  <h3>5.3 协同层：从"信息中继站"到"流程驱动引擎"</h3>
  <p><strong>业务总监与项目经理</strong>当前承担了大量数据搬运与微信催办工作：每天耗费大量时间催收日报、从多套系统导出表格手工用 Excel VLOOKUP 汇总，由于数据不同步，难以实时掌握车间的真实交付损耗与工序进度。</p>
  <div class="box accent">
    <div class="t">改进方向</div>
    引入工单流转助手与台账自动化同步引擎，将日常群聊中的文字进度与变更指令自动解析并回填台账，减少 80% 的人工催办，让管理骨干聚焦异常原因分析。
  </div>

  <h3>5.4 执行层：从"枯燥复制粘贴"到"高价值异常处理"</h3>
  <p><strong>一线对账员与文员</strong>每天在各个系统界面之间来回切换，机械地将订单数据复制到 Excel，再把 Excel 导入到另一个后台，重复繁琐且极易因疲倦产生错行。一旦发生客诉，溯源单据往往需要翻查几百条聊天记录。</p>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">08</span></div>
</div>

<!-- ============ 06 三个核心管理瓶颈 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">06</span>三个核心管理瓶颈深度剖析</h2>

  <div class="bn">
    <div class="hd">
      <span class="ttl">瓶颈一 · 进度协同高度依赖群聊催办，变更存在时滞</span>
      <span class="pri">PRIORITY 01</span>
    </div>
    <div class="row"><div class="lb">现象描述</div><div class="ct">生产进度与排期异常主要在微信工作群内零散上报，项目经理需人工翻找群记录更新台账；客户发生工艺或数量变更时，信息跨部门流转不及时。</div></div>
    <div class="row"><div class="lb">结构性根因</div><div class="ct">沟通渠道（微信）与数据载体（ERP/台账）彼此孤立，缺乏双向同步机制。</div></div>
    <div class="row"><div class="lb">业务影响</div><div class="ct">工单已下发车间甚至已开裁才收到变更通知，导致面料浪费与工时返工。</div></div>
  </div>

  <div class="bn">
    <div class="hd">
      <span class="ttl">瓶颈二 · 管理层日报多系统手工汇编，耗时且数据滞后</span>
      <span class="pri">PRIORITY 02</span>
    </div>
    <div class="row"><div class="lb">现象描述</div><div class="ct">管理人员每天需耗费 1-2 小时从多套后台分别导出 CSV/Excel，手动清洗、比对口径后合并为部门运营日报。</div></div>
    <div class="row"><div class="lb">结构性根因</div><div class="ct">系统间主数据字段映射关系不统一，未建立自动化数据管道与抽取机制。</div></div>
    <div class="row"><div class="lb">业务影响</div><div class="ct">报表往往次日甚至后天才能成型，管理层无法实时洞察当日真实的次品率与产能瓶颈。</div></div>
  </div>

  <div class="bn">
    <div class="hd">
      <span class="ttl">瓶颈三 · 需求交接缺乏标准化表单，一线执行存在偏差</span>
      <span class="pri">PRIORITY 03</span>
    </div>
    <div class="row"><div class="lb">现象描述</div><div class="ct">业务接单阶段，客户非结构化需求（口头、截图、微信聊天）直接发往生产端，关键工艺参数与交期约定容易漏记。</div></div>
    <div class="row"><div class="lb">结构性根因</div><div class="ct">缺乏前端轻量化的工单收集与结构化转换工具，录入成本高导致业务人员习惯于口头沟通。</div></div>
    <div class="row"><div class="lb">业务影响</div><div class="ct">执行端按旧经验施工，最终交付时与客户原始诉求发生偏差，引发客诉与延期。</div></div>
  </div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">09</span></div>
</div>

<!-- ============ 07 改进方向与场景 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">07</span>改进方向与场景化赋能方案</h2>
  <p>针对上述三大瓶颈，我们建议采用<strong>“轻量连接层”</strong>架构，不更换现有 ERP/OA，通过 3 个针对性场景快速实现赋能。</p>

  <h3>场景 1：多源数据自动化聚合与决策日报生成 (RPA + 数据集成)</h3>
  <div class="box accent">
    <div class="t">定位：首期必做，见效最快</div>
    通过自动化机器人或中间管道，定时从各系统拉取最新流水，自动按预设规则清洗对齐，一键生成管理层日报与对账底稿。
  </div>
  <table class="t">
    <tr><th style="width:25mm">维度</th><th>具体设计</th></tr>
    <tr><td><strong>目标岗位</strong></td><td>运营总监、数据对账员、业务核算主管</td></tr>
    <tr><td><strong>业务价值</strong></td><td>将每日 1-2 小时的导表合并动作压缩至 10 分钟自动完成，数据时效性提升至准实时。</td></tr>
    <tr><td><strong>所需条件</strong></td><td>提供常用 Excel 报表样张（脱敏）及系统现有导出权限，无需系统源码改造。</td></tr>
  </table>

  <h3>场景 2：基于语义解析的进度协同与异常预警 (NLP + 协同引擎)</h3>
  <table class="t">
    <tr><th style="width:25mm">维度</th><th>具体设计</th></tr>
    <tr><td><strong>功能定义</strong></td><td>自动抓取群聊中的进度汇报与异常标记，结构化写入台账，异常自动@责任人。</td></tr>
    <tr><td><strong>业务价值</strong></td><td>释放项目经理 80% 的催单拉扯时间，变更指令 5 分钟内触达车间，减少返工。</td></tr>
  </table>

  <h3>场景 3：非结构化需求智能解析与工单校验 (AI/OCR 辅助)</h3>
  <table class="t">
    <tr><th style="width:25mm">维度</th><th>具体设计</th></tr>
    <tr><td><strong>功能定义</strong></td><td>将销售发在群里的图文需求自动解析为包含“款号、面料、数量、交期”的标准单据草稿。</td></tr>
    <tr><td><strong>业务价值</strong></td><td>降低录单门槛，杜绝关键参数遗漏，工单录入效率提升 3 倍以上。</td></tr>
  </table>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">10</span></div>
</div>

<!-- ============ 08 建议实施路径 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">08</span>建议实施路径与 1-2 周轻量 PoC</h2>
  <p>数字化升级最忌“大而全、久拖不决”。我们建议采用敏捷四阶段演进模型：</p>

  <table class="t">
    <thead><tr><th style="width:26mm">阶段划分</th><th style="width:26mm">周期</th><th style="width:60mm">核心动作</th><th>阶段交付物</th></tr></thead>
    <tbody>
      <tr><td><strong>第一阶段<br>轻量 PoC</strong></td><td>1—2 周</td><td>选定 1 个痛点（如日报自动生成），使用 10-20 份脱敏样本进行离线效果验证</td><td>《脱敏样本实测效果对比与 ROI 评估报告》、可体验的原型</td></tr>
      <tr><td><strong>第二阶段<br>重点突破</strong></td><td>1—2 个月</td><td>场景 1 正式上线，在 1 个车间或业务单元跑通，完成主数据字段对齐</td><td>自动化日报与对账模块正式运行，单人日均省时 1.5 小时</td></tr>
      <tr><td><strong>第三阶段<br>全面协同</strong></td><td>3—4 个月</td><td>推进场景 2 进度协同上线，连接销售、PMC 与车间，实现变更闭环</td><td>跨部门敏捷协同网络，排产返工率下降 30% 以上</td></tr>
      <tr><td><strong>第四阶段<br>持续演进</strong></td><td>半年以后</td><td>沉淀企业私域交付知识库，推进场景 3 需求解析，实现预测性排产</td><td>企业智能协同决策中枢</td></tr>
    </tbody>
  </table>

  <h3>推进遵循的三条核心原则</h3>
  <div class="grid2">
    <div class="box"><div class="t">原则一 · 保护既有投资</div>坚决不在现有系统未释放价值前盲目推倒重来，优先做连接与赋能。</div>
    <div class="box accent"><div class="t">原则二 · 达标才进入下一阶段</div>PoC 准确率达到预期方可推进，不达预期随时终止，零沉没试错成本。</div>
  </div>
  <div class="box"><div class="t">原则三 · 对一线操作习惯零侵入</div>优先优化后台数据流，不强迫一线工人改变既有生产习惯。</div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">11</span></div>
</div>

<!-- ============ 09 预期成效 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">09</span>预期成效与价值归属</h2>
  <table class="t">
    <thead><tr><th style="width:34mm">关键业务维度</th><th style="width:64mm">当前现状状态</th><th>改进后预期成效目标</th></tr></thead>
    <tbody>
      <tr><td><strong>日报 / 对账耗时</strong></td><td>每日耗费 1—2 小时手工导表拼接</td><td>10—15 分钟内全自动生成产出</td></tr>
      <tr><td><strong>数据实时性</strong></td><td>日级滞后（通常只能看昨天的报表）</td><td>小时级自动刷新，数据准实时可查</td></tr>
      <tr><td><strong>进度台账维护</strong></td><td>人工翻找群消息转录，容易遗漏</td><td>自动采集流转，结构化沉淀入库</td></tr>
      <tr><td><strong>需求变更传递</strong></td><td>口头与微信文字，容易发生理解偏差</td><td>标准化结构表单，参数要素完整</td></tr>
      <tr><td><strong>异常协同响应</strong></td><td>问题爆发甚至客户投诉后出面协调</td><td>阈值预警事前介入，将损失化解于萌芽</td></tr>
      <tr><td><strong>管理层时间结构</strong></td><td>大量精力消耗在机械的数据搬运与催单</td><td>释放核心时间投向产能优化与品质根因</td></tr>
    </tbody>
  </table>

  <h3>价值落点的三层归属</h3>
  <div class="kv">
    <div><div class="n">决策层价值</div><div class="v" style="font-size:11pt">看得见当下</div><div class="d">经营看板小时级刷新，交期与物料风险提前预警，决策从滞后转向实时</div></div>
    <div><div class="n">协同层价值</div><div class="v" style="font-size:11pt">管得住过程</div><div class="d">台账自动更新，变更一键触达，减少催单拉扯与排产返工带来的内耗</div></div>
    <div><div class="n">执行层价值</div><div class="v" style="font-size:11pt">少做重复工</div><div class="d">一次录入、自动归集，把时间还给生产异常排查与工艺品质拦截</div></div>
  </div>

  <div class="box accent" style="margin-top:6mm">
    <div class="t">一句话总结</div>
    本方案不改变企业的制造能力，而是释放它——把被机械数据搬运占用的管理时间还回来，把被信息滞后掩盖的生产异常提前暴露出来，让现有的系统投入产生最大贯通价值。
  </div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">12</span></div>
</div>

<!-- ============ 10 下一步 ============ -->
<div class="page">
  <h2 class="sec"><span class="num">10</span>下一步建议与行动计划</h2>
  <p>我们建议以<strong>一场半天的轻量联合工作坊</strong>启动合作，双方共同完成以下三项准备，即可无缝进入第一阶段验证：</p>
  <div class="box">
    <div class="t">准备一 · 业务系统现状盘点</div>
    明确 ERP、OA 等现有系统的产品版本与数据导出机制，确定首期取数路径（API 对接或脱敏表格定时导出）。
  </div>
  <div class="box">
    <div class="t">准备二 · 核心台账字段梳理</div>
    汇总业务在用 Excel 表格的具体字段，建立主数据映射口径（如款号、规格、批次号统一对齐规则）。
  </div>
  <div class="box">
    <div class="t">准备三 · 进度汇报机制确认</div>
    确认当前车间与执行端的进度汇报频次、渠道与关键报备点，作为流程自动化的基线。
  </div>
  <p>工作坊结束后，武汉仓藤科技团队将在 7 个工作日内输出第一阶段验证原型与实测效果报告。</p>

  <h2 class="sec" style="margin-top:9mm"><span class="num">附</span>研究依据与说明</h2>
  <table class="t">
    <thead><tr><th style="width:56mm">资料来源依据</th><th>支持推演的业务结论</th></tr></thead>
    <tbody>
      <tr><td>企业公开岗位编制与招聘要求</td><td>业务总监、项目经理、数据对账员等核心岗位的日常高频任务、常用工具栈与协同断点</td></tr>
      <tr><td>企业工商档案与公开信息</td><td>主营业务模式、企业规模、数字化转型战略规划与重点项目</td></tr>
      <tr><td>行业公开研究与权威统计</td><td>行业上下游关系、小单快反演进压力、典型人效与流转效率基准</td></tr>
    </tbody>
  </table>
  <div class="box accent" style="margin-top:8mm">
    <div class="t">方案出具机构</div>
    <strong>武汉仓藤科技 · 企业数字化咨询与工程交付团队</strong><br>
    我们期待与客户决策团队就首期 PoC 切口场景的优先级与落地节奏展开深入探讨。
  </div>
  <div class="foot"><span>${companyName} · 交付协同与数据提效诊断报告</span><span class="pg">13</span></div>
</div>

</body>
</html>`;
}
