# 泉见未来：5人共同开发说明

你们共同维护一份 GitHub 源码仓库。公开网站供游客体验；仓库中的协作者可以修改代码。网页里的知识库导入目前只影响自己的浏览器，不会自动修改其他人的知识库。

网页体验：https://quan-future-daming-guide.mellowkrill32.chatgpt.site

小组仓库：https://github.com/joj935011-coder/AAAshanqingyuan

浏览器编辑：https://github.dev/joj935011-coder/AAAshanqingyuan

仓库是私有的。只有接受仓库邀请的组员才能查看和编辑源码；上述编辑地址仍会检查GitHub权限。

## 先完成的设置

1. 每人使用自己的 GitHub 账号，将用户名发给组长；不共用账号或密码。
2. 组长在项目仓库 `Settings → Collaborators → Add people` 添加另外4人的用户名。
3. 每人在自己的 GitHub 通知或邮箱中接受邀请。接受后才获得仓库读写权限。
4. 建议由你担任整合与发布负责人；按“功能分支 → Pull Request → 检查 → 合并”的规则协作。

官方邀请步骤：
https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository

## 5人的建议分工

| 成员 | 主要工作 | 主要修改文件 | 第一项可完成的小任务 |
| --- | --- | --- | --- |
| 你：组长/整合 | 任务拆分、检查合并、上线、演示 | README、CONTRIBUTING、docs、检查配置 | 建立5个任务，明确验收条件 |
| 成员2：页面与视觉 | 手机布局、景点卡片、泉灵形象 | web/index.html、web/styles.css | 让手机上的聊天入口更容易找到 |
| 成员3：聊天与路线 | 输入体验、追问、偏好路线 | web/app.js、web/core.js | 完善路线兴趣偏好和错误提示 |
| 成员4：知识内容 | 景区故事、引用来源、第二个景区 | docs/daming-lake.json、docs | 核验3条大明湖资料并补充出处 |
| 成员5：模型与测试 | 服务端模型接口、测试、失败处理 | server/handler.js、tests | 接入小组指定模型并验证超时降级 |

不是规定某个人只能做这些；先按主要负责范围降低同时修改同一文件的概率。修改同一文件前在群里说一声；仍可通过分支合并处理冲突。

## 路径A：直接用浏览器修改，不装开发软件

适合改文字、CSS、小段HTML、知识库或文档。

1. 登录自己的GitHub，打开小组仓库。
2. 点击当前的 `main` 分支下拉框，输入新分支名，例如 `feature/mobile-chat`，选择创建分支。
3. 在仓库页面按英文句点 `.`，打开浏览器中的 VS Code 编辑器；或把地址中的 `github.com` 改成 `github.dev`。
4. 在左侧找到自己的文件，修改、保存。
5. 点击左侧 Source Control（源代码管理），暂存修改，填写提交说明，例如“增大手机聊天输入框”，点击 `Commit & Push`。
6. 回到GitHub仓库，创建 Pull Request（简称PR），目标分支选 `main`，说明改了什么、怎么验证。
7. 自动检查通过后，请另一位组员查看修改。组长确认后合并。

浏览器VS Code可以编辑和提交，但没有终端，不能直接运行这个Node服务。需要运行页面时用下面的本地方式或Codespaces。

官方编辑器说明：
https://docs.github.com/en/codespaces/the-githubdev-web-based-editor

## 路径B：本地VS Code开发，可以即时预览

各自电脑准备 VS Code、Git、Node.js 22或更新版本。项目无需 npm install。

第一次把仓库下载到自己的电脑：

```powershell
git clone https://github.com/joj935011-coder/AAAshanqingyuan.git
cd AAAshanqingyuan
git switch -c feature/mobile-chat
npm run dev
```

打开终端显示的 `http://127.0.0.1:4173`。修改源码保存后会自动构建和重启本地服务，刷新浏览器看变化。这个地址只用于当前电脑预览。

做完一个小功能后：

```powershell
npm run check
git status
git add web/index.html web/styles.css
git commit -m "改善手机聊天布局"
git push -u origin feature/mobile-chat
```

`git add` 后面的文件按自己实际修改的内容填写。最后回GitHub创建PR。

下一项任务从最新主分支开始：

```powershell
git switch main
git pull --ff-only
git switch -c feature/next-task
```

如果Git提示用户名/邮箱缺失，只在这个仓库设置 `git config user.name "你的名字"` 和 `git config user.email "你的GitHub提交邮箱"`。GitHub登录在其正常授权界面完成，不把密码写进源码。

## 路径C：浏览器里运行代码（可选）

仓库 `Code → Codespaces → Create codespace`。环境建立后在终端执行 `npm run dev`，在 Ports 中打开4173端口预览。Codespaces有各账号的额度限制，按创建页面说明选择；不必用它才能参与开发。

仓库已提供 `.devcontainer/devcontainer.json`，会配置Node和4173端口。这里写好了配置，尚未替各账号创建或验证Codespace。

## 平时修改哪一个文件

- 结构与页面文字：`web/index.html`。
- 颜色、尺寸、响应式布局：`web/styles.css`。
- 点击、聊天、导入、页面切换：`web/app.js`。
- 资料检索、路线预算、知识库校验：`web/core.js`。
- 大明湖的共同知识库：`docs/daming-lake.json`。运行构建后自动生成 `web/data.js`。
- 模型的服务端调用：`server/handler.js`。
- 核心与API测试：`tests/guide.test.mjs`。

`worker/index.js`、`web/data.js`、`dist/` 和“泉见未来-双击打开.html”是构建输出，不直接编辑。修改源文件后运行构建即可更新。

## 修改怎样成为大家看到的正式网页

1. 每个人提交到自己的分支，可以先看自己的本地预览。
2. PR检查通过、另一位成员看过之后，组长合并到 `main`。
3. **GitHub合并和网站发布是两个步骤。**当前公开网页由Sites托管；合并后由发布负责人同步最新源码、构建、发布。仅合并GitHub代码不会自动更新Sites网址。
4. 发布后用另一台设备或另一网络检查，组长在群里发变更说明。

`.github/workflows/check.yml`会在GitHub执行构建与18项测试；配置文件已写好，上传到仓库并运行后才能确认云端检查结果。当前未配置GitHub到Sites的自动发布凭据。

## 出现问题怎么处理

- 同一文件冲突：不要直接选择全部覆盖。两位作者一起看冲突片段，保留双方需要的内容，重新检查后提交。
- 页面出错：按F12看Console，把报错和触发操作写进任务或PR。
- 自动检查失败：打开PR的Checks查看哪一步失败，修正后推送同一分支。
- 上线有问题：发布负责人恢复上一次成功版本；源码使用GitHub的Revert生成修复提交。
- 模型API Key：仅交给发布负责人存入服务端秘密变量，其他成员可以用无密钥的知识库模式开发。

## 第一周的完成标准

- 5个人都能打开源码仓库；每人成功创建一个分支和一个小PR。
- 每人能解释自己修改的文件，至少另一人能运行验证。
- 大明湖核心问答、资料引用和路线正常；第二个景区可以通过资料导入演示。
- 无模型Key时明确显示知识库模式；接入模型后另记录真实调用结果。
- 公开网址经过组员手机的移动数据网络测试。

## 给完全没用过GitHub的组员：第一次先做这一件事

接受仓库邀请后，在仓库 `main` 下拉框创建 `feature/你的名字-first-task` 分支，找到 `TEAM.md`，把自己这一行的“待登记”改成自己的GitHub用户名。保存为一个提交，再创建PR给组长。这个练习不改网页功能，能确认你会创建分支、编辑、提交和申请合并。成功后再认领一个网页功能任务。

## 你们共同开发与共同编辑的区别

GitHub保存和合并代码，不会像在线文档那样让5个人在同一个网页里实时输入。每人可以同时做各自分支，完成后合并。如果需要一人指导另一人同时看一份代码，可以共享屏幕；完成的修改仍由分支和PR记录。
