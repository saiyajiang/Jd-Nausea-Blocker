# 京东 · 不适商品屏蔽器

> ## 🤖 AI 制作声明
>
> **本项目的代码与文档由 AI（腾讯元宝）辅助生成**，经人工安装测试后发布。
>
> - 脚本逻辑、DOM 适配、规则引擎均由 AI 编写，未经过专业安全审计
> - 已在京东首页 / 搜索页实机验证可用，但**不保证**适配京东的所有页面与未来改版
> - 发现问题欢迎提 [Issues](https://github.com/saiyajiang/jd-nausea-blocker/issues)，但修复同样可能由 AI 完成
> - 许可证 MIT，使用风险自负

一个油猴脚本，按 **关键词 / SKU / 店铺** 屏蔽京东网页上让你感到不适的商品，可选「图片打码」或「彻底隐藏」。

- Greasyfork：<https://greasyfork.org/zh-CN/scripts/595934>
- 本脚本不联网、不采集任何数据，配置仅存于浏览器本地

> 脚本靠**文本匹配**工作（商品标题、图片 alt、图片 URL、店铺名），无法识别图片内容本身。  
> 遇到"标题正常、图很恶心"的商品，用商品卡上悬浮的「屏蔽」按钮按 SKU 拉黑最准。

## 功能

| 能力 | 说明 |
|---|---|
| 两种模式 | **图片打码**（默认，商品仍在，图被高斯模糊，悬停可点「显示」临时查看）<br>**彻底隐藏**（商品卡直接消失） |
| 三类规则 | 关键词（支持 `/正则/i`）、SKU 黑名单、店铺黑名单 |
| 一键拉黑 | 鼠标悬停商品卡 → 右上角浮出「屏蔽 / 显示」<br>点「屏蔽」可选：拉黑该 SKU / 拉黑该店铺 / 顺手加关键词 |
| 改动即生效 | 设置面板里改关键词，停手 0.7 秒自动保存并重扫，不用手动点保存 |
| 覆盖页面 | 搜索页、列表页、首页推荐流、详情页推荐位（只要含商品链接的卡片都能识别） |
| 不闪图 | `document-start` 注入 + MutationObserver，卡片一进 DOM 就处理，不会先糊一张恶心图再消失 |
| 诊断工具 | 油猴菜单「🔍 诊断」显示：识别到几个商品卡、命中几个、前几个商品的真实标题 |

## 安装

**方式一：Greasyfork（推荐，自动更新）**

1. 打开本脚本的 Greasyfork 页面，点「安装此脚本」
2. 打开京东，刷新页面

**方式二：从 GitHub 直接安装**

安装 [Tampermonkey](https://www.tampermonkey.net/) 后，直接打开：

```
https://raw.githubusercontent.com/saiyajiang/jd-nausea-blocker/main/jd-nausea-blocker.user.js
```

浏览器会识别出 `.user.js` 并提示安装。

## 使用

1. 点油猴图标 →「⚙️ 设置」打开面板
2. 关键词一行一个，支持正则，例如 `/(腐烂|腐尸|血腥)/i`
3. 内置了一份默认关键词（标本 / 骨骼 / 寄生虫 / 蟑螂 / 腐烂 / 化脓 / 排泄物 / 痔疮等），**请按自己的接受度增删**
4. 打码强度用滑块调，默认 22px

**默认关键词刻意没有收录**「蛇」「老鼠」「昆虫」这类词——它们容易误伤宠物用品、科普书籍。需要的话自己加。

## 常见问题

**Q：改了配置没反应？**

先按 F5 刷新页面（装完脚本不刷新，当前页跑的还是旧代码）。  
然后点油猴菜单「🔍 诊断」看「识别商品卡」这一行：

- 数字 > 0 且命中 > 0 → 正常工作
- 数字 = 0 → 京东又改版了，把诊断面板的内容发到 Issues，我按实际 DOM 修
- 数字正常但命中 0 → 说明标题没读到，诊断面板会列出真实标题，对着改关键词即可

**Q：迁移到 Greasyfork 版本后，之前配的关键词没了？**

脚本身份由 `@namespace` + `@name` 决定，任一变化就会被当成新脚本，旧配置读不到。  
**迁移前**：旧版设置面板点「导出」→ 复制 JSON 存好；**迁移后**：新版点「导入」粘回去。

**Q：能不能同步到多台电脑？**

可以。设置面板的「导出 / 导入」按钮就是干这个的，配置是纯 JSON 字符串。

## 在 Greasyfork 上配置自动更新

1. 把本仓库推到 GitHub（分支 `main`，脚本路径保持 `jd-nausea-blocker.user.js`）
2. Greasyfork → 发布脚本 → 上传 `jd-nausea-blocker.user.js`
3. 脚本页面 →「管理」→ 勾选 **自动从 GitHub 更新**
   - 仓库：`saiyajiang/jd-nausea-blocker`
   - 分支：`main`
   - 文件路径：`jd-nausea-blocker.user.js`
4. 保存。之后 Greasyfork 会定期抓取 `jd-nausea-blocker.meta.js` 比对版本

> 仓库里的 `.meta.js` 是给 Greasyfork 用的轻量元数据文件。它让 Greasyfork 只下载几十字节判断版本，版本没变就不重复拉取完整脚本。

## Greasyfork 脚本页面填写

### 附加信息（Additional Info）

把 [`ADDITIONAL_INFO.md`](ADDITIONAL_INFO.md) 的内容整个复制到 Greasyfork 脚本编辑页的
**Additional info** 框里（支持 Markdown）。它包含功能说明、使用方法、常见问题和隐私声明。

### 截图

Greasyfork 建议提供截图，在脚本编辑页底部用 **Screenshots** 上传。**必须用真实运行截图**，
AI 生成的示意图可能被判为误导。建议这 4 张：

| 建议截图 | 怎么拍 |
| --- | --- |
| 设置面板 | 京东页面 → 油猴菜单「⚙️ 设置」 |
| 打码效果 | 首页找一个已被模糊的商品卡，悬停显示「已打码」标签 |
| 一键拉黑按钮 | 鼠标悬停商品卡，截右上角浮出的「屏蔽 / 显示」 |
| 诊断面板 | 油猴菜单「🔍 诊断」 |

### 已满足的 Greasyfork 检查项

| 检查项 | 状态 | 做法 |
| --- | --- | --- |
| 指定 `@license` | ✅ | 元数据里写了 `@license MIT` |
| 避免 `@match` 以通配符开头 | ✅ | 不用 `*://`，改为显式 `https://` / `http://` 各写一条 |
| 添加附加信息、列出功能、提供截图 | ✅ | 见上面两节 |

## 发布新版本

```bash
# 1. 改代码
# 2. 改 jd-nausea-blocker.user.js 里的 @version（必须递增，Greasyfork 靠它判断更新）
# 3. 同步生成 meta.js
node update-meta.js

# 4. 提交
git add . && git commit -m "v2.1.0: 说明改了什么" && git push
```

Greasyfork 会自动同步，也可以在后台手动点「同步」。

⚠️ **`@version` 不变的话，Greasyfork 不会推送更新给用户**——这是最常见的"我改了但用户没更新"的原因。

## 目录结构

```
.
├── jd-nausea-blocker.user.js   # 主脚本
├── jd-nausea-blocker.meta.js   # Greasyfork 用的元数据（由 update-meta.js 生成）
├── ADDITIONAL_INFO.md          # 粘到 Greasyfork「附加信息」框的文案
├── update-meta.js              # 生成 meta.js 的小工具
├── README.md
└── LICENSE
```

## 许可证

[MIT](LICENSE)
