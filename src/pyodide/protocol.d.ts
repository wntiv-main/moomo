export type M2WMessage = {
	type: 'pyodideInit',
	baseUrl: string,
} | {
	type: 'runScript',
	id: number,
	script: string,
};

export type W2MMessage = {
	type: 'scriptResult',
	id: number,
	stdout: string,
}
