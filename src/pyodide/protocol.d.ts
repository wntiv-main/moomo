export type M2WMessage = {
	type: 'pyodideInit',
	baseUrl: string,
} | {
	type: 'runScript',
	id: number,
	script: string,
	stdin?: string,
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
}
