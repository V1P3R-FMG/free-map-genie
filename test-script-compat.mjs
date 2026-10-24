import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('src/common/mapgenie/index.ts','utf8');
const {transform}=await import('esbuild');
const {code}=await transform(source,{loader:'ts',format:'cjs'});
const legacy='https://cdn.mapgenie.io/js/map.js?id=abc';
const hashed='https://cdn.mapgenie.io/js/map.c8b3a1c6.js';
for(const src of [hashed,legacy]){
 const scripts=[{src}];const appended=[];
 const document={querySelectorAll:()=>scripts,createElement:()=>({}),body:{appendChild:s=>{scripts.push(s);appended.push(s);}}};
 const $=selector=>{
  if(typeof selector==='string'&&selector.startsWith('script[')){
   const match=selector.match(/src\^="([^"]+)"/);const found=scripts.filter(s=>s.src.startsWith(match?.[1]??''));return {length:found.length,attr:()=>found[0]?.src};
  }
  return {appendTo:()=>{throw Error('Use DOM injection for deterministic duplicate checks');}};
 };
 const module={exports:{}};
 const sandbox={module,exports:module.exports,require:name=>name==='@/common/dom'?{waitForBody:async()=>{}}:{},document,$,URL,console};
 vm.runInNewContext(code,sandbox);
 const activate=module.exports.activateBlockedMapgenieScript;
 await activate('map');await activate('map');
 assert.equal(appended.length,1,`Expected exactly one activation of ${src}`);
 const url=new URL(appended[0].src);assert.equal(url.searchParams.has('ready'),true);
 const rules=await readFile('src/contexts/background/rules/index.ts','utf8');
 const match=rules.match(/regexFilter:\s*("(?:[^"\\]|\\.)*")/);
 assert.ok(match,'Map script blocking must support hashed files');
 const pattern=JSON.parse(match[1]);const block=new RegExp(pattern);
 assert.ok(block.test(src),`Must block original ${src}`);
 assert.ok(!block.test(appended[0].src),'Must allow activated URL');
 assert.ok(!block.test('https://cdn.mapgenie.io/js/vendor/map.c8b3a1c6.js'));
 console.log('SCRIPT_COMPAT_PASS',src,'=>',appended[0].src);
}
