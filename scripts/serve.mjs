import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('../dist/',import.meta.url)),port=5173;
const open=()=>spawn('cmd.exe',['/c','start','','http://localhost:'+port],{windowsHide:true,stdio:'ignore'}).unref();
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.gltf':'model/gltf+json','.glb':'model/gltf-binary','.bin':'application/octet-stream','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{
 if(req.url==='/__health'){res.writeHead(200,{'Content-Type':'text/plain'});res.end('zacharie-saturne');return;}
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
 if(file!==path.resolve(root)&&!file.startsWith(path.resolve(root)+path.sep)){res.writeHead(403).end();return;}
 if(file===path.resolve(root))file=path.join(root,'index.html');
 fs.stat(file,(err,stat)=>{
  if(err||!stat.isFile()){res.writeHead(404).end('Fichier introuvable');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
 });
});
server.on('error',async err=>{
 if(err.code==='EADDRINUSE'){
  try{const r=await fetch('http://localhost:'+port+'/__health');if(await r.text()==='zacharie-saturne'){if(process.argv.includes('--open'))open();console.log('Le jeu est déjà lancé : http://localhost:'+port);return;}}catch{}
 }
 console.error('Impossible de lancer le jeu :',err.message);process.exitCode=1;
});
server.listen(port,'0.0.0.0',()=>{console.log('Zacharie : http://localhost:'+port+' — Ctrl+C pour arrêter.');if(process.argv.includes('--open'))open();});
