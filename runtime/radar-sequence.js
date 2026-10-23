"use strict";
window.createQingRadarSequence=function(D,geometry,durations={}){
  const {pathBetween,through,pointAt,length}=geometry,C=D.corridor;
  const clone=v=>JSON.parse(JSON.stringify(v)),clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const groups=[
    {id:'treasury',label:'国库抢劫与三人分头撤离',base:'HEIST_INTRO',nodes:[
      {id:'HEIST_INTRO',label:'装财物 / 左右巡逻',seconds:8,at:'vaultHall'},
      {id:'HEIST_GRAB',label:'警报 / 两名同伴向两边走',seconds:8,at:'vaultHall'},
      {id:'AERIAL_SPLIT',label:'沿直路离开国库',seconds:10,from:'vaultHall',to:'axisMid'}]},
    {id:'alley',label:'延禧宫夹道撤离与交火',base:'CART_ALLEY',nodes:[
      {id:'CART_ALLEY',label:'沿夹道前进',seconds:8,from:'alleyStart',to:'alleyFight'},
      {id:'SHOOT',label:'夹道交火',seconds:8,at:'alleyFight'},
      {id:'SWITCH_NZH',label:'请求年灼华支援',seconds:3,at:'alleyFight'}]},
    {id:'garden',label:'御花园接近与夺取御驾',base:'APPROACH_CAR',nodes:[
      {id:'APPROACH_CAR',label:'沿直路接近御驾',seconds:6,from:'gardenStart',to:'car'},
      {id:'CARJACK',label:'夺取御驾',seconds:5,at:'car'}]},
    {id:'drive',label:'宫道行驶与右侧瓜摊',base:'DRIVE_FM',corridor:true,nodes:[
      {id:'DRIVE_FM',label:'沿直线宫道前进',seconds:10,frames:[[0,260,480],[1,260,435]]},
      {id:'WATERMELON',label:'靠右撞瓜摊 / 继续前进',seconds:6,frames:[[0,260,435],[.23,261.64,420],[.4,264.1,409],[.43,263.61,410.6],[.62,260.82,397],[1,260,379]]}]},
    {id:'jingren',label:'撞路障与接应安春晓',base:'ROADBLOCK',corridor:true,nodes:[
      {id:'ROADBLOCK',label:'撞开路障',seconds:6,frames:[[0,260,379],[.25,260,360],[.29,260,361.6],[.55,260,347],[1,260,337]]},
      {id:'PICKUP_ANCHUNXIAO',label:'安春晓从右侧上车',seconds:8,frames:[[0,260,337],[1,260,337]]},
      {id:'LEAVE_PICKUP',label:'接人后沿原路继续前进',seconds:6,frames:[[0,260,337],[1,260,295]]}]},
    {id:'westgate',label:'左侧会合与装甲车左转',base:'WESTGATE',corridor:true,nodes:[
      {id:'SWITCH_NHL',label:'继续前进 / 钮祜禄接应',seconds:3,frames:[[0,260,295],[1,260,278]]},
      {id:'WESTGATE',label:'沿宫道接近左岔路口',seconds:6,frames:[[0,260,278],[1,...C.armored]]},
      {id:'SWITCH_TO_INSURGENT',label:'左侧会合 / 换装甲车向左驶离',seconds:6}]}
  ];
  let cursor=0;const entries=[];
  groups.forEach((g,gi)=>{
    g.index=gi;g.start=cursor;g.markerKey=g.corridor?C.markerKey:g.id;
    g.defaults=g.corridor?{friends:clone(C.friends),enemies:clone(C.guards)}:{friends:clone(D.scenes[g.base].friends),enemies:clone(D.scenes[g.base].enemies)};
    g.nodes.forEach(n=>{
      const seconds=Number(durations[n.id]);n.duration=Number.isFinite(seconds)&&seconds>=2&&seconds<=300?seconds:n.seconds;
      if(n.id==='SWITCH_TO_INSURGENT'){
        const arrival=1-1/n.duration,hold=Math.min(.55,arrival-.08),radius=3;
        const route=[C.armored.slice(),[C.center,C.junction[1]+radius]];
        for(let i=1;i<=6;i++){const a=i*Math.PI/12;route.push([C.center-radius+radius*Math.cos(a),C.junction[1]+radius-radius*Math.sin(a)]);}
        route.push(C.end.slice());
        const units=length(route);let progress=0;n.departFraction=hold;
        n.frames=[[0,...C.armored],[hold,...C.armored]];
        route.forEach((p,i)=>{if(i){progress+=Math.hypot(p[0]-route[i-1][0],p[1]-route[i-1][1]);n.frames.push([hold+(arrival-hold)*progress/units,...p]);}});
        n.frames.push([1,...C.end]);
      }
      n.start=cursor;n.end=cursor+n.duration;n.index=entries.length;n.group=g;
      n.route=n.from?pathBetween(n.from,n.to):n.travel?through(n.travel):[];n.units=length(n.route);n.arrival=n.to?Math.min(1,n.duration*.2):0;n.holdTime=0;n.moveTime=Math.max(.01,n.duration-n.arrival);cursor=n.end;entries.push(n);
    });g.end=cursor;
  });
  const byId=id=>entries.find(n=>n.id===id),driveStart=byId('DRIVE_FM').start,last=entries[entries.length-1];
  const stallHit=byId('WATERMELON').start+byId('WATERMELON').duration*.4;
  const barrierHit=byId('ROADBLOCK').start+byId('ROADBLOCK').duration*.25;
  const boardStart=byId('PICKUP_ANCHUNXIAO').start,boardDuration=byId('PICKUP_ANCHUNXIAO').duration,boardedAt=boardStart+boardDuration*.67;
  const gatherDuration=Math.min(last.duration*.5,(last.duration-1)*.65),crewBoardedAt=last.start+gatherDuration,leftDeparture=last.start+last.duration*last.departFraction;
  function locate(time){return entries.find(n=>time<n.end-1e-8)||last;}
  function clocks(time){const n=locate(time);return {patrol:n.group.corridor?time-driveStart:time-n.group.start,split:n.group.id==='treasury'?Math.max(0,time-byId('HEIST_GRAB').start):0};}
  function keyed(frames,t){
    for(let i=1;i<frames.length;i++){const a=frames[i-1],b=frames[i];if(t<=b[0]){const f=clamp((t-a[0])/(b[0]-a[0]),0,1);return [a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}}
    return frames[frames.length-1].slice(1);
  }
  function player(n,time){
    const elapsed=clamp(time-n.start,0,n.duration),fraction=n.units?clamp(elapsed/n.moveTime,0,1):0;
    if(n.group.corridor){
      const t=elapsed/n.duration,pos=keyed(n.frames,t),before=keyed(n.frames,Math.max(0,t-.0001)),after=keyed(n.frames,Math.min(1,t+.0001));
      const forward=before[1]-after[1],dx=after[0]-before[0];
      if(n.id==='SWITCH_TO_INSURGENT'){
        const angle=Math.hypot(dx,forward)>1e-7?Math.atan2(dx,forward)*180/Math.PI:(time>=n.end-1?-90:0);
        return {pos,rot:angle,fraction:t,elapsed};
      }
      const angle=forward>1e-7?Math.atan2(dx,forward)*180/Math.PI:0;
      return {pos,rot:clamp(angle,-24,24),fraction:t,elapsed};
    }
    const pos=n.units?pointAt(n.route,n.units*fraction):D.points[n.at].slice();let rot=D.scenes[n.group.base].rot,headingRoute=n.route,headingDistance=n.units*fraction;
    for(let i=n.index-1;!n.units&&i>=0&&entries[i].group===n.group;i--){if(entries[i].units){headingRoute=entries[i].route;headingDistance=entries[i].units;break;}}
    if(headingRoute.length>1){const a=pointAt(headingRoute,Math.max(0,headingDistance-.02)),b=pointAt(headingRoute,Math.min(length(headingRoute),headingDistance+.02));rot=Math.atan2(b[0]-a[0],a[1]-b[1])*180/Math.PI;}
    return {pos,rot,fraction,elapsed};
  }
  function enemyDelta(g,i,clock){
    if(g.corridor){const phase=i*.81,a=2.1*(Math.sin(clock.patrol*.72+phase)-Math.sin(phase));return [a,(i%2?.5:-.5)*Math.sin(clock.patrol*.43)];}
    if(g.id!=='treasury')return [0,0];
    const phase=i*.73,period=5.8+(i%5)*.25,amount=(3.5+(i%3)*.5)*(Math.sin(clock.patrol*Math.PI*2/period+phase)-Math.sin(phase)),angle=18*Math.PI/180;
    return [Math.cos(angle)*amount,-Math.sin(angle)*amount];
  }
  function friendPose(n,i,time,clock,position,base){
    const g=n.group,original=g.defaults.friends[i];let delta=[0,0],hidden=false,id=base.id||original?.id;
    if(g.corridor){
      if(id==='anchunxiao'){
        const f=clamp((time-boardStart-boardDuration*.05)/(boardDuration*.55),0,1);delta=[-1.4*f,0];hidden=time>=boardedAt;
      }else if(id==='niuhulu'){
        const f=clamp((time-last.start)/(gatherDuration*.9),0,1);delta=[1.4*f,0];hidden=time<byId('SWITCH_NHL').start||time>=crewBoardedAt;
      }
    }else if(original){
      if(g.id==='treasury')delta=[(i===0?-1:1)*Math.min(95,clock.split*2.7),0];
      if(g.id==='alley'){const start=D.points[D.scenes[g.base].at];delta=[position[0]-start[0],position[1]-start[1]];}
    }
    return {delta,hidden,id,name:base.name||original?.name};
  }
  function landmarks(time){
    return [{id:'watermelon',name:'瓜摊',x:C.stall[0],y:C.stall[1],phase:time<stallHit?'intact':time<stallHit+.65?'hit':'destroyed',since:time-stallHit},
      {id:'roadblock',name:'路障',x:C.roadblock[0],y:C.roadblock[1],phase:time<barrierHit?'intact':time<barrierHit+.65?'hit':'destroyed',since:time-barrierHit}];
  }
  function sample(time,bases,actorClock){
    const n=locate(time),g=n.group,p=player(n,time),clock=actorClock||clocks(time);
    const friends=bases.friends.map((b,i)=>{const f=friendPose(n,i,time,clock,p.pos,b);return {...b,id:f.id,name:f.name,x:b.x+f.delta[0],y:b.y+f.delta[1],hidden:f.hidden};});
    const enemies=bases.enemies.map((b,i)=>{const d=enemyDelta(g,i,clock);return {...b,x:b.x+d[0],y:b.y+d[1]};});
    let goal=n.to?D.points[n.to].slice():null,route=n.route,phase=goal?(p.fraction>=1?'arrived':'active'):'gone',units=n.units,arrivalTime=n.to?n.end-n.arrival:null;
    if(!goal&&!n.units&&!g.corridor){for(let i=n.index-1;i>=0&&entries[i].group===g;i--){const previous=entries[i];if(previous.to){goal=D.points[previous.to].slice();route=previous.route;units=previous.units;break;}}}
    let extra={};
    if(g.corridor){
      route=C.navRoute;units=length(route);goal=C.end.slice();arrivalTime=last.end-1;
      phase=time>=last.end-1e-8?'gone':time>=arrivalTime?'arrived':'active';
      const civilians=C.civilians.map((b,i)=>({...b,x:b.x+1.5*Math.sin(clock.patrol*.48+i),y:b.y+.8*Math.sin(clock.patrol*.3+i*.7)}));
      extra={mapKind:'corridor',cameraRot:0,landmarks:landmarks(time),civilians,passengerBoarded:time>=boardedAt,crewBoarded:time>=crewBoardedAt,armoredVehicle:time<crewBoardedAt?C.armored:null,actorPool:g.markerKey};
    }
    return {entry:n,group:g,x:p.pos[0],y:p.pos[1],rot:p.rot,route,goal,phase,units,friends,enemies,arrivalTime,complete:!!goal&&phase!=='active',walked:n.units*p.fraction,...extra};
  }
  function unpose(time,actors,actorClock){
    const n=locate(time),g=n.group,p=player(n,time),clock=actorClock||clocks(time);
    return {friends:actors.friends.map((b,i)=>{const f=friendPose(n,i,time,clock,p.pos,b),out={...b,id:f.id,name:f.name,x:b.x-f.delta[0],y:b.y-f.delta[1]};delete out.hidden;return out;}),enemies:actors.enemies.map((b,i)=>{const d=enemyDelta(g,i,clock);return {...b,x:b.x-d[0],y:b.y-d[1]};})};
  }
  return {groups,entries,total:cursor,locate,clocks,sample,unpose,removed:['BREAKOUT','RESULT'],events:{stallHit,barrierHit,boardedAt,boardStart,crewBoardedAt,leftDeparture},corridorStart:driveStart};
};
