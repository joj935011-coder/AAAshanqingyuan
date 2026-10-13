# 泉见未来 · AI 文化导游网页

以大明湖为首个示范景区。前端、资料检索、路线生成、语音和模型接口分离，可以导入其他景区资料。原创 SVG 泉灵角色和湖畔插画，不依赖外部图片或字体。

公开体验网址：https://quan-future-daming-guide.mellowkrill32.chatgpt.site

小组源码仓库：https://github.com/joj935011-coder/AAAshanqingyuan （目标仓库，上传及协作授权状态以GitHub实际内容为准）。

5人共同开发先读 [CONTRIBUTING.md](CONTRIBUTING.md)，人员登记见 [TEAM.md](TEAM.md)。本地开发运行 `npm run dev`，统一检查运行 `npm run check`。Node.js要求22或更新版本，无需安装项目依赖。

## 现在怎么打开

- 双击 `web/index.html`：离线打开，可用知识库问答、路线和资料导入。
- 本地完整服务：在本目录运行 `node scripts/build.mjs`，再运行 `node scripts/serve.mjs`，打开 `http://127.0.0.1:4173`。
- 上面的在线体验地址已在Sites设置为公开访问，可在不同网络用浏览器访问。组员仍需用各自设备核验实际网络可达性。

## 已完成的功能

1. 原创泉灵卡通角色：待机、思考、朗读动作；浏览器支持时可点击播放回答或开启自动朗读。
2. 大明湖景点与文化资料：8 条资料，覆盖泉水、历下亭、超然楼、遐园、稼轩祠、铁公祠和南丰祠等，附官方来源。
3. 问答：中文词组检索、简单上下文追问、来源展开、缺资料时明确说明；每个景区保存独立对话，最多40条消息。
4. 路线：60/120/180 分钟，文化/摄影/亲子/散步偏好，适中/舒缓节奏，南岸/东侧起点；可复制和下载文字路线。
5. 景区知识库：导入 TXT、Markdown 或 JSON；可下载模板、导出当前景区；导入后切换目的地。资料保存在当前浏览器，暂不跨设备同步。
6. 桌面与手机响应式布局、键盘输入、对话弹窗、减少动画系统偏好。
7. 旅人手记预留页面。按需求暂未实现发帖、账号、评论、审核或上传。

## AI 接入与当前边界

未配置 API 时，网页显示“知识库体验模式”，返回检索资料，不把固定资料称为大模型生成。路线由站点与时间规则编排，不是实时导航。检索目前为中文词组/标题/标签加权，不包含向量数据库、Embedding 或重排模型。

服务端支持 Chat Completions 兼容 HTTP API，真实接入路径已经实现。通过环境变量配置：

| 变量 | 含义 |
| --- | --- |
| `TOUR_API_BASE` | HTTPS API 根地址，例如 `https://api.deepseek.com`；程序追加 `/chat/completions` |
| `TOUR_MODEL` | 供应商当前支持的模型 ID，以其控制台或官方文档为准 |
| `TOUR_API_KEY` | 密钥，只保存到服务端秘密环境变量 |

本地可以复制 `.env.example` 为 `.env`，自己填入以上值，再执行 `node --env-file=.env scripts/serve.mjs`。不要把密钥发到聊天、写进 HTML，或提交到 Git。`.env` 已排除在版本控制外。托管时在 Sites 环境变量中设置以上项目，API Key 标记为秘密，再重新部署。

API 流程：收到问题 → 检索当前景区最相关的3条资料 → 加入最多8条近期对话 → 服务端调用模型 → 返回回答和来源。没有匹配资料则明确说明。上游鉴权失败、限流、网络或超时会显示提示，并回退本地资料回答。API Key 不发送到浏览器。

参考协议文档：https://api-docs.deepseek.com/api/create-chat-completion/

## 导入一个新景区

在“管理知识库”下载 JSON 模板。至少提供 `name` 和非空 `documents`：每条须有 `title`、`content`，推荐提供 `tags`、`sourceTitle`、`sourceUrl`、`checkedAt`。`sourceUrl` 只接受 HTTP/HTTPS。

需要路线时提供 `stops`，按实际相邻可通行的游览顺序填写 `id`、`name`、`description`、`minutes`（停留分钟）、`interests`（culture/photo/family/relax）。只有文字资料的景区可以问答，但没有站点信息时不会编造路线。重新导入同名自定义景区会替换原有资料；内置大明湖保留。

导入限制：文件1 MB、1–100条资料、单条最多12000字符、总正文最多120000字符。TXT/Markdown按段落切分，长段按900字符分块。导入前自行核验资料准确性与使用权。

## 数据与游览说明

所有原始资料和路线草案位于上级 `research/`，包含来源与核查边界。资料核查日期为2026-10-13。部分规划PDF仅由检索索引核验；正式运营前需要进一步人工核实。讲解建议为本项目整理，不是官方原文。

不提供实时门票、营业、亮灯、天气或路况。路线时间是未实测的规划估算；历下亭默认只远观，不自动安排步行登岛；超然楼默认只楼外停留。未核验实时路网与无障碍条件。

本地存储包含景区资料和对话。启用模型时，问题、近期对话和检索片段会发送到所配置模型供应商。暂未实现多人后台、集中知识库、公开用户账号、生产级限流、实时地图与景区运营接口，当前适合原型展示和本人体验。

## 文件与验证

- `web/`：完整前端和内置资料；可直接打开。
- `server/handler.js`：模型接口、请求校验和服务端密钥处理。
- `scripts/build.mjs`：将前端与接口打包到单文件 Worker；无需 npm 安装。
- `worker/index.js`：构建后完整运行代码。
- `tests/guide.test.mjs`：18项核心/API测试，使用mock验证模型接口，不代表已调用真实付费模型。

运行：`node scripts/build.mjs`、`node --test tests/guide.test.mjs`、`node scripts/validate-artifact.mjs`。

GitHub调研见上级 `research/github-references.md`。借鉴 Dify 的知识库/模型分层、RAGFlow 的可追溯来源、Open-LLM-VTuber 的角色状态及 TripPlanner 的偏好编排思路；未复制它们的代码或人物素材。
