# Cavalry Project Packager v0.1.2

[English](#english) · [中文](#中文)

## English

This is a repository, installation and release-engineering refresh. Asset collection, Smart Folder relinking, cleanup and rollback behaviour is carried forward from v0.1.1.

### Download

- **Installation:** `Cavalry-Project-Packager-v0.1.2.zip`
- **Checksums:** `SHA256SUMS.txt`

Use the installation ZIP, not GitHub's automatic Source code archive. Follow the offline `INSTALL.md` / `INSTALL.zh-CN.md` inside the ZIP, or read [Installation](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/docs/INSTALL.md) and [安装指南](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/docs/INSTALL.zh-CN.md).

### New in v0.1.2

- Redesigned bilingual repository landing pages with original workflow artwork and direct download links.
- Dedicated bilingual offline installation, upgrade, removal, privacy and troubleshooting guidance.
- An explicit installation archive containing only the Cavalry script, both offline guides and LICENSE. Development handoff notes and validation material are excluded.
- SHA-256 checksums, archive member/CRC/source-byte verification and reproducible release tooling.
- CI runs Node syntax and the existing regression suite on Ubuntu, macOS and Windows before building the installation archive.

### Verification and limits

- The `v0.1.2` tag CI must complete all source-test and package jobs before publication.
- The Release archive is taken from that tag CI artifact and checked for exact members, CRC, script bytes, offline guide links and SHA-256.
- No new Cavalry GUI or real Windows host end-to-end validation is claimed for this documentation/distribution release.
- Existing limits remain: external references are not recursive, online dependencies stay external, fonts require redistribution permission, and `package-report.json` contains source-machine paths.

## 中文

本版本更新仓库、安装体验与发布工程。素材收集、Smart Folder 重链、清理和失败回滚行为沿用 v0.1.1。

### 下载

- **安装包：** `Cavalry-Project-Packager-v0.1.2.zip`
- **校验值：** `SHA256SUMS.txt`

请使用安装 ZIP，不要把 GitHub 自动生成的 Source code 当作安装包。按照包内离线 `INSTALL.md` / `INSTALL.zh-CN.md` 操作，或阅读 [Installation](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/docs/INSTALL.md) 与[安装指南](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/docs/INSTALL.zh-CN.md)。

### v0.1.2 更新

- 重做双语仓库首页，加入原创流程横幅与直接下载入口。
- 新增双语离线安装、升级、移除、隐私与问题排查指南。
- 安装包采用明确文件清单，仅包含 Cavalry 脚本、双语指南和 LICENSE，不再打入开发交接与验证材料。
- 新增 SHA-256、归档成员／CRC／源字节校验和可重复发布工具。
- CI 在 Ubuntu、macOS、Windows 上运行 Node 语法与现有回归套件，全部通过后才构建安装包。

### 验证与限制

- 发布前，`v0.1.2` 标签 CI 的源码测试与打包任务必须全部完成并通过。
- Release 安装包取自该标签 CI 产物，并核对精确成员、CRC、脚本字节、离线指南链接与 SHA-256。
- 本次文档／分发更新不新增 Cavalry GUI 或真实 Windows 宿主端到端验证声明。
- 现有限制不变：外部引用不递归收集，在线依赖保持外部，字体需要再分发许可，`package-report.json` 包含源电脑路径。

[Full changelog](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/CHANGELOG.md) · [Announcement copy](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/packaging/ANNOUNCEMENT.md)
