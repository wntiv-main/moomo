export type M2WMessage = {
	type: 'pyodideInit',
	baseUrl: string,
} | {
	type: 'runScript',
	id: number,
	script: string,
	stdin?: string,
} | {
	type: 'matplotlibResponse',
	message: string | Uint8Array<ArrayBuffer>,
	id: number,
} | {
	type: 'matplotlibRequestImage',
	name: string,
};

export type W2MMessage = {
	type: 'scriptResult',
	id: number,
	stdout: string,
} | {
	type: 'scriptError',
	id: number,
	stdout: string,
	error: string,
} | {
	type: 'matplotlibCommand',
	message: string,
	id: number,
} | {
	type: 'matplotlibCommandBin',
	message: string | ArrayBuffer,
	id: number,
} | {
	type: 'matplotlibInitScript',
	script: string,
	css: string,
} | {
	type: 'matplotlibInitFigure',
	id: number,
	scriptId: number,
} | {
	type: 'matplotlibImageResponse',
	name: string,
	data: ArrayBuffer,
}
