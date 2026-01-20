// declare const process: {
// 	env: {
// 		UCLEARN_DEBUG?: '0' | '1';
// 		UCLEARN_DEBUG_FLAGS?: string;
// 	};
// };

export declare const DEBUG: boolean;

// (globalThis as { process: typeof process; }).process = { env: {} };

// const DEBUG = !!+(process.env.UCLEARN_DEBUG ?? 0);
// const DEBUG_FLAGS = DEBUG ? (process.env.UCLEARN_DEBUG_FLAGS ?? "").toLowerCase().split(/,\s*/g).filter(x => x) : [];

// type DebugFlags = 'hydration' | 'scripting' | 'mathlive';

// export class MoomoDebug {
// 	static run(task: () => unknown) {
// 		task();
// 	}

// 	static runIn(environment: DebugFlags, task: () => unknown) {
// 		if (DEBUG_FLAGS.includes(environment)) task();
// 	}

// 	static toast() {

// 	}

// 	static assert(...args: Parameters<Console['assert']>) {
// 		console.assert(...args);
// 	}

// 	static clear(...args: Parameters<Console['clear']>) {
// 		return console.clear(...args);
// 	}

// 	static count(...args: Parameters<Console['count']>) {
// 		return console.count(...args);
// 	}

// 	static countReset(...args: Parameters<Console['countReset']>) {
// 		return console.countReset(...args);
// 	}

// 	static debug(...args: Parameters<Console['debug']>) {
// 		return console.debug(...args);
// 	}

// 	static dir(...args: Parameters<Console['dir']>): void {
// 		return console.dir(...args);
// 	}

// 	static dirxml(...args: Parameters<Console['dirxml']>) {
// 		return console.dirxml(...args);
// 	}

// 	static error(...args: Parameters<Console['error']>) {
// 		return console.error(...args);
// 	}

// 	static group(...args: Parameters<Console['group']>) {
// 		return console.group(...args);
// 	}

// 	static groupCollapsed(...args: Parameters<Console['groupCollapsed']>) {
// 		return console.groupCollapsed(...args);
// 	}

// 	static groupEnd(...args: Parameters<Console['groupEnd']>) {
// 		return console.groupEnd(...args);
// 	}

// 	static info(...args: Parameters<Console['info']>) {
// 		return console.info(...args);
// 	}

// 	static log(...args: Parameters<Console['log']>) {
// 		return console.log(...args);
// 	}

// 	static table(...args: Parameters<Console['table']>) {
// 		return console.table(...args);
// 	}

// 	static time(...args: Parameters<Console['time']>) {
// 		return console.time(...args);
// 	}

// 	static timeEnd(...args: Parameters<Console['timeEnd']>) {
// 		return console.timeEnd(...args);
// 	}

// 	static timeLog(...args: Parameters<Console['timeLog']>) {
// 		return console.timeLog(...args);
// 	}

// 	static timeStamp(...args: Parameters<Console['timeStamp']>) {
// 		return console.timeStamp(...args);
// 	}

// 	static trace(...args: Parameters<Console['trace']>) {
// 		return console.trace(...args);
// 	}

// 	static warn(...args: Parameters<Console['warn']>) {
// 		return console.warn(...args);
// 	}

// 	static write(...args: Parameters<Console['write']>) {
// 		return console.write(...args);
// 	}

// 	static profile(...args: Parameters<Console['profile']>) {
// 		return console.profile(...args);
// 	}

// 	static profileEnd(...args: Parameters<Console['profileEnd']>) {
// 		return console.profileEnd(...args);
// 	}
// }
