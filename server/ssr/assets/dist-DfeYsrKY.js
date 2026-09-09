//#region node_modules/@shikijs/types/dist/index.mjs
var ShikiError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "ShikiError";
	}
};
//#endregion
//#region node_modules/@shikijs/vscode-textmate/dist/index.js
function clone(something) {
	return doClone(something);
}
function doClone(something) {
	if (Array.isArray(something)) return cloneArray(something);
	if (something instanceof RegExp) return something;
	if (typeof something === "object") return cloneObj(something);
	return something;
}
function cloneArray(arr) {
	let r = [];
	for (let i = 0, len = arr.length; i < len; i++) r[i] = doClone(arr[i]);
	return r;
}
function cloneObj(obj) {
	let r = {};
	for (let key in obj) r[key] = doClone(obj[key]);
	return r;
}
function mergeObjects(target, ...sources) {
	sources.forEach((source) => {
		for (let key in source) target[key] = source[key];
	});
	return target;
}
function basename(path) {
	const idx = ~path.lastIndexOf("/") || ~path.lastIndexOf("\\");
	if (idx === 0) return path;
	else if (~idx === path.length - 1) return basename(path.substring(0, path.length - 1));
	else return path.substr(~idx + 1);
}
var CAPTURING_REGEX_SOURCE = /\$(\d+)|\${(\d+):\/(downcase|upcase)}/g;
var RegexSource = class {
	static hasCaptures(regexSource) {
		if (regexSource === null) return false;
		CAPTURING_REGEX_SOURCE.lastIndex = 0;
		return CAPTURING_REGEX_SOURCE.test(regexSource);
	}
	static replaceCaptures(regexSource, captureSource, captureIndices) {
		return regexSource.replace(CAPTURING_REGEX_SOURCE, (match, index, commandIndex, command) => {
			let capture = captureIndices[parseInt(index || commandIndex, 10)];
			if (capture) {
				let result = captureSource.substring(capture.start, capture.end);
				while (result[0] === ".") result = result.substring(1);
				switch (command) {
					case "downcase": return result.toLowerCase();
					case "upcase": return result.toUpperCase();
					default: return result;
				}
			} else return match;
		});
	}
};
function strcmp(a, b) {
	if (a < b) return -1;
	if (a > b) return 1;
	return 0;
}
function strArrCmp(a, b) {
	if (a === null && b === null) return 0;
	if (!a) return -1;
	if (!b) return 1;
	let len1 = a.length;
	let len2 = b.length;
	if (len1 === len2) {
		for (let i = 0; i < len1; i++) {
			let res = strcmp(a[i], b[i]);
			if (res !== 0) return res;
		}
		return 0;
	}
	return len1 - len2;
}
function isValidHexColor(hex) {
	if (/^#[0-9a-f]{6}$/i.test(hex)) return true;
	if (/^#[0-9a-f]{8}$/i.test(hex)) return true;
	if (/^#[0-9a-f]{3}$/i.test(hex)) return true;
	if (/^#[0-9a-f]{4}$/i.test(hex)) return true;
	return false;
}
function escapeRegExpCharacters(value) {
	return value.replace(/[\-\\\{\}\*\+\?\|\^\$\.\,\[\]\(\)\#\s]/g, "\\$&");
}
var CachedFn = class {
	constructor(fn) {
		this.fn = fn;
	}
	cache = /* @__PURE__ */ new Map();
	get(key) {
		if (this.cache.has(key)) return this.cache.get(key);
		const value = this.fn(key);
		this.cache.set(key, value);
		return value;
	}
};
var Theme = class {
	constructor(_colorMap, _defaults, _root) {
		this._colorMap = _colorMap;
		this._defaults = _defaults;
		this._root = _root;
	}
	static createFromRawTheme(source, colorMap) {
		return this.createFromParsedTheme(parseTheme(source), colorMap);
	}
	static createFromParsedTheme(source, colorMap) {
		return resolveParsedThemeRules(source, colorMap);
	}
	_cachedMatchRoot = new CachedFn((scopeName) => this._root.match(scopeName));
	getColorMap() {
		return this._colorMap.getColorMap();
	}
	getDefaults() {
		return this._defaults;
	}
	match(scopePath) {
		if (scopePath === null) return this._defaults;
		const scopeName = scopePath.scopeName;
		const effectiveRule = this._cachedMatchRoot.get(scopeName).find((v) => _scopePathMatchesParentScopes(scopePath.parent, v.parentScopes));
		if (!effectiveRule) return null;
		return new StyleAttributes(effectiveRule.fontStyle, effectiveRule.foreground, effectiveRule.background);
	}
};
var ScopeStack = class _ScopeStack {
	constructor(parent, scopeName) {
		this.parent = parent;
		this.scopeName = scopeName;
	}
	static push(path, scopeNames) {
		for (const name of scopeNames) path = new _ScopeStack(path, name);
		return path;
	}
	static from(...segments) {
		let result = null;
		for (let i = 0; i < segments.length; i++) result = new _ScopeStack(result, segments[i]);
		return result;
	}
	push(scopeName) {
		return new _ScopeStack(this, scopeName);
	}
	getSegments() {
		let item = this;
		const result = [];
		while (item) {
			result.push(item.scopeName);
			item = item.parent;
		}
		result.reverse();
		return result;
	}
	toString() {
		return this.getSegments().join(" ");
	}
	extends(other) {
		if (this === other) return true;
		if (this.parent === null) return false;
		return this.parent.extends(other);
	}
	getExtensionIfDefined(base) {
		const result = [];
		let item = this;
		while (item && item !== base) {
			result.push(item.scopeName);
			item = item.parent;
		}
		return item === base ? result.reverse() : void 0;
	}
};
function _scopePathMatchesParentScopes(scopePath, parentScopes) {
	if (parentScopes.length === 0) return true;
	for (let index = 0; index < parentScopes.length; index++) {
		let scopePattern = parentScopes[index];
		let scopeMustMatch = false;
		if (scopePattern === ">") {
			if (index === parentScopes.length - 1) return false;
			scopePattern = parentScopes[++index];
			scopeMustMatch = true;
		}
		while (scopePath) {
			if (_matchesScope(scopePath.scopeName, scopePattern)) break;
			if (scopeMustMatch) return false;
			scopePath = scopePath.parent;
		}
		if (!scopePath) return false;
		scopePath = scopePath.parent;
	}
	return true;
}
function _matchesScope(scopeName, scopePattern) {
	return scopePattern === scopeName || scopeName.startsWith(scopePattern) && scopeName[scopePattern.length] === ".";
}
var StyleAttributes = class {
	constructor(fontStyle, foregroundId, backgroundId) {
		this.fontStyle = fontStyle;
		this.foregroundId = foregroundId;
		this.backgroundId = backgroundId;
	}
};
function parseTheme(source) {
	if (!source) return [];
	if (!source.settings || !Array.isArray(source.settings)) return [];
	let settings = source.settings;
	let result = [], resultLen = 0;
	for (let i = 0, len = settings.length; i < len; i++) {
		let entry = settings[i];
		if (!entry.settings) continue;
		let scopes;
		if (typeof entry.scope === "string") {
			let _scope = entry.scope;
			_scope = _scope.replace(/^[,]+/, "");
			_scope = _scope.replace(/[,]+$/, "");
			scopes = _scope.split(",");
		} else if (Array.isArray(entry.scope)) scopes = entry.scope;
		else scopes = [""];
		let fontStyle = -1;
		if (typeof entry.settings.fontStyle === "string") {
			fontStyle = 0;
			let segments = entry.settings.fontStyle.split(" ");
			for (let j = 0, lenJ = segments.length; j < lenJ; j++) switch (segments[j]) {
				case "italic":
					fontStyle = fontStyle | 1;
					break;
				case "bold":
					fontStyle = fontStyle | 2;
					break;
				case "underline":
					fontStyle = fontStyle | 4;
					break;
				case "strikethrough": fontStyle = fontStyle | 8;
			}
		}
		let foreground = null;
		if (typeof entry.settings.foreground === "string" && isValidHexColor(entry.settings.foreground)) foreground = entry.settings.foreground;
		let background = null;
		if (typeof entry.settings.background === "string" && isValidHexColor(entry.settings.background)) background = entry.settings.background;
		for (let j = 0, lenJ = scopes.length; j < lenJ; j++) {
			let segments = scopes[j].trim().split(" ");
			let scope = segments[segments.length - 1];
			let parentScopes = null;
			if (segments.length > 1) {
				parentScopes = segments.slice(0, segments.length - 1);
				parentScopes.reverse();
			}
			result[resultLen++] = new ParsedThemeRule(scope, parentScopes, i, fontStyle, foreground, background);
		}
	}
	return result;
}
var ParsedThemeRule = class {
	constructor(scope, parentScopes, index, fontStyle, foreground, background) {
		this.scope = scope;
		this.parentScopes = parentScopes;
		this.index = index;
		this.fontStyle = fontStyle;
		this.foreground = foreground;
		this.background = background;
	}
};
var FontStyle = /* @__PURE__ */ ((FontStyle2) => {
	FontStyle2[FontStyle2["NotSet"] = -1] = "NotSet";
	FontStyle2[FontStyle2["None"] = 0] = "None";
	FontStyle2[FontStyle2["Italic"] = 1] = "Italic";
	FontStyle2[FontStyle2["Bold"] = 2] = "Bold";
	FontStyle2[FontStyle2["Underline"] = 4] = "Underline";
	FontStyle2[FontStyle2["Strikethrough"] = 8] = "Strikethrough";
	return FontStyle2;
})(FontStyle || {});
function resolveParsedThemeRules(parsedThemeRules, _colorMap) {
	parsedThemeRules.sort((a, b) => {
		let r = strcmp(a.scope, b.scope);
		if (r !== 0) return r;
		r = strArrCmp(a.parentScopes, b.parentScopes);
		if (r !== 0) return r;
		return a.index - b.index;
	});
	let defaultFontStyle = 0;
	let defaultForeground = "#000000";
	let defaultBackground = "#ffffff";
	while (parsedThemeRules.length >= 1 && parsedThemeRules[0].scope === "") {
		let incomingDefaults = parsedThemeRules.shift();
		if (incomingDefaults.fontStyle !== -1) defaultFontStyle = incomingDefaults.fontStyle;
		if (incomingDefaults.foreground !== null) defaultForeground = incomingDefaults.foreground;
		if (incomingDefaults.background !== null) defaultBackground = incomingDefaults.background;
	}
	let colorMap = new ColorMap(_colorMap);
	let defaults = new StyleAttributes(defaultFontStyle, colorMap.getId(defaultForeground), colorMap.getId(defaultBackground));
	let root = new ThemeTrieElement(new ThemeTrieElementRule(0, null, -1, 0, 0), []);
	for (let i = 0, len = parsedThemeRules.length; i < len; i++) {
		let rule = parsedThemeRules[i];
		root.insert(0, rule.scope, rule.parentScopes, rule.fontStyle, colorMap.getId(rule.foreground), colorMap.getId(rule.background));
	}
	return new Theme(colorMap, defaults, root);
}
var ColorMap = class {
	_isFrozen;
	_lastColorId;
	_id2color;
	_color2id;
	constructor(_colorMap) {
		this._lastColorId = 0;
		this._id2color = [];
		this._color2id = /* @__PURE__ */ Object.create(null);
		if (Array.isArray(_colorMap)) {
			this._isFrozen = true;
			for (let i = 0, len = _colorMap.length; i < len; i++) {
				this._color2id[_colorMap[i]] = i;
				this._id2color[i] = _colorMap[i];
			}
		} else this._isFrozen = false;
	}
	getId(color) {
		if (color === null) return 0;
		color = color.toUpperCase();
		let value = this._color2id[color];
		if (value) return value;
		if (this._isFrozen) throw new Error(`Missing color in color map - ${color}`);
		value = ++this._lastColorId;
		this._color2id[color] = value;
		this._id2color[value] = color;
		return value;
	}
	getColorMap() {
		return this._id2color.slice(0);
	}
};
var emptyParentScopes = Object.freeze([]);
var ThemeTrieElementRule = class _ThemeTrieElementRule {
	scopeDepth;
	parentScopes;
	fontStyle;
	foreground;
	background;
	constructor(scopeDepth, parentScopes, fontStyle, foreground, background) {
		this.scopeDepth = scopeDepth;
		this.parentScopes = parentScopes || emptyParentScopes;
		this.fontStyle = fontStyle;
		this.foreground = foreground;
		this.background = background;
	}
	clone() {
		return new _ThemeTrieElementRule(this.scopeDepth, this.parentScopes, this.fontStyle, this.foreground, this.background);
	}
	static cloneArr(arr) {
		let r = [];
		for (let i = 0, len = arr.length; i < len; i++) r[i] = arr[i].clone();
		return r;
	}
	acceptOverwrite(scopeDepth, fontStyle, foreground, background) {
		if (this.scopeDepth > scopeDepth) console.log("how did this happen?");
		else this.scopeDepth = scopeDepth;
		if (fontStyle !== -1) this.fontStyle = fontStyle;
		if (foreground !== 0) this.foreground = foreground;
		if (background !== 0) this.background = background;
	}
};
var ThemeTrieElement = class _ThemeTrieElement {
	constructor(_mainRule, rulesWithParentScopes = [], _children = {}) {
		this._mainRule = _mainRule;
		this._children = _children;
		this._rulesWithParentScopes = rulesWithParentScopes;
	}
	_rulesWithParentScopes;
	static _cmpBySpecificity(a, b) {
		if (a.scopeDepth !== b.scopeDepth) return b.scopeDepth - a.scopeDepth;
		let aParentIndex = 0;
		let bParentIndex = 0;
		while (true) {
			if (a.parentScopes[aParentIndex] === ">") aParentIndex++;
			if (b.parentScopes[bParentIndex] === ">") bParentIndex++;
			if (aParentIndex >= a.parentScopes.length || bParentIndex >= b.parentScopes.length) break;
			const parentScopeLengthDiff = b.parentScopes[bParentIndex].length - a.parentScopes[aParentIndex].length;
			if (parentScopeLengthDiff !== 0) return parentScopeLengthDiff;
			aParentIndex++;
			bParentIndex++;
		}
		return b.parentScopes.length - a.parentScopes.length;
	}
	match(scope) {
		if (scope !== "") {
			let dotIndex = scope.indexOf(".");
			let head;
			let tail;
			if (dotIndex === -1) {
				head = scope;
				tail = "";
			} else {
				head = scope.substring(0, dotIndex);
				tail = scope.substring(dotIndex + 1);
			}
			if (this._children.hasOwnProperty(head)) return this._children[head].match(tail);
		}
		const rules = this._rulesWithParentScopes.concat(this._mainRule);
		rules.sort(_ThemeTrieElement._cmpBySpecificity);
		return rules;
	}
	insert(scopeDepth, scope, parentScopes, fontStyle, foreground, background) {
		if (scope === "") {
			this._doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background);
			return;
		}
		let dotIndex = scope.indexOf(".");
		let head;
		let tail;
		if (dotIndex === -1) {
			head = scope;
			tail = "";
		} else {
			head = scope.substring(0, dotIndex);
			tail = scope.substring(dotIndex + 1);
		}
		let child;
		if (this._children.hasOwnProperty(head)) child = this._children[head];
		else {
			child = new _ThemeTrieElement(this._mainRule.clone(), ThemeTrieElementRule.cloneArr(this._rulesWithParentScopes));
			this._children[head] = child;
		}
		child.insert(scopeDepth + 1, tail, parentScopes, fontStyle, foreground, background);
	}
	_doInsertHere(scopeDepth, parentScopes, fontStyle, foreground, background) {
		if (parentScopes === null) {
			this._mainRule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
			return;
		}
		for (let i = 0, len = this._rulesWithParentScopes.length; i < len; i++) {
			let rule = this._rulesWithParentScopes[i];
			if (strArrCmp(rule.parentScopes, parentScopes) === 0) {
				rule.acceptOverwrite(scopeDepth, fontStyle, foreground, background);
				return;
			}
		}
		if (fontStyle === -1) fontStyle = this._mainRule.fontStyle;
		if (foreground === 0) foreground = this._mainRule.foreground;
		if (background === 0) background = this._mainRule.background;
		this._rulesWithParentScopes.push(new ThemeTrieElementRule(scopeDepth, parentScopes, fontStyle, foreground, background));
	}
};
var EncodedTokenMetadata = class _EncodedTokenMetadata {
	static toBinaryStr(encodedTokenAttributes) {
		return encodedTokenAttributes.toString(2).padStart(32, "0");
	}
	static print(encodedTokenAttributes) {
		const languageId = _EncodedTokenMetadata.getLanguageId(encodedTokenAttributes);
		const tokenType = _EncodedTokenMetadata.getTokenType(encodedTokenAttributes);
		const fontStyle = _EncodedTokenMetadata.getFontStyle(encodedTokenAttributes);
		const foreground = _EncodedTokenMetadata.getForeground(encodedTokenAttributes);
		const background = _EncodedTokenMetadata.getBackground(encodedTokenAttributes);
		console.log({
			languageId,
			tokenType,
			fontStyle,
			foreground,
			background
		});
	}
	static getLanguageId(encodedTokenAttributes) {
		return (encodedTokenAttributes & 255) >>> 0;
	}
	static getTokenType(encodedTokenAttributes) {
		return (encodedTokenAttributes & 768) >>> 8;
	}
	static containsBalancedBrackets(encodedTokenAttributes) {
		return (encodedTokenAttributes & 1024) !== 0;
	}
	static getFontStyle(encodedTokenAttributes) {
		return (encodedTokenAttributes & 30720) >>> 11;
	}
	static getForeground(encodedTokenAttributes) {
		return (encodedTokenAttributes & 16744448) >>> 15;
	}
	static getBackground(encodedTokenAttributes) {
		return (encodedTokenAttributes & 4278190080) >>> 24;
	}
	/**
	* Updates the fields in `metadata`.
	* A value of `0`, `NotSet` or `null` indicates that the corresponding field should be left as is.
	*/
	static set(encodedTokenAttributes, languageId, tokenType, containsBalancedBrackets, fontStyle, foreground, background) {
		let _languageId = _EncodedTokenMetadata.getLanguageId(encodedTokenAttributes);
		let _tokenType = _EncodedTokenMetadata.getTokenType(encodedTokenAttributes);
		let _containsBalancedBracketsBit = _EncodedTokenMetadata.containsBalancedBrackets(encodedTokenAttributes) ? 1 : 0;
		let _fontStyle = _EncodedTokenMetadata.getFontStyle(encodedTokenAttributes);
		let _foreground = _EncodedTokenMetadata.getForeground(encodedTokenAttributes);
		let _background = _EncodedTokenMetadata.getBackground(encodedTokenAttributes);
		if (languageId !== 0) _languageId = languageId;
		if (tokenType !== 8) _tokenType = fromOptionalTokenType(tokenType);
		if (containsBalancedBrackets !== null) _containsBalancedBracketsBit = containsBalancedBrackets ? 1 : 0;
		if (fontStyle !== -1) _fontStyle = fontStyle;
		if (foreground !== 0) _foreground = foreground;
		if (background !== 0) _background = background;
		return (_languageId << 0 | _tokenType << 8 | _containsBalancedBracketsBit << 10 | _fontStyle << 11 | _foreground << 15 | _background << 24) >>> 0;
	}
};
function toOptionalTokenType(standardType) {
	return standardType;
}
function fromOptionalTokenType(standardType) {
	return standardType;
}
function createMatchers(selector, matchesName) {
	const results = [];
	const tokenizer = newTokenizer(selector);
	let token = tokenizer.next();
	while (token !== null) {
		let priority = 0;
		if (token.length === 2 && token.charAt(1) === ":") {
			switch (token.charAt(0)) {
				case "R":
					priority = 1;
					break;
				case "L":
					priority = -1;
					break;
				default: console.log(`Unknown priority ${token} in scope selector`);
			}
			token = tokenizer.next();
		}
		let matcher = parseConjunction();
		results.push({
			matcher,
			priority
		});
		if (token !== ",") break;
		token = tokenizer.next();
	}
	return results;
	function parseOperand() {
		if (token === "-") {
			token = tokenizer.next();
			const expressionToNegate = parseOperand();
			return (matcherInput) => !!expressionToNegate && !expressionToNegate(matcherInput);
		}
		if (token === "(") {
			token = tokenizer.next();
			const expressionInParents = parseInnerExpression();
			if (token === ")") token = tokenizer.next();
			return expressionInParents;
		}
		if (isIdentifier(token)) {
			const identifiers = [];
			do {
				identifiers.push(token);
				token = tokenizer.next();
			} while (isIdentifier(token));
			return (matcherInput) => matchesName(identifiers, matcherInput);
		}
		return null;
	}
	function parseConjunction() {
		const matchers = [];
		let matcher = parseOperand();
		while (matcher) {
			matchers.push(matcher);
			matcher = parseOperand();
		}
		return (matcherInput) => matchers.every((matcher2) => matcher2(matcherInput));
	}
	function parseInnerExpression() {
		const matchers = [];
		let matcher = parseConjunction();
		while (matcher) {
			matchers.push(matcher);
			if (token === "|" || token === ",") do
				token = tokenizer.next();
			while (token === "|" || token === ",");
			else break;
			matcher = parseConjunction();
		}
		return (matcherInput) => matchers.some((matcher2) => matcher2(matcherInput));
	}
}
function isIdentifier(token) {
	return !!token && !!token.match(/[\w\.:]+/);
}
function newTokenizer(input) {
	let regex = /([LR]:|[\w\.:][\w\.:\-]*|[\,\|\-\(\)])/g;
	let match = regex.exec(input);
	return { next: () => {
		if (!match) return null;
		const res = match[0];
		match = regex.exec(input);
		return res;
	} };
}
function disposeOnigString(str) {
	if (typeof str.dispose === "function") str.dispose();
}
var TopLevelRuleReference = class {
	constructor(scopeName) {
		this.scopeName = scopeName;
	}
	toKey() {
		return this.scopeName;
	}
};
var TopLevelRepositoryRuleReference = class {
	constructor(scopeName, ruleName) {
		this.scopeName = scopeName;
		this.ruleName = ruleName;
	}
	toKey() {
		return `${this.scopeName}#${this.ruleName}`;
	}
};
var ExternalReferenceCollector = class {
	_references = [];
	_seenReferenceKeys = /* @__PURE__ */ new Set();
	get references() {
		return this._references;
	}
	visitedRule = /* @__PURE__ */ new Set();
	add(reference) {
		const key = reference.toKey();
		if (this._seenReferenceKeys.has(key)) return;
		this._seenReferenceKeys.add(key);
		this._references.push(reference);
	}
};
var ScopeDependencyProcessor = class {
	constructor(repo, initialScopeName) {
		this.repo = repo;
		this.initialScopeName = initialScopeName;
		this.seenFullScopeRequests.add(this.initialScopeName);
		this.Q = [new TopLevelRuleReference(this.initialScopeName)];
	}
	seenFullScopeRequests = /* @__PURE__ */ new Set();
	seenPartialScopeRequests = /* @__PURE__ */ new Set();
	Q;
	processQueue() {
		const q = this.Q;
		this.Q = [];
		const deps = new ExternalReferenceCollector();
		for (const dep of q) collectReferencesOfReference(dep, this.initialScopeName, this.repo, deps);
		for (const dep of deps.references) if (dep instanceof TopLevelRuleReference) {
			if (this.seenFullScopeRequests.has(dep.scopeName)) continue;
			this.seenFullScopeRequests.add(dep.scopeName);
			this.Q.push(dep);
		} else {
			if (this.seenFullScopeRequests.has(dep.scopeName)) continue;
			if (this.seenPartialScopeRequests.has(dep.toKey())) continue;
			this.seenPartialScopeRequests.add(dep.toKey());
			this.Q.push(dep);
		}
	}
};
function collectReferencesOfReference(reference, baseGrammarScopeName, repo, result) {
	const selfGrammar = repo.lookup(reference.scopeName);
	if (!selfGrammar) {
		if (reference.scopeName === baseGrammarScopeName) throw new Error(`No grammar provided for <${baseGrammarScopeName}>`);
		return;
	}
	const baseGrammar = repo.lookup(baseGrammarScopeName);
	if (reference instanceof TopLevelRuleReference) collectExternalReferencesInTopLevelRule({
		baseGrammar,
		selfGrammar
	}, result);
	else collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, {
		baseGrammar,
		selfGrammar,
		repository: selfGrammar.repository
	}, result);
	const injections = repo.injections(reference.scopeName);
	if (injections) for (const injection of injections) result.add(new TopLevelRuleReference(injection));
}
function collectExternalReferencesInTopLevelRepositoryRule(ruleName, context, result) {
	if (context.repository && context.repository[ruleName]) {
		const rule = context.repository[ruleName];
		collectExternalReferencesInRules([rule], context, result);
	}
}
function collectExternalReferencesInTopLevelRule(context, result) {
	if (context.selfGrammar.patterns && Array.isArray(context.selfGrammar.patterns)) collectExternalReferencesInRules(context.selfGrammar.patterns, {
		...context,
		repository: context.selfGrammar.repository
	}, result);
	if (context.selfGrammar.injections) collectExternalReferencesInRules(Object.values(context.selfGrammar.injections), {
		...context,
		repository: context.selfGrammar.repository
	}, result);
}
function collectExternalReferencesInRules(rules, context, result) {
	for (const rule of rules) {
		if (result.visitedRule.has(rule)) continue;
		result.visitedRule.add(rule);
		const patternRepository = rule.repository ? mergeObjects({}, context.repository, rule.repository) : context.repository;
		if (Array.isArray(rule.patterns)) collectExternalReferencesInRules(rule.patterns, {
			...context,
			repository: patternRepository
		}, result);
		const include = rule.include;
		if (!include) continue;
		const reference = parseInclude(include);
		switch (reference.kind) {
			case 0:
				collectExternalReferencesInTopLevelRule({
					...context,
					selfGrammar: context.baseGrammar
				}, result);
				break;
			case 1:
				collectExternalReferencesInTopLevelRule(context, result);
				break;
			case 2:
				collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, {
					...context,
					repository: patternRepository
				}, result);
				break;
			case 3:
			case 4:
				const selfGrammar = reference.scopeName === context.selfGrammar.scopeName ? context.selfGrammar : reference.scopeName === context.baseGrammar.scopeName ? context.baseGrammar : void 0;
				if (selfGrammar) {
					const newContext = {
						baseGrammar: context.baseGrammar,
						selfGrammar,
						repository: patternRepository
					};
					if (reference.kind === 4) collectExternalReferencesInTopLevelRepositoryRule(reference.ruleName, newContext, result);
					else collectExternalReferencesInTopLevelRule(newContext, result);
				} else if (reference.kind === 4) result.add(new TopLevelRepositoryRuleReference(reference.scopeName, reference.ruleName));
				else result.add(new TopLevelRuleReference(reference.scopeName));
		}
	}
}
var BaseReference = class {
	kind = 0;
};
var SelfReference = class {
	kind = 1;
};
var RelativeReference = class {
	constructor(ruleName) {
		this.ruleName = ruleName;
	}
	kind = 2;
};
var TopLevelReference = class {
	constructor(scopeName) {
		this.scopeName = scopeName;
	}
	kind = 3;
};
var TopLevelRepositoryReference = class {
	constructor(scopeName, ruleName) {
		this.scopeName = scopeName;
		this.ruleName = ruleName;
	}
	kind = 4;
};
function parseInclude(include) {
	if (include === "$base") return new BaseReference();
	else if (include === "$self") return new SelfReference();
	const indexOfSharp = include.indexOf("#");
	if (indexOfSharp === -1) return new TopLevelReference(include);
	else if (indexOfSharp === 0) return new RelativeReference(include.substring(1));
	else return new TopLevelRepositoryReference(include.substring(0, indexOfSharp), include.substring(indexOfSharp + 1));
}
var HAS_BACK_REFERENCES = /\\(\d+)/;
var BACK_REFERENCING_END = /\\(\d+)/g;
var endRuleId = -1;
var whileRuleId = -2;
function ruleIdFromNumber(id) {
	return id;
}
function ruleIdToNumber(id) {
	return id;
}
var Rule = class {
	$location;
	id;
	_nameIsCapturing;
	_name;
	_contentNameIsCapturing;
	_contentName;
	constructor($location, id, name, contentName) {
		this.$location = $location;
		this.id = id;
		this._name = name || null;
		this._nameIsCapturing = RegexSource.hasCaptures(this._name);
		this._contentName = contentName || null;
		this._contentNameIsCapturing = RegexSource.hasCaptures(this._contentName);
	}
	get debugName() {
		const location = this.$location ? `${basename(this.$location.filename)}:${this.$location.line}` : "unknown";
		return `${this.constructor.name}#${this.id} @ ${location}`;
	}
	getName(lineText, captureIndices) {
		if (!this._nameIsCapturing || this._name === null || lineText === null || captureIndices === null) return this._name;
		return RegexSource.replaceCaptures(this._name, lineText, captureIndices);
	}
	getContentName(lineText, captureIndices) {
		if (!this._contentNameIsCapturing || this._contentName === null) return this._contentName;
		return RegexSource.replaceCaptures(this._contentName, lineText, captureIndices);
	}
};
var CaptureRule = class extends Rule {
	retokenizeCapturedWithRuleId;
	constructor($location, id, name, contentName, retokenizeCapturedWithRuleId) {
		super($location, id, name, contentName);
		this.retokenizeCapturedWithRuleId = retokenizeCapturedWithRuleId;
	}
	dispose() {}
	collectPatterns(grammar, out) {
		throw new Error("Not supported!");
	}
	compile(grammar, endRegexSource) {
		throw new Error("Not supported!");
	}
	compileAG(grammar, endRegexSource, allowA, allowG) {
		throw new Error("Not supported!");
	}
};
var MatchRule = class extends Rule {
	_match;
	captures;
	_cachedCompiledPatterns;
	constructor($location, id, name, match, captures) {
		super($location, id, name, null);
		this._match = new RegExpSource(match, this.id);
		this.captures = captures;
		this._cachedCompiledPatterns = null;
	}
	dispose() {
		if (this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns.dispose();
			this._cachedCompiledPatterns = null;
		}
	}
	get debugMatchRegExp() {
		return `${this._match.source}`;
	}
	collectPatterns(grammar, out) {
		out.push(this._match);
	}
	compile(grammar, endRegexSource) {
		return this._getCachedCompiledPatterns(grammar).compile(grammar);
	}
	compileAG(grammar, endRegexSource, allowA, allowG) {
		return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
	}
	_getCachedCompiledPatterns(grammar) {
		if (!this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns = new RegExpSourceList();
			this.collectPatterns(grammar, this._cachedCompiledPatterns);
		}
		return this._cachedCompiledPatterns;
	}
};
var IncludeOnlyRule = class extends Rule {
	hasMissingPatterns;
	patterns;
	_cachedCompiledPatterns;
	constructor($location, id, name, contentName, patterns) {
		super($location, id, name, contentName);
		this.patterns = patterns.patterns;
		this.hasMissingPatterns = patterns.hasMissingPatterns;
		this._cachedCompiledPatterns = null;
	}
	dispose() {
		if (this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns.dispose();
			this._cachedCompiledPatterns = null;
		}
	}
	collectPatterns(grammar, out) {
		for (const pattern of this.patterns) grammar.getRule(pattern).collectPatterns(grammar, out);
	}
	compile(grammar, endRegexSource) {
		return this._getCachedCompiledPatterns(grammar).compile(grammar);
	}
	compileAG(grammar, endRegexSource, allowA, allowG) {
		return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
	}
	_getCachedCompiledPatterns(grammar) {
		if (!this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns = new RegExpSourceList();
			this.collectPatterns(grammar, this._cachedCompiledPatterns);
		}
		return this._cachedCompiledPatterns;
	}
};
var BeginEndRule = class extends Rule {
	_begin;
	beginCaptures;
	_end;
	endHasBackReferences;
	endCaptures;
	applyEndPatternLast;
	hasMissingPatterns;
	patterns;
	_cachedCompiledPatterns;
	constructor($location, id, name, contentName, begin, beginCaptures, end, endCaptures, applyEndPatternLast, patterns) {
		super($location, id, name, contentName);
		this._begin = new RegExpSource(begin, this.id);
		this.beginCaptures = beginCaptures;
		this._end = new RegExpSource(end ? end : "￿", -1);
		this.endHasBackReferences = this._end.hasBackReferences;
		this.endCaptures = endCaptures;
		this.applyEndPatternLast = applyEndPatternLast || false;
		this.patterns = patterns.patterns;
		this.hasMissingPatterns = patterns.hasMissingPatterns;
		this._cachedCompiledPatterns = null;
	}
	dispose() {
		if (this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns.dispose();
			this._cachedCompiledPatterns = null;
		}
	}
	get debugBeginRegExp() {
		return `${this._begin.source}`;
	}
	get debugEndRegExp() {
		return `${this._end.source}`;
	}
	getEndWithResolvedBackReferences(lineText, captureIndices) {
		return this._end.resolveBackReferences(lineText, captureIndices);
	}
	collectPatterns(grammar, out) {
		out.push(this._begin);
	}
	compile(grammar, endRegexSource) {
		return this._getCachedCompiledPatterns(grammar, endRegexSource).compile(grammar);
	}
	compileAG(grammar, endRegexSource, allowA, allowG) {
		return this._getCachedCompiledPatterns(grammar, endRegexSource).compileAG(grammar, allowA, allowG);
	}
	_getCachedCompiledPatterns(grammar, endRegexSource) {
		if (!this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns = new RegExpSourceList();
			for (const pattern of this.patterns) grammar.getRule(pattern).collectPatterns(grammar, this._cachedCompiledPatterns);
			if (this.applyEndPatternLast) this._cachedCompiledPatterns.push(this._end.hasBackReferences ? this._end.clone() : this._end);
			else this._cachedCompiledPatterns.unshift(this._end.hasBackReferences ? this._end.clone() : this._end);
		}
		if (this._end.hasBackReferences) {
			if (this.applyEndPatternLast) this._cachedCompiledPatterns.setSource(this._cachedCompiledPatterns.length() - 1, endRegexSource);
			else this._cachedCompiledPatterns.setSource(0, endRegexSource);
		}
		return this._cachedCompiledPatterns;
	}
};
var BeginWhileRule = class extends Rule {
	_begin;
	beginCaptures;
	whileCaptures;
	_while;
	whileHasBackReferences;
	hasMissingPatterns;
	patterns;
	_cachedCompiledPatterns;
	_cachedCompiledWhilePatterns;
	constructor($location, id, name, contentName, begin, beginCaptures, _while, whileCaptures, patterns) {
		super($location, id, name, contentName);
		this._begin = new RegExpSource(begin, this.id);
		this.beginCaptures = beginCaptures;
		this.whileCaptures = whileCaptures;
		this._while = new RegExpSource(_while, whileRuleId);
		this.whileHasBackReferences = this._while.hasBackReferences;
		this.patterns = patterns.patterns;
		this.hasMissingPatterns = patterns.hasMissingPatterns;
		this._cachedCompiledPatterns = null;
		this._cachedCompiledWhilePatterns = null;
	}
	dispose() {
		if (this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns.dispose();
			this._cachedCompiledPatterns = null;
		}
		if (this._cachedCompiledWhilePatterns) {
			this._cachedCompiledWhilePatterns.dispose();
			this._cachedCompiledWhilePatterns = null;
		}
	}
	get debugBeginRegExp() {
		return `${this._begin.source}`;
	}
	get debugWhileRegExp() {
		return `${this._while.source}`;
	}
	getWhileWithResolvedBackReferences(lineText, captureIndices) {
		return this._while.resolveBackReferences(lineText, captureIndices);
	}
	collectPatterns(grammar, out) {
		out.push(this._begin);
	}
	compile(grammar, endRegexSource) {
		return this._getCachedCompiledPatterns(grammar).compile(grammar);
	}
	compileAG(grammar, endRegexSource, allowA, allowG) {
		return this._getCachedCompiledPatterns(grammar).compileAG(grammar, allowA, allowG);
	}
	_getCachedCompiledPatterns(grammar) {
		if (!this._cachedCompiledPatterns) {
			this._cachedCompiledPatterns = new RegExpSourceList();
			for (const pattern of this.patterns) grammar.getRule(pattern).collectPatterns(grammar, this._cachedCompiledPatterns);
		}
		return this._cachedCompiledPatterns;
	}
	compileWhile(grammar, endRegexSource) {
		return this._getCachedCompiledWhilePatterns(grammar, endRegexSource).compile(grammar);
	}
	compileWhileAG(grammar, endRegexSource, allowA, allowG) {
		return this._getCachedCompiledWhilePatterns(grammar, endRegexSource).compileAG(grammar, allowA, allowG);
	}
	_getCachedCompiledWhilePatterns(grammar, endRegexSource) {
		if (!this._cachedCompiledWhilePatterns) {
			this._cachedCompiledWhilePatterns = new RegExpSourceList();
			this._cachedCompiledWhilePatterns.push(this._while.hasBackReferences ? this._while.clone() : this._while);
		}
		if (this._while.hasBackReferences) this._cachedCompiledWhilePatterns.setSource(0, endRegexSource ? endRegexSource : "￿");
		return this._cachedCompiledWhilePatterns;
	}
};
var RuleFactory = class _RuleFactory {
	static createCaptureRule(helper, $location, name, contentName, retokenizeCapturedWithRuleId) {
		return helper.registerRule((id) => {
			return new CaptureRule($location, id, name, contentName, retokenizeCapturedWithRuleId);
		});
	}
	static getCompiledRuleId(desc, helper, repository) {
		if (!desc.id) helper.registerRule((id) => {
			desc.id = id;
			if (desc.match) return new MatchRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.match, _RuleFactory._compileCaptures(desc.captures, helper, repository));
			if (typeof desc.begin === "undefined") {
				if (desc.repository) repository = mergeObjects({}, repository, desc.repository);
				let patterns = desc.patterns;
				if (typeof patterns === "undefined" && desc.include) patterns = [{ include: desc.include }];
				return new IncludeOnlyRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, _RuleFactory._compilePatterns(patterns, helper, repository));
			}
			if (desc.while) return new BeginWhileRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, _RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.while, _RuleFactory._compileCaptures(desc.whileCaptures || desc.captures, helper, repository), _RuleFactory._compilePatterns(desc.patterns, helper, repository));
			return new BeginEndRule(desc.$vscodeTextmateLocation, desc.id, desc.name, desc.contentName, desc.begin, _RuleFactory._compileCaptures(desc.beginCaptures || desc.captures, helper, repository), desc.end, _RuleFactory._compileCaptures(desc.endCaptures || desc.captures, helper, repository), desc.applyEndPatternLast, _RuleFactory._compilePatterns(desc.patterns, helper, repository));
		});
		return desc.id;
	}
	static _compileCaptures(captures, helper, repository) {
		let r = [];
		if (captures) {
			let maximumCaptureId = 0;
			for (const captureId in captures) {
				if (captureId === "$vscodeTextmateLocation") continue;
				const numericCaptureId = parseInt(captureId, 10);
				if (numericCaptureId > maximumCaptureId) maximumCaptureId = numericCaptureId;
			}
			for (let i = 0; i <= maximumCaptureId; i++) r[i] = null;
			for (const captureId in captures) {
				if (captureId === "$vscodeTextmateLocation") continue;
				const numericCaptureId = parseInt(captureId, 10);
				let retokenizeCapturedWithRuleId = 0;
				if (captures[captureId].patterns) retokenizeCapturedWithRuleId = _RuleFactory.getCompiledRuleId(captures[captureId], helper, repository);
				r[numericCaptureId] = _RuleFactory.createCaptureRule(helper, captures[captureId].$vscodeTextmateLocation, captures[captureId].name, captures[captureId].contentName, retokenizeCapturedWithRuleId);
			}
		}
		return r;
	}
	static _compilePatterns(patterns, helper, repository) {
		let r = [];
		if (patterns) for (let i = 0, len = patterns.length; i < len; i++) {
			const pattern = patterns[i];
			let ruleId = -1;
			if (pattern.include) {
				const reference = parseInclude(pattern.include);
				switch (reference.kind) {
					case 0:
					case 1:
						ruleId = _RuleFactory.getCompiledRuleId(repository[pattern.include], helper, repository);
						break;
					case 2:
						let localIncludedRule = repository[reference.ruleName];
						if (localIncludedRule) ruleId = _RuleFactory.getCompiledRuleId(localIncludedRule, helper, repository);
						break;
					case 3:
					case 4:
						const externalGrammarName = reference.scopeName;
						const externalGrammarInclude = reference.kind === 4 ? reference.ruleName : null;
						const externalGrammar = helper.getExternalGrammar(externalGrammarName, repository);
						if (externalGrammar) {
							if (externalGrammarInclude) {
								let externalIncludedRule = externalGrammar.repository[externalGrammarInclude];
								if (externalIncludedRule) ruleId = _RuleFactory.getCompiledRuleId(externalIncludedRule, helper, externalGrammar.repository);
							} else ruleId = _RuleFactory.getCompiledRuleId(externalGrammar.repository.$self, helper, externalGrammar.repository);
						}
				}
			} else ruleId = _RuleFactory.getCompiledRuleId(pattern, helper, repository);
			if (ruleId !== -1) {
				const rule = helper.getRule(ruleId);
				let skipRule = false;
				if (rule instanceof IncludeOnlyRule || rule instanceof BeginEndRule || rule instanceof BeginWhileRule) {
					if (rule.hasMissingPatterns && rule.patterns.length === 0) skipRule = true;
				}
				if (skipRule) continue;
				r.push(ruleId);
			}
		}
		return {
			patterns: r,
			hasMissingPatterns: (patterns ? patterns.length : 0) !== r.length
		};
	}
};
var RegExpSource = class _RegExpSource {
	source;
	ruleId;
	hasAnchor;
	hasBackReferences;
	_anchorCache;
	constructor(regExpSource, ruleId) {
		if (regExpSource && typeof regExpSource === "string") {
			const len = regExpSource.length;
			let lastPushedPos = 0;
			let output = [];
			let hasAnchor = false;
			for (let pos = 0; pos < len; pos++) if (regExpSource.charAt(pos) === "\\") {
				if (pos + 1 < len) {
					const nextCh = regExpSource.charAt(pos + 1);
					if (nextCh === "z") {
						output.push(regExpSource.substring(lastPushedPos, pos));
						output.push("$(?!\\n)(?<!\\n)");
						lastPushedPos = pos + 2;
					} else if (nextCh === "A" || nextCh === "G") hasAnchor = true;
					pos++;
				}
			}
			this.hasAnchor = hasAnchor;
			if (lastPushedPos === 0) this.source = regExpSource;
			else {
				output.push(regExpSource.substring(lastPushedPos, len));
				this.source = output.join("");
			}
		} else {
			this.hasAnchor = false;
			this.source = regExpSource;
		}
		if (this.hasAnchor) this._anchorCache = this._buildAnchorCache();
		else this._anchorCache = null;
		this.ruleId = ruleId;
		if (typeof this.source === "string") this.hasBackReferences = HAS_BACK_REFERENCES.test(this.source);
		else this.hasBackReferences = false;
	}
	clone() {
		return new _RegExpSource(this.source, this.ruleId);
	}
	setSource(newSource) {
		if (this.source === newSource) return;
		this.source = newSource;
		if (this.hasAnchor) this._anchorCache = this._buildAnchorCache();
	}
	resolveBackReferences(lineText, captureIndices) {
		if (typeof this.source !== "string") throw new Error("This method should only be called if the source is a string");
		let capturedValues = captureIndices.map((capture) => {
			return lineText.substring(capture.start, capture.end);
		});
		BACK_REFERENCING_END.lastIndex = 0;
		return this.source.replace(BACK_REFERENCING_END, (match, g1) => {
			return escapeRegExpCharacters(capturedValues[parseInt(g1, 10)] || "");
		});
	}
	_buildAnchorCache() {
		if (typeof this.source !== "string") throw new Error("This method should only be called if the source is a string");
		let A0_G0_result = [];
		let A0_G1_result = [];
		let A1_G0_result = [];
		let A1_G1_result = [];
		let pos, len, ch, nextCh;
		for (pos = 0, len = this.source.length; pos < len; pos++) {
			ch = this.source.charAt(pos);
			A0_G0_result[pos] = ch;
			A0_G1_result[pos] = ch;
			A1_G0_result[pos] = ch;
			A1_G1_result[pos] = ch;
			if (ch === "\\") {
				if (pos + 1 < len) {
					nextCh = this.source.charAt(pos + 1);
					if (nextCh === "A") {
						A0_G0_result[pos + 1] = "￿";
						A0_G1_result[pos + 1] = "￿";
						A1_G0_result[pos + 1] = "A";
						A1_G1_result[pos + 1] = "A";
					} else if (nextCh === "G") {
						A0_G0_result[pos + 1] = "￿";
						A0_G1_result[pos + 1] = "G";
						A1_G0_result[pos + 1] = "￿";
						A1_G1_result[pos + 1] = "G";
					} else {
						A0_G0_result[pos + 1] = nextCh;
						A0_G1_result[pos + 1] = nextCh;
						A1_G0_result[pos + 1] = nextCh;
						A1_G1_result[pos + 1] = nextCh;
					}
					pos++;
				}
			}
		}
		return {
			A0_G0: A0_G0_result.join(""),
			A0_G1: A0_G1_result.join(""),
			A1_G0: A1_G0_result.join(""),
			A1_G1: A1_G1_result.join("")
		};
	}
	resolveAnchors(allowA, allowG) {
		if (!this.hasAnchor || !this._anchorCache || typeof this.source !== "string") return this.source;
		if (allowA) {
			if (allowG) return this._anchorCache.A1_G1;
			else return this._anchorCache.A1_G0;
		} else if (allowG) return this._anchorCache.A0_G1;
		else return this._anchorCache.A0_G0;
	}
};
var RegExpSourceList = class {
	_items;
	_hasAnchors;
	_cached;
	_anchorCache;
	constructor() {
		this._items = [];
		this._hasAnchors = false;
		this._cached = null;
		this._anchorCache = {
			A0_G0: null,
			A0_G1: null,
			A1_G0: null,
			A1_G1: null
		};
	}
	dispose() {
		this._disposeCaches();
	}
	_disposeCaches() {
		if (this._cached) {
			this._cached.dispose();
			this._cached = null;
		}
		if (this._anchorCache.A0_G0) {
			this._anchorCache.A0_G0.dispose();
			this._anchorCache.A0_G0 = null;
		}
		if (this._anchorCache.A0_G1) {
			this._anchorCache.A0_G1.dispose();
			this._anchorCache.A0_G1 = null;
		}
		if (this._anchorCache.A1_G0) {
			this._anchorCache.A1_G0.dispose();
			this._anchorCache.A1_G0 = null;
		}
		if (this._anchorCache.A1_G1) {
			this._anchorCache.A1_G1.dispose();
			this._anchorCache.A1_G1 = null;
		}
	}
	push(item) {
		this._items.push(item);
		this._hasAnchors = this._hasAnchors || item.hasAnchor;
	}
	unshift(item) {
		this._items.unshift(item);
		this._hasAnchors = this._hasAnchors || item.hasAnchor;
	}
	length() {
		return this._items.length;
	}
	setSource(index, newSource) {
		if (this._items[index].source !== newSource) {
			this._disposeCaches();
			this._items[index].setSource(newSource);
		}
	}
	compile(onigLib) {
		if (!this._cached) {
			let regExps = this._items.map((e) => e.source);
			this._cached = new CompiledRule(onigLib, regExps, this._items.map((e) => e.ruleId));
		}
		return this._cached;
	}
	compileAG(onigLib, allowA, allowG) {
		if (!this._hasAnchors) return this.compile(onigLib);
		else if (allowA) {
			if (allowG) {
				if (!this._anchorCache.A1_G1) this._anchorCache.A1_G1 = this._resolveAnchors(onigLib, allowA, allowG);
				return this._anchorCache.A1_G1;
			} else {
				if (!this._anchorCache.A1_G0) this._anchorCache.A1_G0 = this._resolveAnchors(onigLib, allowA, allowG);
				return this._anchorCache.A1_G0;
			}
		} else if (allowG) {
			if (!this._anchorCache.A0_G1) this._anchorCache.A0_G1 = this._resolveAnchors(onigLib, allowA, allowG);
			return this._anchorCache.A0_G1;
		} else {
			if (!this._anchorCache.A0_G0) this._anchorCache.A0_G0 = this._resolveAnchors(onigLib, allowA, allowG);
			return this._anchorCache.A0_G0;
		}
	}
	_resolveAnchors(onigLib, allowA, allowG) {
		return new CompiledRule(onigLib, this._items.map((e) => e.resolveAnchors(allowA, allowG)), this._items.map((e) => e.ruleId));
	}
};
var CompiledRule = class {
	constructor(onigLib, regExps, rules) {
		this.regExps = regExps;
		this.rules = rules;
		this.scanner = onigLib.createOnigScanner(regExps);
	}
	scanner;
	dispose() {
		if (typeof this.scanner.dispose === "function") this.scanner.dispose();
	}
	toString() {
		const r = [];
		for (let i = 0, len = this.rules.length; i < len; i++) r.push("   - " + this.rules[i] + ": " + this.regExps[i]);
		return r.join("\n");
	}
	findNextMatchSync(string, startPosition, options) {
		const result = this.scanner.findNextMatchSync(string, startPosition, options);
		if (!result) return null;
		return {
			ruleId: this.rules[result.index],
			captureIndices: result.captureIndices
		};
	}
};
var BasicScopeAttributes = class {
	constructor(languageId, tokenType) {
		this.languageId = languageId;
		this.tokenType = tokenType;
	}
};
var BasicScopeAttributesProvider = class _BasicScopeAttributesProvider {
	_defaultAttributes;
	_embeddedLanguagesMatcher;
	constructor(initialLanguageId, embeddedLanguages) {
		this._defaultAttributes = new BasicScopeAttributes(initialLanguageId, 8);
		this._embeddedLanguagesMatcher = new ScopeMatcher(Object.entries(embeddedLanguages || {}));
	}
	getDefaultAttributes() {
		return this._defaultAttributes;
	}
	getBasicScopeAttributes(scopeName) {
		if (scopeName === null) return _BasicScopeAttributesProvider._NULL_SCOPE_METADATA;
		return this._getBasicScopeAttributes.get(scopeName);
	}
	static _NULL_SCOPE_METADATA = new BasicScopeAttributes(0, 0);
	_getBasicScopeAttributes = new CachedFn((scopeName) => {
		return new BasicScopeAttributes(this._scopeToLanguage(scopeName), this._toStandardTokenType(scopeName));
	});
	/**
	* Given a produced TM scope, return the language that token describes or null if unknown.
	* e.g. source.html => html, source.css.embedded.html => css, punctuation.definition.tag.html => null
	*/
	_scopeToLanguage(scope) {
		return this._embeddedLanguagesMatcher.match(scope) || 0;
	}
	_toStandardTokenType(scopeName) {
		const m = scopeName.match(_BasicScopeAttributesProvider.STANDARD_TOKEN_TYPE_REGEXP);
		if (!m) return 8;
		switch (m[1]) {
			case "comment": return 1;
			case "string": return 2;
			case "regex": return 3;
			case "meta.embedded": return 0;
		}
		throw new Error("Unexpected match for standard token type!");
	}
	static STANDARD_TOKEN_TYPE_REGEXP = /\b(comment|string|regex|meta\.embedded)\b/;
};
var ScopeMatcher = class {
	values;
	scopesRegExp;
	constructor(values) {
		if (values.length === 0) {
			this.values = null;
			this.scopesRegExp = null;
		} else {
			this.values = new Map(values);
			const escapedScopes = values.map(([scopeName, value]) => escapeRegExpCharacters(scopeName));
			escapedScopes.sort();
			escapedScopes.reverse();
			this.scopesRegExp = new RegExp(`^((${escapedScopes.join(")|(")}))($|\\.)`, "");
		}
	}
	match(scope) {
		if (!this.scopesRegExp) return;
		const m = scope.match(this.scopesRegExp);
		if (!m) return;
		return this.values.get(m[1]);
	}
};
typeof process !== "undefined" && process.env["VSCODE_TEXTMATE_DEBUG"];
var UseOnigurumaFindOptions = false;
var TokenizeStringResult = class {
	constructor(stack, stoppedEarly) {
		this.stack = stack;
		this.stoppedEarly = stoppedEarly;
	}
};
function _tokenizeString(grammar, lineText, isFirstLine, linePos, stack, lineTokens, checkWhileConditions, timeLimit) {
	const lineLength = lineText.content.length;
	let STOP = false;
	let anchorPosition = -1;
	if (checkWhileConditions) {
		const whileCheckResult = _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens);
		stack = whileCheckResult.stack;
		linePos = whileCheckResult.linePos;
		isFirstLine = whileCheckResult.isFirstLine;
		anchorPosition = whileCheckResult.anchorPosition;
	}
	const startTime = Date.now();
	while (!STOP) {
		if (timeLimit !== 0) {
			if (Date.now() - startTime > timeLimit) return new TokenizeStringResult(stack, true);
		}
		scanNext();
	}
	return new TokenizeStringResult(stack, false);
	function scanNext() {
		const r = matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
		if (!r) {
			lineTokens.produce(stack, lineLength);
			STOP = true;
			return;
		}
		const captureIndices = r.captureIndices;
		const matchedRuleId = r.matchedRuleId;
		const hasAdvanced = captureIndices && captureIndices.length > 0 ? captureIndices[0].end > linePos : false;
		if (matchedRuleId === endRuleId) {
			const poppedRule = stack.getRule(grammar);
			lineTokens.produce(stack, captureIndices[0].start);
			stack = stack.withContentNameScopesList(stack.nameScopesList);
			handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, poppedRule.endCaptures, captureIndices);
			lineTokens.produce(stack, captureIndices[0].end);
			const popped = stack;
			stack = stack.parent;
			anchorPosition = popped.getAnchorPos();
			if (!hasAdvanced && popped.getEnterPos() === linePos) {
				stack = popped;
				lineTokens.produce(stack, lineLength);
				STOP = true;
				return;
			}
		} else {
			const _rule = grammar.getRule(matchedRuleId);
			lineTokens.produce(stack, captureIndices[0].start);
			const beforePush = stack;
			const scopeName = _rule.getName(lineText.content, captureIndices);
			const nameScopesList = stack.contentNameScopesList.pushAttributed(scopeName, grammar);
			stack = stack.push(matchedRuleId, linePos, anchorPosition, captureIndices[0].end === lineLength, null, nameScopesList, nameScopesList);
			if (_rule instanceof BeginEndRule) {
				const pushedRule = _rule;
				handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
				lineTokens.produce(stack, captureIndices[0].end);
				anchorPosition = captureIndices[0].end;
				const contentName = pushedRule.getContentName(lineText.content, captureIndices);
				const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
				stack = stack.withContentNameScopesList(contentNameScopesList);
				if (pushedRule.endHasBackReferences) stack = stack.withEndRule(pushedRule.getEndWithResolvedBackReferences(lineText.content, captureIndices));
				if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
					stack = stack.pop();
					lineTokens.produce(stack, lineLength);
					STOP = true;
					return;
				}
			} else if (_rule instanceof BeginWhileRule) {
				const pushedRule = _rule;
				handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, pushedRule.beginCaptures, captureIndices);
				lineTokens.produce(stack, captureIndices[0].end);
				anchorPosition = captureIndices[0].end;
				const contentName = pushedRule.getContentName(lineText.content, captureIndices);
				const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
				stack = stack.withContentNameScopesList(contentNameScopesList);
				if (pushedRule.whileHasBackReferences) stack = stack.withEndRule(pushedRule.getWhileWithResolvedBackReferences(lineText.content, captureIndices));
				if (!hasAdvanced && beforePush.hasSameRuleAs(stack)) {
					stack = stack.pop();
					lineTokens.produce(stack, lineLength);
					STOP = true;
					return;
				}
			} else {
				handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, _rule.captures, captureIndices);
				lineTokens.produce(stack, captureIndices[0].end);
				stack = stack.pop();
				if (!hasAdvanced) {
					stack = stack.safePop();
					lineTokens.produce(stack, lineLength);
					STOP = true;
					return;
				}
			}
		}
		if (captureIndices[0].end > linePos) {
			linePos = captureIndices[0].end;
			isFirstLine = false;
		}
	}
}
function _checkWhileConditions(grammar, lineText, isFirstLine, linePos, stack, lineTokens) {
	let anchorPosition = stack.beginRuleCapturedEOL ? 0 : -1;
	const whileRules = [];
	for (let node = stack; node; node = node.pop()) {
		const nodeRule = node.getRule(grammar);
		if (nodeRule instanceof BeginWhileRule) whileRules.push({
			rule: nodeRule,
			stack: node
		});
	}
	for (let whileRule = whileRules.pop(); whileRule; whileRule = whileRules.pop()) {
		const { ruleScanner, findOptions } = prepareRuleWhileSearch(whileRule.rule, grammar, whileRule.stack.endRule, isFirstLine, linePos === anchorPosition);
		const r = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
		if (r) {
			if (r.ruleId !== whileRuleId) {
				stack = whileRule.stack.pop();
				break;
			}
			if (r.captureIndices && r.captureIndices.length) {
				lineTokens.produce(whileRule.stack, r.captureIndices[0].start);
				handleCaptures(grammar, lineText, isFirstLine, whileRule.stack, lineTokens, whileRule.rule.whileCaptures, r.captureIndices);
				lineTokens.produce(whileRule.stack, r.captureIndices[0].end);
				anchorPosition = r.captureIndices[0].end;
				if (r.captureIndices[0].end > linePos) {
					linePos = r.captureIndices[0].end;
					isFirstLine = false;
				}
			}
		} else {
			stack = whileRule.stack.pop();
			break;
		}
	}
	return {
		stack,
		linePos,
		anchorPosition,
		isFirstLine
	};
}
function matchRuleOrInjections(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
	const matchResult = matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
	const injections = grammar.getInjections();
	if (injections.length === 0) return matchResult;
	const injectionResult = matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition);
	if (!injectionResult) return matchResult;
	if (!matchResult) return injectionResult;
	const matchResultScore = matchResult.captureIndices[0].start;
	const injectionResultScore = injectionResult.captureIndices[0].start;
	if (injectionResultScore < matchResultScore || injectionResult.priorityMatch && injectionResultScore === matchResultScore) return injectionResult;
	return matchResult;
}
function matchRule(grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
	const { ruleScanner, findOptions } = prepareRuleSearch(stack.getRule(grammar), grammar, stack.endRule, isFirstLine, linePos === anchorPosition);
	const r = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
	if (r) return {
		captureIndices: r.captureIndices,
		matchedRuleId: r.ruleId
	};
	return null;
}
function matchInjections(injections, grammar, lineText, isFirstLine, linePos, stack, anchorPosition) {
	let bestMatchRating = Number.MAX_VALUE;
	let bestMatchCaptureIndices = null;
	let bestMatchRuleId;
	let bestMatchResultPriority = 0;
	const scopes = stack.contentNameScopesList.getScopeNames();
	for (let i = 0, len = injections.length; i < len; i++) {
		const injection = injections[i];
		if (!injection.matcher(scopes)) continue;
		const { ruleScanner, findOptions } = prepareRuleSearch(grammar.getRule(injection.ruleId), grammar, null, isFirstLine, linePos === anchorPosition);
		const matchResult = ruleScanner.findNextMatchSync(lineText, linePos, findOptions);
		if (!matchResult) continue;
		const matchRating = matchResult.captureIndices[0].start;
		if (matchRating >= bestMatchRating) continue;
		bestMatchRating = matchRating;
		bestMatchCaptureIndices = matchResult.captureIndices;
		bestMatchRuleId = matchResult.ruleId;
		bestMatchResultPriority = injection.priority;
		if (bestMatchRating === linePos) break;
	}
	if (bestMatchCaptureIndices) return {
		priorityMatch: bestMatchResultPriority === -1,
		captureIndices: bestMatchCaptureIndices,
		matchedRuleId: bestMatchRuleId
	};
	return null;
}
function prepareRuleSearch(rule, grammar, endRegexSource, allowA, allowG) {
	if (UseOnigurumaFindOptions) return {
		ruleScanner: rule.compile(grammar, endRegexSource),
		findOptions: getFindOptions(allowA, allowG)
	};
	return {
		ruleScanner: rule.compileAG(grammar, endRegexSource, allowA, allowG),
		findOptions: 0
	};
}
function prepareRuleWhileSearch(rule, grammar, endRegexSource, allowA, allowG) {
	if (UseOnigurumaFindOptions) return {
		ruleScanner: rule.compileWhile(grammar, endRegexSource),
		findOptions: getFindOptions(allowA, allowG)
	};
	return {
		ruleScanner: rule.compileWhileAG(grammar, endRegexSource, allowA, allowG),
		findOptions: 0
	};
}
function getFindOptions(allowA, allowG) {
	let options = 0;
	if (!allowA) options |= 1;
	if (!allowG) options |= 4;
	return options;
}
function handleCaptures(grammar, lineText, isFirstLine, stack, lineTokens, captures, captureIndices) {
	if (captures.length === 0) return;
	const lineTextContent = lineText.content;
	const len = Math.min(captures.length, captureIndices.length);
	const localStack = [];
	const maxEnd = captureIndices[0].end;
	for (let i = 0; i < len; i++) {
		const captureRule = captures[i];
		if (captureRule === null) continue;
		const captureIndex = captureIndices[i];
		if (captureIndex.length === 0) continue;
		if (captureIndex.start > maxEnd) break;
		while (localStack.length > 0 && localStack[localStack.length - 1].endPos <= captureIndex.start) {
			lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
			localStack.pop();
		}
		if (localStack.length > 0) lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, captureIndex.start);
		else lineTokens.produce(stack, captureIndex.start);
		if (captureRule.retokenizeCapturedWithRuleId) {
			const scopeName = captureRule.getName(lineTextContent, captureIndices);
			const nameScopesList = stack.contentNameScopesList.pushAttributed(scopeName, grammar);
			const contentName = captureRule.getContentName(lineTextContent, captureIndices);
			const contentNameScopesList = nameScopesList.pushAttributed(contentName, grammar);
			const stackClone = stack.push(captureRule.retokenizeCapturedWithRuleId, captureIndex.start, -1, false, null, nameScopesList, contentNameScopesList);
			const onigSubStr = grammar.createOnigString(lineTextContent.substring(0, captureIndex.end));
			_tokenizeString(grammar, onigSubStr, isFirstLine && captureIndex.start === 0, captureIndex.start, stackClone, lineTokens, false, 0);
			disposeOnigString(onigSubStr);
			continue;
		}
		const captureRuleScopeName = captureRule.getName(lineTextContent, captureIndices);
		if (captureRuleScopeName !== null) {
			const captureRuleScopesList = (localStack.length > 0 ? localStack[localStack.length - 1].scopes : stack.contentNameScopesList).pushAttributed(captureRuleScopeName, grammar);
			localStack.push(new LocalStackElement(captureRuleScopesList, captureIndex.end));
		}
	}
	while (localStack.length > 0) {
		lineTokens.produceFromScopes(localStack[localStack.length - 1].scopes, localStack[localStack.length - 1].endPos);
		localStack.pop();
	}
}
var LocalStackElement = class {
	scopes;
	endPos;
	constructor(scopes, endPos) {
		this.scopes = scopes;
		this.endPos = endPos;
	}
};
function createGrammar(scopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, onigLib) {
	return new Grammar(scopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, onigLib);
}
function collectInjections(result, selector, rule, ruleFactoryHelper, grammar) {
	const matchers = createMatchers(selector, nameMatcher);
	const ruleId = RuleFactory.getCompiledRuleId(rule, ruleFactoryHelper, grammar.repository);
	for (const matcher of matchers) result.push({
		debugSelector: selector,
		matcher: matcher.matcher,
		ruleId,
		grammar,
		priority: matcher.priority
	});
}
function nameMatcher(identifers, scopes) {
	if (scopes.length < identifers.length) return false;
	let lastIndex = 0;
	return identifers.every((identifier) => {
		for (let i = lastIndex; i < scopes.length; i++) if (scopesAreMatching(scopes[i], identifier)) {
			lastIndex = i + 1;
			return true;
		}
		return false;
	});
}
function scopesAreMatching(thisScopeName, scopeName) {
	if (!thisScopeName) return false;
	if (thisScopeName === scopeName) return true;
	const len = scopeName.length;
	return thisScopeName.length > len && thisScopeName.substr(0, len) === scopeName && thisScopeName[len] === ".";
}
var Grammar = class {
	constructor(_rootScopeName, grammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, grammarRepository, _onigLib) {
		this._rootScopeName = _rootScopeName;
		this.balancedBracketSelectors = balancedBracketSelectors;
		this._onigLib = _onigLib;
		this._basicScopeAttributesProvider = new BasicScopeAttributesProvider(initialLanguage, embeddedLanguages);
		this._rootId = -1;
		this._lastRuleId = 0;
		this._ruleId2desc = [null];
		this._includedGrammars = {};
		this._grammarRepository = grammarRepository;
		this._grammar = initGrammar(grammar, null);
		this._injections = null;
		this._tokenTypeMatchers = [];
		if (tokenTypes) for (const selector of Object.keys(tokenTypes)) {
			const matchers = createMatchers(selector, nameMatcher);
			for (const matcher of matchers) this._tokenTypeMatchers.push({
				matcher: matcher.matcher,
				type: tokenTypes[selector]
			});
		}
	}
	_rootId;
	_lastRuleId;
	_ruleId2desc;
	_includedGrammars;
	_grammarRepository;
	_grammar;
	_injections;
	_basicScopeAttributesProvider;
	_tokenTypeMatchers;
	get themeProvider() {
		return this._grammarRepository;
	}
	dispose() {
		for (const rule of this._ruleId2desc) if (rule) rule.dispose();
	}
	createOnigScanner(sources) {
		return this._onigLib.createOnigScanner(sources);
	}
	createOnigString(sources) {
		return this._onigLib.createOnigString(sources);
	}
	getMetadataForScope(scope) {
		return this._basicScopeAttributesProvider.getBasicScopeAttributes(scope);
	}
	_collectInjections() {
		const grammarRepository = {
			lookup: (scopeName2) => {
				if (scopeName2 === this._rootScopeName) return this._grammar;
				return this.getExternalGrammar(scopeName2);
			},
			injections: (scopeName2) => {
				return this._grammarRepository.injections(scopeName2);
			}
		};
		const result = [];
		const scopeName = this._rootScopeName;
		const grammar = grammarRepository.lookup(scopeName);
		if (grammar) {
			const rawInjections = grammar.injections;
			if (rawInjections) for (let expression in rawInjections) collectInjections(result, expression, rawInjections[expression], this, grammar);
			const injectionScopeNames = this._grammarRepository.injections(scopeName);
			if (injectionScopeNames) injectionScopeNames.forEach((injectionScopeName) => {
				const injectionGrammar = this.getExternalGrammar(injectionScopeName);
				if (injectionGrammar) {
					const selector = injectionGrammar.injectionSelector;
					if (selector) collectInjections(result, selector, injectionGrammar, this, injectionGrammar);
				}
			});
		}
		result.sort((i1, i2) => i1.priority - i2.priority);
		return result;
	}
	getInjections() {
		if (this._injections === null) this._injections = this._collectInjections();
		return this._injections;
	}
	registerRule(factory) {
		const id = ++this._lastRuleId;
		const result = factory(ruleIdFromNumber(id));
		this._ruleId2desc[id] = result;
		return result;
	}
	getRule(ruleId) {
		return this._ruleId2desc[ruleIdToNumber(ruleId)];
	}
	getExternalGrammar(scopeName, repository) {
		if (this._includedGrammars[scopeName]) return this._includedGrammars[scopeName];
		else if (this._grammarRepository) {
			const rawIncludedGrammar = this._grammarRepository.lookup(scopeName);
			if (rawIncludedGrammar) {
				this._includedGrammars[scopeName] = initGrammar(rawIncludedGrammar, repository && repository.$base);
				return this._includedGrammars[scopeName];
			}
		}
	}
	tokenizeLine(lineText, prevState, timeLimit = 0) {
		const r = this._tokenize(lineText, prevState, false, timeLimit);
		return {
			tokens: r.lineTokens.getResult(r.ruleStack, r.lineLength),
			ruleStack: r.ruleStack,
			stoppedEarly: r.stoppedEarly
		};
	}
	tokenizeLine2(lineText, prevState, timeLimit = 0) {
		const r = this._tokenize(lineText, prevState, true, timeLimit);
		return {
			tokens: r.lineTokens.getBinaryResult(r.ruleStack, r.lineLength),
			ruleStack: r.ruleStack,
			stoppedEarly: r.stoppedEarly
		};
	}
	_tokenize(lineText, prevState, emitBinaryTokens, timeLimit) {
		if (this._rootId === -1) {
			this._rootId = RuleFactory.getCompiledRuleId(this._grammar.repository.$self, this, this._grammar.repository);
			this.getInjections();
		}
		let isFirstLine;
		if (!prevState || prevState === StateStackImpl.NULL) {
			isFirstLine = true;
			const rawDefaultMetadata = this._basicScopeAttributesProvider.getDefaultAttributes();
			const defaultStyle = this.themeProvider.getDefaults();
			const defaultMetadata = EncodedTokenMetadata.set(0, rawDefaultMetadata.languageId, rawDefaultMetadata.tokenType, null, defaultStyle.fontStyle, defaultStyle.foregroundId, defaultStyle.backgroundId);
			const rootScopeName = this.getRule(this._rootId).getName(null, null);
			let scopeList;
			if (rootScopeName) scopeList = AttributedScopeStack.createRootAndLookUpScopeName(rootScopeName, defaultMetadata, this);
			else scopeList = AttributedScopeStack.createRoot("unknown", defaultMetadata);
			prevState = new StateStackImpl(null, this._rootId, -1, -1, false, null, scopeList, scopeList);
		} else {
			isFirstLine = false;
			prevState.reset();
		}
		lineText = lineText + "\n";
		const onigLineText = this.createOnigString(lineText);
		const lineLength = onigLineText.content.length;
		const lineTokens = new LineTokens(emitBinaryTokens, lineText, this._tokenTypeMatchers, this.balancedBracketSelectors);
		const r = _tokenizeString(this, onigLineText, isFirstLine, 0, prevState, lineTokens, true, timeLimit);
		disposeOnigString(onigLineText);
		return {
			lineLength,
			lineTokens,
			ruleStack: r.stack,
			stoppedEarly: r.stoppedEarly
		};
	}
};
function initGrammar(grammar, base) {
	grammar = clone(grammar);
	grammar.repository = grammar.repository || {};
	grammar.repository.$self = {
		$vscodeTextmateLocation: grammar.$vscodeTextmateLocation,
		patterns: grammar.patterns,
		name: grammar.scopeName
	};
	grammar.repository.$base = base || grammar.repository.$self;
	return grammar;
}
var AttributedScopeStack = class _AttributedScopeStack {
	/**
	* Invariant:
	* ```
	* if (parent && !scopePath.extends(parent.scopePath)) {
	* 	throw new Error();
	* }
	* ```
	*/
	constructor(parent, scopePath, tokenAttributes) {
		this.parent = parent;
		this.scopePath = scopePath;
		this.tokenAttributes = tokenAttributes;
	}
	static fromExtension(namesScopeList, contentNameScopesList) {
		let current = namesScopeList;
		let scopeNames = namesScopeList?.scopePath ?? null;
		for (const frame of contentNameScopesList) {
			scopeNames = ScopeStack.push(scopeNames, frame.scopeNames);
			current = new _AttributedScopeStack(current, scopeNames, frame.encodedTokenAttributes);
		}
		return current;
	}
	static createRoot(scopeName, tokenAttributes) {
		return new _AttributedScopeStack(null, new ScopeStack(null, scopeName), tokenAttributes);
	}
	static createRootAndLookUpScopeName(scopeName, tokenAttributes, grammar) {
		const rawRootMetadata = grammar.getMetadataForScope(scopeName);
		const scopePath = new ScopeStack(null, scopeName);
		const rootStyle = grammar.themeProvider.themeMatch(scopePath);
		const resolvedTokenAttributes = _AttributedScopeStack.mergeAttributes(tokenAttributes, rawRootMetadata, rootStyle);
		return new _AttributedScopeStack(null, scopePath, resolvedTokenAttributes);
	}
	get scopeName() {
		return this.scopePath.scopeName;
	}
	toString() {
		return this.getScopeNames().join(" ");
	}
	equals(other) {
		return _AttributedScopeStack.equals(this, other);
	}
	static equals(a, b) {
		do {
			if (a === b) return true;
			if (!a && !b) return true;
			if (!a || !b) return false;
			if (a.scopeName !== b.scopeName || a.tokenAttributes !== b.tokenAttributes) return false;
			a = a.parent;
			b = b.parent;
		} while (true);
	}
	static mergeAttributes(existingTokenAttributes, basicScopeAttributes, styleAttributes) {
		let fontStyle = -1;
		let foreground = 0;
		let background = 0;
		if (styleAttributes !== null) {
			fontStyle = styleAttributes.fontStyle;
			foreground = styleAttributes.foregroundId;
			background = styleAttributes.backgroundId;
		}
		return EncodedTokenMetadata.set(existingTokenAttributes, basicScopeAttributes.languageId, basicScopeAttributes.tokenType, null, fontStyle, foreground, background);
	}
	pushAttributed(scopePath, grammar) {
		if (scopePath === null) return this;
		if (scopePath.indexOf(" ") === -1) return _AttributedScopeStack._pushAttributed(this, scopePath, grammar);
		const scopes = scopePath.split(/ /g);
		let result = this;
		for (const scope of scopes) result = _AttributedScopeStack._pushAttributed(result, scope, grammar);
		return result;
	}
	static _pushAttributed(target, scopeName, grammar) {
		const rawMetadata = grammar.getMetadataForScope(scopeName);
		const newPath = target.scopePath.push(scopeName);
		const scopeThemeMatchResult = grammar.themeProvider.themeMatch(newPath);
		const metadata = _AttributedScopeStack.mergeAttributes(target.tokenAttributes, rawMetadata, scopeThemeMatchResult);
		return new _AttributedScopeStack(target, newPath, metadata);
	}
	getScopeNames() {
		return this.scopePath.getSegments();
	}
	getExtensionIfDefined(base) {
		const result = [];
		let self = this;
		while (self && self !== base) {
			result.push({
				encodedTokenAttributes: self.tokenAttributes,
				scopeNames: self.scopePath.getExtensionIfDefined(self.parent?.scopePath ?? null)
			});
			self = self.parent;
		}
		return self === base ? result.reverse() : void 0;
	}
};
var StateStackImpl = class _StateStackImpl {
	/**
	* Invariant:
	* ```
	* if (contentNameScopesList !== nameScopesList && contentNameScopesList?.parent !== nameScopesList) {
	* 	throw new Error();
	* }
	* if (this.parent && !nameScopesList.extends(this.parent.contentNameScopesList)) {
	* 	throw new Error();
	* }
	* ```
	*/
	constructor(parent, ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList) {
		this.parent = parent;
		this.ruleId = ruleId;
		this.beginRuleCapturedEOL = beginRuleCapturedEOL;
		this.endRule = endRule;
		this.nameScopesList = nameScopesList;
		this.contentNameScopesList = contentNameScopesList;
		this.depth = this.parent ? this.parent.depth + 1 : 1;
		this._enterPos = enterPos;
		this._anchorPos = anchorPos;
	}
	_stackElementBrand = void 0;
	static NULL = new _StateStackImpl(null, 0, 0, 0, false, null, null, null);
	/**
	* The position on the current line where this state was pushed.
	* This is relevant only while tokenizing a line, to detect endless loops.
	* Its value is meaningless across lines.
	*/
	_enterPos;
	/**
	* The captured anchor position when this stack element was pushed.
	* This is relevant only while tokenizing a line, to restore the anchor position when popping.
	* Its value is meaningless across lines.
	*/
	_anchorPos;
	/**
	* The depth of the stack.
	*/
	depth;
	equals(other) {
		if (other === null) return false;
		return _StateStackImpl._equals(this, other);
	}
	static _equals(a, b) {
		if (a === b) return true;
		if (!this._structuralEquals(a, b)) return false;
		return AttributedScopeStack.equals(a.contentNameScopesList, b.contentNameScopesList);
	}
	/**
	* A structural equals check. Does not take into account `scopes`.
	*/
	static _structuralEquals(a, b) {
		do {
			if (a === b) return true;
			if (!a && !b) return true;
			if (!a || !b) return false;
			if (a.depth !== b.depth || a.ruleId !== b.ruleId || a.endRule !== b.endRule) return false;
			a = a.parent;
			b = b.parent;
		} while (true);
	}
	clone() {
		return this;
	}
	static _reset(el) {
		while (el) {
			el._enterPos = -1;
			el._anchorPos = -1;
			el = el.parent;
		}
	}
	reset() {
		_StateStackImpl._reset(this);
	}
	pop() {
		return this.parent;
	}
	safePop() {
		if (this.parent) return this.parent;
		return this;
	}
	push(ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList) {
		return new _StateStackImpl(this, ruleId, enterPos, anchorPos, beginRuleCapturedEOL, endRule, nameScopesList, contentNameScopesList);
	}
	getEnterPos() {
		return this._enterPos;
	}
	getAnchorPos() {
		return this._anchorPos;
	}
	getRule(grammar) {
		return grammar.getRule(this.ruleId);
	}
	toString() {
		const r = [];
		this._writeString(r, 0);
		return "[" + r.join(",") + "]";
	}
	_writeString(res, outIndex) {
		if (this.parent) outIndex = this.parent._writeString(res, outIndex);
		res[outIndex++] = `(${this.ruleId}, ${this.nameScopesList?.toString()}, ${this.contentNameScopesList?.toString()})`;
		return outIndex;
	}
	withContentNameScopesList(contentNameScopeStack) {
		if (this.contentNameScopesList === contentNameScopeStack) return this;
		return this.parent.push(this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, this.endRule, this.nameScopesList, contentNameScopeStack);
	}
	withEndRule(endRule) {
		if (this.endRule === endRule) return this;
		return new _StateStackImpl(this.parent, this.ruleId, this._enterPos, this._anchorPos, this.beginRuleCapturedEOL, endRule, this.nameScopesList, this.contentNameScopesList);
	}
	hasSameRuleAs(other) {
		let el = this;
		while (el && el._enterPos === other._enterPos) {
			if (el.ruleId === other.ruleId) return true;
			el = el.parent;
		}
		return false;
	}
	toStateStackFrame() {
		return {
			ruleId: ruleIdToNumber(this.ruleId),
			beginRuleCapturedEOL: this.beginRuleCapturedEOL,
			endRule: this.endRule,
			nameScopesList: this.nameScopesList?.getExtensionIfDefined(this.parent?.nameScopesList ?? null) ?? [],
			contentNameScopesList: this.contentNameScopesList?.getExtensionIfDefined(this.nameScopesList) ?? []
		};
	}
	static pushFrame(self, frame) {
		const namesScopeList = AttributedScopeStack.fromExtension(self?.nameScopesList ?? null, frame.nameScopesList);
		return new _StateStackImpl(self, ruleIdFromNumber(frame.ruleId), frame.enterPos ?? -1, frame.anchorPos ?? -1, frame.beginRuleCapturedEOL, frame.endRule, namesScopeList, AttributedScopeStack.fromExtension(namesScopeList, frame.contentNameScopesList));
	}
};
var BalancedBracketSelectors = class {
	balancedBracketScopes;
	unbalancedBracketScopes;
	allowAny = false;
	constructor(balancedBracketScopes, unbalancedBracketScopes) {
		this.balancedBracketScopes = balancedBracketScopes.flatMap((selector) => {
			if (selector === "*") {
				this.allowAny = true;
				return [];
			}
			return createMatchers(selector, nameMatcher).map((m) => m.matcher);
		});
		this.unbalancedBracketScopes = unbalancedBracketScopes.flatMap((selector) => createMatchers(selector, nameMatcher).map((m) => m.matcher));
	}
	get matchesAlways() {
		return this.allowAny && this.unbalancedBracketScopes.length === 0;
	}
	get matchesNever() {
		return this.balancedBracketScopes.length === 0 && !this.allowAny;
	}
	match(scopes) {
		for (const excluder of this.unbalancedBracketScopes) if (excluder(scopes)) return false;
		for (const includer of this.balancedBracketScopes) if (includer(scopes)) return true;
		return this.allowAny;
	}
};
var LineTokens = class {
	constructor(emitBinaryTokens, lineText, tokenTypeOverrides, balancedBracketSelectors) {
		this.balancedBracketSelectors = balancedBracketSelectors;
		this._emitBinaryTokens = emitBinaryTokens;
		this._tokenTypeOverrides = tokenTypeOverrides;
		this._lineText = null;
		this._tokens = [];
		this._binaryTokens = [];
		this._lastTokenEndIndex = 0;
	}
	_emitBinaryTokens;
	/**
	* defined only if `false`.
	*/
	_lineText;
	/**
	* used only if `_emitBinaryTokens` is false.
	*/
	_tokens;
	/**
	* used only if `_emitBinaryTokens` is true.
	*/
	_binaryTokens;
	_lastTokenEndIndex;
	_tokenTypeOverrides;
	produce(stack, endIndex) {
		this.produceFromScopes(stack.contentNameScopesList, endIndex);
	}
	produceFromScopes(scopesList, endIndex) {
		if (this._lastTokenEndIndex >= endIndex) return;
		if (this._emitBinaryTokens) {
			let metadata = scopesList?.tokenAttributes ?? 0;
			let containsBalancedBrackets = false;
			if (this.balancedBracketSelectors?.matchesAlways) containsBalancedBrackets = true;
			if (this._tokenTypeOverrides.length > 0 || this.balancedBracketSelectors && !this.balancedBracketSelectors.matchesAlways && !this.balancedBracketSelectors.matchesNever) {
				const scopes2 = scopesList?.getScopeNames() ?? [];
				for (const tokenType of this._tokenTypeOverrides) if (tokenType.matcher(scopes2)) metadata = EncodedTokenMetadata.set(metadata, 0, toOptionalTokenType(tokenType.type), null, -1, 0, 0);
				if (this.balancedBracketSelectors) containsBalancedBrackets = this.balancedBracketSelectors.match(scopes2);
			}
			if (containsBalancedBrackets) metadata = EncodedTokenMetadata.set(metadata, 0, 8, containsBalancedBrackets, -1, 0, 0);
			if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 1] === metadata) {
				this._lastTokenEndIndex = endIndex;
				return;
			}
			this._binaryTokens.push(this._lastTokenEndIndex);
			this._binaryTokens.push(metadata);
			this._lastTokenEndIndex = endIndex;
			return;
		}
		const scopes = scopesList?.getScopeNames() ?? [];
		this._tokens.push({
			startIndex: this._lastTokenEndIndex,
			endIndex,
			scopes
		});
		this._lastTokenEndIndex = endIndex;
	}
	getResult(stack, lineLength) {
		if (this._tokens.length > 0 && this._tokens[this._tokens.length - 1].startIndex === lineLength - 1) this._tokens.pop();
		if (this._tokens.length === 0) {
			this._lastTokenEndIndex = -1;
			this.produce(stack, lineLength);
			this._tokens[this._tokens.length - 1].startIndex = 0;
		}
		return this._tokens;
	}
	getBinaryResult(stack, lineLength) {
		if (this._binaryTokens.length > 0 && this._binaryTokens[this._binaryTokens.length - 2] === lineLength - 1) {
			this._binaryTokens.pop();
			this._binaryTokens.pop();
		}
		if (this._binaryTokens.length === 0) {
			this._lastTokenEndIndex = -1;
			this.produce(stack, lineLength);
			this._binaryTokens[this._binaryTokens.length - 2] = 0;
		}
		const result = new Uint32Array(this._binaryTokens.length);
		for (let i = 0, len = this._binaryTokens.length; i < len; i++) result[i] = this._binaryTokens[i];
		return result;
	}
};
var SyncRegistry = class {
	constructor(theme, _onigLib) {
		this._onigLib = _onigLib;
		this._theme = theme;
	}
	_grammars = /* @__PURE__ */ new Map();
	_rawGrammars = /* @__PURE__ */ new Map();
	_injectionGrammars = /* @__PURE__ */ new Map();
	_theme;
	dispose() {
		for (const grammar of this._grammars.values()) grammar.dispose();
	}
	setTheme(theme) {
		this._theme = theme;
	}
	getColorMap() {
		return this._theme.getColorMap();
	}
	/**
	* Add `grammar` to registry and return a list of referenced scope names
	*/
	addGrammar(grammar, injectionScopeNames) {
		this._rawGrammars.set(grammar.scopeName, grammar);
		if (injectionScopeNames) this._injectionGrammars.set(grammar.scopeName, injectionScopeNames);
	}
	/**
	* Lookup a raw grammar.
	*/
	lookup(scopeName) {
		return this._rawGrammars.get(scopeName);
	}
	/**
	* Returns the injections for the given grammar
	*/
	injections(targetScope) {
		return this._injectionGrammars.get(targetScope);
	}
	/**
	* Get the default theme settings
	*/
	getDefaults() {
		return this._theme.getDefaults();
	}
	/**
	* Match a scope in the theme.
	*/
	themeMatch(scopePath) {
		return this._theme.match(scopePath);
	}
	/**
	* Lookup a grammar.
	*/
	grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors) {
		if (!this._grammars.has(scopeName)) {
			let rawGrammar = this._rawGrammars.get(scopeName);
			if (!rawGrammar) return null;
			this._grammars.set(scopeName, createGrammar(scopeName, rawGrammar, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors, this, this._onigLib));
		}
		return this._grammars.get(scopeName);
	}
};
var Registry$1 = class {
	_options;
	_syncRegistry;
	_ensureGrammarCache;
	constructor(options) {
		this._options = options;
		this._syncRegistry = new SyncRegistry(Theme.createFromRawTheme(options.theme, options.colorMap), options.onigLib);
		this._ensureGrammarCache = /* @__PURE__ */ new Map();
	}
	dispose() {
		this._syncRegistry.dispose();
	}
	/**
	* Change the theme. Once called, no previous `ruleStack` should be used anymore.
	*/
	setTheme(theme, colorMap) {
		this._syncRegistry.setTheme(Theme.createFromRawTheme(theme, colorMap));
	}
	/**
	* Returns a lookup array for color ids.
	*/
	getColorMap() {
		return this._syncRegistry.getColorMap();
	}
	/**
	* Load the grammar for `scopeName` and all referenced included grammars asynchronously.
	* Please do not use language id 0.
	*/
	loadGrammarWithEmbeddedLanguages(initialScopeName, initialLanguage, embeddedLanguages) {
		return this.loadGrammarWithConfiguration(initialScopeName, initialLanguage, { embeddedLanguages });
	}
	/**
	* Load the grammar for `scopeName` and all referenced included grammars asynchronously.
	* Please do not use language id 0.
	*/
	loadGrammarWithConfiguration(initialScopeName, initialLanguage, configuration) {
		return this._loadGrammar(initialScopeName, initialLanguage, configuration.embeddedLanguages, configuration.tokenTypes, new BalancedBracketSelectors(configuration.balancedBracketSelectors || [], configuration.unbalancedBracketSelectors || []));
	}
	/**
	* Load the grammar for `scopeName` and all referenced included grammars asynchronously.
	*/
	loadGrammar(initialScopeName) {
		return this._loadGrammar(initialScopeName, 0, null, null, null);
	}
	_loadGrammar(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors) {
		const dependencyProcessor = new ScopeDependencyProcessor(this._syncRegistry, initialScopeName);
		while (dependencyProcessor.Q.length > 0) {
			dependencyProcessor.Q.map((request) => this._loadSingleGrammar(request.scopeName));
			dependencyProcessor.processQueue();
		}
		return this._grammarForScopeName(initialScopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors);
	}
	_loadSingleGrammar(scopeName) {
		if (!this._ensureGrammarCache.has(scopeName)) {
			this._doLoadSingleGrammar(scopeName);
			this._ensureGrammarCache.set(scopeName, true);
		}
	}
	_doLoadSingleGrammar(scopeName) {
		const grammar = this._options.loadGrammar(scopeName);
		if (grammar) {
			const injections = typeof this._options.getInjections === "function" ? this._options.getInjections(scopeName) : void 0;
			this._syncRegistry.addGrammar(grammar, injections);
		}
	}
	/**
	* Adds a rawGrammar.
	*/
	addGrammar(rawGrammar, injections = [], initialLanguage = 0, embeddedLanguages = null) {
		this._syncRegistry.addGrammar(rawGrammar, injections);
		return this._grammarForScopeName(rawGrammar.scopeName, initialLanguage, embeddedLanguages);
	}
	/**
	* Get the grammar for `scopeName`. The grammar must first be created via `loadGrammar` or `addGrammar`.
	*/
	_grammarForScopeName(scopeName, initialLanguage = 0, embeddedLanguages = null, tokenTypes = null, balancedBracketSelectors = null) {
		return this._syncRegistry.grammarForScopeName(scopeName, initialLanguage, embeddedLanguages, tokenTypes, balancedBracketSelectors);
	}
};
var INITIAL = StateStackImpl.NULL;
//#endregion
//#region node_modules/@shikijs/primitive/dist/index.mjs
function resolveColorReplacements(theme, options) {
	const replacements = typeof theme === "string" ? {} : { ...theme.colorReplacements };
	const themeName = typeof theme === "string" ? theme : theme.name;
	for (const [key, value] of Object.entries(options?.colorReplacements || {})) if (typeof value === "string") replacements[key] = value;
	else if (key === themeName) Object.assign(replacements, value);
	return replacements;
}
function applyColorReplacements(color, replacements) {
	if (!color) return color;
	return replacements?.[color?.toLowerCase()] || color;
}
function toArray(x) {
	return Array.isArray(x) ? x : [x];
}
/**
* Normalize a getter to a promise.
*/
async function normalizeGetter(p) {
	return Promise.resolve(typeof p === "function" ? p() : p).then((r) => r.default || r);
}
/**
* Check if the language is plaintext that is ignored by Shiki.
*
* Hard-coded plain text languages: `plaintext`, `txt`, `text`, `plain`.
*/
function isPlainLang(lang) {
	return !lang || [
		"plaintext",
		"txt",
		"text",
		"plain"
	].includes(lang);
}
/**
* Check if the language is specially handled or bypassed by Shiki.
*
* Hard-coded languages: `ansi` and plaintexts like `plaintext`, `txt`, `text`, `plain`.
*/
function isSpecialLang(lang) {
	return lang === "ansi" || isPlainLang(lang);
}
/**
* Check if the theme is specially handled or bypassed by Shiki.
*
* Hard-coded themes: `none`.
*/
function isNoneTheme(theme) {
	return theme === "none";
}
/**
* Check if the theme is specially handled or bypassed by Shiki.
*
* Hard-coded themes: `none`.
*/
function isSpecialTheme(theme) {
	return isNoneTheme(theme);
}
/**
* Split a string into lines, each line preserves the line ending.
*
* @param code - The code string to split into lines
* @param preserveEnding - Whether to preserve line endings in the result
* @returns Array of tuples containing [line content, offset index]
*
* @example
* ```ts
* splitLines('hello\nworld', false)
* // => [['hello', 0], ['world', 6]]
*
* splitLines('hello\nworld', true)
* // => [['hello\n', 0], ['world', 6]]
* ```
*/
var RE_NEWLINE = /(\r?\n)/g;
function splitLines(code, preserveEnding = false) {
	if (code.length === 0) return [["", 0]];
	const parts = code.split(RE_NEWLINE);
	let index = 0;
	const lines = [];
	for (let i = 0; i < parts.length; i += 2) {
		const line = preserveEnding ? parts[i] + (parts[i + 1] || "") : parts[i];
		lines.push([line, index]);
		index += parts[i].length;
		index += parts[i + 1]?.length || 0;
	}
	return lines;
}
/**
* https://github.com/microsoft/vscode/blob/f7f05dee53fb33fe023db2e06e30a89d3094488f/src/vs/platform/theme/common/colorRegistry.ts#L258-L268
*/
var VSCODE_FALLBACK_EDITOR_FG = {
	light: "#333333",
	dark: "#bbbbbb"
};
var VSCODE_FALLBACK_EDITOR_BG = {
	light: "#fffffe",
	dark: "#1e1e1e"
};
var RESOLVED_KEY = "__shiki_resolved";
/**
* Normalize a textmate theme to shiki theme
*/
function normalizeTheme(rawTheme) {
	if (rawTheme?.[RESOLVED_KEY]) return rawTheme;
	const theme = { ...rawTheme };
	if (theme.tokenColors && !theme.settings) {
		theme.settings = theme.tokenColors;
		delete theme.tokenColors;
	}
	theme.type ||= "dark";
	theme.colorReplacements = { ...theme.colorReplacements };
	theme.settings ||= [];
	let { bg, fg } = theme;
	if (!bg || !fg) {
		/**
		* First try:
		* Theme might contain a global `tokenColor` without `name` or `scope`
		* Used as default value for foreground/background
		*/
		const globalSetting = theme.settings ? theme.settings.find((s) => !s.name && !s.scope) : void 0;
		if (globalSetting?.settings?.foreground) fg = globalSetting.settings.foreground;
		if (globalSetting?.settings?.background) bg = globalSetting.settings.background;
		/**
		* Second try:
		* If there's no global `tokenColor` without `name` or `scope`
		* Use `editor.foreground` and `editor.background`
		*/
		if (!fg && theme?.colors?.["editor.foreground"]) fg = theme.colors["editor.foreground"];
		if (!bg && theme?.colors?.["editor.background"]) bg = theme.colors["editor.background"];
		/**
		* Last try:
		* If there's no fg/bg color specified in theme, use default
		*/
		if (!fg) fg = theme.type === "light" ? VSCODE_FALLBACK_EDITOR_FG.light : VSCODE_FALLBACK_EDITOR_FG.dark;
		if (!bg) bg = theme.type === "light" ? VSCODE_FALLBACK_EDITOR_BG.light : VSCODE_FALLBACK_EDITOR_BG.dark;
		theme.fg = fg;
		theme.bg = bg;
	}
	if (!(theme.settings[0] && theme.settings[0].settings && !theme.settings[0].scope)) theme.settings.unshift({ settings: {
		foreground: theme.fg,
		background: theme.bg
	} });
	let replacementCount = 0;
	const replacementMap = /* @__PURE__ */ new Map();
	function getReplacementColor(value) {
		if (replacementMap.has(value)) return replacementMap.get(value);
		replacementCount += 1;
		const hex = `#${replacementCount.toString(16).padStart(8, "0").toLowerCase()}`;
		if (theme.colorReplacements?.[`#${hex}`]) return getReplacementColor(value);
		replacementMap.set(value, hex);
		return hex;
	}
	theme.settings = theme.settings.map((setting) => {
		const replaceFg = setting.settings?.foreground && !setting.settings.foreground.startsWith("#");
		const replaceBg = setting.settings?.background && !setting.settings.background.startsWith("#");
		if (!replaceFg && !replaceBg) return setting;
		const clone = {
			...setting,
			settings: { ...setting.settings }
		};
		if (replaceFg) {
			const replacement = getReplacementColor(setting.settings.foreground);
			theme.colorReplacements[replacement] = setting.settings.foreground;
			clone.settings.foreground = replacement;
		}
		if (replaceBg) {
			const replacement = getReplacementColor(setting.settings.background);
			theme.colorReplacements[replacement] = setting.settings.background;
			clone.settings.background = replacement;
		}
		return clone;
	});
	for (const key of Object.keys(theme.colors || {})) if (key === "editor.foreground" || key === "editor.background" || key.startsWith("terminal.ansi")) {
		if (!theme.colors[key]?.startsWith("#")) {
			const replacement = getReplacementColor(theme.colors[key]);
			theme.colorReplacements[replacement] = theme.colors[key];
			theme.colors[key] = replacement;
		}
	}
	Object.defineProperty(theme, RESOLVED_KEY, {
		enumerable: false,
		writable: false,
		value: true
	});
	return theme;
}
/**
* Resolve
*/
async function resolveLangs(langs) {
	return [...new Set((await Promise.all(langs.filter((l) => !isSpecialLang(l)).map(async (lang) => await normalizeGetter(lang).then((r) => Array.isArray(r) ? r : [r])))).flat())];
}
async function resolveThemes(themes) {
	return (await Promise.all(themes.map(async (theme) => isSpecialTheme(theme) ? null : normalizeTheme(await normalizeGetter(theme))))).filter((i) => !!i);
}
function resolveLangAlias(name, alias) {
	if (!alias) return name;
	if (alias[name]) {
		const resolved = /* @__PURE__ */ new Set([name]);
		while (alias[name]) {
			name = alias[name];
			if (resolved.has(name)) throw new ShikiError(`Circular alias \`${[...resolved].join(" -> ")} -> ${name}\``);
			resolved.add(name);
		}
	}
	return name;
}
var Registry = class extends Registry$1 {
	_resolver;
	_themes;
	_langs;
	_alias;
	_resolvedThemes = /* @__PURE__ */ new Map();
	_resolvedGrammars = /* @__PURE__ */ new Map();
	_langMap = /* @__PURE__ */ new Map();
	_langGraph = /* @__PURE__ */ new Map();
	_textmateThemeCache = /* @__PURE__ */ new WeakMap();
	_loadedThemesCache = null;
	_loadedLanguagesCache = null;
	constructor(_resolver, _themes, _langs, _alias = {}) {
		super(_resolver);
		this._resolver = _resolver;
		this._themes = _themes;
		this._langs = _langs;
		this._alias = _alias;
		this._themes.map((t) => this.loadTheme(t));
		this.loadLanguages(this._langs);
	}
	getTheme(theme) {
		if (typeof theme === "string") return this._resolvedThemes.get(theme);
		else return this.loadTheme(theme);
	}
	loadTheme(theme) {
		const _theme = normalizeTheme(theme);
		if (_theme.name) {
			this._resolvedThemes.set(_theme.name, _theme);
			this._loadedThemesCache = null;
		}
		return _theme;
	}
	getLoadedThemes() {
		if (!this._loadedThemesCache) this._loadedThemesCache = [...this._resolvedThemes.keys()];
		return this._loadedThemesCache;
	}
	setTheme(theme) {
		let textmateTheme = this._textmateThemeCache.get(theme);
		if (!textmateTheme) {
			textmateTheme = Theme.createFromRawTheme(theme);
			this._textmateThemeCache.set(theme, textmateTheme);
		}
		this._syncRegistry.setTheme(textmateTheme);
	}
	getGrammar(name) {
		name = resolveLangAlias(name, this._alias);
		return this._resolvedGrammars.get(name);
	}
	loadLanguage(lang) {
		if (this.getGrammar(lang.name)) return;
		const embeddedLazilyBy = new Set([...this._langMap.values()].filter((i) => i.embeddedLangsLazy?.includes(lang.name)));
		this._resolver.addLanguage(lang);
		const grammarConfig = {
			balancedBracketSelectors: lang.balancedBracketSelectors || ["*"],
			unbalancedBracketSelectors: lang.unbalancedBracketSelectors || []
		};
		this._syncRegistry._rawGrammars.set(lang.scopeName, lang);
		const g = this.loadGrammarWithConfiguration(lang.scopeName, 1, grammarConfig);
		g.name = lang.name;
		this._resolvedGrammars.set(lang.name, g);
		if (lang.aliases) lang.aliases.forEach((alias) => {
			this._alias[alias] = lang.name;
		});
		this._loadedLanguagesCache = null;
		if (embeddedLazilyBy.size) for (const e of embeddedLazilyBy) {
			this._resolvedGrammars.delete(e.name);
			this._loadedLanguagesCache = null;
			this._syncRegistry?._injectionGrammars?.delete(e.scopeName);
			this._syncRegistry?._grammars?.delete(e.scopeName);
			this.loadLanguage(this._langMap.get(e.name));
		}
	}
	dispose() {
		super.dispose();
		this._resolvedThemes.clear();
		this._resolvedGrammars.clear();
		this._langMap.clear();
		this._langGraph.clear();
		this._loadedThemesCache = null;
	}
	loadLanguages(langs) {
		for (const lang of langs) this.resolveEmbeddedLanguages(lang);
		const langsGraphArray = [...this._langGraph.entries()];
		const missingLangs = langsGraphArray.filter(([_, lang]) => !lang);
		if (missingLangs.length) {
			const dependents = langsGraphArray.filter(([_, lang]) => {
				if (!lang) return false;
				return (lang.embeddedLanguages || lang.embeddedLangs)?.some((l) => missingLangs.map(([name]) => name).includes(l));
			}).filter((lang) => !missingLangs.includes(lang));
			throw new ShikiError(`Missing languages ${missingLangs.map(([name]) => `\`${name}\``).join(", ")}, required by ${dependents.map(([name]) => `\`${name}\``).join(", ")}`);
		}
		for (const [_, lang] of langsGraphArray) this._resolver.addLanguage(lang);
		for (const [_, lang] of langsGraphArray) this.loadLanguage(lang);
	}
	getLoadedLanguages() {
		if (!this._loadedLanguagesCache) this._loadedLanguagesCache = [.../* @__PURE__ */ new Set([...this._resolvedGrammars.keys(), ...Object.keys(this._alias)])];
		return this._loadedLanguagesCache;
	}
	resolveEmbeddedLanguages(lang) {
		this._langMap.set(lang.name, lang);
		this._langGraph.set(lang.name, lang);
		const embedded = lang.embeddedLanguages ?? lang.embeddedLangs;
		if (embedded) for (const embeddedLang of embedded) this._langGraph.set(embeddedLang, this._langMap.get(embeddedLang));
	}
};
var Resolver = class {
	_langs = /* @__PURE__ */ new Map();
	_scopeToLang = /* @__PURE__ */ new Map();
	_injections = /* @__PURE__ */ new Map();
	_onigLib;
	constructor(engine, langs) {
		this._onigLib = {
			createOnigScanner: (patterns) => engine.createScanner(patterns),
			createOnigString: (s) => engine.createString(s)
		};
		langs.forEach((i) => this.addLanguage(i));
	}
	get onigLib() {
		return this._onigLib;
	}
	getLangRegistration(langIdOrAlias) {
		return this._langs.get(langIdOrAlias);
	}
	loadGrammar(scopeName) {
		return this._scopeToLang.get(scopeName);
	}
	addLanguage(l) {
		this._langs.set(l.name, l);
		if (l.aliases) l.aliases.forEach((a) => {
			this._langs.set(a, l);
		});
		this._scopeToLang.set(l.scopeName, l);
		if (l.injectTo) l.injectTo.forEach((i) => {
			if (!this._injections.get(i)) this._injections.set(i, []);
			this._injections.get(i).push(l.scopeName);
		});
	}
	getInjections(scopeName) {
		const scopeParts = scopeName.split(".");
		let injections = [];
		for (let i = 1; i <= scopeParts.length; i++) {
			const subScopeName = scopeParts.slice(0, i).join(".");
			injections = [...injections, ...this._injections.get(subScopeName) || []];
		}
		return injections;
	}
};
var instancesCount = 0;
/**
* Get the minimal shiki primitive instance.
*
* Requires to provide the engine and all themes and languages upfront.
*/
function createShikiPrimitive(options) {
	instancesCount += 1;
	if (options.warnings !== false && instancesCount >= 10 && instancesCount % 10 === 0) console.warn(`[Shiki] ${instancesCount} instances have been created. Shiki is supposed to be used as a singleton, consider refactoring your code to cache your highlighter instance; Or call \`highlighter.dispose()\` to release unused instances.`);
	let isDisposed = false;
	if (!options.engine) throw new ShikiError("`engine` option is required for synchronous mode");
	const langs = (options.langs || []).flat(1);
	const themes = (options.themes || []).flat(1).map(normalizeTheme);
	const _registry = new Registry(new Resolver(options.engine, langs), themes, langs, options.langAlias);
	let _lastTheme;
	function resolveLangAlias$1(name) {
		return resolveLangAlias(name, options.langAlias);
	}
	function getLanguage(name) {
		ensureNotDisposed();
		const _lang = _registry.getGrammar(typeof name === "string" ? name : name.name);
		if (!_lang) throw new ShikiError(`Language \`${name}\` not found, you may need to load it first`);
		return _lang;
	}
	function getTheme(name) {
		if (name === "none") return {
			bg: "",
			fg: "",
			name: "none",
			settings: [],
			type: "dark"
		};
		ensureNotDisposed();
		const _theme = _registry.getTheme(name);
		if (!_theme) throw new ShikiError(`Theme \`${name}\` not found, you may need to load it first`);
		return _theme;
	}
	function setTheme(name) {
		ensureNotDisposed();
		const theme = getTheme(name);
		if (_lastTheme !== name) {
			_registry.setTheme(theme);
			_lastTheme = name;
		}
		return {
			theme,
			colorMap: _registry.getColorMap()
		};
	}
	function getLoadedThemes() {
		ensureNotDisposed();
		return _registry.getLoadedThemes();
	}
	function getLoadedLanguages() {
		ensureNotDisposed();
		return _registry.getLoadedLanguages();
	}
	function loadLanguageSync(...langs) {
		ensureNotDisposed();
		_registry.loadLanguages(langs.flat(1));
	}
	async function loadLanguage(...langs) {
		return loadLanguageSync(await resolveLangs(langs));
	}
	function loadThemeSync(...themes) {
		ensureNotDisposed();
		for (const theme of themes.flat(1)) _registry.loadTheme(theme);
	}
	async function loadTheme(...themes) {
		ensureNotDisposed();
		return loadThemeSync(await resolveThemes(themes));
	}
	function ensureNotDisposed() {
		if (isDisposed) throw new ShikiError("Shiki instance has been disposed");
	}
	function dispose() {
		if (isDisposed) return;
		isDisposed = true;
		_registry.dispose();
		instancesCount -= 1;
	}
	return {
		setTheme,
		getTheme,
		getLanguage,
		getLoadedThemes,
		getLoadedLanguages,
		resolveLangAlias: resolveLangAlias$1,
		loadLanguage,
		loadLanguageSync,
		loadTheme,
		loadThemeSync,
		dispose,
		[Symbol.dispose]: dispose
	};
}
/**
* Get the minimal shiki primitive instance.
*/
async function createShikiPrimitiveAsync(options) {
	if (!options.engine) console.warn("`engine` option is required. Use `createOnigurumaEngine` or `createJavaScriptRegexEngine` to create an engine.");
	const [themes, langs, engine] = await Promise.all([
		resolveThemes(options.themes || []),
		resolveLangs(options.langs || []),
		options.engine
	]);
	return createShikiPrimitive({
		...options,
		themes,
		langs,
		engine
	});
}
var _grammarStateMap = /* @__PURE__ */ new WeakMap();
function setLastGrammarStateToMap(keys, state) {
	_grammarStateMap.set(keys, state);
}
function getLastGrammarStateFromMap(keys) {
	return _grammarStateMap.get(keys);
}
/**
* GrammarState is a special reference object that holds the state of a grammar.
*
* It's used to highlight code snippets that are part of the target language.
*/
var GrammarState = class GrammarState {
	/**
	* Theme to Stack mapping
	*/
	_stacks = {};
	lang;
	get themes() {
		return Object.keys(this._stacks);
	}
	get theme() {
		return this.themes[0];
	}
	get _stack() {
		return this._stacks[this.theme];
	}
	/**
	* Static method to create a initial grammar state.
	*/
	static initial(lang, themes) {
		return new GrammarState(Object.fromEntries(toArray(themes).map((theme) => [theme, INITIAL])), lang);
	}
	constructor(...args) {
		if (args.length === 2) {
			const [stacksMap, lang] = args;
			this.lang = lang;
			this._stacks = stacksMap;
		} else {
			const [stack, lang, theme] = args;
			this.lang = lang;
			this._stacks = { [theme]: stack };
		}
	}
	/**
	* Get the internal stack object.
	* @internal
	*/
	getInternalStack(theme = this.theme) {
		return this._stacks[theme];
	}
	getScopes(theme = this.theme) {
		return getScopes(this._stacks[theme]);
	}
	toJSON() {
		return {
			lang: this.lang,
			theme: this.theme,
			themes: this.themes,
			scopes: this.getScopes()
		};
	}
};
function getScopes(stack) {
	const scopes = [];
	const visited = /* @__PURE__ */ new Set();
	function pushScope(stack) {
		if (visited.has(stack)) return;
		visited.add(stack);
		const name = stack?.nameScopesList?.scopeName;
		if (name) scopes.push(name);
		if (stack.parent) pushScope(stack.parent);
	}
	pushScope(stack);
	return scopes;
}
function getGrammarStack(state, theme) {
	if (!(state instanceof GrammarState)) throw new ShikiError("Invalid grammar state");
	return state.getInternalStack(theme);
}
var RE_COMMA = /,/;
var RE_SPACE = / /;
/**
* Code to tokens, with a simple theme.
*/
function codeToTokensBase(primitive, code, options = {}) {
	const { theme: themeName = primitive.getLoadedThemes()[0] } = options;
	if (isPlainLang(primitive.resolveLangAlias(options.lang || "text")) || isNoneTheme(themeName)) return splitLines(code).map((line) => [{
		content: line[0],
		offset: line[1]
	}]);
	const { theme, colorMap } = primitive.setTheme(themeName);
	const _grammar = primitive.getLanguage(options.lang || "text");
	if (options.grammarState) {
		if (options.grammarState.lang !== _grammar.name) throw new ShikiError(`Grammar state language "${options.grammarState.lang}" does not match highlight language "${_grammar.name}"`);
		if (!options.grammarState.themes.includes(theme.name)) throw new ShikiError(`Grammar state themes "${options.grammarState.themes}" do not contain highlight theme "${theme.name}"`);
	}
	return tokenizeWithTheme(code, _grammar, theme, colorMap, options);
}
function getLastGrammarState(...args) {
	if (args.length === 2) return getLastGrammarStateFromMap(args[1]);
	const [primitive, code, options = {}] = args;
	const { lang = "text", theme: themeName = primitive.getLoadedThemes()[0] } = options;
	if (isPlainLang(lang) || isNoneTheme(themeName)) throw new ShikiError("Plain language does not have grammar state");
	if (lang === "ansi") throw new ShikiError("ANSI language does not have grammar state");
	const { theme, colorMap } = primitive.setTheme(themeName);
	const _grammar = primitive.getLanguage(lang);
	return new GrammarState(_tokenizeWithTheme(code, _grammar, theme, colorMap, options).stateStack, _grammar.name, theme.name);
}
function tokenizeWithTheme(code, grammar, theme, colorMap, options) {
	const result = _tokenizeWithTheme(code, grammar, theme, colorMap, options);
	const grammarState = new GrammarState(result.stateStack, grammar.name, theme.name);
	setLastGrammarStateToMap(result.tokens, grammarState);
	return result.tokens;
}
function _tokenizeWithTheme(code, grammar, theme, colorMap, options) {
	const colorReplacements = resolveColorReplacements(theme, options);
	const { tokenizeMaxLineLength = 0, tokenizeTimeLimit = 500, includeExplanation = false } = options;
	const lines = splitLines(code);
	let stateStack = options.grammarState ? getGrammarStack(options.grammarState, theme.name) ?? INITIAL : options.grammarContextCode != null ? _tokenizeWithTheme(options.grammarContextCode, grammar, theme, colorMap, {
		...options,
		grammarState: void 0,
		grammarContextCode: void 0
	}).stateStack : INITIAL;
	let actual = [];
	const final = [];
	for (let i = 0, len = lines.length; i < len; i++) {
		const [line, lineOffset] = lines[i];
		if (line === "") {
			actual = [];
			final.push([]);
			continue;
		}
		if (tokenizeMaxLineLength > 0 && line.length >= tokenizeMaxLineLength) {
			actual = [];
			final.push([{
				content: line,
				offset: lineOffset,
				color: "",
				fontStyle: 0
			}]);
			continue;
		}
		let resultWithScopes;
		let tokensWithScopes;
		let tokensWithScopesIndex;
		if (includeExplanation && includeExplanation !== "tokenType") {
			resultWithScopes = grammar.tokenizeLine(line, stateStack, tokenizeTimeLimit);
			tokensWithScopes = resultWithScopes.tokens;
			tokensWithScopesIndex = 0;
		}
		const result = grammar.tokenizeLine2(line, stateStack, tokenizeTimeLimit);
		const tokensLength = result.tokens.length / 2;
		for (let j = 0; j < tokensLength; j++) {
			const startIndex = result.tokens[2 * j];
			const nextStartIndex = j + 1 < tokensLength ? result.tokens[2 * j + 2] : line.length;
			if (startIndex === nextStartIndex) continue;
			const metadata = result.tokens[2 * j + 1];
			const color = applyColorReplacements(colorMap[EncodedTokenMetadata.getForeground(metadata)], colorReplacements);
			const fontStyle = EncodedTokenMetadata.getFontStyle(metadata);
			const token = {
				content: line.substring(startIndex, nextStartIndex),
				offset: lineOffset + startIndex,
				color,
				fontStyle
			};
			if (includeExplanation === "tokenType") token.type = EncodedTokenMetadata.getTokenType(metadata);
			else if (includeExplanation) {
				const themeSettingsSelectors = [];
				if (includeExplanation !== "scopeName") for (const setting of theme.settings) {
					let selectors;
					switch (typeof setting.scope) {
						case "string":
							selectors = setting.scope.split(RE_COMMA).map((scope) => scope.trim());
							break;
						case "object":
							selectors = setting.scope;
							break;
						default: continue;
					}
					themeSettingsSelectors.push({
						settings: setting,
						selectors: selectors.map((selector) => selector.split(RE_SPACE))
					});
				}
				token.explanation = [];
				let offset = 0;
				while (startIndex + offset < nextStartIndex) {
					const tokenWithScopes = tokensWithScopes[tokensWithScopesIndex];
					const tokenWithScopesText = line.substring(tokenWithScopes.startIndex, tokenWithScopes.endIndex);
					offset += tokenWithScopesText.length;
					token.explanation.push({
						content: tokenWithScopesText,
						scopes: includeExplanation === "scopeName" ? explainThemeScopesNameOnly(tokenWithScopes.scopes) : explainThemeScopesFull(themeSettingsSelectors, tokenWithScopes.scopes)
					});
					tokensWithScopesIndex += 1;
				}
			}
			actual.push(token);
		}
		final.push(actual);
		actual = [];
		stateStack = result.ruleStack;
	}
	return {
		tokens: final,
		stateStack
	};
}
function explainThemeScopesNameOnly(scopes) {
	return scopes.map((scope) => ({ scopeName: scope }));
}
function explainThemeScopesFull(themeSelectors, scopes) {
	const result = [];
	for (let i = 0, len = scopes.length; i < len; i++) {
		const scope = scopes[i];
		result[i] = {
			scopeName: scope,
			themeMatches: explainThemeScope(themeSelectors, scope, scopes.slice(0, i))
		};
	}
	return result;
}
function matchesOne(selector, scope) {
	return selector === scope || scope.substring(0, selector.length) === selector && scope[selector.length] === ".";
}
function matches(selectors, scope, parentScopes) {
	if (!matchesOne(selectors.at(-1), scope)) return false;
	let selectorParentIndex = selectors.length - 2;
	let parentIndex = parentScopes.length - 1;
	while (selectorParentIndex >= 0 && parentIndex >= 0) {
		if (matchesOne(selectors[selectorParentIndex], parentScopes[parentIndex])) selectorParentIndex -= 1;
		parentIndex -= 1;
	}
	if (selectorParentIndex === -1) return true;
	return false;
}
function explainThemeScope(themeSettingsSelectors, scope, parentScopes) {
	const result = [];
	for (const { selectors, settings } of themeSettingsSelectors) for (const selectorPieces of selectors) if (matches(selectorPieces, scope, parentScopes)) {
		result.push(settings);
		break;
	}
	return result;
}
/**
* Get tokens with multiple themes
*/
function codeToTokensWithThemes(primitive, code, options, codeToTokensBaseFn = codeToTokensBase) {
	const themes = Object.entries(options.themes).filter((i) => i[1]).map((i) => ({
		color: i[0],
		theme: i[1]
	}));
	const themedTokens = themes.map((t) => {
		const tokens = codeToTokensBaseFn(primitive, code, {
			...options,
			theme: t.theme
		});
		return {
			tokens,
			state: getLastGrammarStateFromMap(tokens),
			theme: typeof t.theme === "string" ? t.theme : t.theme.name
		};
	});
	const tokens = alignThemesTokenization(...themedTokens.map((i) => i.tokens));
	const mergedTokens = tokens[0].map((line, lineIdx) => line.map((_token, tokenIdx) => {
		const mergedToken = {
			content: _token.content,
			variants: {},
			offset: _token.offset
		};
		if ("includeExplanation" in options && options.includeExplanation) mergedToken.explanation = _token.explanation;
		tokens.forEach((t, themeIdx) => {
			const { content: _, explanation: __, offset: ___, ...styles } = t[lineIdx][tokenIdx];
			mergedToken.variants[themes[themeIdx].color] = styles;
		});
		return mergedToken;
	}));
	const mergedGrammarState = themedTokens[0].state ? new GrammarState(Object.fromEntries(themedTokens.map((s) => [s.theme, s.state?.getInternalStack(s.theme)])), themedTokens[0].state.lang) : void 0;
	if (mergedGrammarState) setLastGrammarStateToMap(mergedTokens, mergedGrammarState);
	return mergedTokens;
}
/**
* Break tokens from multiple themes into same tokenization.
*
* For example, given two themes that tokenize `console.log("hello")` as:
*
* - `console . log (" hello ")` (6 tokens)
* - `console .log ( "hello" )` (5 tokens)
*
* This function will return:
*
* - `console . log ( " hello " )` (8 tokens)
* - `console . log ( " hello " )` (8 tokens)
*/
function alignThemesTokenization(...themes) {
	const outThemes = themes.map(() => []);
	const count = themes.length;
	for (let i = 0; i < themes[0].length; i++) {
		const lines = themes.map((t) => t[i]);
		const outLines = outThemes.map(() => []);
		outThemes.forEach((t, i) => t.push(outLines[i]));
		const indexes = lines.map(() => 0);
		const current = lines.map((l) => l[0]);
		while (current.every((t) => t)) {
			const minLength = Math.min(...current.map((t) => t.content.length));
			for (let n = 0; n < count; n++) {
				const token = current[n];
				if (token.content.length === minLength) {
					outLines[n].push(token);
					indexes[n] += 1;
					current[n] = lines[n][indexes[n]];
				} else {
					outLines[n].push({
						...token,
						content: token.content.slice(0, minLength)
					});
					current[n] = {
						...token,
						content: token.content.slice(minLength),
						offset: token.offset + minLength
					};
				}
			}
		}
	}
	return outThemes;
}
//#endregion
export { toArray as _, createShikiPrimitiveAsync as a, ShikiError as b, isNoneTheme as c, isSpecialTheme as d, normalizeGetter as f, splitLines as g, setLastGrammarStateToMap as h, createShikiPrimitive as i, isPlainLang as l, resolveColorReplacements as m, codeToTokensBase as n, getLastGrammarState as o, normalizeTheme as p, codeToTokensWithThemes as r, getLastGrammarStateFromMap as s, applyColorReplacements as t, isSpecialLang as u, tokenizeWithTheme as v, FontStyle as y };
