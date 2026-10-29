import { CaseSession } from '../types';

export const CASE_PRESETS: Partial<CaseSession>[] = [
  {
    title: '宁波某汽车零部件制造有限公司 - FDE售前诊断',
    industry: '汽车零部件与高精度制造',
    companyName: '宁波精工精密汽车零部件股份有限公司',
    website: 'https://example-autoparts.com',
    region: '浙江宁波',
    coreBusiness: '汽车发动机高压共轨系统铝铸件、底盘结构件，主要客户为上汽、比亚迪及造车新势力',
    contactRole: '生产运营副总裁 / 兼制造部总监',
    meetingGoal: '首次技术交流：围绕主机厂高频工程变更（ECN）、柔性换模排产与品质追溯痛点切入，建立业务信任，争取下周产线半天调研',
    backgroundNotes: '主机厂每月下发工程变更30+次，图纸通过微信群和邮件流转，老版本仍在装配造成呆料与报废；车间主干线换模耗时长，Excel人工排产难以权衡模具寿命与急单；质检员抽检疲劳，微小气孔偶发流出引起主机厂警示。',
    currentStep: 1,
  },
  {
    title: '深圳某跨境消费电子品牌 - FDE售前诊断',
    industry: '跨境电商 / 消费类电子',
    companyName: '深圳驰越数码科技股份有限公司',
    website: 'https://example-crossborder.com',
    region: '广东深圳',
    coreBusiness: '安防摄像头、储能户外电源、智能小家电出海，亚马逊+独立站多渠道',
    contactRole: '跨境业务总经理兼产品总监',
    meetingGoal: '探讨如何从海量海外买家差评（Review）中提取产品质量卡点，以及跨平台退货率高企的逆向物流难题，评估AI分析可行性',
    backgroundNotes: '在美、欧、日有数十个SKU，每周各渠道产生上万条买家评论、客服Ticket。运营团队靠人工翻看周报，往往产品缺陷在海外发酵1个月后研发才知晓；此外不同国家合规认证与海外仓退件核销手工账繁琐。',
    currentStep: 1,
  },
  {
    title: '某知名连锁新茶饮管理集团 - FDE售前诊断',
    industry: '餐饮连锁 / 现制饮品供应链',
    companyName: '茶序餐饮管理（上海）有限公司',
    website: 'https://example-tea.com',
    region: '上海 / 全国门店超2500家',
    coreBusiness: '鲜果茶与轻乳茶连锁，直营+加盟混合模式，拥有全国6大区域中心仓与中央工厂',
    contactRole: '首席运营官（COO）兼供应链总监',
    meetingGoal: '针对鲜果原料高损耗与加盟店订货预测不准切入，验证单店进销存报损痛点，探讨轻量试点方案',
    backgroundNotes: '鲜果保质期极短（3-5天），加盟商普遍习惯凭感觉订货，遇阴雨天极易积压爆损，遇促销日又频频断货；各区域巡店督导只能靠纸质表单和照片打分，品控标准执行走样，跨门店损耗率差异高达8%。',
    currentStep: 1,
  }
];

export const FEEDBACK_PRESETS = [
  {
    label: '场景 A：客户高度确认 ECN 与排产卡点，但否认质检痛点',
    discussedPainPoints: '1. 工程技术变更(ECN)跨部门流转时滞\n2. 小批量高频插单下的排产经验依赖\n3. 质检漏检与追溯',
    clientQuotes: '“你们说的变更确实戳中要害！上个月技术改了螺栓规格，图纸没到采购手上，产线直接干了3天废品，亏了十几万。但是质检这边我们刚上了基恩士的高速光学筛选机，良率99.8%，质检目前不是瓶颈。”',
    confirmedFacts: '1. 确实存在严重的跨部门图纸与BOM版本同步脱节，导致报废\n2. 车间老师傅排产靠脑子，一旦请假没人能接手\n3. 客户对减少呆料返工有极其强烈的迫切性',
    deniedFacts: '1. 质检漏检并非当前主要痛点（已投入重金采购高精度专用光学硬件，短期内无需视觉AI检测）',
    clientData: '目前有用泛微OA和用友U9 ERP，但图纸在企业微信、邮件和局域网FTP各自为战，缺乏单点真相来源。',
    openQuestions: '1. 主机厂给的图纸是3D CAD还是二维PDF/DWG？\n2. 采购下单与库房领料的校验节点到底卡在谁的手里？',
    advisorRequests: '质检方向果断放弃。请深入针对 ECN 跨系统同步与版本校验、排产辅助进行下一轮追问，并给出下周现场调研的脱敏资料清单。'
  },
  {
    label: '场景 B：客户已有复杂ERP但都是数据孤岛，担心数据基础差',
    discussedPainPoints: '全业务流程信息流断点与数据割裂',
    clientQuotes: '“我们系统不少，ERP、MES、WMS都有，但是各干各的，接口全是几年前找外包做的，一堆Bug。大家都说AI好，但我们连基础数据都导不干净，你们能搞得动吗？”',
    confirmedFacts: '1. 存在严重的数据孤岛与多系统重复录入\n2. 客户曾被过度承诺的软件项目坑过，对大而全的系统有防备心\n3. 客户核心关注“低侵入、不折腾现有系统”的轻量化见效方式',
    deniedFacts: '否认目前能直接上一套全新的端到端AI中台，明确表示不愿大改现有ERP底层。',
    clientData: '每天各业务员通过导出Excel表格互相传递，格式不统一。',
    openQuestions: '是否有局部高频环节（如订单核对、报表自动汇编）可以通过轻量脚本或Agent单点切入？',
    advisorRequests: '请指导如何消除客户对“数据基础不好无法上AI”的焦虑，提供不改造系统、直接基于文档/表格交互的单点低风险验证方案。'
  }
];
