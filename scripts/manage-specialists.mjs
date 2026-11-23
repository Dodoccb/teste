import http from 'node:http';
import {readFile,writeFile,mkdir,copyFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {randomBytes,createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);const root=resolve('.');const token=randomBytes(24).toString('hex');const origin='http://127.0.0.1:4174';let busy=false;
const catalog=resolve('content/especialistas.json');
const respond=(res,status,data,type='application/json; charset=utf-8')=>{res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"frame-ancestors 'none'"});res.end(type.startsWith('application/json')?JSON.stringify(data):data);};
const textField=(value,max=1000)=>typeof value==='string'?value.trim().slice(0,max):'';
function validate(items){if(!Array.isArray(items)||items.length>80)throw Error('Lista de especialistas inválida.');const slugs=new Set();return items.map(s=>{const slug=textField(s.slug,80);if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slugs.has(slug))throw Error('Cada especialista precisa de um identificador único, com letras minúsculas e hífens.');slugs.add(slug);if(!textField(s.nome)||!textField(s.area)||!textField(s.bio))throw Error('Preencha nome, especialidade e apresentação.');if(!/^[a-zA-Z0-9_-]+\.(png|jpe?g|webp)$/.test(s.imagem||''))throw Error('Selecione uma foto PNG, JPG ou WebP para cada especialista.');return {nome:textField(s.nome,120),slug,imagem:s.imagem,area:textField(s.area,250),bio:textField(s.bio,2000),temas:Array.isArray(s.temas)?s.temas.map(t=>textField(t,200)).filter(Boolean).slice(0,20):[],programa:textField(s.programa,100)||null,programaNome:textField(s.programaNome,200)||null,ativo:s.ativo!==false,tipo:s.tipo==='foto'?'foto':'arte',zoom:Math.min(600,Math.max(100,Number(s.zoom)||220)),x:Math.min(100,Math.max(0,Number(s.x)||50)),y:Math.min(100,Math.max(0,Number(s.y)||20))};});}
async function jsonBody(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>18000000)throw Error('Arquivo muito grande. Use uma imagem com até 12 MB.');}return JSON.parse(raw);}
http.createServer(async(req,res)=>{try{
 if(req.headers.host!=='127.0.0.1:4174')return respond(res,403,{error:'Endereço não permitido.'});
 const url=new URL(req.url,origin);
 if(url.pathname.startsWith('/api/')){
 if(req.headers['x-fdg-token']!==token||(req.headers.origin&&req.headers.origin!==origin))return respond(res,403,{error:'Abra novamente o editor local.'});
 if(req.method==='GET'&&url.pathname==='/api/especialistas')return respond(res,200,{specialists:JSON.parse(await readFile(catalog,'utf8')),programs:JSON.parse(await readFile('content/programas.json','utf8'))});
 if(req.method==='POST'&&url.pathname==='/api/salvar'){
 if(busy)return respond(res,409,{error:'Uma atualização já está em andamento.'});busy=true;
 try{const body=await jsonBody(req);const normalized=validate(body.specialists);
 for(const item of normalized)await stat(resolve('assets/images/especialistas',item.imagem));
 const backupDir=resolve('content/backups-especialistas');await mkdir(backupDir,{recursive:true});await copyFile(catalog,resolve(backupDir,Date.now()+'.json'));
 await writeFile(catalog,JSON.stringify(normalized,null,2)+'\n');
 await run(process.execPath,['scripts/build.mjs'],{cwd:root});await run(process.execPath,['scripts/check.mjs'],{cwd:root});await run(process.execPath,['scripts/package.mjs'],{cwd:root});
 return respond(res,200,{message:'Especialistas atualizados no site e no pacote de publicação. Recarregue a página para ver as mudanças.'});
 }finally{busy=false;}
 }
 if(req.method==='POST'&&url.pathname==='/api/foto'){
 const body=await jsonBody(req);const match=String(body.data||'').match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);if(!match)throw Error('Use uma imagem PNG, JPG ou WebP.');const bytes=Buffer.from(match[2],'base64');if(bytes.length>12000000)throw Error('Use uma imagem com até 12 MB.');const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;const webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';if(!(png||jpg||webp))throw Error('A imagem não tem um formato válido.');const name='foto-'+createHash('sha256').update(bytes).digest('hex').slice(0,20)+(png?'.png':jpg?'.jpg':'.webp');await writeFile(resolve('assets/images/especialistas',name),bytes);return respond(res,200,{imagem:name});
 }
 return respond(res,404,{error:'Ação não encontrada.'});
 }
 if(req.method!=='GET')return respond(res,405,{error:'Método não permitido.'});
 if(url.pathname==='/'){let html=await readFile('manutencao/especialistas.html','utf8');return respond(res,200,html.replaceAll('__TOKEN__',token),'text/html; charset=utf-8');}
 let path=resolve(root,'.'+decodeURIComponent(url.pathname));if(!path.startsWith(root+sep))return respond(res,403,{error:'Arquivo não permitido.'});if((await stat(path)).isDirectory())path=resolve(path,'index.html');const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp'};respond(res,200,await readFile(path),types[extname(path)]||'application/octet-stream');
 }catch(error){respond(res,400,{error:error.message||'Não foi possível concluir a alteração.'});}}).listen(4174,'127.0.0.1',()=>console.log('Editor local: '+origin+'\nAbra o endereço no navegador. Para encerrar, pressione Ctrl+C.'));
