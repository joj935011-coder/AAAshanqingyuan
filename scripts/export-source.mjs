import { readdir, readFile, lstat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const elements = [];
async function addFile(path) {
  const target = resolve(root, path);
  const stat = await lstat(target);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('只允许导出普通源码文件：' + path);
  elements.push({path,mode:'100644',type:'blob',content:await readFile(target,'utf8')});
}
async function visit(folder) {
  for (const entry of await readdir(resolve(root,folder),{withFileTypes:true})) {
    const path = folder + '/' + entry.name;
    if (entry.isSymbolicLink()) throw Error('不能导出符号链接：' + path);
    if (entry.isDirectory()) await visit(path);
    else if (/\.(js|mjs|json|md|html|css|yml|yaml)$/.test(entry.name)) await addFile(path);
  }
}
for (const filename of ['.gitignore','.env.example','package.json','README.md','CONTRIBUTING.md','TEAM.md']) await addFile(filename);
for (const folder of ['web','server','scripts','tests','docs','.github','.devcontainer','.openai']) await visit(folder);
process.stdout.write(JSON.stringify(elements));
