import { M2WMessage, W2MMessage } from "../pyodide/protocol";
import { assertNever } from "../util";
import { EXT_URL } from "./constants";
import { CodeRunner } from "./patches/coderunner";

type _Omit<T, K extends string> = T extends { [key in K]: infer _ } ? Omit<T, K> : T;
type ScriptResult = _Omit<Extract<W2MMessage, { type: 'scriptResult' | 'scriptError' }>, 'id'>;

let workerScript: string | null = null;
let worker: Worker | null = null;
let scriptId = 0;
const scriptHandlers: Record<number, (result: ScriptResult) => void> = {};

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
				default:
					assertNever(message);
			}
		});
		worker.postMessage({ type: 'pyodideInit', baseUrl: EXT_URL } satisfies M2WMessage);
		return worker;
	})();

	worker.postMessage({
		type: 'runScript',
		script,
		stdin: options?.stdin,
		id: ++scriptId
	} satisfies M2WMessage);
	return await new Promise<ScriptResult>(res => scriptHandlers[scriptId] = res);
};
