# Cavalry Project Packager（工程打包器）

[English](#english) | [中文](#中文)

---

## 中文

一个用于 [Cavalry](https://cavalry.studio/) 的单文件 UI Script：收集工程中**实际使用**的文件素材（图片、视频、音频、图片序列、Smart Folder、外部 `.cv/.cvc` 引用，可选字体），复制到一个新的便携 Project 中并重链素材，再把 Scene 副本保存进包内。其他用户直接打开包内 Scene 即可，**素材不会脱机**。界面为**中英双语**，点击右上角 **中文 / EN** 按钮切换。

当前版本：**0.1.1**

### 功能特性

- **自动收集已使用素材**：只打包被合成实际引用的文件素材，未使用的素材不会混入包内
- **Smart Folder 打包**：整目录递归复制并保留层级，重链到包内 `Assets/SmartFolders/`（按路径与素材类型双重识别，空文件夹跳过并警告）
- **Smart Folder 正确重链**：打包后重建包内 Smart Folder 资产并重新连接 `Asset from Smart Folder`，不会把 26 张图片错误收敛成图片1
- **图片序列逐帧收集**：缺帧会阻止打包并提示
- **跨平台便携重链**：统一规范化 Windows/macOS 路径，写入 `Scenes/path-to-project`，并校验包内资产没有绝对路径
- **清理打包素材**：可选移除打包副本 Assets 窗口中的未使用素材；源工程不会被清理
- **按整个工程或单个合成打包**：限定合成模式会包含嵌套 Pre-Comp，并只清理包内副本，不影响源工程
- **可选复制外部引用与字体**：外部 `.cv/.cvc` 引用复制到 `Assets/References/`；字体复制到 `Assets/Fonts/`（默认关闭，请注意字体授权）
- **安全可靠**：打包前自动保存源 Scene；打包后重新打开包内 Scene 逐项校验；任何失败自动回滚，不改动源工程
- **中英双语界面**：所有按钮、选项、状态信息与扫描结果均可切换

### 安装

1. 在 Cavalry 中点击 **Scripts → Show Scripts Folder**。
2. 把 `Project Packager.js` 复制到打开的文件夹根目录。
   - Windows 常见路径：`%APPDATA%\Cavalry\Scripts\`
   - macOS 常见路径：`~/Library/Application Support/Cavalry/Scripts/`
3. 回到 Cavalry，重新打开 **Scripts** 菜单，点击 **Project Packager**。

也可以直接从 [Releases](../../releases) 下载 ZIP 解压安装。

### 使用方法

1. 打开并**保存**一个 `.cv` Scene（未保存的场景没有文件路径，无法扫描）。`.cvc` Component 请先在 Scene 中导入。
2. 默认打包**所有合成实际使用**的文件素材；如只需一个合成，先在 Assets 窗口选中该 Composition，再勾选"仅打包选中/活动合成（含嵌套预合成）"。
3. 按需勾选：按类型分类素材 / 复制外部引用 / 复制字体文件 / 清理打包素材 / 完成后打开打包文件夹。
4. 选择已存在的**目标父文件夹**，填写尚未存在的**打包名称**（不会合并或覆盖旧包）。
5. 点击 **Scan Used Assets / 扫描已使用素材** 检查数量、路径、缺失文件和警告，再点击 **Package Project / 开始打包**。
6. 分享或迁移时发送**整个包目录**，不要只发送 `Scenes` 中的 `.cv`。

### 输出结构

```text
<打包名称>/
├─ projectDescription.json
├─ Assets/
│  ├─ Images/  Footage/  Audio/  Data/
│  ├─ Sequences/  SmartFolders/  Fonts/  References/
├─ Scenes/
│  ├─ <原 Scene 名>.cv
│  └─ path-to-project
├─ Renders/
├─ Autosave/
└─ package-report.json
```

### 行为与限制

- 打包开始前会**保存一次源 Scene**：当前未保存的改动会写入源 `.cv`。
- 缺失素材、序列缺帧或扫描错误会阻止打包。
- “清理打包素材”只作用于打包副本；源工程的 Assets 窗口、合成和图层不会被删除。
- 字体默认只报告不复制；在线/非文件依赖（如 Google 表格）保持外部引用并给出警告。
- 外部 `.cv/.cvc` 引用可选择复制，但不会递归收集这些外部工程内部的依赖。
- `package-report.json` 包含原素材的本机绝对路径；对外分享前请检查或移除，避免泄露本机目录信息。移除报告不影响包内 Scene 与素材使用。
- 建议先在工程副本上验证，并在交付前做一次整包迁移测试。

### 开发测试

需要 Node.js：

```bash
node --check "src/Project Packager.js"
node --test tests/project-packager.test.cjs
```

### 致谢与许可

本项目基于 [shouzhang123/cavalry-project-packager](https://github.com/shouzhang123/cavalry-project-packager) 继续开发，修复了 Smart Folder 打包在真实 Cavalry 环境中的多个问题并新增中英双语界面；原作者部分思路来自 [Canvalry Scripts](https://github.com/phillip-motion/Canvalry-scripts)。[MIT License](LICENSE)（Copyright © 2025 Phill T）。

---

## English

A single-file UI Script for [Cavalry](https://cavalry.studio/) that collects the file assets **actually used** by your Compositions — images, footage, audio, image sequences, **Smart Folders**, external `.cv/.cvc` references and (optionally) fonts — copies them into a new portable Project, relinks everything, and saves a copy of the Scene inside the package. Recipients just open the packaged Scene: **no offline media**. The interface is bilingual (English / 中文) — use the **中文 / EN** button in the top-right corner.

Current version: **0.1.1**

### Features

- **Collects used assets only**: unused assets never end up in the package
- **Smart Folder packaging**: copied recursively with hierarchy preserved into `Assets/SmartFolders/` (detected by path and by asset type; empty folders are skipped with a warning)
- **Correct Smart Folder relinking**: package-time Smart Folder assets are rebuilt inside the package and all `Asset from Smart Folder` links are rewired, so a 26-image folder does not collapse to `image1.png`
- **Image sequences collected frame by frame**: frame-number gaps block packaging
- **Cross-platform portability**: Windows/macOS path separators are normalised, `Scenes/path-to-project` is written explicitly, and packaged asset paths are checked for absolute-path leaks
- **Clean package option**: optionally removes unused Assets-window items from the packaged copy while leaving the source Scene untouched
- **Whole project or a single Composition**: selected-Composition mode includes nested Pre-Comps and only prunes the packaged copy, never the source
- **Optional external references & fonts**: `.cv/.cvc` references go to `Assets/References/`; fonts to `Assets/Fonts/` (off by default — check the licence)
- **Safe by design**: saves the source Scene first, reopens and validates the packaged Scene afterwards, and rolls back automatically on any failure
- **Bilingual UI**: every label, option, status line and scan message switches between English and Chinese

### Installation

1. In Cavalry, choose **Scripts → Show Scripts Folder**.
2. Copy `Project Packager.js` into that folder.
   - Windows: `%APPDATA%\Cavalry\Scripts\`
   - macOS: `~/Library/Application Support/Cavalry/Scripts/`
3. Back in Cavalry, reopen the **Scripts** menu and click **Project Packager**.

Or download the ZIP from [Releases](../../releases) and unzip it first.

### Usage

1. Open and **save** a `.cv` Scene (an unsaved scene has no file path and cannot be scanned). Import `.cvc` Components into a Scene first.
2. By default, all file assets used by **any** Composition are packaged. To package just one Composition, select it in the Assets Window and enable "Only selected/active Comp + nested Pre-Comps".
3. Toggle options as needed: categorise by type / copy external references / copy fonts / clean unused package assets / open folder when complete.
4. Choose an existing **destination parent folder** and a **package name** that does not exist yet (old packages are never merged or overwritten).
5. Click **Scan Used Assets** to review counts, paths, missing files and warnings, then click **Package Project**.
6. When sharing, send the **entire package folder**, not just the `.cv` inside `Scenes`.

### Output structure

```text
<Package name>/
├─ projectDescription.json
├─ Assets/
│  ├─ Images/  Footage/  Audio/  Data/
│  ├─ Sequences/  SmartFolders/  Fonts/  References/
├─ Scenes/
│  ├─ <original Scene name>.cv
│  └─ path-to-project
├─ Renders/
├─ Autosave/
└─ package-report.json
```

### Behaviour & limitations

- The source Scene is **saved once** before packaging begins: unsaved changes are written to the source `.cv`.
- Missing assets, sequence frame gaps or scan errors block packaging.
- “Clean package Assets” only prunes the packaged Scene; it never deletes assets from the source project.
- Fonts are reported but not copied unless the font option is enabled; online/non-file dependencies (e.g. Google Sheets) stay external with a warning.
- External `.cv/.cvc` references can be copied, but dependencies inside them are not collected recursively.
- `package-report.json` contains absolute paths from your machine — review or remove it before sharing. Removing it does not affect the packaged Scene.
- Verify on a copy of your project first, and do a full migration test before delivery.

### Development & tests

Requires Node.js:

```bash
node --check "src/Project Packager.js"
node --test tests/project-packager.test.cjs
```

### Credits & licence

Continued from [shouzhang123/cavalry-project-packager](https://github.com/shouzhang123/cavalry-project-packager), fixing several Smart Folder packaging issues found on real Cavalry installations and adding a bilingual UI; the original project drew ideas from [Canvalry Scripts](https://github.com/phillip-motion/Canvalry-scripts). [MIT License](LICENSE) (Copyright © 2025 Phill T).
