"use strict";
// Navigation geometry follows the story locations; coordinates are schematic.
window.QingRadarData = (() => {
  const points = {
    north:[240,24],northGate:[240,58],northAxis:[240,96],axisGarden:[240,140],axisMid:[240,180],forecourt:[240,220],courtDoor:[240,238],vaultGate:[240,244],vaultHall:[240,258],vaultLoot:[240,277],
    gardenNW:[152,50],gardenWest:[110,85],gardenTurn:[100,128],gardenStart:[132,132],car:[168,128],gardenEast:[206,140],westLane:[108,160],westCross:[106,210],westSouth:[106,278],
    westGate:[62,210],westCourt:[164,210],courtWest:[202,220],watermelon:[164,210],jingrenTurn:[282,140],jingren:[312,150],jingrenNorth:[332,168],eastTurn:[343,198],eastCross:[336,228],courtEast:[282,220],eastCourt:[314,234],alleyFight:[316,266],alleyStart:[314,306],alleySouth:[298,346],
    lowerWest:[62,282],lowerCourt:[152,282],lowerTurn:[196,300],lowerAxis:[242,302],lowerEast:[284,304],eastSouth:[365,304],southGate:[240,382],southTurn:[240,348],
    rendezvous:[35,218],insurgent:[24,240],outerTurn:[18,276],outerBend:[30,316],outerCross:[104,353],escape:[160,380],outerNorth:[42,150],outerNW:[54,86],outerNE:[110,20],
    eastNorth:[380,72],eastGate:[385,190],eastLower:[392,326],westLink:[78,332],
    outerMarket:[-18,160],outerSquare:[-55,176],outerStreet:[-85,225],outerSouth:[-70,285],outerLane:[-16,314],outerMid:[-8,224],outerHigh:[-40,90],outerBottom:[-70,360],outerCorner:[-30,400],outerRoad:[20,420],outerReturn:[72,394]
  };
  const roads = [
    {width:7.4,chain:['north','northGate','northAxis','axisGarden','axisMid','forecourt']},
    {width:5.4,chain:['northGate','gardenNW','gardenWest','gardenTurn','westLane','westCross','westSouth','lowerWest']},
    {width:4.6,chain:['gardenTurn','gardenStart','car','gardenEast','axisGarden','jingrenTurn','jingren','jingrenNorth','eastTurn','eastCross','eastSouth']},
    {width:7,chain:['westGate','westCross','westCourt','courtWest','forecourt','courtEast','eastCourt','eastCross','eastGate']},
    {width:5.5,chain:['jingrenTurn','courtEast','lowerEast']},
    {width:4.2,chain:['eastCourt','alleyFight','alleyStart','alleySouth']},
    {width:5.6,chain:['lowerWest','westSouth','lowerCourt','lowerTurn','lowerAxis','lowerEast','alleyStart','eastSouth']},
    {width:7,chain:['lowerAxis','southTurn','southGate']},
    {width:6,chain:['forecourt','courtDoor','vaultGate']},
    {width:3.5,indoor:true,chain:['vaultGate','vaultHall','vaultLoot']},
    {width:7.6,chain:['westGate','rendezvous','insurgent','outerTurn','outerBend','westLink','outerCross','escape']},
    {width:6.2,chain:['rendezvous','outerNorth','outerNW','outerNE']},
    {width:4.8,chain:['westLink','lowerWest']},
    {width:6.4,chain:['north','eastNorth','eastGate','eastLower','escape']},
    {width:4.6,chain:['outerNW','outerHigh','outerSquare','outerStreet','outerSouth','outerBottom','outerCorner','outerRoad','outerReturn','outerCross']},
    {width:4.3,chain:['outerNorth','outerMarket','outerSquare']},
    {width:5.4,chain:['rendezvous','outerMid','outerStreet']},
    {width:4.2,chain:['outerSouth','outerLane','outerBend']}
  ];
  // Unequal palace compounds, open courts, a garden, and exterior lanes.
  const blocks = [
    [[63,41],[127,32],[141,48],[105,72],[65,69]],
    [[64,83],[100,91],[91,127],[54,141]],
    [[119,94],[145,89],[158,101],[146,121],[121,121]],
    [[161,60],[226,66],[227,87],[188,91],[175,108],[158,99]],
    [[184,100],[222,97],[225,126],[207,131],[177,117]],
    [[251,67],[291,64],[298,86],[319,86],[319,123],[253,127]],
    [[305,35],[346,40],[360,67],[333,80],[302,73]],
    [[300,99],[333,94],[358,111],[349,143],[323,142]],
    [[119,146],[152,143],[173,150],[190,147],[214,156],[208,184],[173,193],[124,190]],
    [[252,153],[270,153],[271,183],[257,196]],
    [[289,162],[304,167],[327,179],[331,200],[296,208]],
    [[51,157],[94,147],[97,191],[66,198],[53,184]],
    [[121,222],[159,223],[171,239],[185,242],[180,269],[151,271],[120,263]],
    [[67,223],[95,224],[95,261],[64,270],[55,252]],
    [[182,229],[216,234],[216,281],[196,286],[190,264]],
    [[264,236],[274,234],[274,289],[260,285]],
    [[292,239],[304,247],[303,288],[293,294]],
    [[327,245],[348,244],[360,273],[350,293],[326,292]],
    [[123,292],[152,294],[185,310],[187,336],[154,347],[119,329]],
    [[202,314],[229,315],[229,342],[208,349],[195,335]],
    [[253,315],[279,316],[282,344],[264,355],[252,341]],
    [[316,321],[350,317],[372,337],[356,361],[322,353],[308,339]],
    [[47,297],[81,296],[92,316],[76,325],[46,317]],
    [[56,341],[88,350],[104,369],[78,382],[48,366]],
    [[166,360],[197,356],[220,371],[219,395],[184,399],[166,385]],
    [[277,365],[306,358],[329,377],[312,399],[283,395]],
    [[351,159],[375,155],[375,179],[354,183]],
    [[348,210],[375,201],[380,239],[361,247],[349,234]],
    [[-26,104],[0,99],[34,97],[31,137],[-10,147],[-31,139]],
    [[-41,187],[-20,175],[24,174],[28,202],[-6,213],[-32,211]],
    [[-72,239],[-39,236],[-25,254],[-40,276],[-61,270]],
    [[-26,236],[3,239],[9,268],[-6,290],[-34,279]],
    [[-59,302],[-35,305],[-23,329],[-48,341],[-61,328]],
    [[-5,328],[25,336],[35,360],[15,381],[-10,372],[-23,352]],
    [[-54,365],[-30,372],[-15,390],[-26,390],[-46,381]],
    [[43,372],[66,366],[65,387],[47,401],[29,401]],
    [[-78,148],[-66,142],[-60,162],[-75,173],[-88,164]]
  ];
  const courts = [
    [[70,49],[115,43],[123,49],[99,64],[72,60]],
    [[258,77],[283,74],[286,115],[260,115]],
    [[134,158],[163,155],[174,163],[195,158],[198,176],[169,181],[137,178]],
    [[129,232],[151,234],[162,249],[169,254],[159,262],[132,256]],
    [[207,323],[221,324],[220,338],[208,339]],
    [[322,328],[344,326],[360,338],[347,347],[326,342]]
  ];
  const garden = [[114,77],[151,55],[181,60],[174,92],[162,111],[142,125],[121,120]];
  const pond = [[139,75],[148,69],[157,72],[163,82],[157,91],[145,95],[137,87]];
  const hall = [[221,244],[235,244],[235,241],[245,241],[245,244],[259,244],[259,286],[221,286]];
  const labels = [[240,266,'大清国库'],[149,105,'御花园'],[298,183,'景仁宫'],[340,275,'延禧宫'],[60,202,'西门'],[26,237,'接应点']];
  const friend = (x,y,via=[]) => ({x,y,via});
  const guards = [[229,222],[235,216],[242,214],[248,219],[253,211],[260,220],[225,209],[234,204],[244,202],[252,206],[263,211],[272,217]];
  const enemies = positions => positions.map(([x,y]) => ({x,y}));
  const scenes = {
    HEIST_INTRO:{at:'vaultHall',rot:0,goal:null,friends:[friend(233,260),friend(248,258)],enemies:enemies(guards),note:'国库大殿内装财物：两名同伴在身边，前院侍卫横向左右巡逻。',guardTarget:[240,238]},
    HEIST_GRAB:{at:'vaultHall',rot:0,goal:null,friends:[friend(232,254),friend(247,255)],enemies:enemies(guards),note:'警报响起后仍在同一个国库场景：红点继续左右巡逻，两个蓝点从原位向两侧离开。',guardTarget:[240,238]},
    AERIAL_SPLIT:{at:'courtDoor',rot:0,goal:'alleyStart',friends:[friend(235,239,['courtDoor','forecourt','westCourt','westCross','westLane','gardenTurn','gardenStart','car']),friend(246,240,['courtDoor','forecourt','westCourt','westCross','westGate'])],enemies:enemies(guards),note:'接着同一国库场景分头撤离：两名同伴继续离开，安春晓穿过前院前往夹道。',guardTarget:[240,238]},
    CART_ALLEY:{at:'alleyStart',rot:0,goal:'alleyFight',friends:[friend(311,308)],enemies:enemies([[315,241],[312,247],[319,249],[316,255],[309,293],[319,291],[315,286]]),note:'安春晓推车撤离，宝娟在附近；皇后小队从夹道前后接近。'},
    SHOOT:{at:'alleyFight',rot:0,goal:null,friends:[friend(310,271)],enemies:enemies([[315,244],[311,250],[319,253],[314,279],[319,286],[310,289]]),note:'夹道交火：没有行车导航，保留玩家、宝娟和前后夹击的敌人。'},
    SWITCH_NZH:{at:'alleyFight',rot:0,goal:null,friends:[friend(310,271)],enemies:enemies([[314,247],[319,252],[314,283],[318,290]]),note:'请求年灼华支援时，小地图继续保留夹道位置。'},
    APPROACH_CAR:{at:'gardenStart',rot:90,goal:'car',friends:[],enemies:enemies([[180,129],[190,135],[199,140]]),vehicle:[168,128],note:'年灼华沿御花园宫道接近皇帝御驾；黄色路线贴着园外道路。'},
    CARJACK:{at:'car',rot:90,goal:null,friends:[],enemies:enemies([[181,128],[191,134],[202,140]]),vehicle:[168,128],note:'夺取御驾时停留在御花园宫道，不额外画一条已完成的导航路线。'},
    DRIVE_FM:{at:'car',rot:90,goal:'jingren',friends:[],enemies:enemies([[153,130],[145,134],[133,132]]),events:[[190,145,'保熟吗？']],note:'沿同一条直线宫道行驶；瓜摊在右侧，远处侍卫红点和宫女白点徘徊。'},
    WATERMELON:{at:'westCourt',rot:90,goal:'jingren',friends:[],enemies:enemies([[147,210],[139,211],[126,208]]),note:'车辆靠向道路右边撞毁瓜摊，短暂后退后回到直线宫道，继续驶向前方路障。'},
    ROADBLOCK:{at:'jingren',rot:270,goal:'westGate',friends:[friend(306,153)],enemies:enemies([[296,145],[290,143],[283,149],[283,161],[320,166],[326,173],[330,182],[276,140]]),note:'撞瓜摊后约几秒，车辆撞开前方路障，随后在同一路段停车接安春晓。'},
    SWITCH_NHL:{at:'westGate',rot:270,goal:null,friends:[friend(69,213)],enemies:enemies([[83,211],[91,208],[99,213],[108,210]]),note:'安春晓已在车内；车辆继续沿原来的直线宫道前行，地图、镜头和巡逻点不重置。'},
    WESTGATE:{at:'westGate',rot:250,goal:'rendezvous',friends:[friend(60,215)],enemies:enemies([[82,210],[91,207],[98,214],[108,209],[112,218]]),note:'沿原直线宫道通过宫门，保留同一批巡逻侍卫和宫女；安春晓不再显示为车外蓝点。'},
    SWITCH_TO_INSURGENT:{at:'rendezvous',rot:210,goal:'insurgent',friends:[friend(38,221),friend(32,224)],enemies:enemies([[63,210],[71,214],[79,209],[87,212]]),vehicle:[24,240],note:'继续在同一条直线宫道会合；车内安春晓保持隐藏，第 07 场景不再播放。'},
    BREAKOUT:{at:'insurgent',rot:190,goal:null,travel:['insurgent','outerTurn','outerBend','westLink','outerCross','escape'],friends:[friend(23,241),friend(26,242)],enemies:enemies([[37,219],[42,211],[48,207],[57,211],[63,208],[35,227],[38,232],[31,231]]),note:'装甲车沿西门外弯道突围，三人已汇合；不强加目的地黄点。'},
    RESULT:{at:'escape',rot:115,goal:null,friends:[friend(158,381),friend(161,382)],enemies:[],note:'脱离追捕后的结算镜头：小地图继续显示，敌人标记清空。'}
  };
  // Include the neighbourhood beyond the west wall so a west-facing camera
  // still sees connected streets instead of an empty edge of the drawing.
  const shift=p=>[p[0]+100,p[1]+50];
  Object.keys(points).forEach(k=>points[k]=shift(points[k]));
  [blocks,courts].forEach(groups=>groups.forEach(poly=>poly.forEach((p,i)=>poly[i]=shift(p))));
  [garden,pond,hall].forEach(poly=>poly.forEach((p,i)=>poly[i]=shift(p)));
  labels.forEach(p=>{p[0]+=100;p[1]+=50;});
  Object.values(scenes).forEach(s=>{
    ['friends','enemies'].forEach(type=>s[type].forEach(p=>{p.x+=100;p.y+=50;}));
    if(s.guardTarget)s.guardTarget=shift(s.guardTarget);
    if(s.vehicle)s.vehicle=shift(s.vehicle);
    if(s.events)s.events=s.events.map(([x,y,label])=>[x+100,y+50,label]);
  });
  const corridor={
    markerKey:'palace-corridor-straight-v3',center:260,width:7.4,start:[260,480],end:[212,231],
    junction:[260,231],leftRoadEnd:[145,231],armored:[260,237],
    navRoute:[[260,480],[260,231],[212,231]],stall:[266.45,404],roadblock:[260,354],pickup:[260,337],
    friends:[{id:'anchunxiao',name:'安春晓',x:262.4,y:337},{id:'niuhulu',name:'钮祜禄',x:257.6,y:237}],
    guards:[[241,318],[280,324],[243,294],[276,286],[248,267],[279,271]].map(([x,y],i)=>({id:'corridor-guard-'+i,x,y})),
    civilians:[[285,309],[236,300],[287,278],[236,260]].map(([x,y],i)=>({id:'maid-'+i,name:'宫女',x,y})),
    compounds:[
      [[171,438],[238,438],[240,465],[225,472],[174,470]],[[286,442],[344,437],[352,469],[285,472]],
      [[166,382],[234,382],[240,411],[225,420],[170,418]],[[291,379],[352,384],[344,420],[287,416]],
      [[178,326],[230,322],[239,352],[224,364],[173,357]],[[289,323],[350,328],[354,355],[286,365]],
      [[170,274],[239,278],[233,308],[179,312]],[[290,275],[347,270],[352,306],[286,312]],
      [[174,209],[230,211],[239,221],[201,224],[171,220]],[[286,216],[353,221],[344,256],[289,250]],
      [[175,240],[237,239],[234,255],[211,263],[174,257]],
      [[169,159],[231,159],[239,188],[226,202],[173,194]],[[291,157],[351,164],[345,196],[287,201]],
      [[176,98],[239,103],[232,142],[175,141]],[[289,101],[350,96],[353,135],[290,143]],
      [[170,42],[231,42],[240,75],[218,88],[173,80]],[[289,39],[349,44],[346,79],[286,82]]
    ],
    courts:[[[183,450],[226,449],[226,461],[184,459]],[[301,390],[337,394],[332,407],[299,406]],[[187,338],[221,334],[226,348],[190,352]],[[302,230],[337,232],[331,245],[302,241]],[[183,172],[220,172],[223,187],[188,186]],[[300,110],[337,107],[336,128],[302,129]]]
  };
  scenes.SWITCH_NHL.note='继续沿原宫道接近会合点；钮祜禄在道路中间微微偏左的近处，装甲车停在前方左岔路旁。';
  scenes.WESTGATE.note='通过宫门，驶向左岔路口的装甲车；钮祜禄在车辆左侧近处等待会合，安春晓已在车内。';
  scenes.SWITCH_TO_INSURGENT.note='在左岔路口完成三人会合并换乘装甲车；钮祜禄从左侧近处靠近，上车后蓝点隐藏，随后车辆转入向左的道路。';
  scenes.PICKUP_ANCHUNXIAO={...scenes.ROADBLOCK,note:'撞过路障后停车，安春晓从道路右边走到副驾驶一侧，上车后蓝点隐藏。'};
  scenes.LEAVE_PICKUP={...scenes.ROADBLOCK,note:'安春晓已经上车，车辆继续沿同一条直线宫道前进，不再显示安春晓蓝点。'};
  return {size:520,points,roads,blocks,courts,garden,pond,hall,labels,scenes,corridor};
})();
