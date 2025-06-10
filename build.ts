Bun.build({
	entrypoints: [
		"./src/learn/index.ts",
		"./src/timetable/index.ts",
	],
	outdir: "./dist/build",
	minify: true,
});
