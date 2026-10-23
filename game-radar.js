"use strict";
// Continuous navigation geometry and route rendering.
window.createQingGameRadar=function(mount){
  const D=window.QingRadarData,clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),clone=v=>JSON.parse(JSON.stringify(v));
  const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const length=ps=>ps.reduce((sum,p,i)=>i?sum+Math.hypot(p[0]-ps[i-1][0],p[1]-ps[i-1][1]):0,0);
  let state={},groupCache={},saved={},lastKey='';
  try{saved=JSON.parse(localStorage.getItem('qing-radar-markers-v2')||'{}')||{};}catch(_){}
  const graph={};Object.keys(D.points).forEach(k=>graph[k]=[]);
  D.roads.forEach(r=>r.chain.forEach((k,i)=>{if(!i)return;const a=r.chain[i-1],b=k,w=Math.hypot(D.points[a][0]-D.points[b][0],D.points[a][1]-D.points[b][1]);graph[a].push([b,w]);graph[b].push([a,w]);}));
  function pathBetween(start,end){
    const dist={[start]:0},prev={},todo=new Set(Object.keys(graph));
    while(todo.size){const u=[...todo].filter(k=>Number.isFinite(dist[k])).sort((a,b)=>dist[a]-dist[b])[0];if(!u)break;todo.delete(u);if(u===end)break;
      graph[u].forEach(([v,w])=>{if(todo.has(v)&&(!Number.isFinite(dist[v])||dist[u]+w<dist[v])){dist[v]=dist[u]+w;prev[v]=u;}});
    }
    if(!Number.isFinite(dist[end]))throw Error('Disconnected road: '+start+' / '+end);
    const route=[end];while(route[0]!==start)route.unshift(prev[route[0]]);return route.map(k=>D.points[k].slice());
  }
  function through(ids){return ids.reduce((route,id,i)=>i?route.concat(pathBetween(ids[i-1],id).slice(1)):[D.points[id].slice()],[]);}
  function pointAt(ps,d){
    if(!ps.length)return [state.x,state.y];
    for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],n=Math.hypot(b[0]-a[0],b[1]-a[1]);if(d<=n){const t=n?d/n:0;return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}d-=n;}
    return ps[ps.length-1].slice();
  }
  function nearest(ps,x=state.x,y=state.y){
    let best={off:Infinity,progress:0,next:1,x,y},prefix=0;
    for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy);if(!n)continue;
      const t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(n*n),0,1),px=a[0]+dx*t,py=a[1]+dy*t,off=Math.hypot(x-px,y-py),progress=prefix+n*t;
      if(off<best.off-1e-8||(Math.abs(off-best.off)<1e-8&&progress>best.progress))best={off,progress,next:i,x:px,y:py};prefix+=n;
    }return best;
  }
  function baseFor(group){
    const key=group.markerKey;
    if(!groupCache[key]){
      const candidate=saved['group:'+key]||(!group.corridor&&saved[group.base]);
      groupCache[key]=validMarkers(candidate)?clone(candidate):clone(group.defaults);
      // Move the previous untouched off-road default; keep hand-placed markers.
      if(group.corridor)groupCache[key].friends.forEach((p,i)=>{
        if((p.id==='anchunxiao'||(!p.id&&i===0))&&Math.abs(p.x-283)<.01&&Math.abs(p.y-337)<.01){
          const current=D.corridor.friends.find(f=>f.id==='anchunxiao');p.x=current.x;p.y=current.y;
        }
        if((p.id==='niuhulu'||(!p.id&&i===1))&&Math.abs(p.x-283)<.01&&Math.abs(p.y-231)<.01){
          const current=D.corridor.friends.find(f=>f.id==='niuhulu');p.x=current.x;p.y=current.y;
        }
      });
    }
    return groupCache[key];
  }
  function validMarkers(raw){return raw&&Array.isArray(raw.friends)&&Array.isArray(raw.enemies)&&[...raw.friends,...raw.enemies].every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=-D.size&&p.x<=D.size*2&&p.y>=-D.size&&p.y<=D.size*2&&(!p.via||(Array.isArray(p.via)&&p.via.every(k=>Object.hasOwn(D.points,k)))))&&raw.friends.length<=2&&raw.enemies.length<=40;}
  const durations={};
  for(const [id,c] of Object.entries((window.GAME_PREVIEW||{}).scenes||{}))if(id!=='ROADBLOCK')durations[id]=c.durationMs/1000;
  const sequence=window.createQingRadarSequence(D,{pathBetween,through,pointAt,length},durations);
  function project(p,overview=false){
    if(overview)return p;
    const angle=(18-(state.follow?(state.cameraRot??state.rot):0))*Math.PI/180,dx=p[0]-state.x,dy=p[1]-state.y;
    const x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle),depth=Math.max(.32,1-y*state.zoom*.004);
    return [100+x*state.zoom/depth,106+y*state.zoom*.65/depth];
  }
  const number=n=>Number(n.toFixed(3));
  function polygon(ps,fill,overview,attrs=''){return '<path d="'+ps.map((p,i)=>{const q=project(p,overview);return (i?'L':'M')+number(q[0])+','+number(q[1]);}).join('')+'Z" fill="'+fill+'" '+attrs+'/>';}
  function roadShapes(road,width,overview){
    const ps=road.chain.map(k=>D.points[k]),shapes=[];
    for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],n=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/n*width/2,ny=(b[0]-a[0])/n*width/2;
      shapes.push(polygon([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]],'#888',overview));}
    ps.forEach(p=>shapes.push(polygon(Array.from({length:12},(_,i)=>[p[0]+Math.cos(i*Math.PI/6)*width/2,p[1]+Math.sin(i*Math.PI/6)*width/2]),'#888',overview)));
    return shapes.join('');
  }
  function corridorTerrain(overview){
    const C=D.corridor,half=C.width/2;
    // Sample long road boundaries under perspective, using one filled shape
    // so the road stays aligned without seams between segments.
    const strip=(x,y,w,h,fill)=>{
      const levels=[y];for(let top=y+20;top<y+h;top+=20)levels.push(top);levels.push(y+h);
      return polygon([...levels.map(top=>[x,top]),...levels.slice().reverse().map(top=>[x+w,top])],fill,overview);
    };
    let out='<rect x="-900" y="-900" width="2200" height="2200" fill="#393837"/>';
    C.compounds.forEach((p,i)=>out+=polygon(p,['#4b4844','#504b46','#45433f'][i%3],overview));
    C.courts.forEach(p=>out+=polygon(p,'#363431',overview));
    [[159,30,4,480],[358,30,4,480]].forEach(([x,y,w,h])=>out+=strip(x,y,w,h,'#6a665f'));
    const branch=width=>polygon([[C.leftRoadEnd[0],C.junction[1]-width/2],[C.center,C.junction[1]-width/2],[C.center,C.junction[1]+width/2],[C.leftRoadEnd[0],C.junction[1]+width/2]],'#a29f96',overview,'class="corridor-left-road"');
    out+='<g class="radar-road-edge">'+strip(C.center-half-.45,25,C.width+.9,490,'#676762')+branch(C.width+.9)+'</g>';
    out+='<g class="radar-road-surface corridor-road" data-road-width="'+C.width+'">'+strip(C.center-half,25,C.width,490,'#a29f96')+branch(C.width)+'</g>';
    // A gate leaves the driving line open; it does not turn the route sideways.
    [[C.center-half-12,265,11,5],[C.center+half+1,265,11,5]].forEach(([x,y,w,h])=>out+=polygon([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],'#b4afa1',overview));
    return out;
  }
  function landmarkSVG(mark,overview){
    let content='',x=mark.x,y=mark.y;
    const scale=mark.id==='watermelon'?.55:D.corridor.width/18;
    const local=(px,py)=>[x+(px-x)*scale,y+(py-y)*scale];
    const shape=(points,fill)=>polygon(points.map(p=>local(...p)),fill,overview);
    const smallDot=(px,py,r,fill)=>{const p=project(local(px,py),overview);return `<circle cx="${p[0]}" cy="${p[1]}" r="${r*.8}" fill="${fill}" stroke="#222" stroke-width=".4"/>`;};
    if(mark.id==='watermelon'){
      if(mark.phase==='intact'){
        content+=shape([[x-4,y-3],[x+4,y-3],[x+4,y+2],[x-4,y+2]],'#bca481');
        content+=shape([[x-5,y-4],[x+5,y-4],[x+4,y-1],[x-4,y-1]],'#87a453');
        content+=shape([[x-4,y+2],[x-3,y+2],[x-3,y+4],[x-4,y+4]],'#d4c6aa')+shape([[x+3,y+2],[x+4,y+2],[x+4,y+4],[x+3,y+4]],'#d4c6aa');
        [-2.5,0,2.5].forEach(dx=>content+=smallDot(x+dx,y,overview?.8:1.15,'#589651'));
        // A fixed-size slice stays legible as a minimap POI, even in the distance.
        const p=project([x,y],overview);
        content+=`<g class="map-stall-poi" transform="translate(${p[0]} ${p[1]-4}) scale(${overview?.75:1})" stroke-linejoin="round"><path d="M-8-4H8A8 8 0 0 1-8-4Z" fill="#69a65b" stroke="#171717" stroke-width="2.8"/><path d="M-8-4H8A8 8 0 0 1-8-4Z" fill="none" stroke="#f4f0e4" stroke-width=".8"/><path d="M-6-3.2H6A6 6 0 0 1-6-3.2Z" fill="#f0e6bf"/><path class="map-melon-flesh" d="M-5.2-2.6H5.2A5.2 5.2 0 0 1-5.2-2.6Z" fill="#df766c"/><g fill="#302c28"><ellipse cx="-2.8" cy="-1.2" rx=".55" ry=".95" transform="rotate(-28 -2.8 -1.2)"/><ellipse cx="0" cy=".2" rx=".55" ry=".95"/><ellipse cx="2.8" cy="-1.2" rx=".55" ry=".95" transform="rotate(28 2.8 -1.2)"/></g></g>`;
      }else{
        content+=shape([[x-5,y+2],[x+2,y+4],[x+2,y+5],[x-5,y+3]],'#938e7f');
        content+=shape([[x+1,y-4],[x+2,y-4],[x+5,y+2],[x+4,y+3]],'#b0a48b');
        const spread=clamp(Math.max(0,mark.since),0,2)*1.5;
        [[-3,-2],[2,3],[4,-2],[-1,5]].forEach(([dx,dy],i)=>content+=smallDot(x+dx+(i%2?spread:-spread),y+dy,overview?.8:1.15,'#75a25b'));
      }
    }else{
      if(mark.phase==='intact'){
        content+=shape([[x-9,y-1],[x+9,y-1],[x+9,y+1],[x-9,y+1]],'#e0ded2');
        for(let dx=-8;dx<8;dx+=4)content+=shape([[x+dx,y-1],[x+dx+2,y-1],[x+dx+1,y+1],[x+dx-1,y+1]],'#4c4941');
        [-8,8].forEach(dx=>content+=shape([[x+dx-1,y-2],[x+dx+1,y-2],[x+dx+1,y+3],[x+dx-1,y+3]],'#c1b492'));
      }else{
        content+=shape([[x-10,y-4],[x-8,y-5],[x-5,y-1],[x-7,y]],'#bdb8a9');
        content+=shape([[x+5,y],[x+7,y-1],[x+11,y+3],[x+9,y+4]],'#c6c0ae');
        content+=shape([[x-5,y+4],[x,y+5],[x,y+6],[x-5,y+5]],'#908a7d');
      }
    }
    if(mark.phase==='hit'){
      const lines=[];for(let i=0;i<8;i++){const a=i*Math.PI/4,p=project([x+Math.cos(a)*6,y+Math.sin(a)*6],overview),q=project([x+Math.cos(a)*10,y+Math.sin(a)*10],overview);lines.push('M'+p.join(',')+'L'+q.join(','));}
      content+='<path class="map-impact-rays" d="'+lines.join('')+'" fill="none" stroke="#f2c858" stroke-width="1.4"/>';
    }
    return `<g class="map-${mark.id}-marker" data-phase="${mark.phase}" aria-label="${mark.name}${mark.phase==='intact'?'位置':mark.phase==='hit'?'正在撞击':'已撞毁'}">${content}</g>`;
  }
  function terrain(overview){
    if(state.mapKind==='corridor')return corridorTerrain(overview);
    let out='<rect x="-900" y="-900" width="2200" height="2200" fill="#393837"/>';
    out+=polygon(D.garden,'#43483f',overview)+polygon(D.pond,'#454f51',overview);
    D.blocks.forEach((p,i)=>{out+=polygon(p,['#494746','#4d4b48','#454342','#514d49'][i%4],overview);});
    D.courts.forEach(p=>{out+=polygon(p,'#363534',overview);});
    // Draw the entire edge network first, then road surfaces. No lane or centre lines.
    out+='<g class="radar-road-edge">'+D.roads.filter(r=>!r.indoor).map(r=>roadShapes(r,r.width+.9,overview)).join('')+'</g>';
    out+='<g class="radar-road-surface">'+D.roads.filter(r=>!r.indoor).map(r=>roadShapes(r,r.width,overview)).join('')+'</g>';
    out+=polygon(D.hall,'#79766e',overview,'class="radar-vault-floor"');
    // Treasury pillars and three groups of silver chests, based on the scene brief.
    [[225,252],[255,252],[225,263],[255,263],[225,277],[255,277]].forEach(([x,y])=>{out+=polygon([[x+99,y+49],[x+101,y+49],[x+101,y+51],[x+99,y+51]],'#b0aaa0',overview);});
    [[[224,281],[232,281],[232,284],[224,284]],[[246,279],[255,279],[255,282],[246,282]],[[225,247],[231,247],[231,249],[225,249]]].forEach(p=>out+=polygon(p.map(([x,y])=>[x+100,y+50]),'#55524b',overview));
    return out;
  }
  function currentRoute(){
    if(!state.goal||state.phase!=='active'||!state.route.length)return [];
    const p=nearest(state.route);return [[p.x,p.y],...state.route.slice(p.next)];
  }
  function svg(overview=false,editing=false){
    let content=terrain(overview),path=currentRoute();
    if(path.length>1)content+='<polyline class="map-route" points="'+path.map(p=>project(p,overview).map(number).join(',')).join(' ')+'" style="stroke-width:'+(overview?2.6:2.1)+'"/>';
    const dot=(p,fill,cls,r,attrs='')=>{const q=project([p.x,p.y],overview);return `<circle class="${cls}" cx="${number(q[0])}" cy="${number(q[1])}" r="${r}" fill="${fill}" stroke="#151515" stroke-width="${overview?.8:.8}" ${attrs}/>`;};
    if(state.mapKind!=='corridor')(state.config.events||[]).forEach(([x,y,label])=>content+=dot({x,y},'#ededed','map-event-blip',overview?3.2:2.5,`aria-label="${esc(label)}"`));
    (state.landmarks||[]).forEach(mark=>content+=landmarkSVG(mark,overview));
    if(state.armoredVehicle){
      const p=project(state.armoredVehicle,overview);
      content+=`<g class="map-armored-vehicle" transform="translate(${p[0]} ${p[1]}) scale(${overview?.65:.8})" aria-label="装甲车位置" fill="#e8e6dc" stroke="#171717" stroke-width="1.2" stroke-linejoin="round"><path d="M-5-8H5L6-4V7L4 9H-4L-6 7V-4Z"/><path d="M-7-4H-5V1H-7ZM5-4H7V1H5ZM-7 4H-5V8H-7ZM5 4H7V8H5Z" fill="#5a5955"/><path d="M-3-5H3V-1H-3Z" fill="#777b7a"/><circle cy="3" r="2.4" fill="#bab8ae"/><path d="M-.6 2V-5H.6V2Z"/></g>`;
    }
    (state.civilians||[]).forEach(p=>content+=dot(p,'#eee9df','map-civilian-blip',overview?2:1.65,`aria-label="${esc(p.name)}"`));
    if(state.goal&&state.phase==='active')content+=dot({x:state.goal[0],y:state.goal[1]},'#f4d35b','map-target',overview?3.6:3.3,(editing?'':'id="map-target" ')+'data-phase="active"');
    state.enemies.forEach((p,i)=>content+=dot(p,'#de4548','map-enemy-blip',overview?2.6:2.15,`data-marker="enemies" data-index="${i}" aria-label="敌人 ${i+1}"`));
    const friendBlips=state.friends.map((p,i)=>(!p.hidden||editing)?dot(p,'#67a9e6','map-friend-blip',overview?2.8:2.35,`data-marker="friends" data-index="${i}" data-person="${esc(p.id||i)}" aria-label="${esc(p.name||('同伴 '+(i+1)))}"`):'').join('');
    if(state.mapKind!=='corridor')content+=friendBlips;
    if(state.config.vehicle&&state.mapKind!=='corridor'){const p=project(state.config.vehicle,overview);content+=`<g transform="translate(${p.join(' ')}) scale(${overview?.6:.65})" fill="#eee" stroke="#151515" stroke-width="1.2"><path d="M-6-3H6L8 0V4H-8V0Z"/><path d="M-4-6H4L6-3H-6Z"/></g>`;}
    const pos=project([state.x,state.y],overview),ahead=project([state.x+Math.sin(state.rot*Math.PI/180),state.y-Math.cos(state.rot*Math.PI/180)],overview),angle=Math.atan2(ahead[0]-pos[0],pos[1]-ahead[1])*180/Math.PI;
    content+=`<path class="map-player" d="M0-5.5 4.1 4.2 0 2.6-4.1 4.2Z" transform="translate(${pos.join(' ')}) rotate(${angle}) scale(${overview?.9:1})"/>`;
    if(state.mapKind==='corridor')content+=friendBlips;
    if(state.goal&&state.phase==='arrived')content+=dot({x:state.goal[0],y:state.goal[1]},'#66c879','map-target',overview?3.6:3.3,(editing?'':'id="map-target" ')+'data-phase="arrived"');
    if(!overview)content+=navigationHUD();
    if(overview&&!editing)content=`<g transform="translate(${D.size/2} ${D.size/2}) scale(${state.overviewZoom}) translate(${-D.size/2} ${-D.size/2})">${content}</g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" class="map-svg ${overview?'radar-overview':'radar-perspective'}" viewBox="0 0 ${overview?(D.size+' '+D.size):'200 145'}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${esc(state.entry.label)}地图">${content}</svg>`;
  }
  function navigationHUD(){
    const north=project([state.x,state.y-10]),bearing=Math.atan2(north[0]-100,106-north[1])*180/Math.PI;
    let out=`<g transform="translate(10 129)"><circle r="6.5" fill="#101010"/><path d="M0-9-1.8-6.8H1.8Z" fill="#ddd" transform="rotate(${bearing})"/><text class="map-compass-letter" x="0" y="3.7">N</text></g>`;
    const d=metres();if(d===null)return out;
    if(d>0){const goal=project(state.goal),angle=Math.atan2(goal[0]-100,106-goal[1])*180/Math.PI-45;out+='<path class="map-nav-arrow" d="M-4 3 2-3H-2V-5H6V3H4V-1L-2 5Z" transform="translate(25 131) rotate('+angle+')"/>';}
    const value=d>=1000?(d/1000).toFixed(2):d,unit=d>=1000?'km':'m';
    return out+`<text id="map-distance" class="map-distance" x="35" y="138" aria-label="距离目的地 ${d} 米">${value}<tspan class="map-distance-unit">${unit}</tspan></text>`;
  }
  function metres(){if(!state.goal)return null;if(state.phase!=='active')return 0;const p=nearest(state.route);return Math.max(0,Math.ceil((p.off+state.units-p.progress)*state.metresPerUnit-1e-7));}

  function bars(flags,ability){
    return '<svg class="bar-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 12"><rect width="310" height="12" fill="#141414"/>'+[[2,150,flags.health,'#81a669'],[155,77,flags.armor,'#6fa0b3'],[235,73,ability,'#b8a666']].map(([x,w,v,c])=>`<rect x="${x}" y="3" width="${w}" height="6" fill="#505050"/><rect x="${x}" y="3" width="${w*clamp(v||0,0,100)/100}" height="6" fill="${c}"/>`).join('')+'</svg>';
  }
  function interpolate(t,stops){
    for(let i=1;i<stops.length;i++){const a=stops[i-1],b=stops[i];if(t<=b[0])return a[1]+(b[1]-a[1])*clamp((t-a[0])/(b[0]-a[0]),0,1);}
    return stops[stops.length-1][1];
  }
  function update(input){
    if(input.nodeId==='RESULT'){mount.hidden=true;return;}
    mount.hidden=false;
    const key=[input.nodeId,Math.floor(input.elapsed/100),input.duration,input.finished,input.flags.health,input.flags.armor,input.ability].join('|');
    if(key===lastKey)return;lastKey=key;
    let entry=sequence.entries.find(n=>n.id===input.nodeId),time;
    if(!entry){entry=sequence.entries[sequence.entries.length-1];time=sequence.total;}
    else{
      const duration=Math.max(1,input.duration),t=clamp(input.finished?duration:input.elapsed,0,duration),end=entry.end-.000001;
      time=entry.start+(end-entry.start)*t/duration;
      if(input.nodeId==='CARJACK'&&t<6000){const approach=sequence.entries.find(n=>n.id==='APPROACH_CAR');time=approach.start+(approach.end-approach.start-.000001)*t/6000;}
      if(input.nodeId==='ROADBLOCK'){
        const groupEnd=entry.group.end-.000001;
        time=interpolate(t,[[0,entry.start],[duration*4/22,sequence.events.barrierHit],[duration*15/22,sequence.events.boardStart],[duration*16.8/22,sequence.events.boardedAt],[duration,groupEnd]]);
      }
      if(input.nodeId==='WATERMELON')time=interpolate(t,[[0,entry.start],[duration*.7,entry.start],[duration*18.2/22,sequence.events.stallHit],[duration,end]]);
    }
    const current=sequence.locate(time),frame=sequence.sample(time,baseFor(current.group));
    state={...frame,config:D.scenes[current.id],zoom:1.65,follow:true,overviewZoom:1,metresPerUnit:8};
    mount.innerHTML='<section class="mini-map">'+svg()+bars(input.flags,input.ability)+'</section>';
    Object.assign(mount.dataset,{scene:current.id,group:current.group.id,mapKind:state.mapKind||'palace',distance:String(metres()??''),position:state.x.toFixed(2)+','+state.y.toFixed(2),passengerBoarded:String(!!state.passengerBoarded),crewBoarded:String(!!state.crewBoarded)});
  }
  return {update,sequence,overview:()=>state.entry?svg(true):''};
};
