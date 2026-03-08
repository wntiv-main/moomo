import type { Editor, Range } from 'ace-code';
import type ModeList, { Mode } from 'ace-code/src/ext/modelist';

module 'qtype_coderunner/ui_ace_gapfiller' {
	type UiParams = object & {
		lang: string,
		theme: string,
		ui_source: 'globalextra' | 'test0',
	};

	declare class _AceGapfillerUi {
		textArea: JQuery<HTMLTextAreaElement>;
		uiParams: UiParams;
		gaps: Gap[];
		source: 'globalextra' | 'test0';
		modelist: ModeList;
		
		enabled: boolean;
		contents_changed: boolean;
		capturingTab: boolean;
		clickInProgress: boolean;

		editNode: JQuery<HTMLDivElement>;

		editor: Editor;

		gapToSelect: null | Gap;

		fail: boolean;

		constructor(textareaId: string, w: number, h: number, uiParams: UiParams);

		createGaps(code: string): void;

		findCursorGap(cursor: Pos): Gap | null;

		failed(): boolean;
		failMessage(): string;

		sync(): void;
		syncIntervalSecs(): number;

		reload(): void;

		setLanguage(language: string): void;

		getElement(): JQuery<HTMLDivElement>;

		captureTab(): void;
		releaseTab(): void;

		setEventHandlers(): void;

		destroy(): void;

		hasFocus(): boolean;

		findMode(language: string): Mode;

		resize(w: number, h: number): void;

		allowFullscreen(): boolean;
	}

	type Pos = { row: number, column: number };

	declare class _Gap {
		editor: Editor;

		minWidth: number;
		maxWidth: number;

		range: Range;
		textSize: number;

		constructor(
			editor: Editor,
			row: number,
			column: number,
			minWidth: number,
			maxWidth?: number,
		);

		cursorInGap(cursor: Pos): boolean;
		
		getWidth(): number;
		changeWidth(gaps: Gap[], delta: number): void;

		insertChar(gaps: Gap[], pos: Pos, char: string): void;
		deleteChar(gaps: Gap[], pos: Pos): void;
		deleteRange(gaps: Gap[], start: number, end: number): void;
		insertText(gaps: Gap[], start: number, text: string): void;

		getText(): string;
	}

	declare const __Gap: _Gap;
	export type Gap = typeof __Gap;
	export type GapCtor = typeof _Gap;
	declare const __AceGapfillerUi: _AceGapfillerUi;
	export type AceGapfillerUi = typeof __AceGapfillerUi;
	export type AceGapfillerUiCtor = typeof _AceGapfillerUi;

	export const Constructor: typeof _AceGapfillerUi;
}
