import esbuild from 'esbuild';
import fs from 'fs';

const args = process.argv.slice(2);
const config = {};
for (const arg of args) {
    let [key, value] = arg.split("=");
    if (value === undefined) value = true;
    else if (value === "true" || value === "false") value = value === "true";
    else if (value.startsWith("{") && value.endsWith("}")) value = JSON.parse(value);
    config[key] = value;
}

function getFilePath(baseName, env) {
    return `./utils/${baseName}${env === 'advanced' ? 'Advanced' : ''}.js`;
}

function numberToBool(value, x) {
    const n = 1 << x;
    return (parseInt(value) & n) === 0 ? 'basic' : 'advanced';
}

const genId = config.genId || numberToBool(config.p, 0) || 'basic';
const hasFields = config.hasFields || numberToBool(config.p, 1) || 'basic';
const updateObject = config.updateObject || numberToBool(config.p, 2) || 'basic';
delete config.genId;
delete config.hasFields;
delete config.updateObject;
delete config.p;
console.log("genId:", genId);
console.log("hasFields:", hasFields);
console.log("updateObject:", updateObject);

esbuild.build({
    entryPoints: ['./src/index.ts'],
    bundle: true,
    outfile: './dist/core.js',
    platform: 'neutral',
    format: 'esm',
    sourcemap: true,
    minify: true,
    metafile: true,
    plugins: [
        {
            name: 'dynamic-export-plugin',
            setup(build) {
                build.onLoad({ filter: /aliases\.ts$/ }, (args) => {
                    const filePath = args.path;
                    let contents = fs.readFileSync(filePath, 'utf8');

                    contents = contents.replace(
                        /from\s+"(\.\/utils\/)(genId|hasFields|updateObject)(Advanced)?"/g,
                        (match, prefix, baseName) => {
                            const env = baseName === 'genId' ? genId :
                                        baseName === 'hasFields' ? hasFields :
                                        updateObject;
                            return `from "${getFilePath(baseName, env)}"`;
                        }
                    );

                    return { contents, loader: 'js' };
                });
            }
        }
    ],
    ...config
}).then((result) => {
    console.log('ValtheraDB Mini core built.');
    esbuild.analyzeMetafile(result.metafile).then(console.log);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
