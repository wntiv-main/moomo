Bun.build({
	entrypoints: [
		"./src/moodle/index.ts",
		"./src/timetable/index.ts",
	],
	outdir: "./dist/build",
	minify: true,
});
