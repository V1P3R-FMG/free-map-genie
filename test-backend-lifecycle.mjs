import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {transform} from 'esbuild';
const source=await readFile('src/contexts/background/offscreen.ts','utf8');
const {code}=await transform(source,{loader:'ts',format:'cjs',define:{'import.meta.env.VIVALDI_COMPAT':'true','import.meta.env.FIREFOX':'false'}});
async function setup(existing=[]){
 let tabs=existing;let removed;const created=[],reloaded=[];
 const browser={runtime:{getURL:p=>'chrome-extension://test'+p},tabs:{query:async()=>tabs,create:async p=>{created.push(p);const t={...p,id:42};tabs=[t];return t;},update:async()=>{},reload:async id=>reloaded.push(id),onRemoved:{addListener:cb=>removed=cb}},windows:{getAll:async()=>[{id:2,type:'normal'}]}};
 const module={exports:{}};vm.runInNewContext(code,{module,exports:module.exports,require:()=>({default:async()=>{}}),browser,logger:{error:()=>{}}});
 await module.exports.createOffscreenDocument();
 return {created,reloaded,browser,remove:async info=>{tabs=[];removed(42,info);await new Promise(r=>setTimeout(r,10));}};
}
const multi=await setup();await multi.remove({isWindowClosing:true,windowId:1});
assert.equal(multi.created.length,2,'Closing backend window must recover in remaining window');
assert.equal(multi.created[1].windowId,2);console.log('WINDOW_RECOVERY_PASS');
const discarded=await setup([{id:42,discarded:true}]);
assert.deepEqual(discarded.reloaded,[42],'Discarded backend must be reloaded');console.log('DISCARDED_RECOVERY_PASS');
const last=await setup();last.browser.windows.getAll=async()=>[];await last.remove({isWindowClosing:true,windowId:1});
assert.equal(last.created.length,1,'Closing last window must not create a new one');console.log('LAST_WINDOW_CLOSE_PASS');
