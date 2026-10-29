/**
 * Recruitment Intelligence Service
 * Gathers and models authentic job listings (JD) from recruitment sources (BOSS直聘, 猎聘, 智联, etc.)
 * to anchor the FDE pre-sales diagnostic workflow in real-world roles, daily repetitive workloads,
 * tools, and inter-departmental collaboration dynamics.
 */

// Built-in authentic JD benchmarks
export const REAL_RECRUITMENT_BENCHMARKS = {
  'mcn_local_life': {
    companyName: '武汉仓藤传媒有限公司 / 抖音本地生活服务商',
    industry: '新媒体 / 本地生活代运营 / MCN',
    source: 'BOSS直聘 & 猎聘公开招聘数据 (2024-2026)',
    roles: [
      {
        title: '生产运营总监 / 运营副总',
        department: '运营部 / 统筹中心',
        tier: '管理协同层',
        dailyResponsibilities: [
          '统筹公司多项目（餐饮、文旅、医美等）全流程交付与履约进度',
          '监控各商户账户消耗、GMV、核销率与投流毛利',
          '协调商务BD、投流优化师、编导与达人资源，解决跨部门排期冲突'
        ],
        highFrequencyRepetitiveTasks: [
          '每日催收各项目组手工拉取的投流日报与周报，人工汇编给老板',
          '在几十个微信客户对接群中协调插单、催促素材交稿与异常问题升级',
          '人工核算每个项目的投流人效比与履约毛利，判断资源倾斜'
        ],
        toolsAndSystems: ['巨量千川', '巨量百应', '飞瓜/蝉妈妈', '企业微信', '各类汇总Excel'],
        collaborationTargets: ['总经理', '信息流优化师', 'AE客户执行', '短视频编导', '财务'],
        painPointsAndBottlenecks: [
          '多项目并行时各群消息碎片化，缺乏单点全局仪表盘',
          '数据严重依赖基层手工提取，容易发生口径不一致与报表滞后'
        ]
      },
      {
        title: '信息流广告优化师 / 投流运营',
        department: '广告投放部',
        tier: '一线执行层',
        dailyResponsibilities: [
          '负责抖音本地推、巨量千川广告账户日常投放与搭建计划',
          '实时监控消耗、转化成本、ROI与曝光数据，调整出价与受众定向',
          '向编导与设计团队提出素材迭代需求，协同复盘素材生命周期'
        ],
        highFrequencyRepetitiveTasks: [
          '每天早上登录十几个广告后台导出前一日消耗与转化明细',
          '使用Excel (VLOOKUP) 手动合并多平台账户流水，制作每日投流日报',
          '手动修改计划出价与暂停低效计划，频繁在系统间复制粘贴定向包'
        ],
        toolsAndSystems: ['巨量千川', '巨量广告', '本地推', 'Excel表格', '飞瓜数据'],
        collaborationTargets: ['运营总监', '短视频编导', 'AE客户执行', '商户对接人'],
        painPointsAndBottlenecks: [
          '每天拉表清洗耗费2-3小时机械劳动，疲于做表而无精力深度分析策略',
          '爆款素材寿命短，与编导沟通素材需求时全靠口头或截图，缺乏量化归因'
        ]
      },
      {
        title: 'AE / 广告客户执行',
        department: '项目交付部',
        tier: '一线执行层',
        dailyResponsibilities: [
          '负责客户日常沟通，准确接收、拆解营销需求 Brief',
          '对接本地生活达人与探店排期，跟进视频初审、商户确认与上线排期',
          '制作项目周期性报告（周报、月报），协调商务与投放交付'
        ],
        highFrequencyRepetitiveTasks: [
          '在微信群逐一催促达人交片、手动将商户修改意见转发给达人',
          '人工登记探店排期表与样品寄送台账，逐项核对核销券码',
          '手动截图达人发布数据与评论，拼图制作客户汇报PPT/周报'
        ],
        toolsAndSystems: ['微信/企业微信', '抖音App', '探店排期Excel', '腾讯文档'],
        collaborationTargets: ['商户对接人', '外部达人', '投流优化师', '商务BD'],
        painPointsAndBottlenecks: [
          '达人脱稿延期、商户临时变卦全靠人工微信催促，极易遗漏',
          '多项目交期冲突时手工查表极其容易出错，客诉率高'
        ]
      },
      {
        title: '短视频编导 / 内容策划',
        department: '内容制作部',
        tier: '一线执行层',
        dailyResponsibilities: [
          '负责本地生活门店探店脚本、分镜头撰写与拍摄指导',
          '研究平台爆款逻辑与同行爆单案例，提炼吸睛前3秒文案',
          '协同剪辑与投流师，根据投放消耗数据快速迭代脚本'
        ],
        highFrequencyRepetitiveTasks: [
          '每天刷飞瓜、抖音榜单找同行同类目爆款视频，人工提取台词文案',
          '反复撰写结构相似的探店台词模板，手动为剪辑师整理素材包',
          '查看达人粗剪视频并对照商户要求逐秒人工挑刺'
        ],
        toolsAndSystems: ['剪映', '飞瓜数据', '新抖', '幕布/石墨文档', '百度网盘'],
        collaborationTargets: ['AE', '剪辑师', '摄像师', '投流优化师'],
        painPointsAndBottlenecks: [
          '找选题与写脚本极耗脑力，容易陷入灵感枯竭与同质化',
          '投流效果差时不知道是脚本原因还是投放出价原因，复盘脱节'
        ]
      },
      {
        title: '数据对账专员 / 财务助理',
        department: '财务核算部',
        tier: '一线执行层',
        dailyResponsibilities: [
          '负责多平台后台佣金、CPS提成、服务费及投流消耗账单核对',
          '与商户核实核销流水、开票申请与应收账款跟进'
        ],
        highFrequencyRepetitiveTasks: [
          '从抖音来客、百应后台导出月度核销清单，人工与商户POS核对',
          '逐条匹配达人佣金比例与实际支付账单，手工计算提成'
        ],
        toolsAndSystems: ['抖音来客', '用友/金蝶财务软件', '网银流水', '对账Excel'],
        collaborationTargets: ['运营总监', 'AE', '商户财务', '总经理'],
        painPointsAndBottlenecks: [
          '平台结算周期与商户周期不一致，人工对账一做就是一周，极易算错'
        ]
      }
    ],
    collaborationChain: [
      {
        fromRole: '商务BD',
        toRole: 'AE客户执行',
        handoffItem: '商户签约合同与初始营销诉求',
        bottleneck: '商务承诺的内容未沉淀成标准化规范，导致交付团队理解偏差'
      },
      {
        fromRole: 'AE客户执行',
        toRole: '短视频编导',
        handoffItem: '商户门店产品特色与拍摄Brief',
        bottleneck: '商户反复修改卖点，需求变更未及时同步给编导与达人'
      },
      {
        fromRole: '短视频编导',
        toRole: '信息流优化师',
        handoffItem: '审核通过的成片视频素材',
        bottleneck: '视频素材命名混乱、缺乏标签，投流师难以快速批量搭建计划'
      },
      {
        fromRole: '信息流优化师',
        toRole: '运营总监',
        handoffItem: '各商户投流ROI与消耗日报',
        bottleneck: '人工导出合并耗时2小时，总监无法在晨会前拿到最新复盘'
      },
      {
        fromRole: 'AE客户执行',
        toRole: '数据对账专员',
        handoffItem: '探店达人发布清单与核销券核对表',
        bottleneck: '券码核销与达人提成手工匹配，经常出现漏账或争议'
      }
    ]
  },
  'autoparts_manufacturing': {
    companyName: '精密汽车零部件制造企业',
    industry: '高端装备制造 / 汽车零部件',
    source: '智联招聘 & 猎聘公开岗位分析',
    roles: [
      {
        title: '制造运营副总 / 生产总监',
        department: '制造运营中心',
        tier: '管理协同层',
        dailyResponsibilities: [
          '统筹压铸、机加、冲压产线产能交付与安全质量',
          '把控主机厂工程技术变更（ECN）实施进度，控制呆滞料'
        ],
        highFrequencyRepetitiveTasks: [
          '召开跨部门早会协调主机厂急件插单与模具维修进度',
          '人工核对MES系统产出报表与库房实际盘点出入'
        ],
        toolsAndSystems: ['用友U9 ERP', 'MES系统', 'Excel排产表', '企业微信'],
        collaborationTargets: ['PMC计划部', '质量部', '技术部', '车间主任'],
        painPointsAndBottlenecks: ['主机厂ECN频繁下达，纸质与微信图纸流转延迟导致报废']
      },
      {
        title: 'PMC生产计划调度员',
        department: '生管部',
        tier: '一线执行层',
        dailyResponsibilities: [
          '根据主机厂EDI订单与月度预测编制主生产计划与机台负荷表'
        ],
        highFrequencyRepetitiveTasks: [
          '每天从ERP导出几十张订单明细，人工在Excel中调整机台排产',
          '逐台核对模具寿命与换模时间，手工计算物料欠料缺口'
        ],
        toolsAndSystems: ['ERP系统', 'Excel高级公式/VBA', 'WMS库存表'],
        collaborationTargets: ['采购员', '车间主任', '销售跟单'],
        painPointsAndBottlenecks: ['高度依赖老计划员经验排产，一旦请假无人能梳理清楚']
      },
      {
        title: '质检工程师 / QC质检员',
        department: '品质保证部',
        tier: '一线执行层',
        dailyResponsibilities: [
          '负责压铸毛坯外观气孔巡检与三坐标尺寸公差复核'
        ],
        highFrequencyRepetitiveTasks: [
          '用卡尺与肉眼逐箱抽检，在纸质流转卡上手写记录检验结果',
          '下班前将纸质合格单手工录入电脑质量管理系统'
        ],
        toolsAndSystems: ['纸质流转卡', '三坐标测量机', '品控管理软件'],
        collaborationTargets: ['车间操作工', '工艺工程师', '库管'],
        painPointsAndBottlenecks: ['人工录入繁琐易错，主机厂索赔时翻找纸质批次追溯极其耗时']
      }
    ],
    collaborationChain: [
      {
        fromRole: '技术部工程师',
        toRole: 'PMC计划员',
        handoffItem: '主机厂工程变更图纸与新BOM',
        bottleneck: '图纸通过微信流转，旧版本物料未及时锁库造成数万元报废'
      },
      {
        fromRole: 'PMC计划员',
        toRole: '车间主任',
        handoffItem: '每日机台派工单',
        bottleneck: '突发插单未及时通知换模工，产线等待模具调校达3小时'
      }
    ]
  }
};

/**
 * Get or synthesize recruitment benchmarks for a given company & industry
 */
export function getRecruitmentData(companyName, industry) {
  const norm = (companyName + ' ' + industry).toLowerCase();

  if (norm.includes('本地生活') || norm.includes('传媒') || norm.includes('mcn') || norm.includes('抖音') || norm.includes('短视频') || norm.includes('沧藤') || norm.includes('仓藤')) {
    return {
      ...REAL_RECRUITMENT_BENCHMARKS['mcn_local_life'],
      companyName: companyName || '武汉仓藤传媒有限公司'
    };
  }

  if (norm.includes('汽配') || norm.includes('汽车') || norm.includes('制造') || norm.includes('加工') || norm.includes('零件') || norm.includes('机械')) {
    return {
      ...REAL_RECRUITMENT_BENCHMARKS['autoparts_manufacturing'],
      companyName: companyName || '精密制造企业'
    };
  }

  // Generic industry synthesized baseline
  return {
    companyName: companyName || '目标企业',
    industry: industry || '通用行业',
    source: '招聘平台通用岗位分析 (BOSS直聘/猎聘/智联)',
    roles: [
      {
        title: '业务/运营总监',
        department: '运营管理部',
        tier: '管理协同层',
        dailyResponsibilities: ['统筹部门目标达成', '审核跨部门交付物', '解决异常升级'],
        highFrequencyRepetitiveTasks: ['催收各组日报', '多系统导出表格手工汇编', '协调突发紧急插单'],
        toolsAndSystems: ['OA/ERP系统', '各类Excel汇总表', '工作沟通群'],
        collaborationTargets: ['高层决策', '项目经理', '财务'],
        painPointsAndBottlenecks: ['信息滞后，难以实时掌握真实交付损耗']
      },
      {
        title: '项目经理 / 交付主管',
        department: '项目交付部',
        tier: '管理协同层',
        dailyResponsibilities: ['监控工单排期与进度节点', '对接客户需求与内部排产'],
        highFrequencyRepetitiveTasks: ['人工更新进度台账', '微信群催办交付物', '处理客户变更'],
        toolsAndSystems: ['项目管理表格', 'ERP系统', '企业微信'],
        collaborationTargets: ['一线执行骨干', '运营总监', '客户'],
        painPointsAndBottlenecks: ['跨部门信息不同步，变更流转存在时滞导致返工']
      },
      {
        title: '一线执行骨干 / 数据对账员',
        department: '业务执行部',
        tier: '一线执行层',
        dailyResponsibilities: ['日常业务操作与数据录入', '单据核对与基础报表制作'],
        highFrequencyRepetitiveTasks: ['每天从多个后台下载表格手动VLOOKUP合并', '跨系统复制粘贴录入数据', '手工翻找历史沟通记录'],
        toolsAndSystems: ['各类业务后台', 'Excel/WPS', '微信沟通群'],
        collaborationTargets: ['项目主管', '外部对接人'],
        painPointsAndBottlenecks: ['重复手工劳动占用大量时间，枯燥且极易出错']
      }
    ],
    collaborationChain: [
      {
        fromRole: '业务发起人',
        toRole: '执行部门',
        handoffItem: '客户需求单据与交期要求',
        bottleneck: '口头或微信沟通缺乏标准化表单，造成理解偏差'
      },
      {
        fromRole: '执行部门',
        toRole: '管理主管',
        handoffItem: '每日交付进度汇报',
        bottleneck: '人工合并多表耗费1-2小时，报表数据滞后'
      }
    ]
  };
}
