"use strict";
// Gameplay HUD, mission cards, character selection and notifications.
(function(){
  const byId=id=>document.getElementById(id),game=byId('game'),hud=byId('hud');
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const data=window.QingHudData,presets=window.MISSION_CARD_PRESETS;
  const starPath='M50 3 61.2 36.2 96.3 36.7 68.2 57.8 78.6 91.3 50 71 21.4 91.3 31.8 57.8 3.7 36.7 38.8 36.2Z';
  function mount(id,parent,tag='div'){
    let el=byId(id);if(!el){el=document.createElement(tag);el.id=id;parent.appendChild(el);}return el;
  }
  const radarMount=mount('game-ui-radar',byId('minimap-block'));
  const radar=window.createQingGameRadar(radarMount);
  const pauseMap=mount('game-ui-pause-map',document.querySelector('.pause-card'));
  const progress=mount('game-ui-progress',document.querySelector('.pause-card'));
  progress.innerHTML='<label for="game-progress">游戏进程</label><select id="game-progress" aria-label="选择游戏进程"></select><button id="jump-progress" type="button">前往此处</button>';
  const cashEditor=mount('game-ui-cash-editor',hud,'form');
  cashEditor.hidden=true;cashEditor.setAttribute('role','dialog');cashEditor.setAttribute('aria-modal','true');cashEditor.setAttribute('aria-labelledby','cash-editor-title');
  cashEditor.innerHTML='<h2 id="cash-editor-title">临时显示金额</h2><label for="cash-display-value">金额（两）</label><input id="cash-display-value" type="number" min="0" max="9999999999" step="1" inputmode="numeric"><p>仅更改显示；重新开始或跳转进度后恢复剧情金额。</p><div><button type="submit" id="apply-cash-display">应用</button><button type="button" id="restore-cash-display">恢复剧情金额</button><button type="button" id="cancel-cash-display">取消</button></div><small id="cash-display-error" role="status"></small>';
  const objective=mount('game-ui-objective',hud);
  const ammo=mount('game-ui-ammo',byId('ammo-display'));
  const banner=mount('game-ui-mission-art',byId('mission-banner'));
  const eventArt=mount('game-ui-event-art',byId('event-popup'));
  const vehicleArt=mount('game-ui-vehicle-art',byId('vehicle-popup'));
  const resultArt=mount('game-ui-result-art',byId('stage-complete'));
  const radio=mount('game-ui-radio',hud);
  radio.innerHTML='<div class="game-ui-radio-symbol">'+window.QingHudIcon('radio')+'</div><strong>大清 FM 1722</strong><span>宫廷路况实时播报</span>';
  const wheel=mount('game-ui-character-wheel',byId('switch-wheel'));
  wheel.innerHTML="<svg id=\"game-ui-character-disc\" viewBox=\"0 0 300 300\" role=\"listbox\" aria-label=\"选择角色，松开 Alt 确认\" tabindex=\"0\">\n        <defs>\n          <clipPath id=\"game-ui-left-sector\"><path d=\"M150 150 53.8 246.2A136 136 0 0 1 53.8 53.8Z\"/></clipPath>\n          <clipPath id=\"game-ui-right-sector\"><path d=\"M150 150 246.2 53.8A136 136 0 0 1 246.2 246.2Z\"/></clipPath>\n          <clipPath id=\"game-ui-bottom-sector\"><path d=\"M150 150 246.2 246.2A136 136 0 0 1 53.8 246.2Z\"/></clipPath>\n        </defs>\n        <circle class=\"wheel-base\" cx=\"150\" cy=\"150\" r=\"140\"/>\n        <g id=\"game-ui-character-anchunxiao\" class=\"character-sector character-left\" role=\"option\" aria-label=\"安春晓\" aria-selected=\"true\" data-character=\"anchunxiao\">\n          <path class=\"sector-tint\" d=\"M150 150 53.8 246.2A136 136 0 0 1 53.8 53.8Z\"/>\n          <g clip-path=\"url(#game-ui-left-sector)\">\n            <g class=\"character-portrait\"><svg x=\"14\" y=\"53\" width=\"136\" height=\"194\" viewBox=\"0 0 1368 1\" preserveAspectRatio=\"none\" overflow=\"hidden\" aria-hidden=\"true\"><image href=\"assets/characters/anchunxiao-portrait.jpg\" width=\"1368\" height=\"1824\"/></svg><image class=\"portrait-subject\" href=\"assets/characters/anchunxiao-portrait.jpg\" x=\"8\" y=\"102\" width=\"126\" height=\"168\" preserveAspectRatio=\"xMidYMid meet\"/></g>\n          </g>\n          <path class=\"character-arc\" d=\"M49.8 244.8A138 138 0 0 1 49.8 55.2\"/>\n        </g>\n        <g id=\"game-ui-character-nianzhuohua\" class=\"character-sector character-right\" role=\"option\" aria-label=\"年灼华\" aria-selected=\"false\" data-character=\"nianzhuohua\">\n          <path class=\"sector-tint\" d=\"M150 150 246.2 53.8A136 136 0 0 1 246.2 246.2Z\"/>\n          <g clip-path=\"url(#game-ui-right-sector)\">\n            <g class=\"character-portrait\"><svg x=\"150\" y=\"53\" width=\"136\" height=\"194\" viewBox=\"0 0 1368 1\" preserveAspectRatio=\"none\" overflow=\"hidden\" aria-hidden=\"true\"><image href=\"assets/characters/nianzhuohua-portrait.jpg\" width=\"1368\" height=\"1824\"/></svg><image class=\"portrait-subject\" href=\"assets/characters/nianzhuohua-portrait.jpg\" x=\"158\" y=\"88\" width=\"144\" height=\"192\" preserveAspectRatio=\"xMidYMid meet\"/></g>\n          </g>\n          <path class=\"character-arc\" d=\"M250.2 55.2A138 138 0 0 1 250.2 244.8\"/>\n        </g>\n        <g id=\"game-ui-character-niuhulu\" class=\"character-sector character-bottom\" role=\"option\" aria-label=\"钮祜禄\" aria-selected=\"false\" data-character=\"niuhulu\">\n          <path class=\"sector-tint\" d=\"M150 150 246.2 246.2A136 136 0 0 1 53.8 246.2Z\"/>\n          <g clip-path=\"url(#game-ui-bottom-sector)\">\n            <g class=\"character-portrait\"><svg x=\"53\" y=\"150\" width=\"194\" height=\"136\" viewBox=\"0 0 1368 1\" preserveAspectRatio=\"none\" overflow=\"hidden\" aria-hidden=\"true\"><image href=\"assets/characters/niuhulu-portrait.jpg\" width=\"1368\" height=\"1824\"/></svg><image class=\"portrait-subject\" href=\"assets/characters/niuhulu-portrait.jpg\" x=\"76.5\" y=\"174\" width=\"147\" height=\"196\" preserveAspectRatio=\"xMidYMid meet\"/></g>\n          </g>\n          <path class=\"character-arc\" d=\"M244.8 250.2A138 138 0 0 1 55.2 250.2\"/>\n        </g>\n        <text id=\"game-ui-wheel-character-name\" class=\"wheel-character-name\" x=\"150\" y=\"65\" text-anchor=\"middle\" aria-hidden=\"true\">安春晓</text>\n        <circle class=\"wheel-center-point\" cx=\"150\" cy=\"150\" r=\"3\"/>\n      </svg>";
  const toolbar=byId('playthrough-toolbar');
  let api=null,toolbarTimer=null,runStarted=false,candidate=null,changed=false,lastObjective='',progressBuilt=false,cashOverride=null;
  function hideToolbar(){
    if(toolbar.contains(document.activeElement))document.activeElement.blur();
    toolbar.hidden=true;
  }
  function revealToolbar(ms=4000){
    if(!game.classList.contains('chapter-active'))return;
    clearTimeout(toolbarTimer);toolbar.hidden=false;toolbarTimer=setTimeout(hideToolbar,ms);
  }
  function reset(){
    clearTimeout(toolbarTimer);toolbar.hidden=true;runStarted=false;changed=false;candidate=null;
    cashOverride=null;closeTransient();
    game.classList.remove('show-test-tools','game-ui-system-visible');
  }
  function enter(){
    game.classList.add('game-ui-hud');
    if(!runStarted){runStarted=true;revealToolbar();}
  }
  function missionSVG(card,complete){
    let height=250,content='';
    if(complete){
      const rows=card.rows||[],divider=232+rows.length*38,totalY=divider+44;height=totalY+52;
      content='<line class="game-ui-mission-rule" x1="720" y1="218" x2="1200" y2="218"/>';
      rows.forEach((row,i)=>{const y=244+i*38;content+='<text class="game-ui-stat-label" x="732" y="'+y+'">'+esc(row[0])+'</text><text class="game-ui-stat-value" x="1188" y="'+y+'" text-anchor="end">'+esc(row[1])+'</text>';});
      content+='<line class="game-ui-mission-rule" x1="720" y1="'+divider+'" x2="1200" y2="'+divider+'"/><text class="game-ui-total-label" x="732" y="'+totalY+'">'+esc(card.total?.[0])+'</text><text class="game-ui-total-value" x="1188" y="'+totalY+'" text-anchor="end">'+esc(card.total?.[1])+'</text>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" class="game-ui-mission-svg" viewBox="0 0 1920 '+height+'" role="img" aria-label="'+esc(card.title+' · '+card.subtitle)+'"><polygon fill="#000" points="0,44 1920,0 1920,'+height+' 0,'+(height-44)+'"/><text class="game-ui-mission-title" x="960" y="136" text-anchor="middle">'+esc(card.title)+'</text><text class="game-ui-mission-subtitle" x="960" y="184" text-anchor="middle">'+esc(card.subtitle)+'</text>'+content+'</svg>';
  }
  function wanted(level){
    const el=byId('wanted');level=Math.max(0,Math.min(6,level));
    el.innerHTML=Array.from({length:6},(_,i)=>'<svg class="wanted-star '+(i>=6-level?'is-active':'')+'" viewBox="0 0 100 100" aria-hidden="true"><path d="'+starPath+'"/></svg>').join('');
    el.setAttribute('aria-label','通缉等级：'+level+' 星');
  }
  function updateAmmo(n,cfg){
    const reserve=Number.isFinite(cfg.reserve)?cfg.reserve:0;
    ammo.innerHTML='<span class="game-ui-ammo-reserve">'+reserve+'</span><span class="game-ui-ammo-clip">'+n+'</span>';
    ammo.setAttribute('aria-label','备用弹药 '+reserve+' 发，弹匣 '+n+' 发');
  }
  function money(amount){
    const value=cashOverride===null?amount:cashOverride;
    byId('money').textContent=Number(value||0).toLocaleString('en-US')+' 两';
    byId('money').setAttribute('aria-label','金额 '+value+' 两，右击可临时修改');
  }
  function closeTransient(){cashEditor.hidden=true;byId('cash-display-error').textContent='';}
  function missionBanner(big,nodeId){
    byId('mission-banner').dataset.kind=big?'start':'objective';
    if(big)banner.innerHTML=missionSVG(presets.find(p=>p.id===(nodeId==='WATERMELON'?'watermelon':'heist')).start,false);
  }
  function eventCopy(nodeId,cfg){
    const p=data.presets.notifications.find(p=>p.node===nodeId&&p.title===cfg.title);
    return p?{...cfg,sub:p.text}:cfg;
  }
  function event(cfg,nodeId){
    const sideResult=nodeId==='WATERMELON'&&cfg.title==='支线完成';
    byId('event-popup').classList.toggle('game-ui-side-result',sideResult);
    eventArt.innerHTML=sideResult?missionSVG(presets.find(p=>p.id==='watermelon').complete,true):window.QingHudIcon(/载具/.test(cfg.title)?'car':/财物|价值|战利品|军火/.test(cfg.title)?'cash':'contact');
  }
  function vehicle(cfg){
    const entry=data.presets.vehicle.find(p=>p.title===cfg.name);
    const stats=(cfg.stats||[]).map(s=>esc(s.label)+'：'+esc(s.value)).join('<br>');
    vehicleArt.innerHTML='<div class="game-ui-vehicle-name"><h2>'+esc(cfg.name)+'</h2><p>'+esc(entry?.text||'')+'</p></div><div class="game-ui-vehicle-notice"><strong>'+esc(cfg.title)+'</strong><p>'+stats+'</p></div>';
  }
  function result(cfg){
    const rows=(cfg.rows||[]).map(r=>[r.label,r.value]),money=rows.find(r=>/财物/.test(r[0]));
    resultArt.innerHTML=missionSVG({title:cfg.kicker||'任务完成',subtitle:cfg.title,rows:rows.filter(r=>r!==money),total:money||['任务状态','已完成']},true);
  }
  function cutscene(){
    mount('game-ui-aerial-map',document.querySelector('.aerial-map')).innerHTML=radar.overview();
  }
  function selectWheel(id,locked){
    candidate=id;
    wheel.querySelectorAll('[data-character]').forEach(el=>{
      el.setAttribute('aria-selected',String(el.dataset.character===id));
      const unavailable=api&&api.isLocked(el.dataset.character);
      el.setAttribute('aria-disabled',String(!!unavailable));
    });
    const c=api?.getState().characters.find(c=>c.id===id);
    byId('game-ui-wheel-character-name').textContent=(c?.name||'')+(locked?' · 不可用':'');
  }
  function sync(state,elapsed,duration){
    if(!state.node)return;
    const text=byId('mission-objective').textContent||state.node.objective||'';
    const key=text;
    if(lastObjective!==key){
      lastObjective=key;
      const p=data.presets.objective.find(p=>p.node===state.nodeId&&text.includes(p.highlight));
      const target=p?.highlight||['安春晓','皇帝御驾','小车暗格','装甲车','紫禁城','财物','包围','支援','钮祜禄'].find(w=>text.includes(w));
      const at=target?text.indexOf(target):-1;
      objective.innerHTML='<p>'+(at<0?esc(text):esc(text.slice(0,at))+'<span>'+esc(target)+'</span>'+esc(text.slice(at+target.length)))+'</p>';
    }
    const speech=byId('dialogue-text').textContent.trim();
    objective.hidden=!!state.node.completeUI||state.wheelOpen||state.menuOpen||state.cutsceneBusy||state.weaponWheelOpen||!state.weaponReady||!!speech;
    byId('dialogue').hidden=state.wheelOpen||state.menuOpen||state.cutsceneBusy||state.weaponWheelOpen;
    radio.hidden=!byId('dialogue').classList.contains('radio')||state.nodeId!=='DRIVE_FM'||state.menuOpen||state.wheelOpen;
    game.classList.toggle('game-ui-system-visible',byId('sys-modal').classList.contains('show'));
    const rage=(state.node.hud||[]).find(r=>r.label==='怒气');
    radar.update({nodeId:state.nodeId,elapsed,duration,finished:state.videoFinished,flags:state.flags,ability:rage?parseFloat(rage.value):100});
    if(state.menuOpen&&!byId('pause-menu').classList.contains('hidden')){
      pauseMap.innerHTML='<div class="game-ui-pause-tabs"><span>地图</span><span>皇城劫案</span></div>'+radar.overview();
      document.querySelector('.pause-intro').textContent=text;
      const select=byId('game-progress');
      if(!progressBuilt){
        for(const [i,n] of api.progressNodes().entries()){
          const option=document.createElement('option');option.value=n.id;option.textContent=String(i+1).padStart(2,'0')+' '+n.label+(n.missing?'（缺少视频）':'');select.appendChild(option);
        }
        progressBuilt=true;
      }
      if(document.activeElement!==select)select.value=state.nodeId;
    }
  }
  function bind(callbacks){
    api=callbacks;toolbar.hidden=true;
    byId('money').addEventListener('contextmenu',e=>{
      e.preventDefault();if(!api.openTransient('game-ui-cash-editor'))return;
      cashEditor.hidden=false;byId('cash-display-value').value=String(cashOverride??api.getState().flags.money);byId('cash-display-value').focus();
    });
    cashEditor.addEventListener('submit',e=>{
      e.preventDefault();const raw=byId('cash-display-value').value.trim(),n=Number(raw);
      if(!raw||!Number.isSafeInteger(n)||n<0||n>9999999999){byId('cash-display-error').textContent='请输入 0～9,999,999,999 的整数。';return;}
      cashOverride=n;money(api.getState().flags.money);api.closeTransient();
    });
    byId('restore-cash-display').addEventListener('click',()=>{cashOverride=null;money(api.getState().flags.money);api.closeTransient();});
    byId('cancel-cash-display').addEventListener('click',()=>api.closeTransient());
    byId('jump-progress').addEventListener('click',()=>api.jumpProgress(byId('game-progress').value));
    const indices=id=>api.getState().characters.findIndex(c=>c.id===id);
    function hover(id){
      const state=api.getState();if(!state.wheelOpen)return;
      if(candidate!==id)changed=true;
      api.hover(indices(id));
    }
    wheel.addEventListener('click',e=>{const el=e.target.closest('[data-character]');if(el){e.stopPropagation();api.choose(indices(el.dataset.character));}});
    wheel.addEventListener('pointermove',e=>{
      const rect=wheel.getBoundingClientRect(),dx=e.clientX-rect.left-rect.width/2,dy=e.clientY-rect.top-rect.height/2;
      if(Math.hypot(dx,dy)<rect.width*.08)return;
      if(Math.abs(dx)>=Math.abs(dy))hover(dx<0?'anchunxiao':'nianzhuohua');else if(dy>0)hover('niuhulu');
    });
    document.addEventListener('keydown',e=>{
      const state=api.getState();if(e.repeat||e.ctrlKey||e.metaKey||e.target.closest?.('input,select,textarea,[contenteditable]'))return;
      if(e.key==='Alt'){changed=false;return;}
      if(state.wheelOpen){
        const id={ArrowLeft:'anchunxiao',ArrowRight:'nianzhuohua',ArrowDown:'niuhulu'}[e.code];
        if(id){e.preventDefault();changed=true;hover(id);}return;
      }
      if(e.code==='KeyH'&&state.mode==='playing'&&!state.menuOpen&&!state.weaponWheelOpen&&!state.node?.completeUI){e.preventDefault();game.classList.toggle('show-test-tools');}
    });
    document.addEventListener('keyup',e=>{
      if(e.key==='Alt'&&api.getState().wheelOpen&&changed){changed=false;api.choose(indices(candidate));}
    });
    window.addEventListener('blur',()=>{changed=false;});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)changed=false;});
    document.addEventListener('pointermove',e=>{
      if(e.clientY<64&&Math.abs(e.clientX-window.innerWidth/2)<260&&api.getState().mode==='playing'&&!api.getState().menuOpen)revealToolbar(2500);
    });
    toolbar.addEventListener('focusin',()=>revealToolbar(4000));
  }
  window.QingGameHUD={bind,enter,reset,wanted,money,closeTransient,ammo:updateAmmo,missionBanner,eventCopy,event,vehicle,result,cutscene,selectWheel,sync};
})();
