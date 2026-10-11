# Changelog / 更新日志

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
