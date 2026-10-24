# Changelog / 更新日志

## 0.1.2 — 2026-10-24

### 中文

#### 仓库与安装体验

- 重做英文主 README 与独立中文 README，加入原创打包流程横幅、发布状态、下载与校验入口。
- 新增双语离线安装指南，覆盖下载校验、备份、安装、首次打包、升级、移除、隐私与已知限制。
- 安装 ZIP 改为明确的文件映射，仅包含 `Scripts/Project Packager.js`、双语指南与 LICENSE，不再打入开发交接文档。
- 新增 `SHA256SUMS.txt`、归档回读校验和三平台 CI；发布使用通过标签 CI 的安装附件。
- 将维护者架构与 Cavalry API 实测注意事项迁移到公开开发说明，本地 `PROJECT.md` 不再进入新的公开提交。

#### 行为与验证

- 素材收集、Smart Folder 重链、清理和失败回滚逻辑沿用 0.1.1；仅同步脚本报告版本为 0.1.2。
- CI 覆盖 Ubuntu、macOS、Windows 的 Node 语法与现有回归套件，并在通过后构建、校验安装 ZIP。
- 本版本不新增 Cavalry GUI 或真实 Windows 宿主端到端兼容性声明；现有使用限制保持不变。

### English

#### Repository and installation

- Rebuilt the English landing page and added a separate Chinese README, original workflow artwork, release status, downloads and checksums.
- Added bilingual offline installation guides covering verification, backup, installation, first packaging, upgrades, removal, privacy and known limits.
- Installation ZIPs now use an explicit file map with only `Scripts/Project Packager.js`, bilingual guides and LICENSE; development handoff notes are excluded.
- Added `SHA256SUMS.txt`, archive readback validation and three-platform CI. Release artifacts come from the passing tag CI run.
- Moved maintainer architecture and Cavalry API findings into public development notes; local `PROJECT.md` is excluded from new public commits.

#### Behaviour and verification

- Asset collection, Smart Folder relinking, cleanup and rollback logic is unchanged from 0.1.1; only the script report version moves to 0.1.2.
- CI covers Node syntax and the existing regression suite on Ubuntu, macOS and Windows, then builds and verifies the installation ZIP.
- This release makes no new Cavalry GUI or real Windows host end-to-end compatibility claim; existing usage limits still apply.

## 0.1.1 — 2026-10-12

### 中文

#### 修复

- 修复 Smart Folder 打包后被重链为单个子文件的问题。现在会在目标工程内重新创建 Smart Folder，并把所有 `Asset from Smart Folder` 连接重新指向包内文件夹根目录。
- 修复包含多张图片的 Smart Folder 在打包后只显示第一张图片的问题。
- 修复跨 Windows/macOS 的路径分隔符和相对路径处理，统一规范化路径并避免依赖源电脑的绝对路径。
- 显式写入 `Scenes/path-to-project`，帮助 Cavalry 在移动工程后恢复包根目录。
- 增加保存后路径校验，检测打包场景中是否残留已打包素材的绝对路径。

#### 新增

- 新增“清理打包素材 / Clean package Assets”选项。
- 开启后，插件会从**打包副本**的 Assets 窗口移除未使用的文件素材；源工程不会被删除或修改。
- `package-report.json` 现在记录被重建的包内素材 ID，并记录是否启用了未使用素材清理。
- 增加跨平台路径规范化测试、Smart Folder 根目录重链测试和全工程素材清理测试。

#### 验证

- Node 语法检查通过。
- 全部 Node 测试通过。
- 覆盖 Windows 风格路径、Smart Folder 类型识别、Smart Folder 重链、全工程清理和回滚场景。

### English

#### Fixes

- Fixed Smart Folder packaging being relinked to a single child file. The package now rebuilds the Smart Folder asset inside the destination Project and rewires every `Asset from Smart Folder` connection to the packaged folder root.
- Fixed multi-image Smart Folders collapsing to the first image after packaging.
- Fixed Windows/macOS path separator and relative-path handling by normalising filesystem paths and avoiding source-machine absolute paths in the packaged Scene.
- Explicitly writes `Scenes/path-to-project` so Cavalry can recover the package root after the Project is moved.
- Added post-save validation that detects absolute paths left in packaged asset records.

#### Added

- Added the **Clean package Assets** option.
- When enabled, unused file assets are removed from the packaged Scene's Assets window only; the source Project is never pruned.
- `package-report.json` now records rebuilt packaged asset IDs and whether unused-asset pruning was enabled.
- Added tests for cross-platform path normalisation, Smart Folder root relinking and full-project unused-asset cleanup.

#### Verification

- Node syntax check passes.
- All Node tests pass.
- Coverage includes Windows-style paths, Smart Folder type detection, Smart Folder relinking, whole-project cleanup and rollback scenarios.
