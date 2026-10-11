const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')

const sourcePath = path.join(__dirname, '..', 'src', 'Project Packager.js')
const source = fs.readFileSync(sourcePath, 'utf8')

function norm(value) {
	return String(value || '')
		.replace(/\\/g, '/')
		.replace(/\/$/, '')
}

class Widget {
	constructor(value) {
		this.value = value
		this.text = typeof value === 'string' ? value : ''
		this.children = []
		this.filePath = ''
	}
	add(value) {
		this.children.push(value)
	}
	addStretch() {}
	setLayout(value) {
		this.layout = value
	}
	setSpaceBetween() {}
	setMargins() {}
	setFixedHeight() {}
	setFixedWidth() {}
	setText(value) {
		this.text = value
	}
	getText() {
		return this.text
	}
	setTextColor() {}
	setToolTip(value) {
		this.toolTip = value
	}
	setMode() {}
	setPlaceholder() {}
	setOpenLocation() {}
	setFilePath(value) {
		this.filePath = norm(value)
	}
	getFilePath() {
		return this.filePath
	}
	getValue() {
		return Boolean(this.value)
	}
	setValue(value) {
		this.value = value
	}
}

function createHarness(sequencePaths, behavior) {
	behavior = behavior || {}
	const extraComps = Boolean(behavior.withExtraComps)
	const dirs = new Set([
		'C:/source',
		'C:/sequence',
		'C:/smart',
		'C:/smart/nested',
		'C:/fonts',
		'C:/refs',
		'D:/packages',
	])
	const files = new Set([
		'C:/source/Scene.cv',
		'C:/source/logo.png',
		'C:/source/unused.png',
		'C:/sequence/frame_0001.png',
		'C:/sequence/frame_0002.png',
		'C:/sequence/frame_0003.png',
		'C:/smart/cover.jpg',
		'C:/smart/nested/data.json',
		'C:/fonts/licensed.ttf',
		'C:/refs/child.cv',
	])
	const sizes = {}
	for (const file of files) sizes[file] = file.endsWith('.cv') ? 8 : 4

	const assetPaths = {
		'asset#logo': 'C:/source/logo.png',
		'asset#unused': 'C:/source/unused.png',
		'asset#sequence': 'C:/sequence/frame_0001.png',
		'asset#smart': 'C:/smart',
		'asset#font': 'C:/fonts/licensed.ttf',
		'asset#reference': 'C:/refs/child.cv',
	}
	if (extraComps) {
		files.add('C:/source/nested.png')
		files.add('C:/source/other.png')
		assetPaths['asset#nested'] = 'C:/source/nested.png'
		assetPaths['asset#other'] = 'C:/source/other.png'
		sizes['C:/source/nested.png'] = 4
		sizes['C:/source/other.png'] = 4
	}
	const assetTypes = {
		'asset#logo': 'image',
		'asset#unused': 'image',
		'asset#sequence': 'imageSequence',
		'asset#smart': 'imageFolder',
		'asset#font': 'font',
		'asset#reference': 'scene',
		'asset#sheet': 'spreadsheet',
	}
	if (extraComps) {
		assetTypes['asset#nested'] = 'image'
		assetTypes['asset#other'] = 'image'
	}
	const names = {
		'asset#logo': 'Logo',
		'asset#unused': 'Unused',
		'asset#sequence': 'Frames',
		'asset#smart': 'Smart Images',
		'asset#font': 'Licensed Font',
		'asset#reference': 'Child Scene',
		'asset#sheet': 'Live Sheet',
	}
	if (extraComps) {
		names['asset#nested'] = 'Nested Image'
		names['asset#other'] = 'Other Image'
	}
	const connections = {
		'asset#logo': 'shape#1.file',
		'asset#unused': '',
		'asset#sequence': 'imageShader#1.file',
		'asset#smart': 'assetFromSmartFolder#1.id',
		'asset#font': 'textShape#1.font',
		'asset#reference': 'compositionReference#1.id',
		'asset#sheet': 'dataNode#1.id',
	}
	if (extraComps) {
		connections['compNode#2'] = 'compositionReference#2.id'
		connections['asset#nested'] = 'shape#nested.file'
		connections['asset#other'] = 'shape#other.file'
	}
	let compIds = extraComps
		? ['compNode#1', 'compNode#2', 'compNode#3']
		: ['compNode#1']
	let allItems = compIds.concat(Object.keys(assetTypes))
	const compLayers = [
		'shape#1',
		'imageShader#1',
		'assetFromSmartFolder#1',
		'textShape#1',
		'compositionReference#1',
		'dataNode#1',
	]
	const compLayersById = {
		'compNode#1': extraComps
			? compLayers.concat('compositionReference#2')
			: compLayers,
	}
	if (extraComps) {
		compLayersById['compNode#2'] = ['shape#nested']
		compLayersById['compNode#3'] = ['shape#other']
	}
	const fileContents = {}
	const snapshots = {}
	const state = {
		scenePath: 'C:/source/Scene.cv',
		projectPath: 'C:/sourceProject',
		activeComp: 'compNode#1',
		replacements: [],
		openedUrls: [],
		saveCount: 0,
		activeCompSwitched: false,
	}
	function snapshot() {
		return {
			assetPaths: { ...assetPaths },
			assetTypes: { ...assetTypes },
			names: { ...names },
			connections: { ...connections },
			compIds: compIds.slice(),
			allItems: allItems.slice(),
		}
	}
	function restoreSnapshot(value) {
		for (const id of Object.keys(assetPaths)) delete assetPaths[id]
		Object.assign(assetPaths, value.assetPaths)
		for (const id of Object.keys(assetTypes)) delete assetTypes[id]
		Object.assign(assetTypes, value.assetTypes)
		for (const id of Object.keys(names)) delete names[id]
		Object.assign(names, value.names)
		for (const id of Object.keys(connections)) delete connections[id]
		Object.assign(connections, value.connections)
		compIds = value.compIds.slice()
		allItems = value.allItems.slice()
	}

	function ensureParentDirectories(file) {
		let current = norm(file).split('/')
		current.pop()
		while (current.length > 1) {
			dirs.add(current.join('/'))
			current.pop()
		}
	}

	const api = {
		getPlatform: () => 'Windows',
		getAbsolutePath: (value) =>
			behavior.emptyAbsolutePath ? '' : norm(value),
		getRelativePath(a, b) {
			// matches real Cavalry behaviour: returns the path from b to a
			const root = norm(b) + '/'
			const target = norm(a)
			return target.startsWith(root)
				? target.slice(root.length)
				: '../' + path.posix.basename(target)
		},
		getFolderFromPath(value) {
			const normal = norm(value)
			return normal.slice(0, normal.lastIndexOf('/'))
		},
		getSceneFilePath: () => state.scenePath,
		getProjectPath: () => state.projectPath,
		getActiveComp: () => state.activeComp,
		setActiveComp: (value) => {
			state.activeCompSwitched = true
			state.activeComp = value
		},
		getComps: () => compIds.slice(),
		getSelection: () =>
			behavior.selectionLostAfterCompSwitch && state.activeCompSwitched
				? []
				: behavior.selection || [],
		select: () => {
			state.activeCompSwitched = false
		},
		getAssetWindowLayers: () => allItems.slice(),
		getCompLayers: () => {
			if (behavior.failInspectComp === state.activeComp)
				throw new Error('Injected Composition inspection failure')
			return (compLayersById[state.activeComp] || []).slice()
		},
		getChildren: () => {
			if (behavior.failChildren) throw new Error('Injected child inspection failure')
			return []
		},
		getLayerType: (id) =>
			id.startsWith('compositionReference#') ? 'compositionReference' : 'basicShape',
		getCompFromReference: (id) =>
			id === 'compositionReference#2' ? 'compNode#2' : '',
		getOutConnections: (id) => {
			if (behavior.failConnectionsId === id)
				throw new Error('Injected connection inspection failure')
			return connections[id] || ''
		},
		getAssetType: (id) => assetTypes[id] || 'unknown',
		isFileAsset: (id) =>
			Object.prototype.hasOwnProperty.call(assetPaths, id),
		getNiceName: (id) => names[id] || id,
		getAssetFilePath: (id) => assetPaths[id] || '',
		loadSmartFolderAsset(value, type) {
			const id = 'asset#smartPackaged'
			assetPaths[id] = norm(value)
			assetTypes[id] = type === 'audio' ? 'audioFolder' : 'imageFolder'
			names[id] = 'Smart Images (Packaged)'
			if (!allItems.includes(id)) allItems.push(id)
			return id
		},
		getImageSequenceFilePaths: (id) =>
			id === 'asset#sequence'
				? sequencePaths || [
						'C:/sequence/frame_0001.png',
						'C:/sequence/frame_0002.png',
						'C:/sequence/frame_0003.png',
					]
				: [],
		listDirectoryRecursive: (root) => {
			if (behavior.failSmartFolder)
				throw new Error('Injected Smart Folder traversal failure')
			return root === 'C:/smart'
				? [
						'C:/smart/cover.jpg',
						'C:/smart/nested',
						'C:/smart/nested/data.json',
					]
				: []
		},
		isFile: (value) => files.has(norm(value)),
		isDirectory: (value) =>
			behavior.smartFolderNotDirectory && norm(value) === 'C:/smart'
				? false
				: dirs.has(norm(value)),
		filePathExists: (value) =>
			files.has(norm(value)) || dirs.has(norm(value)),
		getFileSize: (value) => sizes[norm(value)] || 0,
		makeFolder(value) {
			dirs.add(norm(value))
			return true
		},
		copyFilePath(from, to) {
			from = norm(from)
			to = norm(to)
			if (!files.has(from) || files.has(to)) return false
			ensureParentDirectories(to)
			files.add(to)
			sizes[to] = sizes[from]
			return true
		},
		writeToFile(file, content, overwrite) {
			file = norm(file)
			if (behavior.failReportWrite && file.endsWith('/package-report.json'))
				return false
			if (behavior.failFinalReportWrite && file.endsWith('/package-report.json') && String(content).includes('"status": "success"'))
				return false
			if (files.has(file) && !overwrite) return false
			ensureParentDirectories(file)
			files.add(file)
			fileContents[file] = String(content)
			sizes[file] = Math.max(1, String(content).length / 1024)
			return true
		},
		readFromFile(file) {
			return fileContents[norm(file)]
		},
		saveScene() {
			state.saveCount += 1
			snapshots[state.scenePath] = snapshot()
			return true
		},
		setProject(value) {
			state.projectPath = norm(value)
		},
		clearProject() {
			state.projectPath = ''
		},
		replaceAsset(id, value) {
			if (behavior.failReplaceId === id)
				throw new Error('Injected relink failure')
			value = norm(value)
			assetPaths[id] = value
			state.replacements.push({ id, value })
		},
		connect(fromLayerId, fromAttrId, toLayerId, toAttrId) {
			if (fromAttrId !== 'id') return
			const target = toLayerId + '.' + toAttrId
			const current = connections[fromLayerId]
			const values = current ? String(current).split(',') : []
			if (!values.includes(target)) values.push(target)
			connections[fromLayerId] = values.join(',')
		},
		saveSceneAs(value) {
			value = norm(value)
			ensureParentDirectories(value)
			files.add(value)
			sizes[value] = 10
			const marker = norm(path.posix.join(path.posix.dirname(value), 'path-to-project'))
			files.add(marker)
			fileContents[marker] = behavior.badProjectMarker ? '../wrong' : '..'
			state.scenePath = value
			snapshots[value] = snapshot()
			return true
		},
		openScene(value) {
			if (behavior.failOpenOriginal && norm(value) === 'C:/source/Scene.cv')
				throw new Error('Injected original Scene reopen failure')
			state.scenePath = norm(value)
			if (snapshots[state.scenePath]) restoreSnapshot(snapshots[state.scenePath])
			if (state.scenePath.startsWith('D:/packages/')) {
				state.projectPath = state.scenePath.split('/Scenes/')[0]
			}
		},
		deleteLayer(id) {
			if (behavior.failDeleteId === id)
				throw new Error('Injected pruning failure')
			compIds = compIds.filter((value) => value !== id)
			allItems = allItems.filter((value) => value !== id)
			delete assetPaths[id]
			delete assetTypes[id]
			delete names[id]
			delete connections[id]
		},
		layerExists(id) {
			return allItems.includes(id) || Object.values(compLayersById).flat().includes(id)
		},
		openURL(value) {
			state.openedUrls.push(value)
		},
	}

	const ui = {
		Button: Widget,
		Checkbox: Widget,
		Label: Widget,
		ScrollView: Widget,
		VLayout: Widget,
		HLayout: Widget,
		LineEdit: Widget,
		FilePath: Widget,
		setTitle() {},
		setBackgroundColor() {},
		setMinimumWidth() {},
		setMinimumHeight() {},
		getThemeColor: (value) => value,
		add() {},
		show() {},
	}

	const context = vm.createContext({
		api,
		ui,
		console,
		Date,
		JSON,
		Math,
		Number,
		String,
		Boolean,
		Object,
		Array,
		RegExp,
		Error,
		parseInt,
		encodeURI,
	})
	vm.runInContext(source, context, { filename: sourcePath })
	return { context, api, state, files, dirs, assetPaths, fileContents }
}

function testScanAndPackage() {
	const harness = createHarness()
	const scan = harness.context.scanProjectAssets({
		categorise: true,
		includeReferences: true,
		openFolder: false,
	})

	assert.strictEqual(scan.errors.length, 0, scan.errors.join('\n'))
	assert.strictEqual(scan.usedFileAssetCount, 5)
	assert.strictEqual(
		scan.entries.some((entry) => entry.id === 'asset#unused'),
		false,
		'unused asset should be excluded'
	)
	assert.strictEqual(
		scan.entries.find((entry) => entry.id === 'asset#font').included,
		false,
		'font should be reported, not copied'
	)
	assert.strictEqual(
		scan.entries.find((entry) => entry.id === 'asset#sequence').mappings
			.length,
		3
	)
	assert.strictEqual(
		scan.entries.find((entry) => entry.id === 'asset#smart').mappings
			.length,
		2
	)
	assert(
		scan.warnings.some((value) =>
			value.includes(
				'dependencies inside it are not collected recursively'
			)
		)
	)
	assert(
		scan.warnings.some((value) =>
			value.includes('online or non-file dependency')
		)
	)

	const outcome = harness.context.executePackage(
		scan,
		'D:/packages',
		'Scene_Package',
		{
			categorise: true,
			includeReferences: true,
			openFolder: false,
		}
	)

	assert.strictEqual(outcome.ok, true, outcome.message)
	assert.strictEqual(
		harness.state.scenePath,
		'D:/packages/Scene_Package/Scenes/Scene.cv'
	)
	assert.strictEqual(harness.state.projectPath, 'D:/packages/Scene_Package')
	assert.strictEqual(harness.state.saveCount, 1)
	assert(
		harness.files.has('D:/packages/Scene_Package/projectDescription.json')
	)
	assert(harness.files.has('D:/packages/Scene_Package/package-report.json'))
	assert(
		harness.files.has('D:/packages/Scene_Package/Scenes/path-to-project')
	)
	assert(
		harness.files.has(
			'D:/packages/Scene_Package/Assets/Sequences/Frames/frame_0003.png'
		)
	)
	assert(
		harness.files.has(
			'D:/packages/Scene_Package/Assets/SmartFolders/Smart Images/nested/data.json'
		)
	)
	assert(
		harness.assetPaths['asset#logo'].startsWith(
			'D:/packages/Scene_Package/Assets/Images/'
		),
		'relink should use an absolute path inside the package, got: ' +
			harness.assetPaths['asset#logo']
	)
	assert.strictEqual(
		harness.assetPaths['asset#font'],
		'C:/fonts/licensed.ttf'
	)
}

function testSequenceGapBlocksPackage() {
	const harness = createHarness([
		'C:/sequence/frame_0001.png',
		'C:/sequence/frame_0003.png',
	])
	const scan = harness.context.scanProjectAssets({
		categorise: true,
		includeReferences: true,
		openFolder: false,
	})
	assert(
		scan.errors.some((value) => value.includes('frame-number gap')),
		'sequence gap should be blocking'
	)
	const outcome = harness.context.executePackage(
		scan,
		'D:/packages',
		'Gap_Package',
		{
			categorise: true,
			includeReferences: true,
			openFolder: false,
		}
	)
	assert.strictEqual(outcome.ok, false)
	assert.strictEqual(
		harness.dirs.has('D:/packages/Gap_Package'),
		false,
		'blocked package must not create output'
	)
}

function testRelinkFailureRestoresOriginalScene() {
	const harness = createHarness(null, { failReplaceId: 'asset#reference' })
	const scan = harness.context.scanProjectAssets({
		categorise: true,
		includeReferences: true,
		openFolder: false,
	})
	const outcome = harness.context.executePackage(
		scan,
		'D:/packages',
		'Rollback_Package',
		{
			categorise: true,
			includeReferences: true,
			openFolder: false,
		}
	)
	assert.strictEqual(outcome.ok, false)
	assert.strictEqual(harness.state.scenePath, 'C:/source/Scene.cv')
	assert.strictEqual(harness.state.projectPath, 'C:/sourceProject')
	assert(
		harness.files.has('D:/packages/Rollback_Package/package-report.json'),
		'failed transaction should keep a diagnostic report'
	)
}

function testSelectedCompositionKeepsNestedAndPrunesCopy() {
	const harness = createHarness(null, {
		withExtraComps: true,
		selection: ['compNode#1'],
	})
	const options = {
		scope: 'selected',
		categorise: true,
		includeReferences: true,
		openFolder: false,
	}
	const scan = harness.context.scanProjectAssets(options)
	assert.strictEqual(scan.errors.length, 0, scan.errors.join('\n'))
	assert.deepStrictEqual(Array.from(scan.compIds), ['compNode#1', 'compNode#2'])
	assert(scan.entries.some((entry) => entry.id === 'asset#nested'))
	assert(!scan.entries.some((entry) => entry.id === 'asset#other'))
	const outcome = harness.context.executePackage(scan, 'D:/packages', 'Selected_Package', options)
	assert.strictEqual(outcome.ok, true, outcome.message)
	assert.deepStrictEqual(harness.api.getComps(), ['compNode#1', 'compNode#2'])
	assert.strictEqual(harness.api.layerExists('asset#other'), false)
	assert.strictEqual(harness.api.layerExists('asset#nested'), true)
	assert.strictEqual(harness.state.saveCount, 2)
	assert.strictEqual(harness.state.activeComp, 'compNode#1')
	harness.api.openScene('C:/source/Scene.cv', true)
	assert.deepStrictEqual(harness.api.getComps(), ['compNode#1', 'compNode#2', 'compNode#3'])
	assert.strictEqual(harness.assetPaths['asset#nested'], 'C:/source/nested.png')
	assert.strictEqual(harness.assetPaths['asset#other'], 'C:/source/other.png')
}

function testSelectedCompositionCanDifferFromActive() {
	const harness = createHarness(null, {
		withExtraComps: true,
		selection: ['compNode#2'],
		selectionLostAfterCompSwitch: true,
	})
	const options = { scope: 'selected', categorise: true, includeReferences: true, openFolder: false }
	const scan = harness.context.scanProjectAssets(options)
	assert.strictEqual(scan.errors.length, 0, scan.errors.join('\n'))
	assert.strictEqual(scan.rootCompId, 'compNode#2')
	assert.deepStrictEqual(Array.from(scan.compIds), ['compNode#2'])
	assert(scan.entries.some((entry) => entry.id === 'asset#nested'))
	assert(!scan.entries.some((entry) => entry.id === 'asset#logo'))
	const outcome = harness.context.executePackage(scan, 'D:/packages', 'Child_Package', options)
	assert.strictEqual(outcome.ok, true, outcome.message)
	assert.deepStrictEqual(harness.api.getComps(), ['compNode#2'])
	assert.strictEqual(harness.state.activeComp, 'compNode#2')
}

function testAllCompositionsModePreservesFullScene() {
	const harness = createHarness(null, { withExtraComps: true })
	const options = { scope: 'all', categorise: true, includeReferences: true, openFolder: false }
	const scan = harness.context.scanProjectAssets(options)
	assert.strictEqual(scan.errors.length, 0, scan.errors.join('\n'))
	assert(scan.entries.some((entry) => entry.id === 'asset#nested'))
	assert(scan.entries.some((entry) => entry.id === 'asset#other'))
	const outcome = harness.context.executePackage(scan, 'D:/packages', 'Full_Package', options)
	assert.strictEqual(outcome.ok, true, outcome.message)
	assert.deepStrictEqual(harness.api.getComps(), ['compNode#1', 'compNode#2', 'compNode#3'])
	assert.strictEqual(harness.api.layerExists('asset#other'), true)
	assert.strictEqual(harness.state.saveCount, 1)
}

function testAllCompositionsCanPruneUnusedAssets() {
	const harness = createHarness(null, { withExtraComps: true })
	const options = {
		scope: 'all',
		categorise: true,
		includeReferences: true,
		openFolder: false,
		pruneUnusedAssets: true,
	}
	const scan = harness.context.scanProjectAssets(options)
	assert(scan.unusedAssetIds.includes('asset#unused'))
	const outcome = harness.context.executePackage(
		scan,
		'D:/packages',
		'Clean_Full_Package',
		options
	)
	assert.strictEqual(outcome.ok, true, outcome.message)
	assert.strictEqual(harness.api.layerExists('asset#unused'), false)
	assert.deepStrictEqual(harness.api.getComps(), ['compNode#1', 'compNode#2', 'compNode#3'])
}

function testScanFailuresBlockPackaging() {
	for (const behavior of [
		{ failInspectComp: 'compNode#1' },
		{ failChildren: true },
		{ failConnectionsId: 'asset#logo' },
		{ failSmartFolder: true },
	]) {
		const harness = createHarness(null, behavior)
		const scan = harness.context.scanProjectAssets({
			scope: 'all',
			categorise: true,
			includeReferences: true,
		})
		assert(scan.errors.length > 0, JSON.stringify(behavior))
		const outcome = harness.context.executePackage(scan, 'D:/packages', 'Blocked_Package', {
			openFolder: false,
		})
		assert.strictEqual(outcome.ok, false)
		assert.strictEqual(harness.dirs.has('D:/packages/Blocked_Package'), false)
	}
}

function testRollbackFailureIsReported() {
	const harness = createHarness(null, {
		failReplaceId: 'asset#reference',
		failOpenOriginal: true,
	})
	const scan = harness.context.scanProjectAssets({ categorise: true, includeReferences: true })
	const outcome = harness.context.executePackage(scan, 'D:/packages', 'Failed_Rollback', {
		openFolder: false,
	})
	assert.strictEqual(outcome.ok, false)
	assert(outcome.message.includes('restoration could not be verified'))
	assert(!outcome.message.includes('original Scene and Project were restored'))
}

function testBadProjectMarkerAndReportFailure() {
	const markerHarness = createHarness(null, { badProjectMarker: true })
	const markerScan = markerHarness.context.scanProjectAssets({ categorise: true, includeReferences: true })
	const markerOutcome = markerHarness.context.executePackage(markerScan, 'D:/packages', 'Bad_Marker', {
		openFolder: false,
	})
	assert.strictEqual(markerOutcome.ok, false)
	assert(markerHarness.fileContents['D:/packages/Bad_Marker/package-report.json'].includes('does not point to the package root'))
	assert.strictEqual(markerHarness.state.scenePath, 'C:/source/Scene.cv')

	const reportHarness = createHarness(null, { failReportWrite: true })
	const reportScan = reportHarness.context.scanProjectAssets({ categorise: true, includeReferences: true })
	const reportOutcome = reportHarness.context.executePackage(reportScan, 'D:/packages', 'No_Report', {
		openFolder: false,
	})
	assert.strictEqual(reportOutcome.ok, false)
	assert(reportOutcome.message.includes('package-report.json could not be written'))
	assert.strictEqual(reportHarness.state.scenePath, 'C:/source/Scene.cv')

	const finalReportHarness = createHarness(null, { failFinalReportWrite: true })
	const finalScan = finalReportHarness.context.scanProjectAssets({ categorise: true, includeReferences: true })
	const finalOutcome = finalReportHarness.context.executePackage(finalScan, 'D:/packages', 'Failed_Final_Report', {
		openFolder: false,
	})
	assert.strictEqual(finalOutcome.ok, false)
	assert.strictEqual(finalReportHarness.state.scenePath, 'C:/source/Scene.cv')
	assert.strictEqual(finalReportHarness.assetPaths['asset#logo'], 'C:/source/logo.png')
}

function testSelectedPruneFailureRestoresOriginal() {
	const harness = createHarness(null, {
		withExtraComps: true,
		selection: ['compNode#1'],
		failDeleteId: 'compNode#3',
	})
	const options = { scope: 'selected', categorise: true, includeReferences: true, openFolder: false }
	const scan = harness.context.scanProjectAssets(options)
	const outcome = harness.context.executePackage(scan, 'D:/packages', 'Failed_Prune', options)
	assert.strictEqual(outcome.ok, false)
	assert.strictEqual(harness.state.scenePath, 'C:/source/Scene.cv')
	assert.deepStrictEqual(harness.api.getComps(), ['compNode#1', 'compNode#2', 'compNode#3'])
}

function testUnsavedSceneShowsTheBlockingReason() {
	const harness = createHarness()
	harness.state.scenePath = ''
	const scan = harness.context.scanProjectAssets({ scope: 'selected' })
	assert.strictEqual(scan.errors.length, 1)
	harness.context.displayScan(scan)
	assert(harness.context.statusLabel.getText().includes('getSceneFilePath() returned an empty path'))
}

function testProjectRelativeSavedScenePathIsResolved() {
	const harness = createHarness(null, { emptyAbsolutePath: true })
	harness.state.scenePath = '@project/Scenes/Scene.cv'
	const scan = harness.context.scanProjectAssets({ scope: 'selected', categorise: true, includeReferences: true })
	assert.strictEqual(scan.errors.length, 0, scan.errors.join('\n'))
	assert.strictEqual(scan.scenePath, 'C:/sourceProject/Scenes/Scene.cv')
	assert.strictEqual(
		harness.context.canonicalPath('//fileserver/shared/test.cv'),
		'//fileserver/shared/test.cv',
		'an empty getAbsolutePath result must not erase a valid UNC path'
	)
}

function testCrossPlatformPathNormalisation() {
	const harness = createHarness()
	assert.strictEqual(
		harness.context.normalisePath('C:\\source\\..\\assets\\image.png'),
		'C:/assets/image.png'
	)
	assert.strictEqual(
		harness.context.normalisePath('\\\\server\\share\\folder\\..\\image.png'),
		'//server/share/image.png'
	)
}

function testSmartFolderDetectedByTypeWhenDirectoryCheckFails() {
	const harness = createHarness(null, { smartFolderNotDirectory: true })
	const options = { categorise: true, includeReferences: true, openFolder: false }
	const scan = harness.context.scanProjectAssets(options)
	assert.strictEqual(scan.errors.length, 0, scan.errors.join('\n'))
	const smart = scan.entries.find((entry) => entry.id === 'asset#smart')
	assert.strictEqual(
		smart.kind,
		'smartFolder',
		'an imageFolder asset must be treated as a Smart Folder even when isDirectory fails'
	)
	assert.strictEqual(smart.mappings.length, 2)
	const outcome = harness.context.executePackage(scan, 'D:/packages', 'SmartByType_Package', options)
	assert.strictEqual(outcome.ok, true, outcome.message)
	assert(
		harness.files.has(
			'D:/packages/SmartByType_Package/Assets/SmartFolders/Smart Images/nested/data.json'
		)
	)
	assert.strictEqual(
		harness.assetPaths['asset#smartPackaged'],
		'D:/packages/SmartByType_Package/Assets/SmartFolders/Smart Images',
		'Smart Folder should relink to the packaged folder root, not one child image'
	)
	assert.strictEqual(
		harness.api.layerExists('asset#smart'),
		false,
		'original Smart Folder asset should not remain as a stale duplicate'
	)
}

function testIncludeFontsCopiesAndRelinks() {
	const harness = createHarness()
	const options = {
		categorise: true,
		includeReferences: true,
		includeFonts: true,
		openFolder: false,
	}
	const scan = harness.context.scanProjectAssets(options)
	assert.strictEqual(scan.errors.length, 0, scan.errors.join('\n'))
	const font = scan.entries.find((entry) => entry.id === 'asset#font')
	assert.strictEqual(font.included, true, 'font should be copied when includeFonts is on')
	assert(
		scan.warnings.some((value) => value.includes('licence permits redistribution')),
		'copying a font should carry a licence warning'
	)
	const outcome = harness.context.executePackage(scan, 'D:/packages', 'Fonts_Package', options)
	assert.strictEqual(outcome.ok, true, outcome.message)
	assert(harness.files.has('D:/packages/Fonts_Package/Assets/Fonts/licensed.ttf'))
	assert.strictEqual(
		harness.assetPaths['asset#font'],
		'D:/packages/Fonts_Package/Assets/Fonts/licensed.ttf'
	)
}

function testBilingualInterface() {
	const harness = createHarness()
	assert.strictEqual(harness.context.tr('ui.scan'), 'Scan Used Assets')
	assert.strictEqual(
		harness.context.tr('missing.key'),
		'missing.key',
		'unknown keys should fall back to the key itself'
	)
	harness.context.setLanguage('zh')
	assert.strictEqual(harness.context.tr('ui.scan'), '扫描已使用素材')
	assert(harness.context.scanButton.getText().includes('扫描'))
	assert(harness.context.packageButton.getText().includes('打包'))
	assert(
		harness.context.statusLabel.getText().includes('个已用文件素材'),
		'switching language should re-render the scan summary, got: ' +
			harness.context.statusLabel.getText()
	)
	const scanZh = harness.context.scanProjectAssets({
		categorise: true,
		includeReferences: true,
	})
	assert(
		scanZh.warnings.some((value) => value.includes('递归收集')),
		'scan warnings should be localised'
	)
	harness.context.setLanguage('en')
	assert.strictEqual(harness.context.tr('ui.scan'), 'Scan Used Assets')
	assert(harness.context.scanButton.getText().includes('Scan'))
	assert(harness.context.statusLabel.getText().includes('used file asset'))
}

testScanAndPackage()
testSequenceGapBlocksPackage()
testRelinkFailureRestoresOriginalScene()
testSelectedCompositionKeepsNestedAndPrunesCopy()
testSelectedCompositionCanDifferFromActive()
testAllCompositionsModePreservesFullScene()
testAllCompositionsCanPruneUnusedAssets()
testScanFailuresBlockPackaging()
testRollbackFailureIsReported()
testBadProjectMarkerAndReportFailure()
testSelectedPruneFailureRestoresOriginal()
testUnsavedSceneShowsTheBlockingReason()
testProjectRelativeSavedScenePathIsResolved()
testCrossPlatformPathNormalisation()
testSmartFolderDetectedByTypeWhenDirectoryCheckFails()
testIncludeFontsCopiesAndRelinks()
testBilingualInterface()
console.log('Project Packager tests passed.')
