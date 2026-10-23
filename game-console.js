/* Real game diagnostics. PASS is emitted only after an observed condition passes. */
(function(){
  'use strict';
  var api=null,enabled=true,running=false,serial=0,entries=[],generation=0,waits=new Set(),outcome='idle';
  var lastKey='',activeTrigger='Clock',lastNode='',lastSample=performance.now(),startedAt=0,passed=0,failed=0;
  var byId=function(id){return document.getElementById(id);};
  var cancelled={cancelled:true};
  function write(trigger,state,detail,kind,ms){
    if(!enabled&&!running)return;
    var mark=kind==='FAIL'?'✗':kind==='INFO'?'·':'✓';
    var line=String(++serial).padStart(5,'0')+' '+mark+' [Trigger: '+trigger+'] -> State: '+state+
      ' ('+(typeof ms==='number'?Math.max(0,Math.round(ms))+'ms · ':'')+(kind||'PASS')+')'+(detail?' | '+detail:'');
    entries.push({time:new Date().toISOString(),line:line});if(entries.length>4000)entries.shift();
    var method=kind==='FAIL'?'error':'log';
    console[method]('%c'+line,'color:'+(kind==='FAIL'?'#e76b6b':kind==='INFO'?'#9ca9b9':'#6fbd84')+';font-family:monospace');
    updateControls();
  }
  function status(s){
    if(s.mode==='title')return 'TITLE';
    if(s.cutscene||s.busy)return s.node?'CUTSCENE_'+s.node:'OPENING';
    if(s.menu)return 'MENU';if(s.weaponWheel)return 'WEAPON_SELECTION';if(!s.weaponReady)return 'SELECT_WEAPON';
    if(s.wheel)return 'CHARACTER_WHEEL';if(s.finished)return s.choices?'CHOICE':s.interact?'WAITING_E':'SEGMENT_COMPLETE';
    if(s.complete)return 'RESULT';if(!s.ready)return 'LOADING';return s.playing?'RUNNING':'PAUSED';
  }
  function observe(trigger){
    if(!api||(!enabled&&!running))return;
    var s=api.snapshot(),now=performance.now(),dt=now-lastSample;
    if(s.mode==='title'&&!running)return;
    var state=status(s),invariant=s.playing?s.ready&&(s.placeholder?s.timer:!s.paused):s.paused&&!s.timer;
    if(s.cutscene||s.busy||s.complete)invariant=s.paused&&!s.timer;
    var detail='Node: '+(s.node||'OPENING')+' | '+Math.round(s.elapsed)+'ms';
    if(s.ammo!==null)detail+=' | Ammo: '+s.reserve+'/'+s.ammo;
    if(!invariant&&s.ready&&running)failed++;
    write(trigger||activeTrigger,state,detail,invariant?'PASS':s.ready?'FAIL':'INFO',dt);
    lastSample=now;lastNode=s.node;
  }
  function updateControls(){
    var start=byId('run-console-tests'),stop=byId('stop-console-tests'),out=byId('console-test-status');
    if(start)start.disabled=running||!api;if(stop)stop.disabled=!running;
    if(out)out.textContent=running?'自动校验中 · '+passed+' PASS / '+failed+' FAIL':
      (failed?'校验失败 · '+failed+' FAIL':outcome==='stopped'?'已停止 · '+passed+' 项已通过':passed?'校验已结束 · '+passed+' PASS':'实时日志已就绪')+' · '+entries.length+' 行';
  }
  function delay(ms,ticket){return new Promise(function(resolve,reject){
    var wait={timer:null,reject:reject};waits.add(wait);
    wait.timer=setTimeout(function(){waits.delete(wait);if(ticket!==generation)reject(cancelled);else resolve();},ms);
  });}
  async function waitFor(predicate,label,ticket,timeout){
    var start=performance.now();
    while(!predicate(api.snapshot())){if(performance.now()-start>(timeout||8000))throw new Error(label+' timed out');await delay(40,ticket);}
  }
  function check(value,trigger,label,start){
    if(!value){failed++;write(trigger,'ASSERTION_FAILED',label,'FAIL',performance.now()-start);throw new Error(label);}
    passed++;write(trigger,status(api.snapshot()),label,'PASS',performance.now()-start);
  }
  async function press(key,ticket,heldMs){
    var start=performance.now();api.key('keydown',key);await delay(heldMs||70,ticket);api.key('keyup',key);await delay(30,ticket);return start;
  }
  async function skip(id,ticket){
    check(api.snapshot().node===id,'Checkpoint','Expected '+id,performance.now());
    var start=await press('Space',ticket);
    check(api.snapshot().completed.indexOf(id)>=0,'Key_Space','Segment completed through actual quick-step handler',start);
  }
  async function holdAndPause(input,ms,ticket,untilMedia){
    var before=api.snapshot(),start=performance.now();
    if(input==='MouseLeft')api.pointer('pointerdown');else api.key('keydown',input);
    if(untilMedia)await waitFor(function(s){return s.elapsed>=untilMedia;},'Shooting video clock',ticket,16000);
    else await delay(ms,ticket);
    var during=api.snapshot();
    check(during.playing&&during.elapsed>before.elapsed+80,input,'Held input advances actual '+(during.placeholder?'placeholder clock':'video clock'),start);
    if(input==='MouseLeft')api.pointer('pointerup');else api.key('keyup',input);
    var paused=api.snapshot();await delay(220,ticket);var after=api.snapshot();
    check(after.paused&&!after.timer&&Math.abs(after.elapsed-paused.elapsed)<100,input+'_UP','Release pauses playback and timeline',start);
  }
  async function run(){
    if(running)return false;
    if(!api){write('Test','NOT_READY','Wait for game data to load','INFO');return false;}
    var initial=api.snapshot();if(initial.busy||initial.cutscene){write('Test','WAIT','Wait for the current transition before starting','INFO');return false;}
    running=true;outcome='running';passed=failed=0;startedAt=performance.now();var ticket=++generation,completed=false;
    write('Test','START','Real engine / actual input handlers / one full chapter / audio muted','INFO');
    api.begin();updateControls();
    try{
      await waitFor(function(s){return s.node==='HEIST_INTRO'&&!s.busy&&s.ready;},'Opening',ticket,12000);
      check(api.snapshot().paused,'BOOT','Opening completes without autoplay',startedAt);
      var before=api.snapshot().node,start=await press('KeyE',ticket);
      check(api.snapshot().node===before&&!api.snapshot().interact,'Key_E','Premature E cannot bypass unfinished clip',start);
      await holdAndPause('KeyW',800,ticket);await skip('HEIST_INTRO',ticket);
      start=await press('KeyE',ticket);check(api.snapshot().node==='HEIST_GRAB','Key_E','E enters HEIST_GRAB',start);
      await holdAndPause('KeyW',500,ticket);await skip('HEIST_GRAB',ticket);
      check(api.snapshot().node==='AERIAL_SPLIT','Cutscene','Actual aerial split entered',start);
      await waitFor(function(s){return s.node==='CART_ALLEY'&&!s.busy&&s.ready;},'Cart',ticket);
      check(!api.snapshot().placeholder,'Media_02','02.mp4 loaded as real footage',performance.now());
      check(api.snapshot().money===30000000,'Money','Story loot is 30,000,000 liang',performance.now());
      await holdAndPause('KeyW',700,ticket);await skip('CART_ALLEY',ticket);await press('KeyE',ticket);
      check(api.snapshot().node==='SHOOT'&&!api.snapshot().weaponReady,'Weapon_Gate','Shooting requires equipment selection',performance.now());
      start=await press('KeyW',ticket);check(api.snapshot().paused,'Key_W','W cannot bypass weapon selection',start);
      start=await press('Tab',ticket);check(api.snapshot().weaponReady&&!api.snapshot().weaponWheel,'Key_Tab','Tab release equips SMG',start);
      check(api.snapshot().ammo===8&&api.snapshot().reserve===9999,'Ammo','Initial ammunition is 9999 / 8',start);
      var prior=api.snapshot().elapsed;start=await press('KeyW',ticket,220);
      check(api.snapshot().paused&&api.snapshot().elapsed===prior,'Key_W','Shooting scene does not use movement key',start);
      await holdAndPause('MouseLeft',6800,ticket,6600);
      check(api.snapshot().ammo===0&&api.snapshot().reserve===9999,'Ammo','Eight timed shots exhausted clip; reserve unchanged',performance.now());
      await skip('SHOOT',ticket);await press('Alt',ticket);check(api.snapshot().wheel,'Key_Alt','Character selection wheel opens',performance.now());
      await press('Digit3',ticket);await waitFor(function(s){return s.node==='CARJACK'&&!s.busy&&s.ready;},'Nianzhuohua',ticket);
      check(!api.snapshot().placeholder&&api.snapshot().character==='nianzhuohua','Media_041','041.mp4 loaded after character switch',performance.now());
      await holdAndPause('KeyW',600,ticket);await skip('CARJACK',ticket);await skip('DRIVE_FM',ticket);
      check(api.snapshot().choices,'Branch','Watermelon choice unlocked',performance.now());await press('KeyE',ticket);
      await skip('WATERMELON',ticket);await skip('ROADBLOCK',ticket);await press('Alt',ticket);await press('Digit2',ticket);
      await waitFor(function(s){return s.node==='WESTGATE'&&!s.busy&&s.ready;},'Niuhulu',ticket);
      check(api.snapshot().character==='niuhulu','Character','Correct west-gate character',performance.now());
      await skip('WESTGATE',ticket);await skip('SWITCH_TO_INSURGENT',ticket);await skip('BREAKOUT',ticket);
      var final=api.snapshot();check(final.node==='RESULT'&&final.complete,'Result','Full chapter reaches actual result screen',performance.now());
      check(final.completed.length===11&&final.wanted===0,'Result','11 segments complete and wanted level cleared',performance.now());
      completed=failed===0;outcome=completed?'complete':'failed';
      write('Test',failed?'FAILED':'COMPLETE',passed+' PASS / '+failed+' FAIL; observations are real-time engine snapshots',failed?'FAIL':'PASS',performance.now()-startedAt);
    }catch(error){
      if(error===cancelled){outcome='stopped';write('Test','STOPPED','Automation stopped; game remains at current progress','INFO',performance.now()-startedAt);}
      else{outcome='failed';if(!failed)failed++;write('Test','FAILED',error.message,'FAIL',performance.now()-startedAt);}
    }finally{api.end();running=false;activeTrigger='Clock';updateControls();}
    return completed&&failed===0;
  }
  function stop(){
    if(!running)return;generation++;api.release();
    waits.forEach(function(wait){clearTimeout(wait.timer);wait.reject(cancelled);});waits.clear();
  }
  function download(){
    var blob=new Blob([entries.map(function(e){return e.time+' '+e.line;}).join('\r\n')],{type:'text/plain;charset=utf-8'});
    var url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='qing-validation-'+Date.now()+'.log';a.click();setTimeout(function(){URL.revokeObjectURL(url);},1000);
  }
  function bind(bridge){
    api=bridge;byId('run-console-tests').addEventListener('click',run);byId('stop-console-tests').addEventListener('click',stop);
    byId('save-console-log').addEventListener('click',download);
    byId('console-log-enabled').addEventListener('change',function(){enabled=this.checked;});
    write('BOOT','READY',bridge.local?'file:// -> embedded JSON (no local fetch)':'HTTP JSON mode (embedded fallback available)','PASS');
    write('Help','CONSOLE','Click game, press H -> 从头自动校验. Console command: QingTest.run(); stop: QingTest.stop()','INFO');
    write('Help','FOCUS','Manual keys require game focus. Automatic validation can run while Console has focus.','INFO');
    updateControls();
    if(new URLSearchParams(window.location.search).get('verify')==='1')setTimeout(run,100);
  }
  document.addEventListener('keydown',function(e){
    if(!api||e.repeat||e.ctrlKey||e.metaKey||e.target.closest?.('input,select,textarea,[contenteditable]'))return;
    activeTrigger=e.code?e.code.replace(/^Key/,'Key_').replace(/^Digit/,'Digit_'):e.key;
    lastKey=e.code;setTimeout(function(){observe(activeTrigger);},0);
  },true);
  document.addEventListener('keyup',function(e){if(api&&e.code===lastKey)setTimeout(function(){observe((e.code||e.key).replace(/^Key/,'Key_')+'_UP');},0);},true);
  document.addEventListener('pointerdown',function(e){if(api&&e.button===0&&e.target.closest('#game')){activeTrigger='Mouse_Left';setTimeout(function(){observe('Mouse_Left');},0);}},true);
  document.addEventListener('pointerup',function(){if(api&&activeTrigger==='Mouse_Left')setTimeout(function(){observe('Mouse_Left_UP');},0);},true);
  setInterval(function(){
    if(!api||(!enabled&&!running))return;var s=api.snapshot();
    if(running||s.playing||s.cutscene||s.node!==lastNode){observe(activeTrigger);}
  },200);
  document.addEventListener('visibilitychange',function(){if(document.hidden&&running)stop();});
  window.QingGameDiagnostics={bind:bind};
  window.QingTest=Object.freeze({run:run,stop:stop,save:download,
    logging:function(value){enabled=value!==false;if(byId('console-log-enabled'))byId('console-log-enabled').checked=enabled;},
    status:function(){return {running:running,outcome:outcome,passed:passed,failed:failed,lines:entries.length};},
    logs:function(){return entries.map(function(e){return e.line;});}});
})();
