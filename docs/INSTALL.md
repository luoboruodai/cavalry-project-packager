# Install Cavalry Project Packager v0.1.2

[中文安装指南](INSTALL.zh-CN.md) · [Project README](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/README.md)

This guide is included offline in the installation ZIP. It does not require images or other online resources. Node.js and Python are development tools only; the installed script does not need them.

## 1. Download and verify

Download both release attachments:

- `Cavalry-Project-Packager-v0.1.2.zip`
- `SHA256SUMS.txt`

Use the installation ZIP, not GitHub's automatic Source code archive.

macOS / Linux:

```sh
shasum -a 256 Cavalry-Project-Packager-v0.1.2.zip
```

Windows PowerShell:

```powershell
Get-FileHash .\Cavalry-Project-Packager-v0.1.2.zip -Algorithm SHA256
```

Compare the result with the ZIP line in `SHA256SUMS.txt`. Do not install an archive that does not match.

## 2. Back up and install

1. In Cavalry, choose **Scripts → Show Scripts Folder**.
2. Back up any existing `Project Packager.js` you want to keep. Do not replace unrelated scripts.
3. Extract the installation ZIP. Copy the **contents** of its `Scripts` folder into Cavalry's Scripts directory. The only required runtime file is `Project Packager.js`.

Common locations:

- macOS: `~/Library/Application Support/Cavalry/Scripts/`
- Windows: `%APPDATA%\Cavalry\Scripts\`

4. Reopen Cavalry's **Scripts** menu and choose **Project Packager**. Restart Cavalry only if the new entry does not appear.

## 3. Package a project

1. Open and **save** a `.cv` Scene. An unsaved Scene has no file path and cannot be scanned. Import `.cvc` Components into a Scene first.
2. Choose the whole project, or enable **Only selected/active Comp + nested Pre-Comps** after selecting a Composition in the Assets Window.
3. Set the options you need: categorise by type, copy external references, copy fonts, clean unused package Assets, or open the folder on completion.
4. Choose an existing destination parent folder and enter a package name that does not exist. Existing packages are not merged or overwritten.
5. Click **Scan Used Assets** and review counts, missing files and warnings.
6. Click **Package Project**. The script saves the source Scene, copies and relinks assets, saves a packaged Scene, then reopens and validates that copy.
7. Share the entire generated Project folder, including `Assets` and `Scenes`. Do not send only the `.cv` file.

The interface can be switched between English and Chinese with **中文 / EN**.

## 4. Upgrade or remove

To upgrade, back up the old `Project Packager.js`, then replace it with the file from the new archive. Your other scripts and Cavalry projects are not installation targets.

To remove the script, delete only `Project Packager.js` from Cavalry's Scripts directory after backing it up. Already generated Project packages remain independent copies.

## Safety, privacy and limits

- Packaging saves the source Scene once before copying. Validate on a project copy first.
- **Clean package Assets** prunes only the packaged Scene's Assets window; it does not remove unused items from the source Scene.
- Missing assets, image-sequence gaps or scan errors block packaging. A packaging failure triggers the existing rollback path; inspect any retained failed package before deleting it.
- Fonts are not copied by default. Check every font licence before enabling redistribution.
- External `.cv/.cvc` references are copied only as files; their internal dependencies are not collected recursively.
- Online and non-file dependencies remain external. A portable file-asset package does not make network services offline-capable.
- `package-report.json` contains original absolute paths. Review or remove it before sharing. This does not affect the packaged Scene or assets.
- Perform a real migration test in the recipient's Cavalry environment before production delivery.

[Changelog](https://github.com/luoboruodai/cavalry-project-packager/blob/v0.1.2/CHANGELOG.md) · [Release](https://github.com/luoboruodai/cavalry-project-packager/releases/tag/v0.1.2)
