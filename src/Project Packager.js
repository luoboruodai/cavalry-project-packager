// Project Packager for Cavalry
// Collects file assets used by any Composition into a portable Cavalry Project,
// relinks the current Scene to the collected files, and saves it into the package.

ui.setTitle('Project Packager')

var SCRIPT_NAME = 'Project Packager'
var SCRIPT_VERSION = '0.1.1'

// =============================================================================
// LOCALISATION (English / 中文)
// =============================================================================

var STRINGS = {
	en: {
		'ui.title': 'Project Packager',
		'ui.language': '中文 / EN',
		'ui.languageTip': 'Switch interface language / 切换界面语言',
		'ui.destination': 'Destination parent folder',
		'ui.destinationPlaceholder': 'Choose the folder that will contain the package',
		'ui.packageName': 'Package name',
		'ui.scopeSelected': 'Only selected/active Comp + nested Pre-Comps',
		'ui.scopeSelectedTip': 'Packages only the Composition selected in the Assets Window (or the active Composition) and its nested Pre-Comps.',
		'ui.categorise': 'Categorise assets by type',
		'ui.includeReferences': 'Copy external .cv/.cvc references',
		'ui.includeReferencesTip': 'Copies external .cv/.cvc files themselves; dependencies inside them are reported only, not collected recursively.',
		'ui.includeFonts': 'Copy font files (check licence)',
		'ui.includeFontsTip': 'Fonts are copied to Assets/Fonts and relinked. Confirm the licence allows redistribution.',
		'ui.pruneUnused': 'Clean package Assets (remove unused items)',
		'ui.pruneUnusedTip': 'Removes unused Assets-window items from the packaged Scene only. The source Scene is never pruned.',
		'ui.openFolder': 'Open package folder when complete',
		'ui.usedDependencies': 'Used dependencies',
		'ui.scan': 'Scan Used Assets',
		'ui.package': 'Package Project',
		'ui.ready': 'Ready',
		'ui.blocking': 'BLOCKING: {0}',
		'ui.files': '{0} file(s)',
		'ui.summarySelected': 'Selected: {0} + {1} nested Pre-Comp(s) · ',
		'ui.summaryAll': 'All Compositions · ',
		'ui.summaryAssets': '{0} used file asset(s), {1}',
		'ui.summaryErrors': ' · {0} blocking error(s)',
		'ui.summaryWarnings': ' · {0} warning(s)',
		'ui.cannotPackage': 'Cannot package: {0}',
		'ui.scanning': 'Scanning Compositions and dependencies...',
		'ui.scanFailed': 'Scan failed: {0}',
		'ui.fixErrors': 'Fix the blocking scan errors before packaging.',
		'ui.copying': 'Copying and verifying assets...',
		'err.inspectChildren': 'Could not inspect children of {0}: {1}',
		'err.readActiveComp': 'Could not read the active Composition: {0}',
		'err.readSelection': 'Could not read Composition selection: {0}',
		'err.enumComps': 'Could not enumerate Compositions: {0}',
		'err.noComps': 'No Composition was found in the Scene.',
		'err.inspectCompRef': 'Could not inspect Composition Reference {0}: {1}',
		'err.inspectComp': 'Could not inspect Composition {0}: {1}',
		'err.restoreActiveComp': 'Could not restore the active Composition: {0}',
		'err.selectOneComp': 'Select only one Composition in the Assets Window.',
		'err.noValidComp': 'No valid selected or active Composition was found.',
		'err.inspectConnections': 'Could not inspect connections for {0}: {1}',
		'err.enumSeqFrames': 'Could not enumerate image-sequence frames: {0}',
		'err.seqGap': 'Sequence has a frame-number gap between {0} and {1}.',
		'err.dirTraversal': 'Directory traversal returned no file list: {0}',
		'err.destCollision': 'Could not resolve destination collision for {0}',
		'err.readScenePath': 'Could not read the current Scene path from Cavalry: {0}',
		'err.emptyScenePath': 'Cavalry getSceneFilePath() returned an empty path — the Scene has probably never been saved. Save the Scene as a .cv file first, then scan again.',
		'err.projectRelativeNoRoot': 'The Scene path is Project-relative, but Cavalry did not return a Project root: {0}',
		'err.classifyUnused': 'Could not classify unused asset {0}: {1}',
		'err.classifyAsset': 'Could not classify asset {0}: {1}',
		'err.noFilePath': 'Asset has no readable file path.',
		'err.inspectSourceDir': 'Could not inspect source directory: {0}',
		'err.listSmartFolder': 'Could not list Smart Folder: {0}',
		'err.smartFolderMissing': 'Smart Folder is missing: {0}',
		'err.smartFolderOutside': 'Smart Folder contains a path outside its root: {0}',
		'err.missingSource': 'Missing source file: {0}',
		'err.recordState': 'Could not record original Assets Window state. Nothing was changed: {0}',
		'err.noDestination': 'Choose an existing destination folder.',
		'err.packageExists': 'The package folder already exists. Choose a new name or destination.',
		'err.blockedByScan': 'Packaging is blocked by {0} scan error(s).',
		'err.saveOriginal': 'Could not save the original Scene. Nothing was changed.',
		'err.createRoot': 'Could not create package root.',
		'err.createFolder': 'Could not create {0}.',
		'err.writeDescription': 'Could not write projectDescription.json.',
		'err.createSmartDest': 'Could not create Smart Folder destination: {0}',
		'err.writeProjectMarker': 'Could not write Scenes/path-to-project.',
		'err.smartRelink': 'Could not rebuild Smart Folder link for {0}: {1}',
		'err.serializedAbsolutePath': 'Packaged asset {0} still contains an absolute path in the saved Scene.',
		'err.copyFailed': 'Copy or verification failed: {0}',
		'err.writeEarlyReport': 'Could not write package-report.json before relinking.',
		'err.activateProject': 'Cavalry did not activate the new Project root.',
		'err.savePackaged': 'Could not save the packaged Scene.',
		'err.saveAsSwitch': 'Save As did not switch to the packaged Scene.',
		'err.validationFailed': 'Package validation failed. See package-report.json.',
		'err.writeFinalReport': 'Could not write the final package-report.json.',
		'err.reopenOriginal': 'Could not reopen original Scene: {0}',
		'err.notOriginalScene': 'The active Scene is not the original Scene.',
		'err.verifyOriginalScene': 'Could not verify the original Scene: {0}',
		'err.restoreProject': 'Could not restore original Project: {0}',
		'err.notOriginalProject': 'The active Project is not the original Project.',
		'err.verifyOriginalProject': 'Could not verify the original Project: {0}',
		'err.compCountRestored': 'The original Composition count was not restored.',
		'err.compRestored': 'Original Composition was not restored: {0}',
		'err.assetsRestored': 'The original Assets Window contents were not restored.',
		'err.assetRestored': 'Original Asset was not restored: {0}',
		'err.verifySceneContents': 'Could not verify original Scene contents: {0}',
		'err.restoreActiveComp2': 'Could not restore the original active Composition: {0}',
		'err.assetPathRestored': 'Original asset path was not restored: {0}',
		'err.verifyAsset': 'Could not verify original asset {0}: {1}',
		'err.pruneSafety': 'Refusing to remove unrelated Compositions before switching to the packaged Scene.',
		'err.pruneComp': 'Could not remove unrelated Composition: {0}',
		'err.pruneAsset': 'Could not remove unrelated asset: {0}',
		'err.pruneKept': 'A required Composition was removed: {0}',
		'err.savePruned': 'Could not save the selected-Composition Scene after pruning.',
		'err.reopenPackaged': 'Could not reopen packaged Scene: {0}',
		'err.packagedScenePath': 'Packaged Scene did not reopen from the expected path.',
		'err.packagedProjectRoot': 'Packaged Scene did not activate the new Project root.',
		'err.markerMissing': 'Scenes/path-to-project was not created.',
		'err.markerWrong': 'Scenes/path-to-project does not point to the package root.',
		'err.markerVerify': 'Could not verify Scenes/path-to-project: {0}',
		'err.unexpectedComps': 'The packaged Scene contains unexpected Compositions.',
		'err.compMissing': 'Required Composition is missing: {0}',
		'err.unrelatedAssetRemains': 'Unrelated asset remains in packaged Scene: {0}',
		'err.verifyPackagedComps': 'Could not verify packaged Compositions: {0}',
		'err.resolvesOutside': '{0} resolves outside the package after reopening.',
		'err.resolvesMissing': '{0} resolves to a missing packaged path.',
		'warn.compRefNoTarget': 'Composition Reference has no local target (possibly an external .cv reference): {0}',
		'warn.restoreSelection': 'Could not restore the original selection: {0}',
		'warn.refCompOutside': 'Referenced Composition is outside this Scene: {0}',
		'warn.onlineDependency': '{0} ({1}) is an online or non-file dependency and remains external.',
		'warn.fontNotCopied': 'Font is not copied by default; enable the font option or install it on the destination system.',
		'warn.fontCopied': 'Font file was copied; confirm its licence permits redistribution.',
		'warn.refExcluded': 'External Cavalry reference was excluded and will not be portable.',
		'warn.refCopiedShallow': 'The reference file is copied, but dependencies inside it are not collected recursively.',
		'warn.smartFolderEmpty': 'Smart Folder is empty.',
		'msg.packaged': 'Packaged {0} dependency record(s), {1}.',
		'msg.failed': 'Packaging failed: {0}',
		'msg.restoreUnverified': ' WARNING: original Scene or Project restoration could not be verified: {0}. Reopen the original Scene manually: {1}.',
		'msg.restored': ' The original Scene and Project were restored.',
		'msg.failedKept': ' The failed package was kept for diagnosis.',
		'msg.reportUnwritten': ' WARNING: package-report.json could not be written.',
		'kind.file': 'file',
		'kind.sequence': 'sequence',
		'kind.smartFolder': 'smart folder',
		'kind.font': 'font',
		'kind.reference': 'reference',
	},
	zh: {
		'ui.title': 'Project Packager（工程打包器）',
		'ui.language': '中文 / EN',
		'ui.languageTip': '切换界面语言 / Switch interface language',
		'ui.destination': '目标父文件夹',
		'ui.destinationPlaceholder': '选择用于存放打包结果的文件夹',
		'ui.packageName': '打包名称',
		'ui.scopeSelected': '仅打包选中/活动合成（含嵌套预合成）',
		'ui.scopeSelectedTip': '只打包 Assets 窗口中选中的合成（未选中时为当前活动合成）及其嵌套预合成。',
		'ui.categorise': '按类型分类素材',
		'ui.includeReferences': '复制外部 .cv/.cvc 引用',
		'ui.includeReferencesTip': '复制外部 .cv/.cvc 文件本身；其内部嵌套依赖仅报告，不递归收集。',
		'ui.includeFonts': '复制字体文件（注意授权）',
		'ui.includeFontsTip': '字体将复制到 Assets/Fonts 并重链，请确认授权允许再分发。',
		'ui.pruneUnused': '清理打包素材（移除未使用项目）',
		'ui.pruneUnusedTip': '只清理打包副本 Assets 窗口中的未使用素材，不会修改源工程。',
		'ui.openFolder': '完成后打开打包文件夹',
		'ui.usedDependencies': '已使用的依赖',
		'ui.scan': '扫描已使用素材',
		'ui.package': '开始打包',
		'ui.ready': '就绪',
		'ui.blocking': '阻止项：{0}',
		'ui.files': '{0} 个文件',
		'ui.summarySelected': '已选：{0} + {1} 个嵌套预合成 · ',
		'ui.summaryAll': '全部合成 · ',
		'ui.summaryAssets': '{0} 个已用文件素材，{1}',
		'ui.summaryErrors': ' · {0} 个阻止性错误',
		'ui.summaryWarnings': ' · {0} 个警告',
		'ui.cannotPackage': '无法打包：{0}',
		'ui.scanning': '正在扫描合成与依赖…',
		'ui.scanFailed': '扫描失败：{0}',
		'ui.fixErrors': '请先解决阻止性扫描错误，再进行打包。',
		'ui.copying': '正在复制并校验素材…',
		'err.inspectChildren': '无法检查 {0} 的子级：{1}',
		'err.readActiveComp': '无法读取当前活动合成：{0}',
		'err.readSelection': '无法读取合成选择：{0}',
		'err.enumComps': '无法枚举合成：{0}',
		'err.noComps': '场景中未找到任何合成。',
		'err.inspectCompRef': '无法检查合成引用 {0}：{1}',
		'err.inspectComp': '无法检查合成 {0}：{1}',
		'err.restoreActiveComp': '无法恢复活动合成：{0}',
		'err.selectOneComp': '请只在 Assets 窗口中选中一个合成。',
		'err.noValidComp': '未找到有效的选中或活动合成。',
		'err.inspectConnections': '无法检查 {0} 的连接：{1}',
		'err.enumSeqFrames': '无法枚举图片序列帧：{0}',
		'err.seqGap': '序列在 {0} 与 {1} 之间存在帧号断档。',
		'err.dirTraversal': '目录遍历未返回文件列表：{0}',
		'err.destCollision': '无法解决目标路径冲突：{0}',
		'err.readScenePath': '无法从 Cavalry 读取当前场景路径：{0}',
		'err.emptyScenePath': '当前场景尚未保存为 .cv 文件（getSceneFilePath() 返回空路径）。请先保存场景，再重新扫描。',
		'err.projectRelativeNoRoot': '场景路径为工程相对路径，但 Cavalry 未返回工程根目录：{0}',
		'err.classifyUnused': '无法分类未使用的素材 {0}：{1}',
		'err.classifyAsset': '无法分类素材 {0}：{1}',
		'err.noFilePath': '素材没有可读取的文件路径。',
		'err.inspectSourceDir': '无法检查源目录：{0}',
		'err.listSmartFolder': '无法列出智能文件夹：{0}',
		'err.smartFolderMissing': '智能文件夹丢失：{0}',
		'err.smartFolderOutside': '智能文件夹包含其根目录之外的路径：{0}',
		'err.missingSource': '源文件缺失：{0}',
		'err.recordState': '无法记录 Assets 窗口的原始状态，未做任何改动：{0}',
		'err.noDestination': '请选择一个已存在的目标文件夹。',
		'err.packageExists': '打包文件夹已存在，请更换名称或目标位置。',
		'err.blockedByScan': '打包被 {0} 个扫描错误阻止。',
		'err.saveOriginal': '无法保存原始场景，未做任何改动。',
		'err.createRoot': '无法创建打包根目录。',
		'err.createFolder': '无法创建 {0}。',
		'err.writeDescription': '无法写入 projectDescription.json。',
		'err.createSmartDest': '无法创建智能文件夹目标目录：{0}',
		'err.writeProjectMarker': '无法写入 Scenes/path-to-project。',
		'err.smartRelink': '无法重建智能文件夹 {0} 的引用：{1}',
		'err.serializedAbsolutePath': '打包后的场景仍包含素材 {0} 的绝对路径。',
		'err.copyFailed': '复制或校验失败：{0}',
		'err.writeEarlyReport': '无法在重链前写入 package-report.json。',
		'err.activateProject': 'Cavalry 未激活新的工程根目录。',
		'err.savePackaged': '无法保存打包后的场景。',
		'err.saveAsSwitch': '另存为未能切换到打包场景。',
		'err.validationFailed': '打包校验失败，详见 package-report.json。',
		'err.writeFinalReport': '无法写入最终的 package-report.json。',
		'err.reopenOriginal': '无法重新打开原始场景：{0}',
		'err.notOriginalScene': '当前场景不是原始场景。',
		'err.verifyOriginalScene': '无法验证原始场景：{0}',
		'err.restoreProject': '无法恢复原始工程：{0}',
		'err.notOriginalProject': '当前工程不是原始工程。',
		'err.verifyOriginalProject': '无法验证原始工程：{0}',
		'err.compCountRestored': '原始合成数量未能恢复。',
		'err.compRestored': '原始合成未能恢复：{0}',
		'err.assetsRestored': 'Assets 窗口的原始内容未能恢复。',
		'err.assetRestored': '原始素材未能恢复：{0}',
		'err.verifySceneContents': '无法验证原始场景内容：{0}',
		'err.restoreActiveComp2': '无法恢复原始活动合成：{0}',
		'err.assetPathRestored': '原始素材路径未能恢复：{0}',
		'err.verifyAsset': '无法验证原始素材 {0}：{1}',
		'err.pruneSafety': '在切换到打包场景之前，拒绝移除无关合成。',
		'err.pruneComp': '无法移除无关合成：{0}',
		'err.pruneAsset': '无法移除无关素材：{0}',
		'err.pruneKept': '必需的合成被移除了：{0}',
		'err.savePruned': '清理后无法保存选定合成的场景。',
		'err.reopenPackaged': '无法重新打开打包场景：{0}',
		'err.packagedScenePath': '打包场景未能从预期路径重新打开。',
		'err.packagedProjectRoot': '打包场景未能激活新的工程根目录。',
		'err.markerMissing': 'Scenes/path-to-project 未被创建。',
		'err.markerWrong': 'Scenes/path-to-project 未指向打包根目录。',
		'err.markerVerify': '无法验证 Scenes/path-to-project：{0}',
		'err.unexpectedComps': '打包场景包含意外的合成。',
		'err.compMissing': '必需的合成缺失：{0}',
		'err.unrelatedAssetRemains': '打包场景中仍残留无关素材：{0}',
		'err.verifyPackagedComps': '无法验证打包后的合成：{0}',
		'err.resolvesOutside': '{0} 重新打开后解析到了包外路径。',
		'err.resolvesMissing': '{0} 解析到的包内路径缺失。',
		'warn.compRefNoTarget': '合成引用没有本地目标（可能是外部 .cv 引用）：{0}',
		'warn.restoreSelection': '无法恢复原始选择：{0}',
		'warn.refCompOutside': '被引用的合成不在此场景中：{0}',
		'warn.onlineDependency': '{0}（{1}）是在线或非文件依赖，将保持外部引用。',
		'warn.fontNotCopied': '字体默认不复制；请启用字体选项，或在目标系统上安装该字体。',
		'warn.fontCopied': '字体文件已复制；请确认其授权允许再分发。',
		'warn.refExcluded': '外部 Cavalry 引用已被排除，将不可移植。',
		'warn.refCopiedShallow': '引用文件已复制，但其内部依赖不会被递归收集。',
		'warn.smartFolderEmpty': '智能文件夹为空。',
		'msg.packaged': '已打包 {0} 条依赖记录，共 {1}。',
		'msg.failed': '打包失败：{0}',
		'msg.restoreUnverified': ' 警告：无法验证原始场景或工程是否已恢复：{0}。请手动重新打开原始场景：{1}。',
		'msg.restored': ' 原始场景与工程已恢复。',
		'msg.failedKept': ' 失败的打包已保留，便于排查。',
		'msg.reportUnwritten': ' 警告：无法写入 package-report.json。',
		'kind.file': '文件',
		'kind.sequence': '图片序列',
		'kind.smartFolder': '智能文件夹',
		'kind.font': '字体',
		'kind.reference': '引用',
	},
}

var currentLanguage = 'en'

function tr(key) {
	var table = STRINGS[currentLanguage] || STRINGS.en
	var text = table[key]
	if (typeof text !== 'string') text = STRINGS.en[key]
	if (typeof text !== 'string') return key
	for (var i = 1; i < arguments.length; i++)
		text = text.split('{' + (i - 1) + '}').join(String(arguments[i]))
	return text
}

function setLanguage(language) {
	currentLanguage = language === 'zh' ? 'zh' : 'en'
	if (typeof applyLanguage === 'function') applyLanguage()
}

// =============================================================================
// PATH AND STRING HELPERS
// =============================================================================

function normalisePath(path) {
	if (!path) return ''
	var value = String(path).replace(/\\/g, '/')
	while (value.length > 1 && value.charAt(value.length - 1) === '/') {
		value = value.substring(0, value.length - 1)
	}
	// Keep Cavalry tokens such as @project/@assets intact, but collapse
	// dot-segments in real filesystem paths so Windows and macOS produce the
	// same package-relative destination keys.
	if (value.charAt(0) === '/' || value.substring(0, 2) === '//' || /^[A-Za-z]:\//.test(value)) {
		var prefix = ''
		var rest = value
		if (rest.substring(0, 2) === '//') {
			prefix = '//'
			rest = rest.substring(2)
		} else if (rest.charAt(0) === '/') {
			prefix = '/'
			rest = rest.substring(1)
		} else if (/^[A-Za-z]:\//.test(rest)) {
			prefix = rest.substring(0, 3)
			rest = rest.substring(3)
		}
		var segments = rest.split('/')
		var stack = []
		for (var segmentIndex = 0; segmentIndex < segments.length; segmentIndex++) {
			var segment = segments[segmentIndex]
			if (!segment || segment === '.') continue
			if (segment === '..') {
				if (stack.length > 0 && stack[stack.length - 1] !== '..') stack.pop()
				else if (prefix === '') stack.push(segment)
			} else stack.push(segment)
		}
		value = prefix + stack.join('/')
	}
	return value
}

function canonicalPath(path) {
	var value = normalisePath(path)
	if (!value) return ''
	if (value === '@project' || value.substring(0, 9) === '@project/') {
		try {
			var projectRoot = normalisePath(api.getProjectPath())
			if (projectRoot)
				value = joinPath(
					projectRoot,
					value === '@project' ? '' : value.substring(9)
				)
		} catch (e) {}
	}
	try {
		var absolute = normalisePath(api.getAbsolutePath(value))
		if (absolute) value = absolute
	} catch (e) {}
	return value
}

function startsWithPath(path, parent) {
	var childValue = normalisePath(path)
	var parentValue = normalisePath(parent)
	if (api.getPlatform && api.getPlatform() === 'Windows') {
		childValue = childValue.toLowerCase()
		parentValue = parentValue.toLowerCase()
	}
	return (
		childValue === parentValue ||
		childValue.substring(0, parentValue.length + 1) === parentValue + '/'
	)
}

function pathKey(path) {
	var value = normalisePath(path)
	try {
		if (api.getPlatform() === 'Windows') return value.toLowerCase()
	} catch (e) {}
	return value
}

function fileNameFromPath(path) {
	var value = normalisePath(path)
	var index = value.lastIndexOf('/')
	return index === -1 ? value : value.substring(index + 1)
}

function folderFromPath(path) {
	try {
		return normalisePath(api.getFolderFromPath(path))
	} catch (e) {}
	var value = normalisePath(path)
	var index = value.lastIndexOf('/')
	return index === -1 ? '' : value.substring(0, index)
}

function extensionFromPath(path) {
	var name = fileNameFromPath(path)
	var index = name.lastIndexOf('.')
	return index <= 0 ? '' : name.substring(index).toLowerCase()
}

function baseNameFromPath(path) {
	var name = fileNameFromPath(path)
	var index = name.lastIndexOf('.')
	return index <= 0 ? name : name.substring(0, index)
}

function safeName(value, fallback) {
	var result = String(value || '').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
	result = result.replace(/^\s+|\s+$/g, '').replace(/[. ]+$/g, '')
	if (result === '' || result === '.' || result === '..')
		result = fallback || 'Item'
	return result
}

function joinPath(left, right) {
	var a = normalisePath(left)
	var b = String(right || '')
		.replace(/\\/g, '/')
		.replace(/^\/+/, '')
	return a === '' ? b : a + '/' + b
}

function relativePath(from, to) {
	// api.getRelativePath(a, b) actually returns the path from b to a on real
	// Cavalry, so compute the common case manually and only use the api (with
	// swapped arguments) as a fallback for paths outside the root.
	var root = normalisePath(from)
	var value = normalisePath(to)
	if (startsWithPath(value, root)) return value.substring(root.length + 1)
	try {
		return normalisePath(api.getRelativePath(value, root)).replace(/^\.\//, '')
	} catch (e) {
		return fileNameFromPath(value)
	}
}

function formatSize(kilobytes) {
	var size = Number(kilobytes || 0)
	if (size >= 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' GB'
	if (size >= 1024) return (size / 1024).toFixed(2) + ' MB'
	return size.toFixed(0) + ' KB'
}

function nowIso() {
	try {
		return new Date().toISOString()
	} catch (e) {
		return String(new Date())
	}
}

function pathToFileUrl(path) {
	var value = normalisePath(path)
	if (value.substring(0, 2) === '//') return 'file:' + encodeURI(value)
	return 'file:///' + encodeURI(value)
}

function stringArray(value) {
	if (!value || value === '') return []
	if (typeof value === 'string')
		return value.indexOf(',') === -1 ? [value] : value.split(',')
	return value
}

function extractLayerId(connection) {
	var value = String(connection || '').replace(/^\s+|\s+$/g, '')
	var dot = value.indexOf('.')
	return dot === -1 ? value : value.substring(0, dot)
}

function extractAttributeId(connection) {
	var value = String(connection || '').replace(/^\s+|\s+$/g, '')
	var dot = value.indexOf('.')
	return dot === -1 ? '' : value.substring(dot + 1)
}

function containsString(list, value) {
	for (var i = 0; i < list.length; i++) {
		if (list[i] === value) return true
	}
	return false
}

// =============================================================================
// SCENE DEPENDENCY DISCOVERY
// =============================================================================

function addLayerAndDescendants(layerId, layerSet, errors) {
	if (!layerId || layerSet[layerId]) return
	layerSet[layerId] = true
	try {
		var children = api.getChildren(layerId)
		for (var i = 0; i < children.length; i++)
			addLayerAndDescendants(children[i], layerSet, errors)
	} catch (e) {
		errors.push(tr('err.inspectChildren', layerId, e))
	}
}

function collectCompositionLayers(scope) {
	var result = { layers: {}, compIds: [], allCompIds: [], rootCompId: '', rootCompName: '', errors: [], warnings: [] }
	var originalComp = ''
	try {
		originalComp = api.getActiveComp()
	} catch (e) {
		result.errors.push(tr('err.readActiveComp', e))
	}
	var selection = []
	try {
		selection = stringArray(api.getSelection())
	} catch (e) {
		if (scope === 'selected')
			result.errors.push(tr('err.readSelection', e))
	}
	var allComps = []
	try {
		allComps = stringArray(api.getComps())
	} catch (e) {
		result.errors.push(tr('err.enumComps', e))
	}
	result.allCompIds = allComps
	if (allComps.length === 0)
		result.errors.push(tr('err.noComps'))

	var layersByComp = {}
	var referencesByComp = {}
	for (var i = 0; i < allComps.length; i++) {
		var itemId = allComps[i]
		var layerSet = {}
		try {
			api.setActiveComp(itemId)
			var layers = api.getCompLayers(false)
			for (var j = 0; j < layers.length; j++)
				addLayerAndDescendants(layers[j], layerSet, result.errors)
			layersByComp[itemId] = layerSet
			if (scope === 'selected') {
				referencesByComp[itemId] = []
				for (var layerId in layerSet) {
					if (!Object.prototype.hasOwnProperty.call(layerSet, layerId)) continue
					try {
						if (api.getLayerType(layerId) === 'compositionReference') {
							var referencedComp = api.getCompFromReference(layerId)
							if (!referencedComp)
								result.warnings.push(tr('warn.compRefNoTarget', layerId))
							else referencesByComp[itemId].push(referencedComp)
						}
					} catch (e) {
						result.errors.push(tr('err.inspectCompRef', layerId, e))
					}
				}
			}
		} catch (e) {
			result.errors.push(tr('err.inspectComp', itemId, e))
		}
	}

	if (originalComp) {
		try {
			api.setActiveComp(originalComp)
		} catch (e) {
			result.errors.push(tr('err.restoreActiveComp', e))
		}
	}
	if (selection.length > 0) {
		try {
			api.select(selection)
		} catch (e) {
			result.warnings.push(tr('warn.restoreSelection', e))
		}
	}

	if (scope === 'selected') {
		var selectedComps = []
		for (var s = 0; s < selection.length; s++)
			if (containsString(allComps, selection[s])) selectedComps.push(selection[s])
		if (selectedComps.length > 1)
			result.errors.push(tr('err.selectOneComp'))
		result.rootCompId = selectedComps.length === 1 ? selectedComps[0] : originalComp
		if (!containsString(allComps, result.rootCompId))
			result.errors.push(tr('err.noValidComp'))
		else {
			try {
				result.rootCompName = api.getNiceName(result.rootCompId) || result.rootCompId
			} catch (e) {
				result.rootCompName = result.rootCompId
			}
		}
		var keepComps = {}
		if (result.rootCompId) keepComps[result.rootCompId] = true
		var changed = true
		while (changed) {
			changed = false
			for (var parentIndex = 0; parentIndex < allComps.length; parentIndex++) {
				var parentComp = allComps[parentIndex]
				if (!keepComps[parentComp]) continue
				var references = referencesByComp[parentComp] || []
				for (var referenceIndex = 0; referenceIndex < references.length; referenceIndex++) {
					var childComp = references[referenceIndex]
					if (!containsString(allComps, childComp))
						result.warnings.push(tr('warn.refCompOutside', childComp))
					else if (!keepComps[childComp]) {
						keepComps[childComp] = true
						changed = true
					}
				}
			}
		}
		for (var kept = 0; kept < allComps.length; kept++)
			if (keepComps[allComps[kept]]) result.compIds.push(allComps[kept])
	} else {
		result.compIds = allComps.slice()
	}
	for (var c = 0; c < result.compIds.length; c++) {
		var compLayers = layersByComp[result.compIds[c]] || {}
		result.layers[result.compIds[c]] = true
		for (var layerId in compLayers)
			if (Object.prototype.hasOwnProperty.call(compLayers, layerId))
				result.layers[layerId] = true
	}
	return result
}

function isAssetUsed(assetId, sceneLayers, errors) {
	try {
		var connections = stringArray(api.getOutConnections(assetId, 'id'))
		for (var i = 0; i < connections.length; i++) {
			if (sceneLayers[extractLayerId(connections[i])]) return true
		}
	} catch (e) {
		errors.push(tr('err.inspectConnections', assetId, e))
	}
	return false
}

function isReferencePath(path) {
	var extension = extensionFromPath(path)
	return extension === '.cv' || extension === '.cvc'
}

function isSmartFolderType(assetType) {
	var value = String(assetType || '')
		.toLowerCase()
		.replace(/[\s_\-]/g, '')
	return (
		value.indexOf('smartfolder') !== -1 ||
		value === 'imagefolder' ||
		value === 'audiofolder'
	)
}

function typeFolder(assetType, path, categorise) {
	if (!categorise) return ''
	var type = String(assetType || '').toLowerCase()
	var extension = extensionFromPath(path)
	if (type.indexOf('audio') !== -1) return 'Audio'
	if (type.indexOf('movie') !== -1 || type.indexOf('video') !== -1)
		return 'Footage'
	if (type.indexOf('image') !== -1 || type.indexOf('svg') !== -1)
		return 'Images'
	if (
		type.indexOf('spreadsheet') !== -1 ||
		type.indexOf('text') !== -1 ||
		extension === '.csv' ||
		extension === '.json'
	)
		return 'Data'
	return 'Data'
}

function sequenceInfo(assetId, assetType) {
	var paths = []
	var error = ''
	try {
		paths = api.getImageSequenceFilePaths(assetId) || []
	} catch (e) {
		if (String(assetType || '').toLowerCase().indexOf('sequence') !== -1)
			error = tr('err.enumSeqFrames', e)
	}
	var type = String(assetType || '').toLowerCase()
	return {
		isSequence: paths.length > 1 || type.indexOf('sequence') !== -1,
		paths: paths,
		error: error,
	}
}

function sequenceGap(paths) {
	if (!paths || paths.length < 2) return ''
	var numbers = []
	var prefix = null
	var suffix = null
	for (var i = 0; i < paths.length; i++) {
		var name = fileNameFromPath(paths[i])
		var match = name.match(/^(.*?)(\d+)(\.[^.]+)$/)
		if (!match) return ''
		if (prefix === null) {
			prefix = match[1]
			suffix = match[3].toLowerCase()
		}
		if (prefix !== match[1] || suffix !== match[3].toLowerCase()) return ''
		numbers.push(parseInt(match[2], 10))
	}
	numbers.sort(function (a, b) {
		return a - b
	})
	for (var j = 1; j < numbers.length; j++) {
		if (numbers[j] !== numbers[j - 1] + 1) {
			return tr('err.seqGap', numbers[j - 1], numbers[j])
		}
	}
	return ''
}

function fileSizeSafe(path) {
	try {
		return Number(api.getFileSize(path) || 0)
	} catch (e) {
		return 0
	}
}

function listSmartFolderFiles(rootPath) {
	var paths = api.listDirectoryRecursive(rootPath)
	if (!paths || typeof paths.length !== 'number')
		throw new Error(tr('err.dirTraversal', rootPath))
	var files = []
	for (var i = 0; i < paths.length; i++) {
		if (api.isFile(paths[i])) files.push(canonicalPath(paths[i]))
	}
	files.sort()
	return files
}

function nextUniqueRelative(baseRelative, sourceKey, reservations) {
	var candidate = normalisePath(baseRelative)
	var candidateKey = pathKey(candidate)
	var existing = reservations[candidateKey]
	if (!existing || existing === sourceKey) {
		reservations[candidateKey] = sourceKey
		return candidate
	}

	var folder = folderFromPath(candidate)
	var name = fileNameFromPath(candidate)
	var extension = extensionFromPath(name)
	var base = extension
		? name.substring(0, name.length - extension.length)
		: name
	for (var i = 2; i < 10000; i++) {
		var numbered = joinPath(folder, base + '_' + i + extension)
		var numberedKey = pathKey(numbered)
		existing = reservations[numberedKey]
		if (!existing || existing === sourceKey) {
			reservations[numberedKey] = sourceKey
			return numbered
		}
	}
	throw new Error(tr('err.destCollision', candidate))
}

function scanProjectAssets(options) {
	var result = {
		generatedAt: nowIso(),
		scope: options.scope === 'selected' ? 'selected' : 'all',
		pruneUnusedAssets: Boolean(options.pruneUnusedAssets),
		scenePath: '',
		projectPath: '',
		rootCompId: '',
		rootCompName: '',
		compIds: [],
		allCompIds: [],
		unusedAssetIds: [],
		entries: [],
		warnings: [],
		errors: [],
		totalSizeKB: 0,
		usedFileAssetCount: 0,
	}

	var rawScenePath = ''
	try {
		rawScenePath = api.getSceneFilePath() || ''
		result.scenePath = canonicalPath(rawScenePath)
	} catch (e) {
		result.errors.push(tr('err.readScenePath', e))
		return result
	}
	try {
		result.projectPath = canonicalPath(api.getProjectPath())
	} catch (e) {}
	if (!result.scenePath) {
		result.errors.push(tr('err.emptyScenePath'))
		return result
	}
	if (result.scenePath === '@project' || result.scenePath.substring(0, 9) === '@project/') {
		result.errors.push(tr('err.projectRelativeNoRoot', rawScenePath))
		return result
	}

	var compositionScan = collectCompositionLayers(result.scope)
	result.rootCompId = compositionScan.rootCompId
	result.rootCompName = compositionScan.rootCompName
	result.compIds = compositionScan.compIds
	result.allCompIds = compositionScan.allCompIds
	result.errors = result.errors.concat(compositionScan.errors)
	result.warnings = result.warnings.concat(compositionScan.warnings)
	var sceneLayers = compositionScan.layers
	var allAssets = api.getAssetWindowLayers(false)
	var candidates = []

	for (var i = 0; i < allAssets.length; i++) {
		var assetId = allAssets[i]
		if (containsString(result.allCompIds, assetId)) continue
		var used = isAssetUsed(assetId, sceneLayers, result.errors)
		if (!used) {
			try {
				// Selected-Composition packaging has always pruned unrelated file
				// assets. In 0.1.1 the same inventory is also available to the new
				// optional "clean package" pass for whole-project packaging.
				if (api.isFileAsset(assetId) || api.getAssetType(assetId) !== 'unknown')
					result.unusedAssetIds.push(assetId)
			} catch (e) {
				result.errors.push(tr('err.classifyUnused', assetId, e))
			}
			continue
		}

		var assetType = 'unknown'
		try {
			assetType = api.getAssetType(assetId) || 'unknown'
		} catch (e) {}
		var isFileAsset = false
		try {
			isFileAsset = api.isFileAsset(assetId)
		} catch (e) {
			result.errors.push(tr('err.classifyAsset', assetId, e))
			continue
		}
		var assetName = assetId
		try {
			assetName = api.getNiceName(assetId) || assetId
		} catch (e) {}

		if (!isFileAsset) {
			if (assetType !== 'unknown' && assetType !== '') {
				result.warnings.push(tr('warn.onlineDependency', assetName, assetType))
			}
			continue
		}

		result.usedFileAssetCount++
		var sourcePath = ''
		try {
			sourcePath = canonicalPath(api.getAssetFilePath(assetId))
		} catch (e) {}

		candidates.push({
			id: assetId,
			name: assetName,
			type: assetType,
			sourcePath: sourcePath,
		})
	}

	candidates.sort(function (a, b) {
		var left = String(a.type) + '\n' + String(a.name) + '\n' + a.id
		var right = String(b.type) + '\n' + String(b.name) + '\n' + b.id
		return left < right ? -1 : left > right ? 1 : 0
	})

	var reservations = {}
	var sharedSourceDestinations = {}

	for (var c = 0; c < candidates.length; c++) {
		var candidate = candidates[c]
		var entry = {
			id: candidate.id,
			name: candidate.name,
			type: candidate.type,
			kind: 'file',
			sourcePath: candidate.sourcePath,
			sourceFiles: [],
			mappings: [],
			destinationRelative: '',
			relinkRelative: '',
			sizeKB: 0,
			included: true,
			warnings: [],
			errors: [],
		}

		var lowerType = String(entry.type || '').toLowerCase()
		var isFont = lowerType.indexOf('font') !== -1
		if (isFont) {
			entry.kind = 'font'
			if (!options.includeFonts) {
				entry.included = false
				entry.warnings.push(tr('warn.fontNotCopied'))
				result.warnings.push(entry.name + ': ' + entry.warnings[0])
				result.entries.push(entry)
				continue
			}
			entry.warnings.push(tr('warn.fontCopied'))
			result.warnings.push(entry.name + ': ' + entry.warnings[0])
		}

		if (!entry.sourcePath) {
			entry.errors.push(tr('err.noFilePath'))
			result.errors.push(entry.name + ': ' + entry.errors[0])
			result.entries.push(entry)
			continue
		}

		if (isReferencePath(entry.sourcePath)) {
			entry.kind = 'reference'
			if (!options.includeReferences) {
				entry.included = false
				entry.warnings.push(tr('warn.refExcluded'))
				result.warnings.push(entry.name + ': ' + entry.warnings[0])
				result.entries.push(entry)
				continue
			}
			entry.warnings.push(tr('warn.refCopiedShallow'))
			result.warnings.push(entry.name + ': ' + entry.warnings[0])
		}

		var isDirectory = false
		try {
			isDirectory = api.isDirectory(entry.sourcePath)
		} catch (e) {
			entry.errors.push(tr('err.inspectSourceDir', e))
		}
		var seq = sequenceInfo(entry.id, entry.type)
		if (seq.error) entry.errors.push(seq.error)

		if (isDirectory || isSmartFolderType(entry.type)) {
			entry.kind = 'smartFolder'
			try {
				entry.sourceFiles = listSmartFolderFiles(entry.sourcePath)
			} catch (e) {
				entry.errors.push(tr('err.listSmartFolder', e))
			}
			if (!api.filePathExists(entry.sourcePath)) {
				entry.errors.push(tr('err.smartFolderMissing', entry.sourcePath))
			} else if (entry.sourceFiles.length === 0) {
				entry.warnings.push(tr('warn.smartFolderEmpty'))
				result.warnings.push(entry.name + ': ' + tr('warn.smartFolderEmpty'))
				// Nothing to copy and replaceAsset cannot target an empty
				// folder, so leave the entry out of the package.
				entry.included = false
			}
			var smartBase =
				'Assets/SmartFolders/' + safeName(entry.name, 'SmartFolder')
			entry.destinationRelative = nextUniqueRelative(
				smartBase,
				entry.sourcePath,
				reservations
			)
			// Smart Folder assets must be rebuilt as folder assets after the
			// package is copied. Do not relink them to 图片1.png/a single child;
			// that turns all Asset-from-Smart-Folder nodes into the same image.
			entry.relinkRelative = entry.destinationRelative
			for (var sf = 0; sf < entry.sourceFiles.length; sf++) {
				var smartRelative = relativePath(
					entry.sourcePath,
					entry.sourceFiles[sf]
				)
				if (smartRelative.substring(0, 2) === '..') {
					entry.errors.push(
						tr('err.smartFolderOutside', entry.sourceFiles[sf])
					)
					continue
				}
				entry.mappings.push({
					source: entry.sourceFiles[sf],
					destinationRelative: joinPath(
						entry.destinationRelative,
						smartRelative
					),
				})
			}
		} else if (seq.isSequence) {
			entry.kind = 'sequence'
			entry.sourceFiles = seq.paths
			if (
				entry.sourceFiles.length === 0 &&
				api.filePathExists(entry.sourcePath)
			)
				entry.sourceFiles = [entry.sourcePath]
			var gap = sequenceGap(entry.sourceFiles)
			if (gap) entry.errors.push(gap)
			var sequenceBase =
				'Assets/Sequences/' +
				safeName(entry.name, baseNameFromPath(entry.sourcePath))
			entry.destinationRelative = nextUniqueRelative(
				sequenceBase,
				entry.sourcePath,
				reservations
			)
			for (var sq = 0; sq < entry.sourceFiles.length; sq++) {
				var sequenceSource = canonicalPath(entry.sourceFiles[sq])
				entry.sourceFiles[sq] = sequenceSource
				entry.mappings.push({
					source: sequenceSource,
					destinationRelative: joinPath(
						entry.destinationRelative,
						fileNameFromPath(sequenceSource)
					),
				})
			}
			var relinkName = fileNameFromPath(entry.sourcePath)
			if (!relinkName && entry.sourceFiles.length > 0)
				relinkName = fileNameFromPath(entry.sourceFiles[0])
			entry.relinkRelative = joinPath(
				entry.destinationRelative,
				relinkName
			)
		} else {
			entry.sourceFiles = [entry.sourcePath]
			var folder =
				entry.kind === 'reference'
					? 'References'
					: isFont
						? 'Fonts'
						: typeFolder(
								entry.type,
								entry.sourcePath,
								options.categorise
							)
			var regularBase =
				'Assets' +
				(folder ? '/' + folder : '') +
				'/' +
				fileNameFromPath(entry.sourcePath)
			var shared = sharedSourceDestinations[pathKey(entry.sourcePath)]
			if (shared) {
				entry.destinationRelative = shared
			} else {
				entry.destinationRelative = nextUniqueRelative(
					regularBase,
					entry.sourcePath,
					reservations
				)
				sharedSourceDestinations[pathKey(entry.sourcePath)] =
					entry.destinationRelative
			}
			entry.relinkRelative = entry.destinationRelative
			entry.mappings.push({
				source: entry.sourcePath,
				destinationRelative: entry.destinationRelative,
			})
		}

		for (var m = 0; m < entry.mappings.length; m++) {
			var source = entry.mappings[m].source
			if (!api.filePathExists(source)) {
				entry.errors.push(tr('err.missingSource', source))
			} else {
				entry.sizeKB += fileSizeSafe(source)
			}
		}

		for (var er = 0; er < entry.errors.length; er++)
			result.errors.push(entry.name + ': ' + entry.errors[er])
		result.totalSizeKB += entry.sizeKB
		result.entries.push(entry)
	}

	return result
}

// =============================================================================
// PACKAGE TRANSACTION
// =============================================================================

function ensureFolder(path) {
	if (api.filePathExists(path)) return true
	try {
		return api.makeFolder(path)
	} catch (e) {
		return false
	}
}

function projectDescription(packageName) {
	return {
		description: {
			assets: '@project/Assets',
			autoSave: '@project/Autosave',
			name: packageName,
			palettes: '@project/Assets/Palettes',
			renders: '@project/Renders',
			scenes: '@project/Scenes',
		},
	}
}

function reportObject(scan, state, status, messages) {
	var assets = []
	for (var i = 0; i < scan.entries.length; i++) {
		var entry = scan.entries[i]
		assets.push({
			id: entry.id,
			packagedAssetId: entry.packagedAssetId || null,
			name: entry.name,
			type: entry.type,
			kind: entry.kind,
			included: entry.included,
			sourcePath: entry.sourcePath,
			destination: entry.included ? entry.relinkRelative : null,
			fileCount: entry.mappings.length,
			sizeKB: entry.sizeKB,
			warnings: entry.warnings,
			errors: entry.errors,
		})
	}
	return {
		tool: SCRIPT_NAME,
		version: SCRIPT_VERSION,
		generatedAt: nowIso(),
		status: status,
		scope: scan.scope,
		rootComposition: scan.rootCompId || null,
		rootCompositionName: scan.rootCompName || null,
		includedCompositions: scan.compIds,
		pruneUnusedAssets: Boolean(scan.pruneUnusedAssets || scan.scope === 'selected'),
		sourceScene: state.originalScenePath,
		sourceProject: state.originalProjectPath || null,
		packageRoot: state.packageRoot,
		packageScene: state.packageScenePath,
		totalSizeKB: scan.totalSizeKB,
		assets: assets,
		warnings: scan.warnings,
		errors: scan.errors.concat(messages || []),
	}
}

function writeReport(scan, state, status, messages) {
	if (!state.packageRoot || !api.filePathExists(state.packageRoot))
		return false
	var content = JSON.stringify(
		reportObject(scan, state, status, messages),
		null,
		2
	)
	try {
		return api.writeToFile(
			joinPath(state.packageRoot, 'package-report.json'),
			content,
			true
		)
	} catch (e) {
		return false
	}
}

function restoreOriginalScene(state) {
	var errors = []
	try {
		api.openScene(state.originalScenePath, true)
	} catch (e) {
		errors.push(tr('err.reopenOriginal', e))
	}
	try {
		if (canonicalPath(api.getSceneFilePath()) !== canonicalPath(state.originalScenePath))
			errors.push(tr('err.notOriginalScene'))
	} catch (e) {
		errors.push(tr('err.verifyOriginalScene', e))
	}
	try {
		if (state.originalProjectPath) api.setProject(state.originalProjectPath)
		else api.clearProject()
	} catch (e) {
		errors.push(tr('err.restoreProject', e))
	}
	try {
		if (canonicalPath(api.getProjectPath()) !== canonicalPath(state.originalProjectPath))
			errors.push(tr('err.notOriginalProject'))
	} catch (e) {
		errors.push(tr('err.verifyOriginalProject', e))
	}
	try {
		var restoredComps = stringArray(api.getComps())
		if (restoredComps.length !== state.originalCompIds.length)
			errors.push(tr('err.compCountRestored'))
		for (var compIndex = 0; compIndex < state.originalCompIds.length; compIndex++)
			if (!containsString(restoredComps, state.originalCompIds[compIndex]))
				errors.push(tr('err.compRestored', state.originalCompIds[compIndex]))
		var restoredAssets = stringArray(api.getAssetWindowLayers(false))
		if (restoredAssets.length !== state.originalAssetIds.length)
			errors.push(tr('err.assetsRestored'))
		for (var assetIndex = 0; assetIndex < state.originalAssetIds.length; assetIndex++)
			if (!containsString(restoredAssets, state.originalAssetIds[assetIndex]))
				errors.push(tr('err.assetRestored', state.originalAssetIds[assetIndex]))
	} catch (e) {
		errors.push(tr('err.verifySceneContents', e))
	}
	if (state.originalComp) {
		try {
			api.setActiveComp(state.originalComp)
		} catch (e) {
			errors.push(tr('err.restoreActiveComp2', e))
		}
	}
	for (var i = 0; i < state.originalAssetPaths.length; i++) {
		var asset = state.originalAssetPaths[i]
		try {
			if (canonicalPath(api.getAssetFilePath(asset.id)) !== canonicalPath(asset.path))
				errors.push(tr('err.assetPathRestored', asset.id))
		} catch (e) {
			errors.push(tr('err.verifyAsset', asset.id, e))
		}
	}
	return errors
}

function prunePackagedScene(scan, state, options) {
	var pruneUnused = scan.scope === 'selected' || Boolean(options && options.pruneUnusedAssets)
	if (scan.scope !== 'selected' && !pruneUnused) return
	if (canonicalPath(api.getSceneFilePath()) !== canonicalPath(state.packageScenePath))
		throw new Error(tr('err.pruneSafety'))
	if (scan.scope === 'selected') {
		api.setActiveComp(scan.rootCompId)
		for (var i = 0; i < scan.allCompIds.length; i++) {
			var compId = scan.allCompIds[i]
			if (containsString(scan.compIds, compId)) continue
			api.deleteLayer(compId)
			if (api.layerExists(compId))
				throw new Error(tr('err.pruneComp', compId))
		}
	}
	if (pruneUnused) {
		for (var j = 0; j < scan.unusedAssetIds.length; j++) {
			var assetId = scan.unusedAssetIds[j]
			api.deleteLayer(assetId)
			if (api.layerExists(assetId))
				throw new Error(tr('err.pruneAsset', assetId))
		}
	}
	if (scan.scope === 'selected') {
		for (var k = 0; k < scan.compIds.length; k++)
			if (!api.layerExists(scan.compIds[k]))
				throw new Error(tr('err.pruneKept', scan.compIds[k]))
		api.setActiveComp(scan.rootCompId)
	}
	if (!api.saveScene())
		throw new Error(tr('err.savePruned'))
}

function validatePackage(scan, state) {
	var errors = []
	try {
		api.openScene(state.packageScenePath, true)
	} catch (e) {
		errors.push(tr('err.reopenPackaged', e))
		return errors
	}

	var currentScene = ''
	var currentProject = ''
	try {
		currentScene = canonicalPath(api.getSceneFilePath())
	} catch (e) {}
	try {
		currentProject = canonicalPath(api.getProjectPath())
	} catch (e) {}
	if (currentScene !== canonicalPath(state.packageScenePath))
		errors.push(tr('err.packagedScenePath'))
	if (currentProject !== canonicalPath(state.packageRoot))
		errors.push(tr('err.packagedProjectRoot'))

	var pathToProject = joinPath(
		joinPath(state.packageRoot, 'Scenes'),
		'path-to-project'
	)
	if (!api.filePathExists(pathToProject))
		errors.push(tr('err.markerMissing'))
	else {
		try {
			var projectMarker = String(api.readFromFile(pathToProject)).replace(/^\s+|\s+$/g, '')
			if (projectMarker !== '..')
				errors.push(tr('err.markerWrong'))
		} catch (e) {
			errors.push(tr('err.markerVerify', e))
		}
	}
	if (scan.scope === 'selected') {
		try {
			var packagedComps = stringArray(api.getComps())
			if (packagedComps.length !== scan.compIds.length)
				errors.push(tr('err.unexpectedComps'))
			for (var compIndex = 0; compIndex < scan.compIds.length; compIndex++)
				if (!containsString(packagedComps, scan.compIds[compIndex]))
					errors.push(tr('err.compMissing', scan.compIds[compIndex]))
			if (api.getActiveComp() !== scan.rootCompId)
				api.setActiveComp(scan.rootCompId)
		} catch (e) {
			errors.push(tr('err.verifyPackagedComps', e))
		}
	}
	if (scan.scope === 'selected' || scan.pruneUnusedAssets) {
		for (var unusedIndex = 0; unusedIndex < scan.unusedAssetIds.length; unusedIndex++)
			if (api.layerExists(scan.unusedAssetIds[unusedIndex]))
				errors.push(tr('err.unrelatedAssetRemains', scan.unusedAssetIds[unusedIndex]))
	}

	for (var i = 0; i < scan.entries.length; i++) {
		var entry = scan.entries[i]
		if (!entry.included || entry.errors.length > 0) continue
		var resolved = ''
		try {
			resolved = canonicalPath(
				api.getAssetFilePath(entry.packagedAssetId || entry.id)
			)
		} catch (e) {}
		if (!resolved || !startsWithPath(resolved, state.packageRoot)) {
			errors.push(tr('err.resolvesOutside', entry.name))
		} else if (!api.filePathExists(resolved)) {
			errors.push(tr('err.resolvesMissing', entry.name))
		}
	}
	// A saved .cv should contain @assets/... or another package-relative
	// token, never a machine-specific absolute path. Older Cavalry builds may
	// not expose readable JSON here; in that case the runtime path checks above
	// remain authoritative.
	try {
		var serialized = String(api.readFromFile(state.packageScenePath) || '')
		if (serialized.charAt(0) === '{') {
			var document = JSON.parse(serialized)
			var serializedAssets = document.assets || []
			var expectedSerializedAssets = {}
			for (var expectedIndex = 0; expectedIndex < scan.entries.length; expectedIndex++) {
				var expectedEntry = scan.entries[expectedIndex]
				if (expectedEntry.included && expectedEntry.errors.length === 0)
					expectedSerializedAssets[expectedEntry.packagedAssetId || expectedEntry.id] = true
			}
			for (var serializedIndex = 0; serializedIndex < serializedAssets.length; serializedIndex++) {
				var serializedAsset = serializedAssets[serializedIndex]
				if (!expectedSerializedAssets[serializedAsset.nodeId]) continue
				var serializedPath = serializedAsset.data && serializedAsset.data.filePath
				if (!serializedPath) continue
				if (/^(?:[A-Za-z]:[\\/]|[\\/]{1,2})/.test(String(serializedPath)))
					errors.push(tr('err.serializedAbsolutePath', serializedAsset.nodeId || 'asset'))
			}
		}
	} catch (e) {}
	return errors
}

function copyAndVerify(source, destination) {
	if (api.filePathExists(destination)) return false
	if (!ensureFolder(folderFromPath(destination))) return false
	var copied = false
	try {
		copied = api.copyFilePath(source, destination)
	} catch (e) {
		copied = false
	}
	if (!copied || !api.filePathExists(destination)) return false
	var sourceSize = fileSizeSafe(source)
	var destinationSize = fileSizeSafe(destination)
	return sourceSize === destinationSize
}

function smartFolderLoadType(entry) {
	var type = String(entry.type || '').toLowerCase()
	return type.indexOf('audio') !== -1 ? 'audio' : 'image'
}

function relinkSmartFolderAsset(entry, packageRoot) {
	var destinationFolder = joinPath(packageRoot, entry.destinationRelative)
	var outgoing = stringArray(api.getOutConnections(entry.id, 'id'))
	if (outgoing.length === 0)
		throw new Error(tr('err.smartRelink', entry.name, 'no outgoing connections'))

	var replacementId = api.loadSmartFolderAsset(
		destinationFolder,
		smartFolderLoadType(entry)
	)
	if (!replacementId)
		throw new Error(tr('err.smartRelink', entry.name, 'Cavalry returned no replacement asset'))

	for (var i = 0; i < outgoing.length; i++) {
		var targetLayer = extractLayerId(outgoing[i])
		var targetAttribute = extractAttributeId(outgoing[i])
		if (!targetLayer || !targetAttribute)
			throw new Error(tr('err.smartRelink', entry.name, outgoing[i]))
		api.connect(replacementId, 'id', targetLayer, targetAttribute, true)
	}

	var replacementPath = canonicalPath(api.getAssetFilePath(replacementId))
	if (!replacementPath || !startsWithPath(replacementPath, canonicalPath(destinationFolder)))
		throw new Error(tr('err.smartRelink', entry.name, replacementPath || 'missing replacement path'))

	entry.packagedAssetId = replacementId
	if (replacementId !== entry.id) {
		api.deleteLayer(entry.id)
		if (api.layerExists(entry.id))
			throw new Error(tr('err.smartRelink', entry.name, 'old asset was not removed'))
	}
}

function executePackage(scan, parentFolder, requestedName, options) {
	var cleanName = safeName(
		requestedName,
		baseNameFromPath(scan.scenePath) + '_Package'
	)
	var packageRoot = joinPath(parentFolder, cleanName)
	var originalExtension = extensionFromPath(scan.scenePath) || '.cv'
	var sceneName =
		safeName(baseNameFromPath(scan.scenePath), 'Scene') + originalExtension
	var state = {
		originalScenePath: scan.scenePath,
		originalProjectPath: scan.projectPath,
		originalComp: '',
		originalCompIds: scan.allCompIds.slice(),
		originalAssetIds: [],
		originalAssetPaths: [],
		packageRoot: packageRoot,
		packageScenePath: joinPath(joinPath(packageRoot, 'Scenes'), sceneName),
	}
	try {
		state.originalComp = api.getActiveComp()
	} catch (e) {}
	try {
		state.originalAssetIds = stringArray(api.getAssetWindowLayers(false))
	} catch (e) {
		return { ok: false, message: tr('err.recordState', e) }
	}
	for (var originalIndex = 0; originalIndex < scan.entries.length; originalIndex++) {
		var originalEntry = scan.entries[originalIndex]
		if (originalEntry.sourcePath)
			state.originalAssetPaths.push({ id: originalEntry.id, path: originalEntry.sourcePath })
	}

	if (
		!parentFolder ||
		!api.filePathExists(parentFolder) ||
		!api.isDirectory(parentFolder)
	) {
		return { ok: false, message: tr('err.noDestination') }
	}
	if (api.filePathExists(packageRoot)) {
		return { ok: false, message: tr('err.packageExists') }
	}
	if (scan.errors.length > 0) {
		return { ok: false, message: tr('err.blockedByScan', scan.errors.length) }
	}

	var saved = false
	try {
		saved = api.saveScene()
	} catch (e) {
		saved = false
	}
	if (!saved)
		return { ok: false, message: tr('err.saveOriginal') }

	var transactionErrors = []
	var relinkStarted = false
	try {
		if (!ensureFolder(packageRoot))
			throw new Error(tr('err.createRoot'))
		var requiredFolders = [
			'Assets',
			'Assets/Images',
			'Assets/Footage',
			'Assets/Audio',
			'Assets/Data',
			'Assets/Sequences',
			'Assets/SmartFolders',
			'Assets/Fonts',
			'Assets/References',
			'Scenes',
			'Renders',
			'Autosave',
		]
		for (var d = 0; d < requiredFolders.length; d++) {
			if (!ensureFolder(joinPath(packageRoot, requiredFolders[d])))
				throw new Error(tr('err.createFolder', requiredFolders[d]))
		}
		if (!api.writeToFile(joinPath(packageRoot, 'Scenes/path-to-project'), '..', false))
			throw new Error(tr('err.writeProjectMarker'))

		if (
			!api.writeToFile(
				joinPath(packageRoot, 'projectDescription.json'),
				JSON.stringify(projectDescription(cleanName), null, 2),
				false
			)
		) {
			throw new Error(tr('err.writeDescription'))
		}

		var copiedDestinations = {}
		for (var i = 0; i < scan.entries.length; i++) {
			var entry = scan.entries[i]
			if (!entry.included || entry.errors.length > 0) continue
			if (
				entry.kind === 'smartFolder' &&
				!ensureFolder(joinPath(packageRoot, entry.destinationRelative))
			) {
				throw new Error(
					tr('err.createSmartDest', entry.destinationRelative)
				)
			}
			for (var m = 0; m < entry.mappings.length; m++) {
				var mapping = entry.mappings[m]
				var destination = joinPath(
					packageRoot,
					mapping.destinationRelative
				)
				var destinationKey = pathKey(destination)
				if (copiedDestinations[destinationKey]) continue
				if (!copyAndVerify(mapping.source, destination))
					throw new Error(tr('err.copyFailed', mapping.source))
				copiedDestinations[destinationKey] = true
			}
		}

		if (!writeReport(scan, state, 'copied', []))
			throw new Error(tr('err.writeEarlyReport'))

		api.setProject(packageRoot)
		var activeProject = ''
		try {
			activeProject = canonicalPath(api.getProjectPath())
		} catch (e) {}
		if (activeProject !== canonicalPath(packageRoot))
			throw new Error(tr('err.activateProject'))

		relinkStarted = true
		for (var r = 0; r < scan.entries.length; r++) {
			var relinkEntry = scan.entries[r]
			if (!relinkEntry.included || relinkEntry.errors.length > 0) continue
			if (relinkEntry.kind === 'smartFolder') {
				relinkSmartFolderAsset(relinkEntry, packageRoot)
			} else {
				// Cavalry rewrites this package-local absolute path to an
				// @assets/... path when the Scene is saved. Passing @project
				// directly to replaceAsset is not portable on all Cavalry builds.
				api.replaceAsset(
					relinkEntry.id,
					joinPath(packageRoot, relinkEntry.relinkRelative)
				)
				relinkEntry.packagedAssetId = relinkEntry.id
			}
		}

		var saveAsResult = api.saveSceneAs(state.packageScenePath)
		if (!saveAsResult || !api.filePathExists(state.packageScenePath))
			throw new Error(tr('err.savePackaged'))
		if (canonicalPath(api.getSceneFilePath()) !== canonicalPath(state.packageScenePath))
			throw new Error(tr('err.saveAsSwitch'))
		prunePackagedScene(scan, state, options)

		var validationErrors = validatePackage(scan, state)
		if (validationErrors.length > 0) {
			for (var ve = 0; ve < validationErrors.length; ve++)
				transactionErrors.push(validationErrors[ve])
			throw new Error(tr('err.validationFailed'))
		}

		if (!writeReport(scan, state, 'success', []))
			throw new Error(tr('err.writeFinalReport'))
		if (options.openFolder) {
			try {
				api.openURL(pathToFileUrl(packageRoot))
			} catch (e) {}
		}
		return {
			ok: true,
			packageRoot: packageRoot,
			packageScenePath: state.packageScenePath,
			packageName: cleanName,
			message: tr(
				'msg.packaged',
				scan.entries.length,
				formatSize(scan.totalSizeKB)
			),
		}
	} catch (error) {
		transactionErrors.push(String(error))
		var restoreErrors = []
		if (relinkStarted) restoreErrors = restoreOriginalScene(state)
		else {
			try {
				if (state.originalProjectPath)
					api.setProject(state.originalProjectPath)
				else api.clearProject()
			} catch (restoreError) {
				restoreErrors.push(tr('err.restoreProject', restoreError))
			}
			try {
				if (canonicalPath(api.getProjectPath()) !== canonicalPath(state.originalProjectPath))
					restoreErrors.push(tr('err.notOriginalProject'))
			} catch (verifyError) {
				restoreErrors.push(tr('err.verifyOriginalProject', verifyError))
			}
		}
		transactionErrors = transactionErrors.concat(restoreErrors)
		var reportWritten = writeReport(scan, state, 'failed', transactionErrors)
		return {
			ok: false,
			packageRoot: packageRoot,
			message:
				tr('msg.failed', error) +
				(restoreErrors.length > 0
					? tr('msg.restoreUnverified', restoreErrors.join(' | '), state.originalScenePath)
					: tr('msg.restored')) +
				(reportWritten ? tr('msg.failedKept') : tr('msg.reportUnwritten')),
		}
	}
}

// =============================================================================
// UI
// =============================================================================

function setWidgetText(widget, text) {
	try {
		if (widget && typeof widget.setText === 'function') widget.setText(text)
	} catch (e) {}
}

var defaultScenePath = ''
try {
	defaultScenePath = api.getSceneFilePath()
} catch (e) {}
var defaultSceneName = baseNameFromPath(defaultScenePath) || 'Cavalry_Project'
var defaultParent = defaultScenePath ? folderFromPath(defaultScenePath) : ''
try {
	var currentProject = api.getProjectPath()
	if (currentProject) defaultParent = folderFromPath(currentProject)
} catch (e) {}

var destinationPicker = new ui.FilePath()
destinationPicker.setMode('OpenDirectory')
destinationPicker.setPlaceholder(tr('ui.destinationPlaceholder'))
if (defaultParent) {
	destinationPicker.setOpenLocation(defaultParent)
	destinationPicker.setFilePath(defaultParent)
}

var packageNameInput = new ui.LineEdit()
packageNameInput.setText(
	safeName(defaultSceneName, 'Cavalry_Project') + '_Package'
)

var categoriseCheckbox = new ui.Checkbox(true)
var includeReferencesCheckbox = new ui.Checkbox(true)
var includeFontsCheckbox = new ui.Checkbox(false)
var openFolderCheckbox = new ui.Checkbox(true)
var selectedCompCheckbox = new ui.Checkbox(false)
var pruneUnusedCheckbox = new ui.Checkbox(true)

var scanButton = new ui.Button(tr('ui.scan'))
var packageButton = new ui.Button(tr('ui.package'))
var languageButton = new ui.Button(tr('ui.language'))
languageButton.setToolTip(tr('ui.languageTip'))
var statusLabel = new ui.Label(tr('ui.ready'))
statusLabel.setTextColor(ui.getThemeColor('Light'))

var previewScroll = new ui.ScrollView()
previewScroll.setFixedHeight(300)
var previewRows = new ui.VLayout()
previewRows.setSpaceBetween(3)
previewScroll.setLayout(previewRows)
var lastScan = null

function optionValues() {
	return {
		scope: selectedCompCheckbox.getValue() ? 'selected' : 'all',
		categorise: categoriseCheckbox.getValue(),
		includeReferences: includeReferencesCheckbox.getValue(),
		includeFonts: includeFontsCheckbox.getValue(),
		openFolder: openFolderCheckbox.getValue(),
		pruneUnusedAssets: pruneUnusedCheckbox.getValue(),
	}
}

function resetPreview() {
	previewRows = new ui.VLayout()
	previewRows.setSpaceBetween(3)
	previewScroll.setLayout(previewRows)
}

function displayScan(scan) {
	resetPreview()
	for (var errorIndex = 0; errorIndex < scan.errors.length; errorIndex++) {
		var errorLabel = new ui.Label(tr('ui.blocking', scan.errors[errorIndex]))
		errorLabel.setTextColor('#ff6666')
		errorLabel.setToolTip(scan.errors[errorIndex])
		previewRows.add(errorLabel)
	}
	for (var i = 0; i < scan.entries.length; i++) {
		var entry = scan.entries[i]
		var row = new ui.HLayout()
		row.setSpaceBetween(6)
		var marker =
			entry.errors.length > 0
				? 'ERR'
				: entry.warnings.length > 0
					? 'WARN'
					: entry.included
						? 'OK'
						: 'SKIP'
		var markerLabel = new ui.Label(marker)
		markerLabel.setTextColor(
			entry.errors.length > 0
				? '#ff6666'
				: entry.warnings.length > 0
					? '#ffcc66'
					: ui.getThemeColor('Accent1')
		)
		row.add(markerLabel)
		var nameText =
			entry.name.length > 42
				? entry.name.substring(0, 39) + '...'
				: entry.name
		var nameLabel = new ui.Label(nameText.split(' ').join('\u00A0'))
		nameLabel.setToolTip(
			entry.sourcePath +
				(entry.relinkRelative ? '\n→ ' + entry.relinkRelative : '')
		)
		row.add(nameLabel)
		row.addStretch()
		var detail = new ui.Label(
			tr('kind.' + entry.kind) +
				' · ' +
				tr('ui.files', entry.mappings.length) +
				' · ' +
				formatSize(entry.sizeKB)
		)
		detail.setTextColor(ui.getThemeColor('Midlight'))
		row.add(detail)
		previewRows.add(row)
	}
	previewRows.addStretch()

	var includedCount = 0
	for (var j = 0; j < scan.entries.length; j++)
		if (scan.entries[j].included) includedCount++
	var summary =
		(scan.scope === 'selected'
			? tr(
					'ui.summarySelected',
					scan.rootCompName || '?',
					Math.max(0, scan.compIds.length - 1)
				)
			: tr('ui.summaryAll')) +
		tr('ui.summaryAssets', includedCount, formatSize(scan.totalSizeKB))
	if (scan.errors.length > 0)
		summary += tr('ui.summaryErrors', scan.errors.length)
	if (scan.warnings.length > 0)
		summary += tr('ui.summaryWarnings', scan.warnings.length)
	statusLabel.setText(
		scan.errors.length > 0
			? tr('ui.cannotPackage', scan.errors[0])
			: summary
	)
	statusLabel.setToolTip(scan.errors.concat(scan.warnings).join('\n'))
	statusLabel.setTextColor(
		scan.errors.length > 0
			? '#ff6666'
			: scan.warnings.length > 0
				? '#ffcc66'
				: ui.getThemeColor('Accent1')
	)
}

function runScan() {
	statusLabel.setText(tr('ui.scanning'))
	statusLabel.setTextColor(ui.getThemeColor('Light'))
	try {
		lastScan = scanProjectAssets(optionValues())
		displayScan(lastScan)
	} catch (error) {
		lastScan = null
		resetPreview()
		statusLabel.setText(tr('ui.scanFailed', error))
		statusLabel.setTextColor('#ff6666')
		console.log(SCRIPT_NAME + ' scan failed: ' + error)
	}
}

scanButton.onClick = function () {
	runScan()
}
categoriseCheckbox.onValueChanged = function () {
	runScan()
}
includeReferencesCheckbox.onValueChanged = function () {
	runScan()
}
includeFontsCheckbox.onValueChanged = function () {
	runScan()
}
selectedCompCheckbox.onValueChanged = function () {
	runScan()
}
pruneUnusedCheckbox.onValueChanged = function () {
	runScan()
}

packageButton.onClick = function () {
	runScan()
	if (!lastScan) return
	if (lastScan.errors.length > 0) {
		statusLabel.setText(tr('ui.fixErrors'))
		statusLabel.setTextColor('#ff6666')
		return
	}
	var destination = canonicalPath(destinationPicker.getFilePath())
	var packageName = packageNameInput.getText()
	statusLabel.setText(tr('ui.copying'))
	statusLabel.setTextColor(ui.getThemeColor('Light'))
	var outcome = executePackage(
		lastScan,
		destination,
		packageName,
		optionValues()
	)
	statusLabel.setText(outcome.message)
	statusLabel.setTextColor(
		outcome.ok ? ui.getThemeColor('Accent1') : '#ff6666'
	)
	if (outcome.ok && outcome.packageName !== packageName)
		packageNameInput.setText(outcome.packageName)
	console.log(SCRIPT_NAME + ': ' + outcome.message)
}

var mainLayout = new ui.VLayout()
mainLayout.setMargins(4, 4, 4, 4)
mainLayout.setSpaceBetween(7)

var headerRow = new ui.HLayout()
headerRow.addStretch()
headerRow.add(languageButton)
mainLayout.add(headerRow)

var destinationLabel = new ui.Label(tr('ui.destination'))
destinationLabel.setTextColor(ui.getThemeColor('Light'))
mainLayout.add(destinationLabel)
mainLayout.add(destinationPicker)

var packageNameLabel = new ui.Label(tr('ui.packageName'))
packageNameLabel.setTextColor(ui.getThemeColor('Light'))
mainLayout.add(packageNameLabel)
mainLayout.add(packageNameInput)

var localisedLabels = []

function optionRow(checkbox, key, tipKey) {
	var row = new ui.HLayout()
	row.setSpaceBetween(6)
	row.add(checkbox)
	var label = new ui.Label(tr(key))
	label.setTextColor(ui.getThemeColor('Light'))
	if (tipKey) label.setToolTip(tr(tipKey))
	row.add(label)
	row.addStretch()
	localisedLabels.push({ widget: label, key: key, tipKey: tipKey || '' })
	return row
}

var optionsColumns = new ui.HLayout()
optionsColumns.setSpaceBetween(32)
var optionsColLeft = new ui.VLayout()
optionsColLeft.setSpaceBetween(6)
var optionsColRight = new ui.VLayout()
optionsColRight.setSpaceBetween(6)
optionsColLeft.add(
	optionRow(selectedCompCheckbox, 'ui.scopeSelected', 'ui.scopeSelectedTip')
)
optionsColLeft.add(
	optionRow(
		includeReferencesCheckbox,
		'ui.includeReferences',
		'ui.includeReferencesTip'
	)
)
optionsColLeft.add(optionRow(openFolderCheckbox, 'ui.openFolder'))
optionsColRight.add(optionRow(categoriseCheckbox, 'ui.categorise'))
optionsColRight.add(
	optionRow(includeFontsCheckbox, 'ui.includeFonts', 'ui.includeFontsTip')
)
optionsColRight.add(
	optionRow(pruneUnusedCheckbox, 'ui.pruneUnused', 'ui.pruneUnusedTip')
)
optionsColumns.add(optionsColLeft)
optionsColumns.add(optionsColRight)
optionsColumns.addStretch()
mainLayout.add(optionsColumns)

var previewTitleLabel = new ui.Label(tr('ui.usedDependencies'))
var previewHeader = new ui.HLayout()
previewHeader.add(previewTitleLabel)
previewHeader.addStretch()
previewHeader.add(scanButton)
mainLayout.add(previewHeader)
mainLayout.add(previewScroll)
mainLayout.add(statusLabel)
mainLayout.add(packageButton)

function applyLanguage() {
	ui.setTitle(tr('ui.title'))
	destinationLabel.setText(tr('ui.destination'))
	destinationPicker.setPlaceholder(tr('ui.destinationPlaceholder'))
	packageNameLabel.setText(tr('ui.packageName'))
	for (var i = 0; i < localisedLabels.length; i++) {
		localisedLabels[i].widget.setText(tr(localisedLabels[i].key))
		if (localisedLabels[i].tipKey)
			localisedLabels[i].widget.setToolTip(tr(localisedLabels[i].tipKey))
	}
	previewTitleLabel.setText(tr('ui.usedDependencies'))
	setWidgetText(scanButton, tr('ui.scan'))
	setWidgetText(packageButton, tr('ui.package'))
	setWidgetText(languageButton, tr('ui.language'))
	languageButton.setToolTip(tr('ui.languageTip'))
	if (lastScan) runScan()
	else {
		statusLabel.setText(tr('ui.ready'))
		statusLabel.setTextColor(ui.getThemeColor('Light'))
	}
}

languageButton.onClick = function () {
	setLanguage(currentLanguage === 'en' ? 'zh' : 'en')
}

ui.add(mainLayout)
ui.setBackgroundColor(ui.getThemeColor('Base'))
ui.setMinimumWidth(620)
ui.setMinimumHeight(540)
ui.show()

applyLanguage()
runScan()
