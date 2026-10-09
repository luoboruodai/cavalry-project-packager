# PROJECT.md — Cavalry Project Packager 项目与开发过程汇总

> 本文档面向后续接手的 AI 智能体/开发者：读完本文即可理解项目结构、关键决策、已踩过的坑，无需重新考古对话历史。
> 汇总日期：2026-10-09。对应发布版本：v0.1.0。

## 1. 项目是什么

Cavalry（Motion Design 软件，cavalry.studio）的单文件 UI Script 插件。核心功能：把当前工程中**实际被合成使用的文件素材**收集到一个便携 Project 目录、复制、重链，并把 Scene 副本存进包内，使其他人打开包内 Scene 不出现素材脱机。

- 源文件（也是唯一产物）：`src/Project Packager.js`（约 1800 行，ES5 风格、Tab 缩进）
- 测试：`tests/project-packager.test.cjs`（Node 内置 runner，mock 整个 `api`/`ui` 后 vm 执行脚本）
- 文档：`README.md`（中英双语）
- 发布：GitHub Releases 提供 ZIP（含 js + README + LICENSE）

上游来源：fork/延续 `shouzhang123/cavalry-project-packager`（v1.1.0），其又基于 `phillip-motion/Canvalry-scripts`（MIT）。本仓库在其上做了：中英双语界面、Smart Folder 真实可用化、字体复制选项、布局优化，以及**真实 Cavalry 环境实测驱动的多处修复**。

## 2. 运行/测试/发布命令

```bash
node --check "src/Project Packager.js"          # 语法检查
node --test tests/project-packager.test.cjs     # 全部测试（16 个用例）
```

发布流程：改 `SCRIPT_VERSION` → 跑测试 → 提交打 tag → 推送 → `gh release create <tag> dist/*.zip`。安装到本机：把 `src/Project Packager.js` 复制到 `~/Library/Application Support/Cavalry/Scripts/`（macOS）。

## 3. 架构速览（脚本内部）

1. **i18n 层**：`STRINGS.en/zh` + `tr(key, ...)`（`{0}` 占位符替换，未知 key 回退英文再回退 key 本身）。`setLanguage('en'|'zh')` → `applyLanguage()` 重设所有静态文案并对 `lastScan` 重新扫描以刷新动态消息。`localisedLabels` 注册表管理复选框 label + tooltip。
2. **扫描** `scanProjectAssets(options)`：枚举 `api.getComps()` → `collectCompositionLayers` 收集全部图层（含 `getChildren` 递归）→ 遍历 `api.getAssetWindowLayers(false)`，用 `api.getOutConnections(assetId,'id')` + `extractLayerId` 判定素材是否被场景图层使用 → 分类为 file/sequence/smartFolder/font/reference，生成 `mappings`（源→包内相对路径）、`destinationRelative`、`relinkRelative`。
3. **打包事务** `executePackage`：保存源 Scene → 建目录 → 逐文件 `copyAndVerify`（尺寸校验）→ 写中间报告 → `api.setProject(packageRoot)` → `api.replaceAsset` 重链 → `saveSceneAs` → （selected 模式 `prunePackagedScene`）→ `validatePackage`（重开包内 Scene，逐项校验素材解析在包内且存在）→ 写最终报告。任一步失败回滚（`restoreOriginalScene`），失败包保留供排查。
4. **UI 层**：目标文件夹 `ui.FilePath`、包名 `ui.LineEdit`、5 个复选框（双列布局）、扫描/打包按钮、预览 ScrollView、状态栏、右上角语言切换按钮。

## 4. 关键坑点（真实 Cavalry 2.x 实测结论，血泪史）

### 4.1 `api.getRelativePath(a, b)` 实际返回"从 b 到 a"的路径 ⚠️
文档写 "Computes the relative path from one location to another"，实测：`getRelativePath(root, root+'/nested/f.png')` 返回 `'../..'`，反向调用返回 `'nested/f.png'`。**与直觉/文档参数顺序相反**，且**不抛异常**（try/catch 兜不住）。上游原版 Smart Folder 打包因此必然全部报"路径在根目录之外"而失败——该功能在上游从未真正工作过。
→ 修复：`relativePath()` 先手动用 `startsWithPath` 计算，仅包外路径才 fallback 到参数对调后的 api 调用。测试 mock 已按真实行为实现。

### 4.2 `api.replaceAsset` 不接受 `@project/...` 令牌路径，也不接受目录路径 ⚠️
- 传 `'@project/Assets/...'`：**静默忽略**，素材保持原路径 → 校验失败回滚。
- 传目录路径（Smart Folder 重链）：**同样静默忽略**。
- 正确做法：重链一律用**包内绝对路径**；Cavalry 在 `saveSceneAs` 时会自动把包内路径序列化为 `@assets/...` 工程相对路径，便携性由 Cavalry 自己保证。
- Smart Folder 重链必须传**文件夹内某个文件**的路径（实测传 `<dir>/cover.jpg` 成功）。插件选**顶层文件**（避免 folder root 漂移到子目录）；无顶层文件时退化为第一个文件。

### 4.3 Cavalry 2.x 的 Smart Folder 素材类型是 `imageFolder` / `audioFolder` ⚠️
不是 `imageSmartFolder`。检测逻辑：`isDirectory(路径)` 或 `isSmartFolderType(type)`（匹配 `smartfolder` 子串或精确 `imagefolder`/`audiofolder`）。空的 Smart Folder 无法重链（replaceAsset 无解）→ 直接 `included=false` + 警告。

### 4.4 手搓 `.cv` 场景的注意事项
`.cv` 是 JSON（`resourceType: cavalry.scenefile`）。结构：`nodes`（图层/素材节点）+ `nodeMeta`（父子层级：compNode 的 children 即合成图层；Assets 窗口分组也是 `nodeType:'asset'` 的节点）+ `connections`（`{from:'a.id', to:'b.attr'}`）+ `assets`（`{nodeId, type:'file', data:{filePath, assetType?}}`）。
- 手写的"目录路径素材"会被 Cavalry **迁移成 Assets 窗口分组文件夹**，导致 `getAssetWindowLayers` 不返回它、连接被丢弃（日志：`Can't connect 'asset#1.id' to 'assetFromSmartFolder#1.id'`）。
- 正确创建 Smart Folder 素材：`api.loadSmartFolderAsset(path,'image')`；接入合成：`api.addAssetToComp(assetId)`（自动建 footageShape→imageShader→assetFromSmartFolder 层级并连线 `asset.id → assetFromSmartFolder#.file`）。
- 未被连接的素材会在下次保存时被 Cavalry 回收。
- `assetFromSmartFolder` 节点的 `path` 属性决定当前显示文件夹内哪个文件。

### 4.5 Cavalry API 其它实测行为
- `api.getSceneFilePath()` 未保存的场景返回空 → 插件据此阻止扫描（v0.1.0 起提示语明确为"请先保存"）。
- `api.listDirectoryRecursive` / `listDirectory` / `listDirectoryPaths` 存在且可用（文档最新版有；老版本 Cavalry 可能缺失，`listSmartFolderFiles` 有 throw 兜底）。
- 场景/素材路径在 Cavalry 保存时会被自动重写为 `@project/...`（相对当前 project root），切换 project root 后旧序列化路径可能解析失败——测试时注意 project 上下文。
- UI 脚本中 `console.log` 不写入 `logs/js_log.txt`（该文件很旧）；调试输出用 `api.writeToFile` 最可靠。
- 非 UI 上下文里 `ui` 对象是残缺的（`ui.setTitle` 不存在）——如需 headless 驱动打包，可先 polyfill ui 再 `eval(api.readFromFile(脚本路径))`，然后直接调用 `scanProjectAssets`/`executePackage`（本项目实测验证用的方法，见第 6 节）。
- Cavalry 无 CLI/headless 模式：`--help` 无输出直接起 GUI。
- 偶发：通过 `open -a` 启动的实例 AX 菜单栏不全（只剩 Apple/应用名），直接运行 `Cavalry.app/Contents/MacOS/Cavalry <scene>` 或先激活窗口可恢复。

### 4.6 版本注意
公开发布版本号从 0.1.0 开始（开发期内部迭代号为 1.2.x，见 git 历史）。

## 5. 测试策略

- **Node 模拟测试**（`tests/`）：mock 整个 `api`/`ui`，覆盖：全量打包、序列缺帧阻止、重链失败回滚、选定合成裁剪、Smart Folder 按类型识别（`smartFolderNotDirectory` 行为位）、字体复制、双语切换、相对路径场景路径等。改 bug 时先改/加测试。
- **真实环境验证**（无 CI，需要人工或脚本驱动）：在 Cavalry 里构造含 Smart Folder 的场景 → 跑插件 → 检查产物结构、`package-report.json` 的 `status: success`、包内 `.cv` 中素材路径为 `@assets/...`、重开包内场景素材 `filePathExists` 全为 true。
- mock 的 `getRelativePath` 故意按"真实（反向）语义"实现，防止回归。

## 6. Headless 驱动插件的技巧（本次实测首创）

Cavalry 没有脚本控制台，UI 脚本按钮又是 Qt 无 AX 暴露。验证用方法：
1. 写一个临时 `_TestSetup.js` 放进 Scripts 目录；
2. 内部 polyfill `ui`（Widget 桩 + setTitle/show 等 noop）；
3. `eval(api.readFromFile('<scripts>/Project Packager.js'))` 加载真实插件源码（`var` 声明进入当前作用域）；
4. 直接调用 `scanProjectAssets({...})` / `executePackage(scan, parent, name, {...})`；
5. 结果用 `api.writeToFile` 落盘读取。
菜单点击可用 AppleScript（`System Events` 点菜单项有效；Qt 窗口内按钮无 AX 名称，坐标点击易受窗口遮挡/输入法干扰，尽量避免；文本输入用 AX `set value`，不要 `keystroke`——中文输入法会把 `_` 等字符吃掉）。

## 7. 已知限制 / 后续可做

- 字体默认不复制（授权原因），选项默认关。
- 外部 `.cv/.cvc` 引用只复制文件本身，不递归收集其内部依赖。
- 在线/非文件依赖（Google Sheets 等）无法打包，仅警告。
- Smart Folder 若只有子目录没有顶层文件，重链后 folder root 可能漂移一层（极端情况，暂未处理）。
- `package-report.json` 含本机绝对路径，分享前提示用户检查。
- 未做：打包后自动压缩 ZIP；多 Scene 打包；增量打包。

## 8. 仓库卫生

- 无密钥/凭证；测试内路径均为 mock 的 `C:/...`。
- `.gitignore`：`.DS_Store`、`dist/`（ZIP 只作为 Release 资产，不进 git）。
- 提交前跑 `grep -rn "Users/" src tests README.md PROJECT.md` 确认无本机绝对路径泄漏。
