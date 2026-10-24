# Cavalry Project Packager — Development Notes

[English README](../README.md) · [中文说明](../README.zh-CN.md) · [Release tooling](../packaging/build_release.py)

## Project shape

Cavalry Project Packager is a single-file Cavalry UI Script. It collects file assets used by Compositions into a new portable Project, relinks the packaged Scene and validates the result.

- Runtime and version source: `src/Project Packager.js`
- Scenario-based Node mock harness: `tests/project-packager.test.cjs`
- User installation: `docs/INSTALL.md` and `docs/INSTALL.zh-CN.md`
- Reproducible release mapping and archive verification: `packaging/build_release.py`
- Release copy: `packaging/RELEASE-NOTES.md` and `packaging/ANNOUNCEMENT.md`
- CI: `.github/workflows/ci.yml`

The script uses an ES5-style runtime and tab indentation. Keep host API calls in the script compatible with Cavalry's JavaScript environment; Node is a test harness, not the production runtime.

## Local checks

```sh
node --check "src/Project Packager.js"
node --test tests/project-packager.test.cjs
python3 packaging/build_release.py
python3 packaging/build_release.py --verify-dir dist/release
```

The packaging command derives the archive version from `SCRIPT_VERSION`, validates public documentation, builds an allowlisted ZIP, reads back every member, checks CRC and offline links, and writes `SHA256SUMS.txt`. Fixed ZIP metadata makes repeated builds from identical bytes deterministic in the same toolchain.

`dist/`, `private/` and local `PROJECT.md` are not public source inputs. Do not add real user projects, package reports, validation logs, caches or credentials to a commit or Release.

## Runtime architecture

1. **Localisation:** `STRINGS.en/zh`, `tr()` and `applyLanguage()` own static and dynamic interface text. Language changes must not overwrite unsaved form values.
2. **Inventory:** `scanProjectAssets()` enumerates Compositions, nested layers and Assets-window connections. It classifies file, sequence, Smart Folder, font and external-reference dependencies and creates source-to-package mappings.
3. **Transaction:** `executePackage()` saves the source Scene, creates a new package, copies and size-checks files, switches the Project context, relinks assets and saves the packaged Scene.
4. **Validation and recovery:** the packaged Scene is reopened and checked for existing, portable asset paths. Failures follow `restoreOriginalScene()`; failed packages may remain for diagnosis.
5. **Interface:** destination and package-name fields, scope/options, scan preview and packaging actions remain in the single UI Script.

## Verified Cavalry API findings

These are compatibility findings from the existing `v0.1.x` development work, not assumptions from documentation alone.

### Relative paths

Cavalry 2.x `api.getRelativePath(a, b)` was observed to return the path from `b` to `a`, opposite the intuitive argument order. The script first handles in-package paths with its own normalized path logic and only uses the reversed API fallback for outside paths. The mock harness reproduces the observed direction.

### Smart Folders

- Real Smart Folder asset types include `imageFolder` and `audioFolder`; directory inspection and asset type checks are both required.
- `api.replaceAsset()` does not accept a Smart Folder directory or an `@project/...` token as a general relinking solution. Ordinary files and sequences use absolute in-package paths and are serialised by Cavalry as portable paths on save.
- Packaged Smart Folders are rebuilt with `api.loadSmartFolderAsset()`. Existing output connections are moved to the new asset, preventing a folder from collapsing to one displayed child image.
- Empty Smart Folders cannot be rebuilt into a useful packaged asset and are skipped with a warning.

### Scene and asset persistence

- `.cv` files are JSON with nodes, metadata, connections and asset records. Manually inventing a directory-path asset is not equivalent to calling the Smart Folder API.
- Unused assets can be reclaimed by Cavalry during save. Validation must use rebuilt packaged asset IDs, not stale source IDs.
- `Scenes/path-to-project` is written explicitly. Validation rejects packaged asset records that retain absolute Windows, Unix or UNC paths.
- `api.getSceneFilePath()` is empty for an unsaved Scene, so scanning requires a saved Scene first.
- Cavalry has no supported CLI/headless mode for this workflow. Node mocks do not replace host validation after runtime changes.

## Current limits

- Font copying is opt-in and requires redistribution permission.
- External `.cv/.cvc` files are copied without recursively collecting their own dependencies.
- Online and non-file dependencies remain external.
- A Smart Folder containing only nested directories and no top-level files still has a known root-relink edge case.
- `package-report.json` contains original absolute paths and must be reviewed before sharing.
- Automatic post-package ZIP creation, multi-Scene packaging and incremental packaging are not implemented.

## CI and release contract

CI runs syntax and the existing regression suite on Ubuntu, macOS and Windows. Only after all source jobs pass does the package job build, read back and upload `release-packages`.

For a new version:

1. Update `SCRIPT_VERSION`, both READMEs, installation guides, changelog and release copy together.
2. Run every local check and inspect the public diff and archive allowlist.
3. Push `main` and wait for its exact commit to pass CI.
4. Tag that exact tested commit and push the tag. Never move an already published tag.
5. Wait for the tag run, download its `release-packages` artifact and verify it with `python3 packaging/build_release.py --verify-dir <directory>`.
6. Create a new Release from those verified artifacts. Do not silently replace a same-named public attachment.
7. Download the public Release attachments and compare their SHA-256, members, script bytes and version with the tag CI result.

CI and archive evidence do not certify every Cavalry version, OS or user project. Record real host validation separately and keep unverified environments explicit in Release Notes.
