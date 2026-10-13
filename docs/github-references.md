# 泉见未来：GitHub 借鉴项目与落地选择

核验日期：2026-10-13。通过已连接的 GitHub 工具实际搜索仓库、读取默认分支 README 与许可证；对旅行规划项目额外检查了入口与 Agent 源码。本次没有克隆仓库、安装其依赖或复制其代码，也没有运行这些项目，因此下文不把 README 的宣传、效果或部署承诺当作实测结论。

建议做成“可替换景区知识包的卡通 AI 导游”，从大明湖开始。前台自行设计，知识检索、模型调用、路线规划、语音播放各自独立。下面四个项目分别提供这些模块的参考，并不存在一个换个名字就完整满足需求的项目。

## 1. Dify：优先参考知识库和模型接入方式

- 仓库：[langgenius/dify](https://github.com/langgenius/dify)
- 已读：[README](https://github.com/langgenius/dify/blob/main/README.md)、[LICENSE](https://github.com/langgenius/dify/blob/main/LICENSE)
- 核验到的内容：工作流编排、模型供应商接入、从文档导入到检索的 RAG 流程、应用 API；README 的自托管最低要求为 2 核 CPU、4 GiB RAM。
- 可借鉴：每个景区对应独立知识集合，用户提问时带上景区标识；检索出的资料片段交给模型组织成导游口吻的答案；网站通过服务端适配器调用模型或知识库服务。
- 适合程度：适合后续将知识库管理交给现成平台，使学生项目能把精力放在内容质量、交互与效果评估上。初版可以先完成相同接口结构，再决定接 Dify 或自建检索。
- 许可证事实：这是基于 Apache 2.0 附加条件的 Dify Open Source License，不能简单标成普通 Apache 2.0。许可证对未经书面授权的多租户环境作出限制；使用其前端时还有标识与版权信息条件。今后做面向多个景区运营方的独立工作空间服务时，需再次核对实际使用方式。只为网站写一个自己的游客界面，不代表已经取得其他条款的豁免。

**本项目采用的设计思路：**“景区配置 + 知识库 + 模型接口”分开。更换大明湖知识包后，角色语气、资料检索和景点介绍随景区变化，而不重写整套界面。

## 2. RAGFlow：重点借鉴可追溯回答

- 仓库：[infiniflow/ragflow](https://github.com/infiniflow/ragflow)
- 已读：[README](https://github.com/infiniflow/ragflow/blob/main/README.md)、[LICENSE](https://github.com/infiniflow/ragflow/blob/main/LICENSE)
- 核验到的内容：文档解析、可视化分块、可追溯引用、多种资料格式、检索与重排，以及 API 接入。README 当前建议 Docker 起配为 4 核 CPU、16 GB RAM、50 GB 可用磁盘，实际消耗随任务变化。
- 可借鉴：回答下面附“依据的景区资料”，点击可看到资料标题、原文片段和来源；导入资料后先预览切分结果，避免把一段历史故事拆得失去上下文。
- 适合程度：内容规模扩大到大量 PDF、扫描件、展馆图文资料时更有价值。对初版大明湖导游，直接部署完整平台会增加环境维护工作，先保留适配接口即可。
- 许可证事实：仓库代码为 Apache License 2.0；若后续分发修改代码，需要按照许可证处理许可文本、修改声明与相关声明文件。

**本项目采用的设计思路：**先把“能找到依据”做出来。若资料未覆盖某个问题，应坦诚说明；门票、营业、活动、游船、天气等易变化信息要显示资料日期或通过实时服务核验。

## 3. Open-LLM-VTuber：最接近“卡通形象能互动”的方向

- 仓库：[Open-LLM-VTuber/Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber)
- 已读：[README](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber/blob/main/README.md)、[LICENSE](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber/blob/main/LICENSE)、[Live2D 素材条款](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber/blob/main/LICENSE-Live2D.md)
- 核验到的内容：Live2D 形象、实时语音对话、表情映射、触摸反馈、对话记录；大模型、语音识别和语音合成可模块化替换。项目同时提供网页及桌面使用方式。
- 可借鉴：把角色与大模型分离。用户输入后，角色经历待机、思考、说话、结束状态；导游语言可配置，语音供应商也可单独替换。
- 适合程度：第二阶段需要精细口型、语音打断、更多动作时值得深入。首版原创 SVG/卡通角色配简单动作、文字聊天和点击朗读，已能验证游客是否喜欢这种交互。
- 许可证事实：程序主要为 MIT，但 README 和 LICENSE 均明确 Live2D 示例模型另有许可；不能因为代码是 MIT 就把示例人物当作可任意改名、改绘、商用的素材。

**本项目采用的设计思路：**先做原创“泉灵”形象及清晰状态反馈。讲解、路线完成和用户点击都能触发小动作，后续再替换为完整 Live2D 渲染层。语音权限应在用户点击后请求，保留随时停止播放的控件。

## 4. TripPlanner Multi-AI Agents：借鉴任务拆分，不照搬多 Agent

- 仓库：[shaheennabi/Production-Ready-TripPlanner-Multi-AI-Agents-Project](https://github.com/shaheennabi/Production-Ready-TripPlanner-Multi-AI-Agents-Project)
- 已读：[README](https://github.com/shaheennabi/Production-Ready-TripPlanner-Multi-AI-Agents-Project/blob/main/README.md)、[MIT LICENSE](https://github.com/shaheennabi/Production-Ready-TripPlanner-Multi-AI-Agents-Project/blob/main/LICENSE)
- 额外核查：[Streamlit 入口](https://github.com/shaheennabi/Production-Ready-TripPlanner-Multi-AI-Agents-Project/blob/main/deployment/app.py)、[报告 Agent](https://github.com/shaheennabi/Production-Ready-TripPlanner-Multi-AI-Agents-Project/blob/main/src/agentic/agents/reporter_agent.py)
- 核验到的内容：代码将目的地研究、活动、天气、航班、报告汇总拆成不同任务；`research_destination(destination, interests)` 使用目的地和兴趣作为研究上下文。README 自述为模拟业务场景，因此仓库名称中的 Production-Ready 不能当作其可靠性或实际商业部署的证明。
- 可借鉴：先收集用户条件，再生成行程；稳定文化知识和实时天气分别获取，再交给导游解释。把“查资料”和“安排顺序”拆开，方便定位错误。
- 适合程度：任务结构适合学习，航班、AWS、多 Agent 及多个付费服务对景区内导游并非首版所需。大明湖内路线可先用已核验的景点节点、步行耗时和用户偏好做约束，模型负责解释推荐理由。
- 许可证事实：MIT，后续若复用代码需保留其版权与许可声明。本次只借鉴模块化思路。

**本项目采用的设计思路：**用户输入“只有 90 分钟、喜欢历史、少走路”，输出有顺序的站点、每站停留时间、总时长和推荐理由。路线在内部先做时间预算校验；未接真实路径服务时应标为游览建议或示意路线，不能声称实时导航。

## 补充：一个适合看产品流程的旅行网站

[barika001/ai-trip-planner](https://github.com/barika001/ai-trip-planner) 的 [README](https://github.com/barika001/ai-trip-planner/blob/main/README.md) 展示了“创建行程—查看景点/酒店—保存我的行程”的产品流程，使用 React、Google Generative AI、Places 与 Firebase。适合观察从表单输入到结果卡片的组织方式。

本次读取根目录与尝试读取 LICENSE 后，没有在根目录发现许可证文件，README 也没有给出许可条款。因此不把它列为可直接复制代码的底座；如果以后需要复用，应先取得明确许可。

## 大明湖首版的三个直接落地点

1. **有来源的导游回答。**回答与引用一同展示，快捷问题可继续追问。把本地演示回答、模型 API 生成回答、实时数据分清楚，避免让游客误解能力。
2. **有约束的路线卡片。**先选游览时长、兴趣与步行偏好，再输出站点顺序和建议用时。模型不能随意编出知识包里不存在的景点；可先用规则路线，在接口准备好后接生成与地图服务。
3. **有反馈的卡通导游。**角色常驻，提问时思考、朗读时说话、路线完成后提示；文字、点击朗读和快捷操作先做好，持续语音对话作为下一阶段。

## 可扩展的数据和接口边界

- 景区包：景区 ID、名称、简介、角色设定、景点列表、景点坐标、资料来源、资料更新时间。
- 知识条目：标题、正文、标签、所属景区、来源 URL、审核状态、更新时间。导入后再切分、检索；不能只把整份资料塞到提示词里就称为完整 RAG。
- 问答请求：景区 ID、用户问题、必要对话上下文；回复包含答案、来源与能力模式。
- 路线请求：景区 ID、可用分钟、兴趣、出发点、步行偏好；回复包含站点序列、时间预算、约束说明。
- 社区预留：仅预留入口与数据扩展位置。未来再做用户账号、经验文章、图片、审核和举报；首版不展示伪造的用户动态。

第一版完成可演示交互后，再接入真实模型 API 和可验证检索流程。评审材料应分别描述已经实现、已接通测试、后续规划，保留具体提问与引用命中的验证记录。
