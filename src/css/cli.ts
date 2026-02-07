import { argv } from 'node:process';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';

import { bundleAsync } from 'lightningcss';

import { transform } from './build';

export async function build(infile: string, outfile?: string) {
	const { code } = await bundleAsync({
		filename: infile,
		minify: true,
		resolver: {
			read(file) {
				return transform(readFileSync(file, { encoding: 'utf8' }));
			},
		},
	});
	const out = outfile ?? infile.replace(/(\.\w+)$/, '.build$1');
	writeFileSync(out, `:root:root:root:root:root:root:root:root{${code}}`, { encoding: 'utf8' });
	console.log(`Successfully built from '${infile}' to '${out}'!`);
}

if (import.meta.main) {
	if (!argv[2]) throw new Error(`Usage: ${argv[1]} <input path> [-o <output path>] [-w <watch paths...>]`);
	const [_, _1, infile, ...args] = argv;
	let outfile: string | undefined = undefined;
	let watch: string[] | undefined = undefined;
	while (args.length) {
		switch(args.shift()) {
			case '-w':
				watch = [];
				while(args.length && !args[0].startsWith('-'))
					watch.push(args.shift()!);
				break;
			case '-o':
				outfile = args.shift();
				break;
			default:
				throw new Error(`Unknown arg: ${JSON.stringify(argv[argv.length - args.length])}`);
		}
	}
	if (!existsSync(infile)) throw new Error(`${infile} does not exist`);

	await build(infile, outfile);

	if (watch) {
		const { default: Watcher } = await import('watcher');
		const watcher = new Watcher();
		watcher.watch(watch, {
			recursive: true,
			ignoreInitial: true,
		}, async () => {
			try {
				await build(infile, outfile)
			} catch (e) {
				console.error(e);
			}
		});
	}
}
