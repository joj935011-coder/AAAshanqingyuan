# 5 人 AI 协作开发流程

本项目用 GitHub 的分支和 Pull Request 合并，不把 5 个人同时直接改 `main`。每人领取一个分支，在自己的 AI 对话中完成一项独立任务，再提交 Pull Request 由负责人合并。

## 已分好的开发分支

| 分支 | 负责内容 | 主要文件 |
| --- | --- | --- |
| `feature/knowledge-base` | 补充、核验大明湖资料；新增其他景区知识包 | `docs/`、`web/data.js` |
| `feature/ai-guide` | 优化 AI 问答、来源展示、服务端模型接口 | `web/core.js`、`web/app.js`、`server/handler.js` |
| `feature/route-planner` | 优化 60/120/180 分钟路线、偏好选择和导出 | `web/core.js`、`web/app.js`、`docs/route-drafts.md` |
| `feature/ui-mobile` | 优化卡通导游、色彩、动效和手机布局 | `web/index.html`、`web/styles.css`、`web/app.js` |
| `main` | 稳定版本，只由负责人合并和发布 | 全部 |

## 每位组员第一次操作

1. 接受负责人发送的仓库邀请，打开仓库。
2. 点击分支下拉框，从自己负责的分支进入，例如 `feature/ui-mobile`。
3. 按键盘 `.`，进入 GitHub 浏览器版 VS Code；也可以克隆到本地。
4. 在你自己的 AI 对话中，把下面对应的提示词连同仓库链接发给 AI。
5. 让 AI 修改完成后，先检查改动只覆盖你负责的部分，再提交并推送到自己的分支。
6. 回到 GitHub 点击 **Compare & pull request**，标题写清楚做了什么，创建 PR。
7. 负责人检查 PR，通过后合并到 `main`。合并后再同步更新公开演示网站。

## 给 AI 的任务提示词

### 知识库负责人

> 我在 GitHub 仓库 `joj935011-coder/AAAshanqingyuan` 的 `feature/knowledge-base` 分支开发“泉见未来”AI 文化导游。请只完善知识库和资料出处：核验大明湖资料，补充可追溯来源；如果新增景区，按现有 JSON 结构增加资料和站点。不要改 UI、路线算法或模型密钥。改完运行项目已有测试，并说明修改了哪些文件和资料边界。

### AI 问答负责人

> 我在 `feature/ai-guide` 分支开发“泉见未来”AI 文化导游。请只优化 AI 问答、检索结果、追问和来源展示，以及服务端 API 错误处理。不要把 API Key 写进前端、仓库或提交记录；不要宣称没有实现的向量数据库或真实模型能力。改完运行已有测试，并说明改动和限制。

### 路线负责人

> 我在 `feature/route-planner` 分支开发“泉见未来”AI 文化导游。请只优化游览路线功能：根据时长、兴趣和起点生成可解释的路线，完善复制/下载交互。路线要避免把未经核验的实时信息当作事实，不要默认安排步行登上历下亭岛。改完运行已有测试，并说明路线规则。

### UI 负责人

> 我在 `feature/ui-mobile` 分支开发“泉见未来”AI 文化导游。请只优化前端视觉和手机体验：保留泉灵卡通导游、提高信息层级和可读性，保证响应式布局、键盘可用性和减少动画偏好。不要删除知识库、路线或 API 安全逻辑。改完打开页面检查桌面和手机尺寸，并说明修改文件。

## 本地运行

```powershell
git clone https://github.com/joj935011-coder/AAAshanqingyuan.git
cd AAAshanqingyuan
git switch feature/ui-mobile
npm run dev
```

统一验证：

```powershell
npm run check
```

## 合并规则

- 一次 PR 只做一类工作，不混入其他人的改动。
- 提交前先拉取对应分支最新版本；遇到冲突先处理冲突，再提交。
- 不提交 `.env`、API Key、账号密码或个人隐私资料。
- AI 写完后，人要实际阅读改动和测试结果；AI 不能代替资料核验。
- 负责人只在 PR 检查通过后合并到 `main`，然后发布公开演示版本。
