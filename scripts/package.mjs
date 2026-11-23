import {readFile,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const pages=JSON.parse(await readFile('content/paginas-geradas.json','utf8'));
const folders=[...new Set(['assets','css','js','index.html','robots.txt','sitemap.xml',...pages.filter(p=>p.path!=='/').map(p=>p.path.split('/')[1])])];
const literal=folders.map(p=>"'"+p.replaceAll("'","''")+"'").join(',');
execFileSync('pwsh.exe',['-NoProfile','-Command',`Compress-Archive -LiteralPath ${literal} -DestinationPath 'SITE-FDG-PARA-PUBLICAR.zip' -Force`],{stdio:'inherit'});
console.log('Pacote atualizado:',(await stat('SITE-FDG-PARA-PUBLICAR.zip')).size,'bytes');
