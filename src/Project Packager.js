// Project Packager for Cavalry
// Collects file assets used by any Composition into a portable Cavalry Project,
// relinks the current Scene to the collected files, and saves it into the package.

ui.setTitle('Project Packager')

var SCRIPT_NAME = 'Project Packager'
var SCRIPT_VERSION = '1.1.0'

// =============================================================================
// PATH AND STRING HELPERS
// =============================================================================

function normalisePath(path) {
	if (!path) return ''
	var value = String(path).replace(/\\/g, '/')
	while (value.length > 1 && value.charAt(value.length - 1) === '/') {
		value = value.substring(0, value.length - 1)
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
	try {
		return normalisePath(api.getRelativePath(from, to)).replace(/^\.\//, '')
	} catch (e) {
		var root = normalisePath(from)
		var value = normalisePath(to)
		if (startsWithPath(value, root)) return value.substring(root.length + 1)
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
		errors.push('Could not inspect children of ' + layerId + ': ' + e)
	}
}

function collectCompositionLayers(scope) {
	var result = { layers: {}, compIds: [], allCompIds: [], rootCompId: '', rootCompName: '', errors: [], warnings: [] }
	var originalComp = ''
	try {
		originalComp = api.getActiveComp()
	} catch (e) {
		result.errors.push('Could not read the active Composition: ' + e)
	}
	var selection = []
	try {
		selection = stringArray(api.getSelection())
	} catch (e) {
		if (scope === 'selected')
			result.errors.push('Could not read Composition selection: ' + e)
	}
	var allComps = []
	try {
		allComps = stringArray(api.getComps())
	} catch (e) {
		result.errors.push('Could not enumerate Compositions: ' + e)
	}
	result.allCompIds = allComps
	if (allComps.length === 0)
		result.errors.push('No Composition was found in the Scene.')

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
								result.warnings.push('Composition Reference has no local target (possibly an external .cv reference): ' + layerId)
							else referencesByComp[itemId].push(referencedComp)
						}
					} catch (e) {
						result.errors.push('Could not inspect Composition Reference ' + layerId + ': ' + e)
					}
				}
			}
		} catch (e) {
			result.errors.push('Could not inspect Composition ' + itemId + ': ' + e)
		}
	}

	if (originalComp) {
		try {
			api.setActiveComp(originalComp)
		} catch (e) {
			result.errors.push('Could not restore the active Composition: ' + e)
		}
	}
	if (selection.length > 0) {
		try {
			api.select(selection)
		} catch (e) {
			result.warnings.push('Could not restore the original selection: ' + e)
		}
	}

	if (scope === 'selected') {
		var selectedComps = []
		for (var s = 0; s < selection.length; s++)
			if (containsString(allComps, selection[s])) selectedComps.push(selection[s])
		if (selectedComps.length > 1)
			result.errors.push('Select only one Composition in the Assets Window.')
		result.rootCompId = selectedComps.length === 1 ? selectedComps[0] : originalComp
		if (!containsString(allComps, result.rootCompId))
			result.errors.push('No valid selected or active Composition was found.')
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
						result.warnings.push('Referenced Composition is outside this Scene: ' + childComp)
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
		errors.push('Could not inspect connections for ' + assetId + ': ' + e)
	}
	return false
}

function isReferencePath(path) {
	var extension = extensionFromPath(path)
	return extension === '.cv' || extension === '.cvc'
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
			error = 'Could not enumerate image-sequence frames: ' + e
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
			return (
				'Sequence has a frame-number gap between ' +
				numbers[j - 1] +
				' and ' +
				numbers[j] +
				'.'
			)
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
		throw new Error('Directory traversal returned no file list: ' + rootPath)
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
	throw new Error('Could not resolve destination collision for ' + candidate)
}

function scanProjectAssets(options) {
	var result = {
		generatedAt: nowIso(),
		scope: options.scope === 'selected' ? 'selected' : 'all',
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
		result.errors.push('Could not read the current Scene path from Cavalry: ' + e)
		return result
	}
	try {
		result.projectPath = canonicalPath(api.getProjectPath())
	} catch (e) {}
	if (!result.scenePath) {
		result.errors.push(
			'Cavalry getSceneFilePath() returned an empty path. Reopen the saved .cv Scene and scan again.'
		)
		return result
	}
	if (result.scenePath === '@project' || result.scenePath.substring(0, 9) === '@project/') {
		result.errors.push('The Scene path is Project-relative, but Cavalry did not return a Project root: ' + rawScenePath)
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
			if (result.scope === 'selected') {
				try {
					if (api.isFileAsset(assetId) || api.getAssetType(assetId) !== 'unknown')
						result.unusedAssetIds.push(assetId)
				} catch (e) {
					result.errors.push('Could not classify unused asset ' + assetId + ': ' + e)
				}
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
			result.errors.push('Could not classify asset ' + assetId + ': ' + e)
			continue
		}
		var assetName = assetId
		try {
			assetName = api.getNiceName(assetId) || assetId
		} catch (e) {}

		if (!isFileAsset) {
			if (assetType !== 'unknown' && assetType !== '') {
				result.warnings.push(
					assetName +
						' (' +
						assetType +
						') is an online or non-file dependency and remains external.'
				)
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
		if (lowerType.indexOf('font') !== -1) {
			entry.kind = 'font'
			entry.included = false
			entry.warnings.push(
				'Font is not copied by default; confirm its licence and install it on the destination system.'
			)
			result.warnings.push(entry.name + ': ' + entry.warnings[0])
			result.entries.push(entry)
			continue
		}

		if (!entry.sourcePath) {
			entry.errors.push('Asset has no readable file path.')
			result.errors.push(entry.name + ': ' + entry.errors[0])
			result.entries.push(entry)
			continue
		}

		if (isReferencePath(entry.sourcePath)) {
			entry.kind = 'reference'
			if (!options.includeReferences) {
				entry.included = false
				entry.warnings.push(
					'External Cavalry reference was excluded and will not be portable.'
				)
				result.warnings.push(entry.name + ': ' + entry.warnings[0])
				result.entries.push(entry)
				continue
			}
			entry.warnings.push(
				'The reference file is copied, but dependencies inside it are not collected recursively.'
			)
			result.warnings.push(entry.name + ': ' + entry.warnings[0])
		}

		var isDirectory = false
		try {
			isDirectory = api.isDirectory(entry.sourcePath)
		} catch (e) {
			entry.errors.push('Could not inspect source directory: ' + e)
		}
		var seq = sequenceInfo(entry.id, entry.type)
		if (seq.error) entry.errors.push(seq.error)

		if (isDirectory) {
			entry.kind = 'smartFolder'
			try {
				entry.sourceFiles = listSmartFolderFiles(entry.sourcePath)
			} catch (e) {
				entry.errors.push('Could not list Smart Folder: ' + e)
			}
			if (!api.filePathExists(entry.sourcePath)) {
				entry.errors.push(
					'Smart Folder is missing: ' + entry.sourcePath
				)
			} else if (entry.sourceFiles.length === 0) {
				entry.warnings.push('Smart Folder is empty.')
				result.warnings.push(entry.name + ': Smart Folder is empty.')
			}
			var smartBase =
				'Assets/SmartFolders/' + safeName(entry.name, 'SmartFolder')
			entry.destinationRelative = nextUniqueRelative(
				smartBase,
				entry.sourcePath,
				reservations
			)
			entry.relinkRelative = entry.destinationRelative
			for (var sf = 0; sf < entry.sourceFiles.length; sf++) {
				var smartRelative = relativePath(
					entry.sourcePath,
					entry.sourceFiles[sf]
				)
				if (smartRelative.substring(0, 2) === '..') {
					entry.errors.push(
						'Smart Folder contains a path outside its root: ' +
							entry.sourceFiles[sf]
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
				entry.errors.push('Missing source file: ' + source)
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
		errors.push('Could not reopen original Scene: ' + e)
	}
	try {
		if (canonicalPath(api.getSceneFilePath()) !== canonicalPath(state.originalScenePath))
			errors.push('The active Scene is not the original Scene.')
	} catch (e) {
		errors.push('Could not verify the original Scene: ' + e)
	}
	try {
		if (state.originalProjectPath) api.setProject(state.originalProjectPath)
		else api.clearProject()
	} catch (e) {
		errors.push('Could not restore original Project: ' + e)
	}
	try {
		if (canonicalPath(api.getProjectPath()) !== canonicalPath(state.originalProjectPath))
			errors.push('The active Project is not the original Project.')
	} catch (e) {
		errors.push('Could not verify the original Project: ' + e)
	}
	try {
		var restoredComps = stringArray(api.getComps())
		if (restoredComps.length !== state.originalCompIds.length)
			errors.push('The original Composition count was not restored.')
		for (var compIndex = 0; compIndex < state.originalCompIds.length; compIndex++)
			if (!containsString(restoredComps, state.originalCompIds[compIndex]))
				errors.push('Original Composition was not restored: ' + state.originalCompIds[compIndex])
		var restoredAssets = stringArray(api.getAssetWindowLayers(false))
		if (restoredAssets.length !== state.originalAssetIds.length)
			errors.push('The original Assets Window contents were not restored.')
		for (var assetIndex = 0; assetIndex < state.originalAssetIds.length; assetIndex++)
			if (!containsString(restoredAssets, state.originalAssetIds[assetIndex]))
				errors.push('Original Asset was not restored: ' + state.originalAssetIds[assetIndex])
	} catch (e) {
		errors.push('Could not verify original Scene contents: ' + e)
	}
	if (state.originalComp) {
		try {
			api.setActiveComp(state.originalComp)
		} catch (e) {
			errors.push('Could not restore the original active Composition: ' + e)
		}
	}
	for (var i = 0; i < state.originalAssetPaths.length; i++) {
		var asset = state.originalAssetPaths[i]
		try {
			if (canonicalPath(api.getAssetFilePath(asset.id)) !== canonicalPath(asset.path))
				errors.push('Original asset path was not restored: ' + asset.id)
		} catch (e) {
			errors.push('Could not verify original asset ' + asset.id + ': ' + e)
		}
	}
	return errors
}

function prunePackagedScene(scan, state) {
	if (scan.scope !== 'selected') return
	if (canonicalPath(api.getSceneFilePath()) !== canonicalPath(state.packageScenePath))
		throw new Error('Refusing to remove unrelated Compositions before switching to the packaged Scene.')
	api.setActiveComp(scan.rootCompId)
	for (var i = 0; i < scan.allCompIds.length; i++) {
		var compId = scan.allCompIds[i]
		if (containsString(scan.compIds, compId)) continue
		api.deleteLayer(compId)
		if (api.layerExists(compId))
			throw new Error('Could not remove unrelated Composition: ' + compId)
	}
	for (var j = 0; j < scan.unusedAssetIds.length; j++) {
		var assetId = scan.unusedAssetIds[j]
		api.deleteLayer(assetId)
		if (api.layerExists(assetId))
			throw new Error('Could not remove unrelated asset: ' + assetId)
	}
	for (var k = 0; k < scan.compIds.length; k++)
		if (!api.layerExists(scan.compIds[k]))
			throw new Error('A required Composition was removed: ' + scan.compIds[k])
	api.setActiveComp(scan.rootCompId)
	if (!api.saveScene())
		throw new Error('Could not save the selected-Composition Scene after pruning.')
}

function validatePackage(scan, state) {
	var errors = []
	try {
		api.openScene(state.packageScenePath, true)
	} catch (e) {
		errors.push('Could not reopen packaged Scene: ' + e)
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
		errors.push('Packaged Scene did not reopen from the expected path.')
	if (currentProject !== canonicalPath(state.packageRoot))
		errors.push('Packaged Scene did not activate the new Project root.')

	var pathToProject = joinPath(
		joinPath(state.packageRoot, 'Scenes'),
		'path-to-project'
	)
	if (!api.filePathExists(pathToProject))
		errors.push('Scenes/path-to-project was not created.')
	else {
		try {
			var projectMarker = String(api.readFromFile(pathToProject)).replace(/^\s+|\s+$/g, '')
			if (projectMarker !== '..')
				errors.push('Scenes/path-to-project does not point to the package root.')
		} catch (e) {
			errors.push('Could not verify Scenes/path-to-project: ' + e)
		}
	}
	if (scan.scope === 'selected') {
		try {
			var packagedComps = stringArray(api.getComps())
			if (packagedComps.length !== scan.compIds.length)
				errors.push('The packaged Scene contains unexpected Compositions.')
			for (var compIndex = 0; compIndex < scan.compIds.length; compIndex++)
				if (!containsString(packagedComps, scan.compIds[compIndex]))
					errors.push('Required Composition is missing: ' + scan.compIds[compIndex])
			for (var unusedIndex = 0; unusedIndex < scan.unusedAssetIds.length; unusedIndex++)
				if (api.layerExists(scan.unusedAssetIds[unusedIndex]))
					errors.push('Unrelated asset remains in packaged Scene: ' + scan.unusedAssetIds[unusedIndex])
			if (api.getActiveComp() !== scan.rootCompId)
				api.setActiveComp(scan.rootCompId)
		} catch (e) {
			errors.push('Could not verify packaged Compositions: ' + e)
		}
	}

	for (var i = 0; i < scan.entries.length; i++) {
		var entry = scan.entries[i]
		if (!entry.included || entry.errors.length > 0) continue
		var resolved = ''
		try {
			resolved = canonicalPath(api.getAssetFilePath(entry.id))
		} catch (e) {}
		if (!resolved || !startsWithPath(resolved, state.packageRoot)) {
			errors.push(
				entry.name + ' resolves outside the package after reopening.'
			)
		} else if (!api.filePathExists(resolved)) {
			errors.push(entry.name + ' resolves to a missing packaged path.')
		}
	}
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
		return { ok: false, message: 'Could not record original Assets Window state. Nothing was changed: ' + e }
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
		return { ok: false, message: 'Choose an existing destination folder.' }
	}
	if (api.filePathExists(packageRoot)) {
		return {
			ok: false,
			message:
				'The package folder already exists. Choose a new name or destination.',
		}
	}
	if (scan.errors.length > 0) {
		return {
			ok: false,
			message:
				'Packaging is blocked by ' +
				scan.errors.length +
				' scan error(s).',
		}
	}

	var saved = false
	try {
		saved = api.saveScene()
	} catch (e) {
		saved = false
	}
	if (!saved)
		return {
			ok: false,
			message: 'Could not save the original Scene. Nothing was changed.',
		}

	var transactionErrors = []
	var relinkStarted = false
	try {
		if (!ensureFolder(packageRoot))
			throw new Error('Could not create package root.')
		var requiredFolders = [
			'Assets',
			'Assets/Images',
			'Assets/Footage',
			'Assets/Audio',
			'Assets/Data',
			'Assets/Sequences',
			'Assets/SmartFolders',
			'Assets/References',
			'Scenes',
			'Renders',
			'Autosave',
		]
		for (var d = 0; d < requiredFolders.length; d++) {
			if (!ensureFolder(joinPath(packageRoot, requiredFolders[d])))
				throw new Error('Could not create ' + requiredFolders[d] + '.')
		}

		if (
			!api.writeToFile(
				joinPath(packageRoot, 'projectDescription.json'),
				JSON.stringify(projectDescription(cleanName), null, 2),
				false
			)
		) {
			throw new Error('Could not write projectDescription.json.')
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
					'Could not create Smart Folder destination: ' +
						entry.destinationRelative
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
					throw new Error(
						'Copy or verification failed: ' + mapping.source
					)
				copiedDestinations[destinationKey] = true
			}
		}

		if (!writeReport(scan, state, 'copied', []))
			throw new Error('Could not write package-report.json before relinking.')

		api.setProject(packageRoot)
		var activeProject = ''
		try {
			activeProject = canonicalPath(api.getProjectPath())
		} catch (e) {}
		if (activeProject !== canonicalPath(packageRoot))
			throw new Error('Cavalry did not activate the new Project root.')

		relinkStarted = true
		for (var r = 0; r < scan.entries.length; r++) {
			var relinkEntry = scan.entries[r]
			if (!relinkEntry.included || relinkEntry.errors.length > 0) continue
			api.replaceAsset(
				relinkEntry.id,
				joinPath(packageRoot, relinkEntry.relinkRelative)
			)
		}

		var saveAsResult = api.saveSceneAs(state.packageScenePath)
		if (!saveAsResult || !api.filePathExists(state.packageScenePath))
			throw new Error('Could not save the packaged Scene.')
		if (canonicalPath(api.getSceneFilePath()) !== canonicalPath(state.packageScenePath))
			throw new Error('Save As did not switch to the packaged Scene.')
		prunePackagedScene(scan, state)

		var validationErrors = validatePackage(scan, state)
		if (validationErrors.length > 0) {
			for (var ve = 0; ve < validationErrors.length; ve++)
				transactionErrors.push(validationErrors[ve])
			throw new Error(
				'Package validation failed. See package-report.json.'
			)
		}

		if (!writeReport(scan, state, 'success', []))
			throw new Error('Could not write the final package-report.json.')
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
			message:
				'Packaged ' +
				scan.entries.length +
				' dependency record(s), ' +
				formatSize(scan.totalSizeKB) +
				'.',
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
				restoreErrors.push('Could not restore original Project: ' + restoreError)
			}
			try {
				if (canonicalPath(api.getProjectPath()) !== canonicalPath(state.originalProjectPath))
					restoreErrors.push('The original Project was not restored.')
			} catch (verifyError) {
				restoreErrors.push('Could not verify original Project: ' + verifyError)
			}
		}
		transactionErrors = transactionErrors.concat(restoreErrors)
		var reportWritten = writeReport(scan, state, 'failed', transactionErrors)
		return {
			ok: false,
			packageRoot: packageRoot,
			message:
				'Packaging failed: ' +
				error +
				(restoreErrors.length > 0
					? ' WARNING: original Scene or Project restoration could not be verified: ' + restoreErrors.join(' | ') + '. Reopen the original Scene manually: ' + state.originalScenePath + '.'
					: ' The original Scene and Project were restored.') +
				(reportWritten ? ' The failed package was kept for diagnosis.' : ' WARNING: package-report.json could not be written.'),
		}
	}
}

// =============================================================================
// UI
// =============================================================================

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
destinationPicker.setPlaceholder(
	'Choose the folder that will contain the package'
)
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
var openFolderCheckbox = new ui.Checkbox(true)
var selectedCompCheckbox = new ui.Checkbox(false)

var scanButton = new ui.Button('Scan Used Assets')
var packageButton = new ui.Button('Package Project')
var statusLabel = new ui.Label('Ready')
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
		openFolder: openFolderCheckbox.getValue(),
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
		var errorLabel = new ui.Label('BLOCKING: ' + scan.errors[errorIndex])
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
			entry.kind +
				' · ' +
				entry.mappings.length +
				' file' +
				(entry.mappings.length === 1 ? '' : 's') +
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
			? 'Selected: ' + (scan.rootCompName || '?') + ' + ' + Math.max(0, scan.compIds.length - 1) + ' nested Pre-Comp(s) · '
			: 'All Compositions · ') +
		includedCount +
		' used file asset' +
		(includedCount === 1 ? '' : 's') +
		', ' +
		formatSize(scan.totalSizeKB)
	if (scan.errors.length > 0)
		summary +=
			' · ' +
			scan.errors.length +
			' blocking error' +
			(scan.errors.length === 1 ? '' : 's')
	if (scan.warnings.length > 0)
		summary +=
			' · ' +
			scan.warnings.length +
			' warning' +
			(scan.warnings.length === 1 ? '' : 's')
	statusLabel.setText(
		scan.errors.length > 0 ? 'Cannot package: ' + scan.errors[0] : summary
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
	statusLabel.setText('Scanning Compositions and dependencies...')
	statusLabel.setTextColor(ui.getThemeColor('Light'))
	try {
		lastScan = scanProjectAssets(optionValues())
		displayScan(lastScan)
	} catch (error) {
		lastScan = null
		resetPreview()
		statusLabel.setText('Scan failed: ' + error)
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
selectedCompCheckbox.onValueChanged = function () {
	runScan()
}

packageButton.onClick = function () {
	runScan()
	if (!lastScan) return
	if (lastScan.errors.length > 0) {
		statusLabel.setText('Fix the blocking scan errors before packaging.')
		statusLabel.setTextColor('#ff6666')
		return
	}
	var destination = canonicalPath(destinationPicker.getFilePath())
	var packageName = packageNameInput.getText()
	statusLabel.setText('Copying and verifying assets...')
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

var destinationLabel = new ui.Label('Destination parent folder')
destinationLabel.setTextColor(ui.getThemeColor('Light'))
mainLayout.add(destinationLabel)
mainLayout.add(destinationPicker)

var packageNameLabel = new ui.Label('Package name')
packageNameLabel.setTextColor(ui.getThemeColor('Light'))
mainLayout.add(packageNameLabel)
mainLayout.add(packageNameInput)

function optionRow(checkbox, text) {
	var row = new ui.HLayout()
	row.add(checkbox)
	var label = new ui.Label(text)
	label.setTextColor(ui.getThemeColor('Light'))
	row.add(label)
	row.addStretch()
	return row
}

mainLayout.add(
	optionRow(
		selectedCompCheckbox,
		'Only selected Composition (or active Composition) and nested Pre-Comps'
	)
)
mainLayout.add(
	optionRow(categoriseCheckbox, 'Categorise regular assets by type')
)
mainLayout.add(
	optionRow(
		includeReferencesCheckbox,
		'Copy external .cv/.cvc references (nested dependencies are reported only)'
	)
)
mainLayout.add(
	optionRow(openFolderCheckbox, 'Open package folder when complete')
)

var previewHeader = new ui.HLayout()
previewHeader.add(new ui.Label('Used dependencies'))
previewHeader.addStretch()
previewHeader.add(scanButton)
mainLayout.add(previewHeader)
mainLayout.add(previewScroll)
mainLayout.add(statusLabel)
mainLayout.add(packageButton)

ui.add(mainLayout)
ui.setBackgroundColor(ui.getThemeColor('Base'))
ui.setMinimumWidth(620)
ui.setMinimumHeight(540)
ui.show()

runScan()
