# FDE 售前客户诊断工作流 Web 系统 (V1.0)

本项目严格根据《FDE 售前客户诊断工作流 V1.0：双 Agent 业务框架、执行规范与 Prompt 文档》业务与技术规范设计实现。

提供开箱即用、交互沉浸的高保真 Web 系统，助力 FDE（Forward Deployed Engineer）售前顾问在接触客户前快速建立业务共鸣、验证痛点真伪、挖掘真实 AI 改造机会。

---

## 🌟 核心业务闭环设计

```
[步骤 1: 基础输入] ➔ [步骤 2: Agent 1 情报研究] ➔ [步骤 3: Agent 2 作战卡制作] ➔ [步骤 4: 访谈反馈与动态复盘]
   行业 + 企业名称         《客户行业情报与岗位痛点地图》       《客户共鸣与痛点诊断作战卡》        痛点五级状态校准 + AI 准入判定
```

### 1. 双 Agent 协同分工
- **Agent 1（行业与企业情报研究）**：
  - 负责研究行业整体变化、产业链上下游业务流与信息流协同卡点。
  - 刻画目标企业画像，构建**经营决策层、管理协同层、一线执行层**三层业务流程与痛点地图。
  - 严格区分**已确认事实**、**行业共性**与**待核实假设**，生成标准的《客户行业情报与岗位痛点地图》。
- **Agent 2（FDE 客户痛点诊断与作战卡）**：
  - 针对会谈对象角色（老板/总经理、业务负责人、部门主管、一线岗位、IT数字化负责人）量身定制沟通切入点。
  - 精选 3-5 个高价值痛点，生成**共鸣开场白**、**五层追问法**（业务现状 ➔ 发生频率 ➔ 业务影响 ➔ 现有方式 ➔ 改善价值）。
  - 内置 6 类典型异议应对策略（痛点否认、已有系统、数据基础差、盲目要AI等）。
- **动态复盘与痛点闭环（步骤 4）**：
  - 现场访谈后，顾问输入客户真实回答与原话。
  - Agent 2 进行动态复盘，将痛点状态在五级标准中跃迁：`待验证` ➔ `客户陈述` ➔ `证据支持` ➔ `试点验证` ➔ `已否定`。
  - 剔除伪痛点，收敛聚焦真实可落地的 AI/POC 改造机会。

### 2. 人机协同（Human-in-the-loop）质检清单
- 内置规范第 8 章定义的两套顾问自检清单：
  - **Agent 1 自检清单（8 项）**：企业对齐、来源可追溯、事实与假设区分、岗位颗粒度等。
  - **Agent 2 自检清单（8 项）**：痛点精选、开场克制、五层追问覆盖、避免过早推销技术等。

---

## 🚀 模型配置（支持 OpenAI 兼容接口）

系统支持通过环境变量 `.env` 或在 Web 界面右上角「模型配置」中灵活配置任意 OpenAI 兼容接口（如 GLM-5.2、DeepSeek、Qwen、OpenAI 等）：

### 环境变量配置
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 填入你的 API Key 和网关地址
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_API_KEY="your_api_key_here"
MODEL_NAME="gpt-4o"
PORT=8088
```

- **实时流式传输**：采用 SSE（Server-Sent Events）原生支持推理思考过程（Reasoning CoT）与正文流式输出。
- **界面直配**：无需重启服务，即可在界面右上角「系统与模型配置」中一键配置 API Key 并测试连通性。

---

## 💻 快速运行与访问

Web 服务器已在后台启动：
- **浏览器访问地址**：[http://localhost:8088](http://localhost:8088)

### 常用命令
```bash
# 进入项目目录
cd fde

# 复制环境变量并配置 API Key
cp .env.example .env

# 一键启动服务（自动构建并启动）
./start.sh

# 或者使用 npm 启动
npm start

# 开发模式（前后端热重载）
npm run dev
```

---

## 📂 项目结构

```
fde/
├── dist/                      # 编译生成的高性能静态资源
├── data/
│   ├── cases.json             # 案例持久化存储（含预置精选案例）
│   └── config.json            # 模型与系统配置
├── server/
│   ├── index.js               # Express API 服务 + SSE 流式代理 + 静态托管
│   ├── db.js                  # 本地 JSON 存储引擎
│   └── defaultPrompts.js      # 规范第 5 章定义的标准 Agent 1/2 Prompt
├── src/
│   ├── App.tsx                # 主应用控制器
│   ├── types.ts               # 全流程数据结构与状态类型
│   ├── lib/
│   │   ├── api.ts             # API 封装与 SSE 数据流解析
│   │   └── presets.ts         # 精选实战案例与现场反馈预设
│   └── components/
│       ├── Header.tsx         # 顶部导航、模型状态、快捷载入
│       ├── Stepper.tsx        # 4 步工作流步进导航器
│       ├── SessionSidebar.tsx # 历史诊断案例侧边栏
│       ├── SettingsModal.tsx  # 模型配置与 Prompt 调试抽屉
│       ├── Step1Input.tsx     # 步骤 1：客户基础信息录入
│       ├── Step2Research.tsx  # 步骤 2：Agent 1 成果与顾问质检
│       ├── Step3CombatCard.tsx# 步骤 3：Agent 2 作战卡制作
│       ├── Step4InterviewFeedback.tsx # 步骤 4：现场反馈与动态复盘
│       ├── MarkdownViewer.tsx # 高保真 Markdown 渲染与一键复制
│       └── StatusBadge.tsx    # 痛点状态徽章
├── start.sh                   # 一键启动脚本
└── package.json
```
