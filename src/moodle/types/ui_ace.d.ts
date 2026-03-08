import type { Editor } from "ace-code";
import type ModeList, { Mode } from "ace-code/src/ext/modelist";

module 'qtype_coderunner/ui_ace' {
	class _AceWrapper {
		modelist: ModeList;
		textareaId: string;
		
		enabled: boolean;
		contents_changed: boolean;
		capturingTab: boolean;
		clickInProgress: boolean;
		
		editNode: JQuery<HTMLDivElement>;
		editor: Editor;

		fail: boolean;

		constructor(
			textareaId: string,
			w: number,
			h: number,
			params: object,
		);

		set_ace_aria_label(editor_container: HTMLElement): void;

		extract_from_json_maybe(code: string): string | undefined;

		failed(): boolean;
		failMessage(): string;

		sync(): void;
		syncIntervalSecs(): number;

		setLanguage(language: string): void;

		getElement(): JQuery<HTMLElement>;

		captureTab(): void;
		releaseTab(): void;

		fixSlowLoad(): void;

		setEventHandlers(): void;

		destroy(): void;

		hasFocus(): boolean;

		findMode(language: string): Mode | undefined;

		resize(w: number, h: number): void;

		allowFullscreen(): boolean;
	}

	declare const __AceWrapper: _AceWrapper;
	export type AceWrapper = typeof __AceWrapper;
	export type AceWrapperCtor = typeof _AceWrapper;

	export const Constructor: typeof _AceWrapper;
}
