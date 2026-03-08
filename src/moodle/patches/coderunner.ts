import type { AceGapfillerUi, GapCtor, Gap } from 'qtype_coderunner/ui_ace_gapfiller';

import { Hook } from "./hook";
import { patch, tailHookClean } from './patch';
import { EXT_URL } from '../constants';
import { LazyPromise } from '../../util';

import type { Ace, edit } from 'ace-code';
import { AceLanguageClient } from 'ace-linters/build/ace-language-client';

export const gapfillerPatch: Hook<'qtype_coderunner/ui_ace_gapfiller'> = (ready) => {
	return tailHookClean(ready, ({}, _, Gap: GapCtor) => {
		const _insert = Gap.prototype.insertChar;
		Gap.prototype.insertChar = function (gaps, pos, char) {
			if (char.length !== 1) return this.insertText(gaps, pos.column, char);
			return _insert.call(this, gaps, pos, char);
		};
	}, ['Gap'],
	{
		hookHandler: (listen: (ev: string, fn: Ace.execEventHandler) => void, ev: string, fn: Ace.execEventHandler) => {
			return listen(ev, aceExecHandlerPatch(fn));
		},
		constructAceEditor,
	}, undefined,
	src => src.replace(/([$a-zA-Z_.\s]*?\.commands\.on)\((['"]exec['"])/, "hookHandler($1,$2")
		.replace(/((?:window\.)?ace\.edit)\(/g, "constructAceEditor($1,"));
}

export const acePatch: Hook<'qtype_coderunner/ui_ace'> = (ready) => {
	return patch(
		ready,
		src => src.replace(/((?:window\.)?ace\.edit)\(/g, "constructAceEditor($1,"),
		{ constructAceEditor }
	) as typeof ready;
}

// async function readZipFile(base: string, url: string) {
// 	try {
// 		const response = await fetch(url);
// 		const data = await response.arrayBuffer();
// 		const results: Record<string, string> = {};
// 		const zip = await JSZip.loadAsync(data);
// 		for (const [filename, file] of Object.entries(zip.files)) {
// 			if (file.dir) continue;
// 			results[`${base}/${filename}`] = await file.async("text");
// 		}
// 		return results;
// 	} catch (error) {
// 		console.error(error);
// 		return {};
// 	}
// }

type LanguageProvider = ReturnType<typeof AceLanguageClient.for>;

const languageServers: Record<string, LazyPromise<LanguageProvider>> = {
	"ace/mode/python": LazyPromise.wrap(async () => {
		const data = await (await fetch(`${EXT_URL}/lib/pyright/pyright.worker.js`)).blob();
		const blobUrl = URL.createObjectURL(data);
		const worker = new Worker(blobUrl, {
			type: 'module',
			name: "Pyright Language Server",
		});
		// worker.postMessage({
		// 	type: 'browser/boot',
		// 	mode: 'foreground'
		// });
		const languageProvider = AceLanguageClient.for({
			id: "python",
			module: () => import("ace-linters/build/language-client"),
			modes: "python",
			type: "webworker",
			worker: worker,
			initializationOptions: {
				rootPath: '/',
				files: {},
				// files: await readZipFile('/__typeshed__', `${EXT_URL}/learn/python-typeshed.zip`),
			},
			options: {
				python: {
					analysis: {
						// typeshedPaths: ['/__typeshed__'],
						// include: ['/**/*'],
						// exclude: ['/**/__pycache__', '/**/.*', '/__typeshed__', '/tmp'],
					},
				},
			},
			features: {
				// codeAction: true,
				// completion: true,
				// completionResolve: true,
				// diagnostics: true,
				// documentHighlight: true,
				// executeCommand: true,
				// format: true,
				// hover: true,
				// semanticTokens: true,
				// signatureHelp: true,
			},
		});
		// (languageProvider as unknown as { $messageController: MessageController; })
		// 	.$messageController.init({}, {}, '');
		return languageProvider;
	}),
};

function onSetLanguage(mode: string | Ace.SyntaxMode, editor: Ace.Editor) {
	if (typeof mode !== 'string') return;
	if (editor.getReadOnly()) return;

	if(!(mode in languageServers)) {
		console.error("Could not find language server for", mode);
		return;
	}

	languageServers[mode].then(ls => {
		ls.registerEditor(editor);
		editor.setOption('enableLiveAutocompletion', true);
	});
}

const aceShadowStyles = LazyPromise.wrap(async () => {
	const stylesheet = new CSSStyleSheet();
	return await stylesheet.replace(await (await fetch(`${EXT_URL}/config/ace-shadow-root.build.css`)).text());
});

const constructAceEditor: (callee: typeof edit, ...args: Parameters<typeof edit>) => ReturnType<typeof edit>
	= (edit, el, options) => {
	try {
		const element = typeof el === 'string' ? document.getElementById(el) : el;
		if (!element) throw new Error("Expected an element");
		element.classList.add('__moomo-code-editor-container');
		const root = element.attachShadow({
			mode: "open",
		});
		aceShadowStyles.then(css => {
			root.adoptedStyleSheets = [css];
			editor.resize();
		});
		// const style = document.createElement('link');
		// style.rel = "stylesheet";
		// style.href = `${EXT_URL}/config/ace-shadow-root.build.css`;
		// style.id = '__moomo-ace-code-shadow';
		// style.addEventListener("load", () =>
		// 	setTimeout(() => editor.resize(), 0));
		const container = document.createElement("div");
		root.append(container);
		const editor = edit(container, {
			copyWithEmptySelection: true,
			scrollPastEnd: 0.5,
			enableBasicAutocompletion: false,
			...(options ?? {}),
		} satisfies Parameters<typeof edit>[1]);
		editor.renderer.attachToShadowRoot();
		if (!editor) throw new Error("Could not make ACE editor");
		if (options?.mode) onSetLanguage(options.mode, editor);
		const _setMode = editor.session.setMode;
		editor.session.setMode = function (mode, cb) {
			onSetLanguage(mode, editor);
			_setMode.call(this, mode, cb);
		};
		const _setReadOnly = editor.setReadOnly;
		editor.setReadOnly = function (readOnly) {
			onSetLanguage(editor.session.getMode(), editor);
			_setReadOnly.call(this, readOnly);
		};
		return editor;
	} catch (e) {
		console.error(e);
		throw e;
	}
}

const aceExecHandlerPatch = (cb: Ace.execEventHandler): Ace.execEventHandler => (e, emit) => {
	// Patch exec handler
	// biome-ignore lint/security/noGlobalEval: bypassing name "mangling"
	const that: AceGapfillerUi = eval('t');
	const cursor = e.editor.selection.getCursor();
	const range = e.editor.getSelectionRange();
	const gap = that.findCursorGap(cursor);
	// Revert these to default behavior
	if (gap?.range.containsRange(range) && (e.command.name === 'startAutocomplete'
		|| e.command.name === 'Down'
		|| e.command.name === 'Up'
		|| e.command.name === 'Tab'
		|| e.command.name === 'Return'
		|| e.command.name === 'Esc'
	)) return;
	const manager = e.editor.session.getUndoManager();
	if ((e.command.name === 'undo' && manager.canUndo()) || (e.command.name === 'redo' && manager.canRedo())) {
		const isFake = (gap: Gap, delta: Ace.Delta) => delta.lines.length === 1 && delta.lines[0] === ' ' && gap.range.start.column + gap.minWidth === delta.end.column;
		if (e.command.name === 'redo') e.editor.redo();
		const revision = manager.getRevision();
		const deltas = manager.getDeltas(revision - 1).flat(1);
		const sel = e.command.name === 'undo' ? deltas.at(-1) : deltas[0];
		const delGap = sel && that.findCursorGap(sel.start);
		if(!delGap) throw new Error("Undo delta not in gap???");
		const delta = (e.command.name === 'undo' ? -1 : 1) * deltas.reduce((d, delta) => d
			+ (isFake(delGap, delta) ? 0
				: (delta.action === 'insert' ? 1 : -1) * (delta.end.column - delta.start.column)), 0);
		if (e.command.name === 'undo') e.editor.undo();
		const oldSize = delGap.textSize;
		delGap.textSize += delta;
		if (Math.max(oldSize, delGap.minWidth) !== Math.max(delGap.textSize, delGap.minWidth))
			delGap.changeWidth(that.gaps, Math.max(delGap.textSize, delGap.minWidth) - Math.max(oldSize, delGap.minWidth));
		const cursor = e.editor.getCursorPosition();
		if (cursor.row === delGap.range.start.row && cursor.column > delGap.range.start.column + delGap.textSize)
			e.editor.selection.moveCursorTo(cursor.row, delGap.range.start.column + delGap.textSize);
		(e as Partial<Event>).preventDefault?.();
		(e as Partial<Event>).stopPropagation?.();
		return;
	}
	if (gap && (e.command.name === 'gotoright' || e.command.name === 'gowordright') && cursor.column >= gap.range.start.column + gap.textSize) {
		if (gap.range.end.column + 1 > e.editor.session.getLine(cursor.row).length) {
			e.editor.selection.moveTo(cursor.row + 1, 0);
			(e as Partial<Event>).preventDefault?.();
			(e as Partial<Event>).stopPropagation?.();
			return;
		}
	}
	if (e.command.name?.startsWith('select')
		&& e.command.name !== 'selectall') {
		const target: Ace.Point | null = e.command.name === 'selectleft' ? { row: cursor.row, column: cursor.column - 1 }
			: e.command.name === 'selectright' ? { row: cursor.row, column: cursor.column + 1 }
				: e.command.name === 'selectup' ? { row: cursor.row - 1, column: cursor.column }
					: e.command.name === 'selectdown' ? { row: cursor.row + 1, column: cursor.column } : null;
		if (gap && target && target.column > gap.range.start.column + gap.textSize)
			target.column = gap.range.end.column + 1;
		// Handle crossing over gap
		if (gap && target && !gap.range.containsRange(range)) {
			if (target.column > e.editor.session.getLine(cursor.row).length) {
				e.editor.selection.selectTo(target.row + 1, 0);
			} else {
				e.editor.selection.selectToPosition(target);
			}
			(e as Partial<Event>).preventDefault?.();
			(e as Partial<Event>).stopPropagation?.();
			return;
		}
		// Revert to default behavior if selection should be allowed
		if (!gap || !gap.range.containsRange(range))
			return;
		// allow within-gap selection
		if (target && gap.range.containsRange(range) && gap.range.contains(target.row, target.column))
			return;
		if (e.command.name === 'selectwordleft') {
			// Select word, constrain to gap
			e.editor.selection.selectWordLeft();
			const c2 = e.editor.selection.getCursor();
			if (!gap.range.contains(c2.row, c2.column)) e.editor.selection.selectToPosition(gap.range.start);
		}
		if (e.command.name === 'selectwordright') {
			// Select word, constrain to gap
			e.editor.selection.selectWordRight();
			const c2 = e.editor.selection.getCursor();
			if (!gap.range.contains(c2.row, c2.column)) e.editor.selection.selectToPosition(gap.range.end);
		}
	}
	const operation = e.editor.curOp && (e.editor.curOp as { command?: { name?: string; }; }).command;
	if (gap?.range.containsRange(range)
		&& (operation?.name === 'insertMatch'
			|| operation?.name === 'Tab'
			|| operation?.name === 'Return')) {
		// Ensure gap stays up-to-date
		const start = (e.editor.curOp as { selectionBefore: Ace.Range; }).selectionBefore.start;
		gap.textSize -= start.column - cursor.column;
		const shrink = Math.min(start.column - cursor.column, gap.minWidth - gap.textSize);
		if (shrink > 0) e.editor.session.insert({
			row: gap.range.end.row,
			column: gap.range.end.column - shrink,
		}, new Array(shrink).fill(' ').join(''));
	}
	if (gap?.range.containsRange(range) && (e.command.name === 'removewordleft' || e.command.name === 'removewordright')) {
		// Select word
		if (e.editor.selection.isEmpty()) {
			if (e.command.name === 'removewordleft') e.editor.selection.selectWordLeft();
			else e.editor.selection.selectWordRight();
			const c2 = e.editor.selection.getCursor();
			if (!gap.range.contains(c2.row, c2.column)) e.editor.selection.selectToPosition(gap.range.start);
		}
		// Trigger remove
		if (!e.editor.selection.isEmpty()) {
			cb({
				editor: e.editor,
				command: {
					name: "del",
				},
				args: [],
				preventDefault() { },
				stopPropagation() { },
			} as Parameters<typeof cb>[0], emit);
		}
	}
	// Default behaviour
	cb(e, emit);
};
