# 安装 Cavalry Project Packager v0.1.2

[English installation](INSTALL.md) · [项目首页](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/README.zh-CN.md)

本指南随安装 ZIP 离线提供，不依赖图片或其他在线资源。Node.js 与 Python 仅用于开发和发布；安装后的脚本不需要它们。

## 1. 下载并校验

请同时下载两个 Release 附件：

- `Cavalry-Project-Packager-v0.1.2.zip`
- `SHA256SUMS.txt`

请使用安装 ZIP，不要把 GitHub 自动生成的 Source code 当作安装包。

macOS / Linux：

```sh
shasum -a 256 Cavalry-Project-Packager-v0.1.2.zip
```

Windows PowerShell：

```powershell
Get-FileHash .\Cavalry-Project-Packager-v0.1.2.zip -Algorithm SHA256
```

将结果与 `SHA256SUMS.txt` 中 ZIP 那一行对比。校验不一致时请不要安装。

## 2. 备份并安装

1. 在 Cavalry 中选择 **Scripts → Show Scripts Folder**。
2. 备份需要保留的旧 `Project Packager.js`，不要覆盖无关脚本。
3. 解压安装 ZIP，把其中 `Scripts` 文件夹的**内容**复制到 Cavalry 的 Scripts 目录。唯一必需的运行文件是 `Project Packager.js`。

常见位置：

- macOS：`~/Library/Application Support/Cavalry/Scripts/`
- Windows：`%APPDATA%\Cavalry\Scripts\`

4. 重新打开 Cavalry 的 **Scripts** 菜单，选择 **Project Packager**。只有新条目未出现时再重启 Cavalry。

## 3. 打包工程

1. 打开并**保存**一个 `.cv` Scene。未保存的 Scene 没有文件路径，无法扫描；`.cvc` Component 请先导入 Scene。
2. 默认打包整个工程；如只打包指定范围，先在 Assets 窗口选中 Composition，再启用 **Only selected/active Comp + nested Pre-Comps / 仅打包选中／活动合成（含嵌套预合成）**。
3. 按需设置：按类型分类、复制外部引用、复制字体、清理打包副本中未使用的 Assets、完成后打开文件夹。
4. 选择已存在的目标父文件夹，填写尚未存在的打包名称。旧包不会被合并或覆盖。
5. 点击 **Scan Used Assets / 扫描已使用素材**，检查数量、缺失文件和警告。
6. 点击 **Package Project / 开始打包**。脚本会保存源 Scene、复制并重链素材、保存包内 Scene，再重新打开校验。
7. 分享整个生成的 Project 文件夹，包括 `Assets` 与 `Scenes`，不要只发送 `.cv`。

点击 **中文 / EN** 可切换中英界面。

## 4. 升级或移除

升级时先备份旧 `Project Packager.js`，再用新安装包中的同名文件替换。其他脚本与 Cavalry 工程不是安装目标。

移除时，备份后只删除 Scripts 目录中的 `Project Packager.js`。已经生成的 Project 打包目录仍是独立副本。

## 安全、隐私与限制

- 打包开始前会保存一次源 Scene，请先在工程副本上验证。
- **清理打包素材**只清理包内 Scene 的 Assets 窗口，不移除源 Scene 的未使用项目。
- 缺失素材、图片序列缺帧或扫描错误会阻止打包。打包失败会走既有回滚路径；保留的失败包请先检查再删除。
- 字体默认不复制。启用复制前请确认每款字体的再分发许可。
- 外部 `.cv/.cvc` 引用只复制文件本身，不递归收集其内部依赖。
- 在线和非文件依赖仍保持外部引用；文件素材便携化不代表网络服务可以离线使用。
- `package-report.json` 包含原始绝对路径。分享前请检查或移除，不影响包内 Scene 和素材。
- 正式交付前，请在接收方的 Cavalry 环境中完成一次真实整包迁移测试。

[更新日志](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/CHANGELOG.md) · [发布页面](https://github.com/luoboruodai/cavalry-project-packager/releases/tag/v0.1.2)
