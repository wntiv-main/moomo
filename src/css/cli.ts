import { argv } from 'node:process';
import { readFile, existsSync, writeFileSync } from 'node:fs';
import { build } from './build';

if (!argv[2]) throw new Error(`Usage: ${argv[1]} <filepath>`);
if (!existsSync(argv[2])) throw new Error(`${argv[2]} does not exist`);

readFile(argv[2], {
    encoding: 'utf8'
}, (err, data) => {
    if (err) throw err;
    writeFileSync(
        argv[3] ?? argv[2].replace(/(\.\w+)$/, '.build$1'),
        build(data), {
        encoding: 'utf8',
    });
});
