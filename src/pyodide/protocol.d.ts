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
	message: string | Uint8Array,
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
	message: string
} | {
	type: 'matplotlibCommandBin',
	message: string | Uint8Array,
} | {
	type: 'matplotlibInitScript',
	script: string,
} | {
	type: 'matplotlibInitFigure',
	fignum: string,
}
