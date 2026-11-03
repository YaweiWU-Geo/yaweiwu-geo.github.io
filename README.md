# Yawei Wu — Academic website

Personal academic website for Yawei Wu (武亚威), with a printable CV.

Planned address: https://ywu494496-dotcom.github.io

## 日常更新：只改 content.json

在 GitHub 打开 `content.json`，点击铅笔，修改后点击 **Commit changes**。配置 GitHub Pages 后，更新会自动构建并发布。主页与 CV 共用这一份内容，避免改一处漏一处。

| 内容 | 在哪里修改 |
| --- | --- |
| 姓名、头衔、邮箱、所在地、首页介绍 | `profile` |
| 页面显示的更新时间 | `profile.updated`，例如 `December 2026` |
| About 三段个人介绍 | `about` |
| 论文 | `publications` |
| 教育与工作经历 | `experience` |

新增论文：复制 `publications` 中的一整项，保留字段名并修改内容；相邻项之间用英文逗号分隔。首页按文件中的顺序显示；CV 自动按年份由新到旧排列。`featured` 控制首页重点论文样式，`openAccess` 控制开放获取标记。`summary`、`note` 可以留空。

新增经历：复制 `experience` 的一项。`date` 是首页日期，`cvDate` 是 CV 日期。`status` 为角标；`upcoming` 控制时间轴圆点样式，不会自动改变任职状态。到岗后请同步修改描述和日期。

JSON 使用英文双引号；文本中的双引号需写为 `\"`。不要在最后一项后多加逗号。构建失败时旧网站仍保留；在 **Actions** 查看失败原因，或在文件 **History** 查看旧版本。

## 首次发布

1. 在你自己的账号创建公开仓库 `ywu494496-dotcom.github.io`。
2. 上传此项目全部源码（包括 `.github/workflows/pages.yml`）；不要上传压缩包本身。
3. 进入 **Settings → Pages → Build and deployment → Source**，选择 **GitHub Actions**。
4. 在 **Actions → Publish academic website → Run workflow** 启动首次部署。以后提交修改会自动部署。
5. 等待 build 和 deploy 都成功，再访问网站。源码仓库和 Pages 配置均由你的 GitHub 账号管理。

## 本地检查与预览

需要 Node.js 18 或更新版本，无需安装第三方依赖：

```sh
node scripts/check.mjs
node scripts/build.mjs
python -m http.server 8765 --directory _site
```

访问 http://localhost:8765 。`_site` 是生成结果，不直接编辑。

## 文件说明

- `content.json`：常用学术内容。
- `templates/`：网页排版与其余固定文本。研究主题、EBSD & MTEX 专长、荣誉和服务内容如需调整，在这两个模板中同步修改。
- `static/assets/yawei-wu-cutout.png`：当前透明人像，保留原黑色外套。
- `static/assets/style-c-original.png`：已选定的 C 版原线稿来源。
- `static/swiss.css`：浅灰样式与人像显示尺寸。
- `scripts/`：构建和验证逻辑。
- `.github/workflows/pages.yml`：自动发布流程。

网站不依赖 ChatGPT 登录、OpenAI API 或数据库。GitHub 发布配置不会改变旧 Sites 网站。绑定个人域名后，请同步修改 `profile.website`。
