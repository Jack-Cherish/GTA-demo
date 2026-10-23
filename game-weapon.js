"use strict";
// Eight-sector equipment selection with vector weapon artwork.
(function(){
  const game=document.getElementById('game'),hud=document.getElementById('hud');
  const panel=document.createElement('section');panel.id='game-weapon-panel';panel.hidden=true;
  panel.setAttribute('role','dialog');panel.setAttribute('aria-label','选择微型冲锋枪');hud.appendChild(panel);
  const slots=[['pistol','手枪'],['smg','微型冲锋枪'],['rifle','步枪'],['shotgun','霰弹枪'],['pin','近战武器'],['fist','徒手'],['minigun','重型武器'],['grenade','投掷武器']];
  let api=null;
  const point=(radius,angle)=>[320+Math.sin(angle)*radius,320-Math.cos(angle)*radius];
  function sector(i){const a=i*Math.PI/4-Math.PI/8,b=a+Math.PI/4;return `M320 320L${point(276,a)}A276,276 0 0 1 ${point(276,b)}Z`;}
  function band(i){const a=i*Math.PI/4-Math.PI/8,b=a+Math.PI/4;return `M${point(276,a)}A276,276 0 0 1 ${point(276,b)}L${point(206,b)}A206,206 0 0 0 ${point(206,a)}Z`;}
  function show(clip,reserve){
    let svg='<svg xmlns="http://www.w3.org/2000/svg" class="weapon-disc" viewBox="0 0 640 640" role="img" aria-label="微型冲锋枪，备用 '+reserve+' 发，弹匣 '+clip+' 发"><circle class="weapon-base" cx="320" cy="320" r="276"/>';
    slots.forEach(([icon,name],i)=>{
      const p=point(219,i*Math.PI/4),width=[133,159,171,177,144,130,244,117][i],height=width/2;
      svg+='<g data-weapon="'+icon+'" class="game-weapon-slot '+(i===1?'is-available':'is-unavailable')+'" role="button" aria-label="'+name+(i===1?'':'，未持有')+'" aria-disabled="'+(i!==1)+'"><path class="weapon-sector '+(i===1?'is-selected':'')+'" d="'+sector(i)+'"/>';
      if(i===1)svg+='<path class="weapon-selection-band" d="'+band(i)+'"/>';
      svg+='<g transform="translate('+(p[0]-width/2)+' '+(p[1]-height/2-6)+')">'+window.QingWeaponArt(icon,'width="'+width+'" height="'+height+'"')+'</g>';
      if(i===1)svg+='<text class="weapon-counter" x="'+p[0]+'" y="'+(p[1]+height/2+18)+'">'+reserve+'<tspan class="weapon-counter-clip"> / '+clip+'</tspan></text>';
      svg+='</g>';
    });
    slots.forEach((_,i)=>{const a=i*Math.PI/4-Math.PI/8;svg+='<path class="weapon-divider" d="M'+point(132,a)+'L'+point(276,a)+'"/>';});
    svg+='<circle class="weapon-boundary" cx="320" cy="320" r="276"/><path class="weapon-selection-edge" d="M'+point(276,Math.PI/8)+'A276,276 0 0 1 '+point(276,3*Math.PI/8)+'"/><text class="weapon-label" x="320" y="230">微型冲锋枪</text><text class="weapon-label weapon-caption" x="320" y="260">1 / 1</text><text class="weapon-label weapon-attachment" x="320" y="290">标准弹匣</text></svg>';
    panel.innerHTML=svg+'<div class="weapon-ammo">'+reserve+'<small>'+clip+'</small></div><section class="weapon-stats">'+[4,9,4,3].map((v,i)=>'<div class="weapon-stat-row">'+['伤害','攻击速度','精准度','射程'][i]+'<div class="weapon-stat-track"><span style="width:'+v*10+'%"></span><i></i><i></i><i></i></div></div>').join('')+'</section><p class="game-weapon-confirm">松开 <kbd>Tab</kbd> 装备　／　点击微型冲锋枪</p>';
    panel.hidden=false;game.classList.add('equipment-selecting');
  }
  function hide(){panel.hidden=true;game.classList.remove('equipment-selecting');}
  panel.addEventListener('click',e=>{const slot=e.target.closest('[data-weapon]');if(slot?.dataset.weapon==='smg'){e.stopPropagation();api?.choose('smg');}});
  window.QingGameWeapon={show,hide,bind:callbacks=>{api=callbacks;}};
})();
