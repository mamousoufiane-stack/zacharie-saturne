import fs from 'node:fs';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
export function readGLB(file){
 const bytes=fs.readFileSync(file),jsonLength=bytes.readUInt32LE(12);
 const json=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
 const offset=20+jsonLength,bin=bytes.subarray(offset+8,offset+8+bytes.readUInt32LE(offset));
 return {json,bin};
}
// Node has no image decoder; browser checks separately exercise actual embedded textures.
export async function loadGeometry(file){
 const {json,bin}=readGLB(file);
 json.buffers[0].uri='data:application/octet-stream;base64,'+bin.toString('base64');
 for(const m of json.materials||[]){
  delete m.normalTexture;delete m.occlusionTexture;delete m.emissiveTexture;
  if(m.pbrMetallicRoughness){delete m.pbrMetallicRoughness.baseColorTexture;delete m.pbrMetallicRoughness.metallicRoughnessTexture;}
 }
 json.images=[];json.textures=[];globalThis.ProgressEvent??=class{};
 return new GLTFLoader().parseAsync(JSON.stringify(json),'');
}
