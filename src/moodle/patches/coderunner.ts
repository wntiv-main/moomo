import type { AceGapfillerUi, GapCtor, Gap } from 'qtype_coderunner/ui_ace_gapfiller';

import type { Hook } from "./hook";
import { tailHookClean } from './patch';
import { EXT_URL } from '../constants';
import { fnAsConstructor, LazyPromise } from '../../util';

import type { Ace, edit } from 'ace-code';
import { AceLanguageClient } from 'ace-linters/build/ace-language-client';
import { loadAsync } from 'jszip';

import CSS from '../../lib/ace-themes/vs-dark';
import { runScript as runPython } from '../pyodide-loader';

export const gapfillerPatch: Hook<'qtype_coderunner/ui_ace_gapfiller'> = (ready) => {
	return tailHookClean(ready, ({}, _, Gap: GapCtor) => {
		const _insert = Gap.prototype.insertChar;
		Gap.prototype.insertChar = function (gaps, pos, char) {
			if (char.length !== 1) return this.insertText(gaps, pos.column, char);
			return _insert.call(this, gaps, pos, char);
		};
	}, ['Gap'],
	{
		hookHandler: (that: AceGapfillerUi, commands: { on(ev: string, fn: Ace.execEventHandler): void }, ev: string, fn: Ace.execEventHandler) => {
			return commands.on(ev, aceExecHandlerPatch(fn, that));
		},
		constructAceEditor,
	}, undefined,
	src => src.replace(/([$a-zA-Z_.\s]*?\.commands)\.on\((['"]exec['"])/, "hookHandler(t,$1,$2")
		.replace(/((?:window\.)?ace\.edit)\(/g, "constructAceEditor($1,")
		.replaceAll(/(?:\w+\s*\.\s*)*editor\s*\.\s*setTheme/g, '(()=>0)'));
}

declare module 'qtype_coderunner/ui_ace' {
	interface _AceWrapper {
		initTestFields(): void;
	}
}

export type CodeRunner = (script: string, options?: {
	stdin?: string,
}) => Promise<{ stdout: string, error?: string }>;

const runners: Record<string, CodeRunner> = {
	python: runPython,
	python3: runPython,
};

export const acePatch: Hook<'qtype_coderunner/ui_ace'> = (ready) => {
	return tailHookClean(
		ready,
		({ Constructor }) => {
			const AceWrapper = fnAsConstructor<typeof Constructor>(function(textareaId: string, w: number, h: number, params: object) {
				Constructor.call(this, textareaId, w, h, params);
				this.initTestFields();
			});
			AceWrapper.prototype = Constructor.prototype;
			AceWrapper.prototype.initTestFields = function() {
				const textarea = this.textarea.get(0)!;
				const lang = textarea.dataset.lang?.toLowerCase();
				const runner = lang && runners[lang];
				if (!runner) return;
				const qn = textarea.closest('.que.coderunner');
				if (!qn) return;
				let tables: Iterable<HTMLElement> & { length: number } = qn.querySelectorAll('.coderunnerexamples, .coderunner-test-results.table');
				if(!tables.length) {
					const table = document.createElement('table');
					table.classList.add('coderunnerexamples');
					const head = document.createElement('thead');
					const body = document.createElement('tbody');
					const hrow = document.createElement('tr');
					const brow = document.createElement('tr');
					head.append(hrow);
					body.append(brow);
					for(const col of ["Test", "Stdin", "Result"]) {
						const header = document.createElement('th');
						header.classList.add('header');
						header.innerText = col;
						hrow.append(header);
						const cell = document.createElement('td');
						const data = document.createElement('pre');
						data.contentEditable = 'true';
						data.classList.add('tablecell');
						cell.append(data);
						brow.append(cell);
					}
					table.append(head, body);
					textarea.after(table);
					tables = [table];
				}
				for (const table of tables) {
					const headRow = table.querySelector('thead tr');
					if(!headRow) continue;
					const header = document.createElement('th');
					header.classList.add('header');
					header.innerText = 'Run';
					headRow.prepend(header);
					const cols = {
						runBtn: 0,
						testCode: ([] as HTMLElement[]).findIndex.call(headRow.children,
							el => /test/i.test(el.textContent)),
						expectedOutput: ([] as HTMLElement[]).findIndex.call(headRow.children,
							el => /result|expected/i.test(el.textContent)),
						currentOutput: ([] as HTMLElement[]).findIndex.call(headRow.children,
							el => /got/i.test(el.textContent)),
						stdin: ([] as HTMLElement[]).findIndex.call(headRow.children,
							el => /input/i.test(el.textContent)),
						// TODO: read provided stdin / files
					};
					if (cols.testCode < 0 && cols.stdin < 0) {
						header.remove();
						continue;
					}
					if (cols.currentOutput < 0) {
						const header = document.createElement('th');
						header.classList.add('header');
						header.innerText = 'Output';
						headRow.append(header);
					}
					for (const row of table.querySelectorAll('tbody tr')) {
						const cell = document.createElement('td');
						row.prepend(cell);
						const code = cols.testCode < 0 ? '' : row.children[cols.testCode].querySelector('pre')?.textContent ?? '';
						const stdin = cols.stdin < 0 ? undefined
							: row.children[cols.stdin].querySelector('pre')?.textContent;
						const expectedResult = cols.expectedOutput < 0 ? undefined
							: row.children[cols.expectedOutput].querySelector('pre')?.textContent.trim();
						const outCell = cols.currentOutput < 0 ? document.createElement('td')
							: row.children[cols.currentOutput];
						if (cols.currentOutput < 0) {
							row.append(outCell);
						}
						const btn = document.createElement('button');
						btn.classList.add('__moomo-code-run-button');
						btn.textContent = '>';
						btn.addEventListener('click', async e => {
							e.preventDefault();
							e.stopPropagation();
							const globalExtra = (textarea.dataset.globalextra ?? '')
								.replaceAll(/\{#[^]*?#\}/g, '');
							const script = `${globalExtra}\n\n${textarea.value}\n\n${code}`;
							const result = await runner(script, { stdin: stdin?.trimEnd() });
							const out = outCell.querySelector('pre') ?? (() => {
								const pre = document.createElement('pre');
								pre.classList.add('tablecell');
								outCell.append(pre);
								return pre;
							})();
							out.textContent = result.stdout.trimEnd();
							out.classList.add('__moomo-code-out');
							out.classList.remove(
								'__moomo-code-out-correct',
								'__moomo-code-out-error',
								'__moomo-code-out-incorrect');
							if (result.error) {
								const errSpan = document.createElement('div');
								errSpan.classList.add('__moomo-error-text');
								errSpan.textContent = result.error;
								out.classList.add('__moomo-code-out-error');
								out.append(errSpan);
							} else if (result.stdout.trim() == expectedResult) {
								out.classList.add('__moomo-code-out-correct');
							} else {
								out.classList.add('__moomo-code-out-incorrect');
							}
						});
						cell.append(btn);
					}
				}
			}
			return { Constructor: AceWrapper };
		},
		[],
		{ constructAceEditor },
		undefined,
		src => src.replace(/((?:window\.)?ace\.edit)\(/g, "constructAceEditor($1,")
			.replaceAll(/(?:\w+\s*\.\s*)*editor\s*\.\s*setTheme/g, '(()=>0)'),
	) as typeof ready;
}

async function readZipFile(base: string, url: string, fs: Record<string, string> | null = null) {
	try {
		const response = await fetch(url);
		const data = await response.arrayBuffer();
		const results: Record<string, string> = fs ?? {};
		const zip = await loadAsync(data);
		for (const [filename, file] of Object.entries(zip.files)) {
			if (file.dir) continue;
			results[`${base}/${filename}`] = await file.async("text");
		}
		return results;
	} catch (error) {
		console.error(error);
		return {};
	}
}

type LanguageProvider = ReturnType<typeof AceLanguageClient.for>;

const languageServers: Record<string, LazyPromise<LanguageProvider>> = {
	"ace/mode/python": LazyPromise.wrap(async () => {
		const data = await (await fetch(`${EXT_URL}/lib/pyright/pyright.worker.js`)).blob();
		const blobUrl = URL.createObjectURL(data);
		const worker = new Worker(blobUrl, {
			type: 'module',
			name: "Pyright Language Server",
		});
		const languageProvider = AceLanguageClient.for({
			id: "python",
			module: () => import("ace-linters/build/language-client"),
			modes: "python",
			type: "webworker",
			worker: worker,
			initializationOptions: {
				rootPath: '/',
				workspaceRootUri: '/',
				files: await readZipFile('/__typeshed__', `${EXT_URL}/lib/pyright/python-typeshed.zip`),
			},
			options: {
				python: {
					analysis: {
						typeshedPaths: ['/__typeshed__'],
						include: ['/**/*'],
						exclude: ['/**/__pycache__', '/**/.*', '/__typeshed__', '/tmp'],
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
			// TODO: pull vs themes from https://github.com/microsoft/vscode/blob/main/extensions/theme-defaults/themes/dark_vs.json?
		
		const container = document.createElement("div");
		root.append(container);
		const editor = edit(container, {
			copyWithEmptySelection: true,
			scrollPastEnd: 0.5,
			enableBasicAutocompletion: false,
			...(options ?? {}),
		} satisfies Parameters<typeof edit>[1]);
		editor.setTheme({
			cssClass: 'ace-vs-dark',
			cssText: CSS
				+ '.ace-vs-dark .ace_cursor { color: inherit; }'
				+ '.ace-vs-dark .ace_marker-layer .ace_selection { background-color: #4495FF50; }'
				+ '.ace-vs-dark .ace_support.ace_function { color: #4ec9b0; }'
				+ '.ace-vs-dark .ace_support.ace_function[class^="ace_function"] { color: #dcdcaa; }'
				+ '.ace-vs-dark .ace_keyword { color: #c586c0; }',
			isDark: true,
		});
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

const aceExecHandlerPatch = (cb: Ace.execEventHandler, that: AceGapfillerUi): Ace.execEventHandler => (e, emit) => {
	// Patch exec handler
	// biome-ignore lint/security/noGlobalEval: bypassing name "mangling"
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
