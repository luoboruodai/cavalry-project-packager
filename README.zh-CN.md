# Cavalry Project Packager（工程打包器）

把 Cavalry 合成中实际使用的文件素材收集到便携 Project，正确重链 Smart Folder，并在打包后重新打开 Scene 校验。

[English README](README.md) · [下载 v0.1.2](https://github.com/luoboruodai/cavalry-project-packager/releases/tag/v0.1.2) · [安装指南](docs/INSTALL.zh-CN.md) · [更新日志](CHANGELOG.md)

**v0.1.2** · 单文件 Cavalry UI Script · macOS / Windows · 中文 / English

<div align="center">

<img src="docs/assets/cavalry-project-packager-banner.svg" alt="Cavalry Project Packager 流程：扫描已使用素材、打包并重链、验证便携 Project" width="960">

[![CI](https://github.com/luoboruodai/cavalry-project-packager/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/luoboruodai/cavalry-project-packager/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/luoboruodai/cavalry-project-packager?label=release)](https://github.com/luoboruodai/cavalry-project-packager/releases/tag/v0.1.2)
[![License](https://img.shields.io/badge/license-MIT-2fcd71)](LICENSE)

</div>

## 发布状态

| 产品 | 状态 | 安装包内容 |
| --- | --- | --- |
| Cavalry Project Packager | `v0.1.2` · 文档与分发体验更新 | 一个 Cavalry UI Script、双语离线指南、MIT 许可证 |

素材收集、重链与失败回滚行为沿用 `v0.1.1`；本版本集中改进仓库首页、安装体验和可验证的发布产物。

## 功能

- **只收集已使用的文件素材**：图片、视频、音频、数据、图片序列、Smart Folder，以及可选的外部引用和字体。
- **保持 Smart Folder 完整**：保留目录层级，在包内重建 Smart Folder 资产并恢复连接，不会塌缩为一个子文件。
- **创建便携 Project**：复制素材、重链包内 Scene，并写入 `Scenes/path-to-project` 以支持迁移。
- **按交付范围打包**：支持整个工程，或仅选中／活动合成及其嵌套预合成。
- **检查打包结果**：缺失素材和序列缺帧会阻止打包；完成后重新打开包内 Scene 校验，失败时回滚。
- **中英双语界面**：不修改工程即可切换界面语言。

## 下载

| 文件 | 用途 |
| --- | --- |
| [Cavalry-Project-Packager-v0.1.2.zip](https://github.com/luoboruodai/cavalry-project-packager/releases/download/v0.1.2/Cavalry-Project-Packager-v0.1.2.zip) | 可直接复制的脚本、双语离线安装指南和 LICENSE |
| [SHA256SUMS.txt](https://github.com/luoboruodai/cavalry-project-packager/releases/download/v0.1.2/SHA256SUMS.txt) | 安装 ZIP 的 SHA-256 校验值 |

**安装请使用上述 ZIP，不要把 GitHub 自动生成的 “Source code” 当作安装包。**

[发布说明](https://github.com/luoboruodai/cavalry-project-packager/releases/tag/v0.1.2) · [安装指南](docs/INSTALL.zh-CN.md) · [English installation](docs/INSTALL.md)

## 安装与使用

1. 下载 ZIP，并用 `SHA256SUMS.txt` 核对文件。
2. 在 Cavalry 中选择 **Scripts → Show Scripts Folder**，把安装包 `Scripts` 文件夹中的 `Project Packager.js` 复制进去。
3. 重新打开 **Scripts → Project Packager**。扫描前先打开并保存一个 `.cv` Scene。
4. 选择整个工程或指定合成，设置目标位置和一个尚未存在的打包名称，再点击 **Scan Used Assets / 扫描已使用素材**。
5. 检查扫描结果，点击 **Package Project / 开始打包**。分享时发送整个生成的 Project 文件夹，不要只发送 `.cv`。

完整指南包含校验、升级、移除与恢复：[中文](docs/INSTALL.zh-CN.md) · [English](docs/INSTALL.md)。

## 输出结构

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

## 行为与限制

- 打包开始前会**保存一次源 Scene**。建议先在工程副本上验证。
- **清理打包素材**只移除打包副本 Assets 窗口中的未使用项目，不清理源 Scene。
- 字体默认只报告、不复制。只有字体许可允许再分发时才启用复制。
- 外部 `.cv/.cvc` 引用可复制，但不会递归收集其内部依赖。
- Google 表格等在线／非文件依赖保持外部引用，并给出警告。
- `package-report.json` 包含源电脑绝对路径。对外分享前请检查或移除；删除报告不影响包内 Scene。
- 正式交付前请做一次真实整包迁移测试。Node mock 与 CI 归档检查不能替代你的 Cavalry 环境验收。

## 开发、测试与发布

开发需要 Node.js 和 Python 3；安装后的 Cavalry 脚本不依赖它们运行。

```sh
node --check "src/Project Packager.js"
node --test tests/project-packager.test.cjs
python3 packaging/build_release.py
python3 packaging/build_release.py --verify-dir dist/release
```

CI 在 Ubuntu、macOS 和 Windows 上运行源码检查，再构建并回读安装包。架构、Cavalry API 实测注意事项与发布流程见[开发说明](docs/DEVELOPMENT.md)。

## 致谢与许可

基于 [shouzhang123/cavalry-project-packager](https://github.com/shouzhang123/cavalry-project-packager) 继续开发，加入中英双语界面并修复 Smart Folder 打包问题；上游部分思路来自 [Canvalry Scripts](https://github.com/phillip-motion/Canvalry-scripts)。

[MIT License](LICENSE) · Copyright © 2025 Phill T
