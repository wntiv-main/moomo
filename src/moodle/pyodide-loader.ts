import type { MPL } from "../pyodide/main-thread/matplotlib";
import { MockJSSocket } from "../pyodide/main-thread/mock-socket";
import type { M2WMessage, W2MMessage } from "../pyodide/protocol";
import { assertNever } from "../util";
import { EXT_URL } from "./constants";
import { CodeRunner } from "./patches/coderunner";

type _Omit<T, K extends string> = T extends { [key in K]: infer _ } ? Omit<T, K> : T;
type ScriptResult = _Omit<Extract<W2MMessage, { type: 'scriptResult' | 'scriptError' }>, 'id'>;

let workerScript: string | null = null;
let worker: Worker | null = null;
let scriptId = 0;
const scriptHandlers: Record<number, (result: ScriptResult) => void> = {};
const mplScriptHosts: Record<number, HTMLElement> = {};
let mpl: MPL;
const figSockets: Record<number, MockJSSocket> = {};
const toolbarImgs: Record<string, Promise<string>> = {};
const toolbarImgRes: Record<string, (url: string) => void> = {};
const stylesheet = new CSSStyleSheet();

export const runScript: CodeRunner = async (script, options) => {
	worker ??= await (async () => {
		workerScript ??= await (async () => {
			const data = await (await fetch(`${EXT_URL}/pyodide_worker.js`)).blob();
			return URL.createObjectURL(data);
		})();
		const worker = new Worker(workerScript, {
			name: "Pyodide Runner Worker",
		});
		worker.addEventListener('message', e => {
			const message = e.data as W2MMessage;
			switch (message.type) {
				case 'scriptResult':
					scriptHandlers[message.id]?.(message);
					delete scriptHandlers[message.id];
					break;
				case 'scriptError':
					scriptHandlers[message.id]?.(message);
					delete scriptHandlers[message.id];
					break;
				case 'matplotlibCommand':
					figSockets[message.id]?._receive_json(message.message);
					break;
				case 'matplotlibCommandBin':
					figSockets[message.id]?._receive_binary(message.message);
					break;
				case 'matplotlibInitScript':
					mpl = new Function('MockJsWebSocket', 'getToolbarImgUrl', message.script)
						(MockJSSocket, async (name: string) => {
							return await (toolbarImgs[name] ??= new Promise(res => {
								toolbarImgRes[name] = res;
								worker.postMessage({
									type: 'matplotlibRequestImage',
									name,
								} satisfies M2WMessage);
							}));
						});
					stylesheet.replace(message.css);
					break;
				case 'matplotlibInitFigure':
					const fignum = message.id;
					const WSType = mpl.get_websocket_type() as typeof MockJSSocket;
					const ws = new WSType(fignum);
					ws.messageTarget = worker;
					const _fig = new mpl.figure(fignum, ws, null, mplScriptHosts[message.scriptId]);
					ws.open();
					figSockets[fignum] = ws;
					break;
				case 'matplotlibImageResponse':
					const blob = new Blob([message.data], { type: 'image/png' });
					const url = (window.URL || window.webkitURL).createObjectURL(blob);
					toolbarImgRes[message.name](url);
					delete toolbarImgRes[message.name];
					break;
				default:
					assertNever(message);
			}
		});
		worker.postMessage({ type: 'pyodideInit', baseUrl: EXT_URL } satisfies M2WMessage);
		return worker;
	})();

	const id = ++scriptId;
	worker.postMessage({
		type: 'runScript',
		script,
		stdin: options?.stdin,
		id,
	} satisfies M2WMessage);
	if(options?.htmlOutput) {
		const host = options.htmlOutput;
		const root = host.attachShadow({
			mode: 'closed',
		});
		root.adoptedStyleSheets = [stylesheet];
		const container = document.createElement('div');
		root.append(container);
		mplScriptHosts[id] = container;
	}

	return await new Promise<ScriptResult>(res => scriptHandlers[scriptId] = result => {
		res(result);
		delete scriptHandlers[scriptId];
		if(scriptId in mplScriptHosts) delete mplScriptHosts[scriptId];
	});
};
