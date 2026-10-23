/* ============================================================
   GTA：大清合伙人 · 互动电影 Demo  ——  游戏主逻辑
   纯原生 JavaScript，无框架、无引擎、无构建依赖
   功能：剧情/角色数据加载、视频节点切换、全屏视频、
        WASD/Alt 监听、角色轮盘切换、任务提示、选项系统、
        技能栏、标志位（金钱·血甲·通缉）
   ============================================================ */
(function () {
  "use strict";

  /* ---------- DOM 快捷引用 ---------- */
  function $(id) { return document.getElementById(id); }
  var game        = $("game");
  var video       = $("video-player");
  var hud         = $("hud");
  var titleScreen = $("title-screen");
  var fadeEl      = $("fade");
  var chapterEl   = $("mission-chapter");
  var objectiveEl = $("mission-objective");
  var zoneToast   = $("zone-toast");
  var moneyEl     = $("money");
  var wantedEl    = $("wanted");
  var mapLocEl    = $("map-location");
  var healthFill  = document.querySelector(".health-bar i");
  var armorFill   = document.querySelector(".armor-bar i");
  var choicesEl   = $("choices");
  var speakerEl   = $("speaker");
  var dtextEl     = $("dialogue-text");
  var toastEl     = $("toast");
  var endingCard  = $("ending-card");
  var btnSound    = $("btn-sound");
  var btnFull     = $("btn-fullscreen");
  var startBtn    = $("start-btn");
  var chipAvatar  = $("chip-avatar");
  var chipName    = $("chip-name");
  var gearEl      = $("character-gear");
  var skillBtnsEl = $("skill-buttons");
  var wheel       = $("switch-wheel");
  var wheelSegs   = wheel.querySelectorAll(".wheel-seg");
  var interactPrompt = $("interact-prompt");
  var interactText   = $("interact-text");
  var mcWrap     = $("mission-complete");
  var mcName     = $("mc-name");
  var mcReward   = $("mc-reward");
  var mcConfirm  = $("mc-confirm");
  var subObjectiveEl = $("mission-subobjective");
  var hudExtra       = $("hud-extra");
  var distancePill   = $("distance-pill");
  var distanceText   = $("distance-text");
  var nitroIcon      = $("nitro-icon");
  var eventPopup     = $("event-popup");
  var epTitle        = $("ep-title");
  var epSub          = $("ep-sub");
  var sysModal       = $("sys-modal");
  var smTitle        = $("sm-title");
  var smSub          = $("sm-sub");
  var vehiclePopup   = $("vehicle-popup");
  var vpTitle        = $("vp-title");
  var vpName         = $("vp-name");
  var vpStats        = $("vp-stats");
  var stageUI        = $("stage-ui");
  var stageUnlock    = $("stage-unlock");
  var switchHint     = $("switch-hint");
  var ammoDisplay    = $("ammo-display");
  var ammoWeapon     = $("ammo-weapon");
  var ammoCount      = $("ammo-count");
  var holdProgress   = $("hold-progress");
  var holdLabel      = $("hold-label");
  var holdFill       = $("hold-fill");
  var cutscene       = $("switch-cutscene");
  var csStages       = cutscene.querySelectorAll(".cs-stage");
  var vfNodeId       = $("vf-node-id");
  var vfFilePath     = $("vf-file-path");
  var openingCard    = $("opening-card");
  var openingText    = $("opening-text");
  var missionBanner  = $("mission-banner");
  var mbTitle        = $("mb-title");
  var mbObjective    = $("mb-objective");
  var wheelInfo      = $("wheel-info");
  var wiName         = $("wi-name");
  var wiLocation     = $("wi-location");
  var wiAbility      = $("wi-ability");
  var mapSvg         = $("map-svg");
  var suHandoff      = $("su-handoff");
  var suStage        = $("su-stage");
  var suGuard        = $("su-guard");
  var stageComplete  = $("stage-complete");
  var previewConfig = window.GAME_PREVIEW || { enabled: false, scenes: {} };
  var gameHUD = window.QingGameHUD || null;
  var weaponUI = window.QingGameWeapon || null;
  var mediaFrame = null, mediaTimer = null, mediaClockToken = 0;
  var sceneTasks = [];
  var placeholderLastTick = 0;
  var previewSeekMs = null;
  var audioEffects = [];
  var backgroundMusic = window.QingGameMusic || null;
  var menuFocus = null;
  var dialogueEl     = $("dialogue");
  var validationActive = false, validationSaved = null;
  var diagnostics = window.QingGameDiagnostics || null;
  function isLocalFile() { return !!(window.location && window.location.protocol === "file:"); }

  /* ---------- file:// 双击运行时的内置剧情兜底 ----------
     浏览器在 file:// 协议下会拒绝 fetch 本地 JSON；
     该数据由构建步骤从 story.json 注入，保持与 story.json 一致。
     推荐运行方式：本目录执行  python -m http.server 后访问 localhost */
  var EMBEDDED_STORY = {"meta":{"missionTitle":"终极抢劫：大清国库","stage":"第一章 · 大清国库大劫案","version":"1.0.0","startNode":"HEIST_INTRO","defaultCharacter":"anchunxiao","currency":"两","titleVideo":"assets/videos/title.mp4","openingLine":"雍正年间 · 紫禁城 · 国库","initialFlags":{"money":0,"health":100,"armor":0,"wanted":0}},"nodes":{"HEIST_INTRO":{"id":"HEIST_INTRO","character":"anchunxiao","location":"紫禁城 · 国库","video":"assets/videos/heist_intro.mp4","missionTitle":"终极抢劫：大清国库","objective":"拿走最后一箱财物","wantedLevel":0,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"无"}],"controls":{"playKey":"W","playLabel":"继续","interact":{"key":"E","prompt":"按 E 装走高价值银票金票","nagAfter":5000,"nagText":"E  装走高价值银票金票","next":"HEIST_GRAB"}},"wheelRules":{"allowed":["anchunxiao"],"disabled":{"nianzhuohua":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[]},"HEIST_GRAB":{"id":"HEIST_GRAB","character":"anchunxiao","location":"紫禁城 · 国库","video":"assets/videos/heist_grab.mp4","missionTitle":"终极抢劫：大清国库","objective":"拿走最后一箱财物","wantedLevel":0,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"无"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"AERIAL_SPLIT"},"wheelRules":{"allowed":["anchunxiao"],"disabled":{"nianzhuohua":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":1500,"eventPopup":{"title":"已掠夺财物总价值","sub":"30,000,000两","duration":2400},"moneyTotal":30000000},{"at":3800,"sound":"assets/audio/alarm.mp3","uiAlert":true,"wantedLevel":2},{"at":4200,"eventPopup":{"title":"警报：国库遭劫","sub":"皇后阵营已进入追捕状态","duration":2600}},{"at":4400,"objective":"分头逃亡","subObjective":"按计划从不同出口撤离"},{"at":6200,"speaker":"钮祜禄","subtitle":"分头走。"},{"at":7400,"objective":"分头逃亡"}]},"AERIAL_SPLIT":{"id":"AERIAL_SPLIT","character":"anchunxiao","location":"紫禁城上空","video":"assets/videos/heist_grab.mp4","missionTitle":"终极抢劫：大清国库","objective":"分头逃亡","hud":[],"controls":{},"switchCutscene":{"target":"anchunxiao","sound":"assets/audio/character_switch.mp3","next":"CART_ALLEY"},"events":[]},"CART_ALLEY":{"id":"CART_ALLEY","character":"anchunxiao","location":"延禧宫夹道","video":"assets/videos/cart_alley.mp4","missionTitle":"终极抢劫：大清国库","objective":"携带战利品沿宫道撤离","wantedLevel":2,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"无"}],"controls":{"playKey":"W","playLabel":"继续","interact":{"key":"E","prompt":"按 E 打开小车暗格","nagAfter":5000,"nagText":"E  打开小车暗格","next":"SHOOT"}},"wheelRules":{"allowed":["anchunxiao"],"disabled":{"nianzhuohua":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":3310,"speaker":"宝娟","subtitle":"小主！不好了！","subtitleDuration":1220},{"at":4530,"speaker":"宝娟","subtitle":"小主嗓子哑了！","subtitleDuration":1860},{"at":6390,"speaker":"宝娟","subtitle":"皇后的人追来了！","subtitleDuration":1220},{"at":14500,"uiAlert":true,"wantedLevel":3,"objective":"突破包围","subObjective":""}],"moneyTotal":30000000},"SHOOT":{"id":"SHOOT","character":"anchunxiao","location":"延禧宫夹道","video":"assets/videos/shoot.mp4","missionTitle":"终极抢劫：大清国库","objective":"突破包围","wantedLevel":3,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"微型冲锋枪"}],"ammo":{"max":8,"start":8,"reserve":9999},"controls":{"playKey":"MouseLeft","playLabel":"射击"},"wheelRules":{"allowed":["anchunxiao","nianzhuohua"],"highlight":"nianzhuohua","next":{"nianzhuohua":"SWITCH_NZH"},"disabled":{"niuhulu":"正在执行其他任务"}},"events":[{"at":3260,"ammo":7},{"at":3555,"ammo":6},{"at":3995,"ammo":5},{"at":4320,"ammo":4},{"at":4600,"ammo":3},{"at":5365,"ammo":2},{"at":5960,"ammo":1},{"at":6325,"ammo":0},{"at":7900,"sysModal":{"title":"弹匣已空","sub":"请求年灼华支援","duration":1800}},{"at":9600,"objective":"请求支援","subObjective":"","showSwitchHint":true}],"moneyTotal":30000000,"weaponSelect":{"required":"smg","name":"微型冲锋枪"}},"SWITCH_NZH":{"id":"SWITCH_NZH","character":"anchunxiao","location":"紫禁城上空","video":"assets/videos/shoot.mp4","missionTitle":"终极抢劫：大清国库","objective":"请求支援","hud":[],"controls":{},"switchCutscene":{"target":"nianzhuohua","sound":"assets/audio/character_switch.mp3","next":"CARJACK"},"events":[]},"APPROACH_CAR":{"id":"APPROACH_CAR","character":"nianzhuohua","location":"御花园宫道","video":"assets/videos/approach_car.mp4","missionTitle":"终极抢劫：大清国库","objective":"夺取皇帝御驾","wantedLevel":3,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"双涡轮八抬大轿"}],"controls":{"playKey":"W","playLabel":"继续","interact":{"key":"E","prompt":"按 E 拉开驾驶门","nagAfter":5000,"nagText":"E  拉开驾驶门","next":"CARJACK"}},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":3000,"eventPopup":{"title":"发现高性能载具","sub":"Pegassi Zentorno","duration":2400}}],"redirectTo":"CARJACK"},"CARJACK":{"id":"CARJACK","character":"nianzhuohua","location":"御花园宫道","video":"assets/videos/carjack.mp4","missionTitle":"终极抢劫：大清国库","objective":"夺取皇帝御驾","wantedLevel":3,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"DRIVE_FM"},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":1200,"eventPopup":{"title":"发现高性能载具","sub":"Pegassi Zentorno","duration":2200}},{"at":9600,"wantedLevel":4},{"at":12560,"speaker":"雍正皇帝","subtitle":"你的胆子真是肥嘟嘟的！","subtitleDuration":1720},{"at":24100,"vehiclePopup":{"title":"载具已获得","name":"Pegassi Zentorno","stats":[{"label":"皇家御驾盗窃","value":"已记录"},{"label":"皇帝好感度","value":"-999"}],"duration":2900}},{"at":24600,"objective":"前往接应安春晓","subObjective":""}]},"DRIVE_FM":{"id":"DRIVE_FM","character":"nianzhuohua","location":"紫禁城宫道","video":"assets/videos/drive_fm.mp4","missionTitle":"终极抢劫：大清国库","objective":"前往接应安春晓","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":600,"radio":true,"speaker":"大清FM 1722","subtitle":"这里是大清FM一七二二，宫廷路况实时播报。"},{"at":3200,"radio":true,"speaker":"大清FM 1722","subtitle":"雍正皇帝御用车辆刚刚失窃，驾驶者已确认为年贵妃。"},{"at":6800,"radio":true,"speaker":"大清FM 1722","subtitle":"建议沿途侍卫不要单独拦截。"},{"at":9200,"eventPopup":{"title":"附近随机事件","sub":"保熟吗？","duration":2000}}],"choices":[{"key":"E","text":"接受支线「保熟吗？」","next":"WATERMELON"},{"key":"Q","text":"忽略，继续接应","next":"ROADBLOCK"}]},"WATERMELON":{"id":"WATERMELON","character":"nianzhuohua","location":"紫禁城宫道 · 瓜摊","video":"assets/videos/watermelon.mp4","missionTitle":"终极抢劫：大清国库","objective":"验证西瓜成熟度","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"ROADBLOCK"},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":8200,"speaker":"年灼华","subtitle":"这瓜保熟吗？"},{"at":10400,"speaker":"摊主","subtitle":"现切现卖，吃了不烧心。"},{"at":18200,"eventPopup":{"title":"支线完成","sub":"全部现切","duration":2200}}]},"ROADBLOCK":{"id":"ROADBLOCK","character":"nianzhuohua","location":"景仁宫前","video":"assets/videos/roadblock.mp4","missionTitle":"终极抢劫：大清国库","objective":"突破皇后阵营封锁","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"wheelRules":{"allowed":["nianzhuohua","niuhulu"],"highlight":"niuhulu","next":{"niuhulu":"SWITCH_NHL"},"disabled":{"anchunxiao":"正在执行其他任务"}},"events":[{"at":4000,"objective":"突破皇后阵营封锁"},{"at":15000,"speaker":"安春晓","subtitle":"快走。"},{"at":16800,"eventPopup":{"title":"队友已接应：安春晓","sub":"战利品已保全","duration":2600}},{"at":19200,"objective":"切换钮祜禄","subObjective":"按住 Alt 切换钮祜禄","showSwitchHint":true}]},"SWITCH_NHL":{"id":"SWITCH_NHL","character":"nianzhuohua","location":"紫禁城上空","video":"assets/videos/roadblock.mp4","missionTitle":"终极抢劫：大清国库","objective":"切换钮祜禄","hud":[],"controls":{},"switchCutscene":{"target":"niuhulu","sound":"assets/audio/character_switch.mp3","next":"WESTGATE"},"events":[]},"WESTGATE":{"id":"WESTGATE","character":"niuhulu","location":"紫禁城 · 西门","video":"assets/videos/westgate.mp4","missionTitle":"终极抢劫：大清国库","objective":"开放最终撤离路线","wantedLevel":4,"hud":[{"label":"身份","value":"主谋 / 操盘手"},{"label":"特殊能力","value":"惊鸿心眼"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"SWITCH_TO_INSURGENT"},"wheelRules":{"allowed":["niuhulu"],"disabled":{"anchunxiao":"正在执行其他任务","nianzhuohua":"正在执行其他任务"}},"events":[{"at":2000,"eventPopup":{"title":"内应已就位","sub":"撤离路线已开放","duration":2400}}]},"SWITCH_TO_INSURGENT":{"id":"SWITCH_TO_INSURGENT","character":"nianzhuohua","location":"紫禁城 · 西门外","video":"assets/videos/switch_insurgent.mp4","missionTitle":"终极抢劫：大清国库","objective":"三人汇合，换乘装甲车","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"BREAKOUT"},"wheelRules":{"allowed":["nianzhuohua","anchunxiao","niuhulu"]},"events":[{"at":9000,"eventPopup":{"title":"团队已集结","sub":"3/3","duration":2200}},{"at":11000,"eventPopup":{"title":"逃逸载具已就位","sub":"HVY Insurgent Pick-Up Custom","duration":2400}},{"at":13500,"objective":"逃离紫禁城"}]},"BREAKOUT":{"id":"BREAKOUT","character":"nianzhuohua","location":"逃离中 · 紫禁城西门","video":"assets/videos/breakout.mp4","missionTitle":"终极抢劫：大清国库","objective":"逃离紫禁城","wantedLevel":5,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"载具","value":"HVY Insurgent"},{"label":"车顶机枪","value":"安春晓"},{"label":"导航","value":"钮祜禄"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"RESULT"},"wheelRules":{"allowed":["nianzhuohua","anchunxiao","niuhulu"]},"events":[{"at":1000,"wantedLevel":5,"toast":"大清限定：六星通缉"},{"at":2000,"eventPopup":{"title":"年氏集团军火补给已到账","sub":"弹药充足","duration":2000}}]},"RESULT":{"id":"RESULT","character":"nianzhuohua","location":"紫禁城 · 西门外","missionTitle":"终极抢劫：大清国库","objective":"任务完成","hud":[],"controls":{},"completeUI":{"kicker":"任务完成","title":"大清国库大劫案","rows":[{"label":"劫获财物","value":"30,000,000两"},{"label":"团队集结","value":"3/3"},{"label":"队友已接应","value":"安春晓"},{"label":"最高通缉等级","value":"六星（大清限定）"},{"label":"皇帝好感度","value":"-999"},{"label":"追捕状态","value":"已脱离"}]},"wheelRules":{"allowed":["anchunxiao","nianzhuohua","niuhulu"]},"events":[]}}}; /* injected from story.json at build */

  /* ---------- file:// 双击运行时的内置角色兜底（由构建步骤从 characters.json 注入） ---------- */
  var EMBEDDED_CHARACTERS = {"meta":{"title":"GTA：大清合伙人","version":"1.0.0","defaultCharacter":"anchunxiao"},"characters":[{"id":"anchunxiao","name":"安春晓","avatar":"assets/portraits/anchunxiao.png","color":"#9b6bd6","description":"出身微寒、心思缜密的制香高手，LV.1 答应，擅以柔弱外表掩藏锋芒，熟悉宫中一切暗道与门路。","skills":["制香迷踪","潜行匿迹","歌喉惑敌"],"specialAbility":"迷香迟滞——点燃特制线香，短时间内令周围敌人动作迟缓、难以察觉你的行动","vehicle":"青帷软轿马车","weapon":"淬毒银簪","currentMission":{"title":"第一章 · 大清国库大劫案","objective":"装走最后一箱财物，携带赃款从宫道撤离"}},{"id":"niuhulu","name":"钮祜禄","avatar":"assets/portraits/niuhulu.png","color":"#d9a441","description":"足智多谋、人脉遍布六宫的回宫贵妃，本案主谋与操盘手，擅布局与谈判，总能在谈笑间扭转局势。","skills":["谋略布局","谈判交涉","人脉调度"],"specialAbility":"惊鸿心眼——短时间内洞察场景中的关键线索、机关与可交互目标","vehicle":"凤纹鎏金辇","weapon":"琴中剑（长相思）","currentMission":{"title":"第一章 · 大清国库大劫案","objective":"在西门安排内应与武装装甲车，规划最终撤离路线"}},{"id":"nianzhuohua","name":"年灼华","avatar":"assets/portraits/nianzhuohua.png","color":"#e0453b","description":"骄横凌厉、崇尚正面碾压的年贵妃，LV.45，火力与驾驶并重，越被围攻越凶猛。","skills":["火力压制","威慑震慑","重兵器精通"],"specialAbility":"翊坤之怒——短时间内伤害翻倍、免疫一切控制，受击反而积蓄怒气","vehicle":"Pegassi Zentorno","weapon":"一丈红（鎏金鞭）","currentMission":{"title":"第一章 · 大清国库大劫案","objective":"抢走皇帝御用 Zentorno，撞破封锁接应安春晓"}}]}; /* CHARACTERS_FALLBACK */

  /* ---------- file:// 双击运行时的内置任务兜底（由构建步骤从 missions/ 注入） ---------- */
  var EMBEDDED_MISSION = {"meta":{"missionTitle":"终极抢劫：大清国库","stage":"第一章 · 大清国库大劫案","version":"1.0.0","startNode":"HEIST_INTRO","defaultCharacter":"anchunxiao","currency":"两","titleVideo":"assets/videos/title.mp4","openingLine":"雍正年间 · 紫禁城 · 国库","initialFlags":{"money":0,"health":100,"armor":0,"wanted":0}},"nodes":{"HEIST_INTRO":{"id":"HEIST_INTRO","character":"anchunxiao","location":"紫禁城 · 国库","video":"assets/videos/heist_intro.mp4","missionTitle":"终极抢劫：大清国库","objective":"拿走最后一箱财物","wantedLevel":0,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"无"}],"controls":{"playKey":"W","playLabel":"继续","interact":{"key":"E","prompt":"按 E 装走高价值银票金票","nagAfter":5000,"nagText":"E  装走高价值银票金票","next":"HEIST_GRAB"}},"wheelRules":{"allowed":["anchunxiao"],"disabled":{"nianzhuohua":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[]},"HEIST_GRAB":{"id":"HEIST_GRAB","character":"anchunxiao","location":"紫禁城 · 国库","video":"assets/videos/heist_grab.mp4","missionTitle":"终极抢劫：大清国库","objective":"拿走最后一箱财物","wantedLevel":0,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"无"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"AERIAL_SPLIT"},"wheelRules":{"allowed":["anchunxiao"],"disabled":{"nianzhuohua":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":1500,"eventPopup":{"title":"已掠夺财物总价值","sub":"30,000,000两","duration":2400},"moneyTotal":30000000},{"at":3800,"sound":"assets/audio/alarm.mp3","uiAlert":true,"wantedLevel":2},{"at":4200,"eventPopup":{"title":"警报：国库遭劫","sub":"皇后阵营已进入追捕状态","duration":2600}},{"at":4400,"objective":"分头逃亡","subObjective":"按计划从不同出口撤离"},{"at":6200,"speaker":"钮祜禄","subtitle":"分头走。"},{"at":7400,"objective":"分头逃亡"}]},"AERIAL_SPLIT":{"id":"AERIAL_SPLIT","character":"anchunxiao","location":"紫禁城上空","video":"assets/videos/heist_grab.mp4","missionTitle":"终极抢劫：大清国库","objective":"分头逃亡","hud":[],"controls":{},"switchCutscene":{"target":"anchunxiao","sound":"assets/audio/character_switch.mp3","next":"CART_ALLEY"},"events":[]},"CART_ALLEY":{"id":"CART_ALLEY","character":"anchunxiao","location":"延禧宫夹道","video":"assets/videos/cart_alley.mp4","missionTitle":"终极抢劫：大清国库","objective":"携带战利品沿宫道撤离","wantedLevel":2,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"无"}],"controls":{"playKey":"W","playLabel":"继续","interact":{"key":"E","prompt":"按 E 打开小车暗格","nagAfter":5000,"nagText":"E  打开小车暗格","next":"SHOOT"}},"wheelRules":{"allowed":["anchunxiao"],"disabled":{"nianzhuohua":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":3310,"speaker":"宝娟","subtitle":"小主！不好了！","subtitleDuration":1220},{"at":4530,"speaker":"宝娟","subtitle":"小主嗓子哑了！","subtitleDuration":1860},{"at":6390,"speaker":"宝娟","subtitle":"皇后的人追来了！","subtitleDuration":1220},{"at":14500,"uiAlert":true,"wantedLevel":3,"objective":"突破包围","subObjective":""}],"moneyTotal":30000000},"SHOOT":{"id":"SHOOT","character":"anchunxiao","location":"延禧宫夹道","video":"assets/videos/shoot.mp4","missionTitle":"终极抢劫：大清国库","objective":"突破包围","wantedLevel":3,"hud":[{"label":"等级","value":"LV.1 答应"},{"label":"现金","value":"0两"},{"label":"特殊能力","value":"小娟我的嗓子"},{"label":"武器","value":"微型冲锋枪"}],"ammo":{"max":8,"start":8,"reserve":9999},"controls":{"playKey":"MouseLeft","playLabel":"射击"},"wheelRules":{"allowed":["anchunxiao","nianzhuohua"],"highlight":"nianzhuohua","next":{"nianzhuohua":"SWITCH_NZH"},"disabled":{"niuhulu":"正在执行其他任务"}},"events":[{"at":3260,"ammo":7},{"at":3555,"ammo":6},{"at":3995,"ammo":5},{"at":4320,"ammo":4},{"at":4600,"ammo":3},{"at":5365,"ammo":2},{"at":5960,"ammo":1},{"at":6325,"ammo":0},{"at":7900,"sysModal":{"title":"弹匣已空","sub":"请求年灼华支援","duration":1800}},{"at":9600,"objective":"请求支援","subObjective":"","showSwitchHint":true}],"moneyTotal":30000000,"weaponSelect":{"required":"smg","name":"微型冲锋枪"}},"SWITCH_NZH":{"id":"SWITCH_NZH","character":"anchunxiao","location":"紫禁城上空","video":"assets/videos/shoot.mp4","missionTitle":"终极抢劫：大清国库","objective":"请求支援","hud":[],"controls":{},"switchCutscene":{"target":"nianzhuohua","sound":"assets/audio/character_switch.mp3","next":"CARJACK"},"events":[]},"APPROACH_CAR":{"id":"APPROACH_CAR","character":"nianzhuohua","location":"御花园宫道","video":"assets/videos/approach_car.mp4","missionTitle":"终极抢劫：大清国库","objective":"夺取皇帝御驾","wantedLevel":3,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"双涡轮八抬大轿"}],"controls":{"playKey":"W","playLabel":"继续","interact":{"key":"E","prompt":"按 E 拉开驾驶门","nagAfter":5000,"nagText":"E  拉开驾驶门","next":"CARJACK"}},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":3000,"eventPopup":{"title":"发现高性能载具","sub":"Pegassi Zentorno","duration":2400}}],"redirectTo":"CARJACK"},"CARJACK":{"id":"CARJACK","character":"nianzhuohua","location":"御花园宫道","video":"assets/videos/carjack.mp4","missionTitle":"终极抢劫：大清国库","objective":"夺取皇帝御驾","wantedLevel":3,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"DRIVE_FM"},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":1200,"eventPopup":{"title":"发现高性能载具","sub":"Pegassi Zentorno","duration":2200}},{"at":9600,"wantedLevel":4},{"at":12560,"speaker":"雍正皇帝","subtitle":"你的胆子真是肥嘟嘟的！","subtitleDuration":1720},{"at":24100,"vehiclePopup":{"title":"载具已获得","name":"Pegassi Zentorno","stats":[{"label":"皇家御驾盗窃","value":"已记录"},{"label":"皇帝好感度","value":"-999"}],"duration":2900}},{"at":24600,"objective":"前往接应安春晓","subObjective":""}]},"DRIVE_FM":{"id":"DRIVE_FM","character":"nianzhuohua","location":"紫禁城宫道","video":"assets/videos/drive_fm.mp4","missionTitle":"终极抢劫：大清国库","objective":"前往接应安春晓","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":600,"radio":true,"speaker":"大清FM 1722","subtitle":"这里是大清FM一七二二，宫廷路况实时播报。"},{"at":3200,"radio":true,"speaker":"大清FM 1722","subtitle":"雍正皇帝御用车辆刚刚失窃，驾驶者已确认为年贵妃。"},{"at":6800,"radio":true,"speaker":"大清FM 1722","subtitle":"建议沿途侍卫不要单独拦截。"},{"at":9200,"eventPopup":{"title":"附近随机事件","sub":"保熟吗？","duration":2000}}],"choices":[{"key":"E","text":"接受支线「保熟吗？」","next":"WATERMELON"},{"key":"Q","text":"忽略，继续接应","next":"ROADBLOCK"}]},"WATERMELON":{"id":"WATERMELON","character":"nianzhuohua","location":"紫禁城宫道 · 瓜摊","video":"assets/videos/watermelon.mp4","missionTitle":"终极抢劫：大清国库","objective":"验证西瓜成熟度","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"ROADBLOCK"},"wheelRules":{"allowed":["nianzhuohua"],"disabled":{"anchunxiao":"正在执行其他任务","niuhulu":"正在执行其他任务"}},"events":[{"at":8200,"speaker":"年灼华","subtitle":"这瓜保熟吗？"},{"at":10400,"speaker":"摊主","subtitle":"现切现卖，吃了不烧心。"},{"at":18200,"eventPopup":{"title":"支线完成","sub":"全部现切","duration":2200}}]},"ROADBLOCK":{"id":"ROADBLOCK","character":"nianzhuohua","location":"景仁宫前","video":"assets/videos/roadblock.mp4","missionTitle":"终极抢劫：大清国库","objective":"突破皇后阵营封锁","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"wheelRules":{"allowed":["nianzhuohua","niuhulu"],"highlight":"niuhulu","next":{"niuhulu":"SWITCH_NHL"},"disabled":{"anchunxiao":"正在执行其他任务"}},"events":[{"at":4000,"objective":"突破皇后阵营封锁"},{"at":15000,"speaker":"安春晓","subtitle":"快走。"},{"at":16800,"eventPopup":{"title":"队友已接应：安春晓","sub":"战利品已保全","duration":2600}},{"at":19200,"objective":"切换钮祜禄","subObjective":"按住 Alt 切换钮祜禄","showSwitchHint":true}]},"SWITCH_NHL":{"id":"SWITCH_NHL","character":"nianzhuohua","location":"紫禁城上空","video":"assets/videos/roadblock.mp4","missionTitle":"终极抢劫：大清国库","objective":"切换钮祜禄","hud":[],"controls":{},"switchCutscene":{"target":"niuhulu","sound":"assets/audio/character_switch.mp3","next":"WESTGATE"},"events":[]},"WESTGATE":{"id":"WESTGATE","character":"niuhulu","location":"紫禁城 · 西门","video":"assets/videos/westgate.mp4","missionTitle":"终极抢劫：大清国库","objective":"开放最终撤离路线","wantedLevel":4,"hud":[{"label":"身份","value":"主谋 / 操盘手"},{"label":"特殊能力","value":"惊鸿心眼"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"SWITCH_TO_INSURGENT"},"wheelRules":{"allowed":["niuhulu"],"disabled":{"anchunxiao":"正在执行其他任务","nianzhuohua":"正在执行其他任务"}},"events":[{"at":2000,"eventPopup":{"title":"内应已就位","sub":"撤离路线已开放","duration":2400}}]},"SWITCH_TO_INSURGENT":{"id":"SWITCH_TO_INSURGENT","character":"nianzhuohua","location":"紫禁城 · 西门外","video":"assets/videos/switch_insurgent.mp4","missionTitle":"终极抢劫：大清国库","objective":"三人汇合，换乘装甲车","wantedLevel":4,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"怒气","value":"87%"},{"label":"特殊能力","value":"一丈红狂暴"},{"label":"载具","value":"Pegassi Zentorno"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"BREAKOUT"},"wheelRules":{"allowed":["nianzhuohua","anchunxiao","niuhulu"]},"events":[{"at":9000,"eventPopup":{"title":"团队已集结","sub":"3/3","duration":2200}},{"at":11000,"eventPopup":{"title":"逃逸载具已就位","sub":"HVY Insurgent Pick-Up Custom","duration":2400}},{"at":13500,"objective":"逃离紫禁城"}]},"BREAKOUT":{"id":"BREAKOUT","character":"nianzhuohua","location":"逃离中 · 紫禁城西门","video":"assets/videos/breakout.mp4","missionTitle":"终极抢劫：大清国库","objective":"逃离紫禁城","wantedLevel":5,"hud":[{"label":"等级","value":"LV.45 年灼华"},{"label":"载具","value":"HVY Insurgent"},{"label":"车顶机枪","value":"安春晓"},{"label":"导航","value":"钮祜禄"}],"controls":{"playKey":"W","playLabel":"继续"},"onEnd":{"next":"RESULT"},"wheelRules":{"allowed":["nianzhuohua","anchunxiao","niuhulu"]},"events":[{"at":1000,"wantedLevel":5,"toast":"大清限定：六星通缉"},{"at":2000,"eventPopup":{"title":"年氏集团军火补给已到账","sub":"弹药充足","duration":2000}}]},"RESULT":{"id":"RESULT","character":"nianzhuohua","location":"紫禁城 · 西门外","missionTitle":"终极抢劫：大清国库","objective":"任务完成","hud":[],"controls":{},"completeUI":{"kicker":"任务完成","title":"大清国库大劫案","rows":[{"label":"劫获财物","value":"30,000,000两"},{"label":"团队集结","value":"3/3"},{"label":"队友已接应","value":"安春晓"},{"label":"最高通缉等级","value":"六星（大清限定）"},{"label":"皇帝好感度","value":"-999"},{"label":"追捕状态","value":"已脱离"}]},"wheelRules":{"allowed":["anchunxiao","nianzhuohua","niuhulu"]},"events":[]}}}; /* MISSION_FALLBACK */

  /* ---------- file:// 双击运行时的内置小地图兜底（由构建步骤从 map.json 注入） ---------- */
  var EMBEDDED_MAP = {"meta":{"title":"紫禁城 · 小地图（数据驱动 SVG）","viewBox":200,"version":"1.0.0","note":"现代 GPS 风格，道路为灰白、建筑为深灰；玩家白色三角、目标彩色点、路线黄色导航线。"},"palette":{"background":"#0c0e11","building":"#23272d","buildingEdge":"#2f343b","road":"#3b4047","roadEdge":"#4a5058","route":"#f5c518","player":"#ffffff","goal":"#ff4d4d","sideGoal":"#7fb2ff"},"buildings":[{"x":10,"y":10,"w":82,"h":82},{"x":108,"y":10,"w":82,"h":82},{"x":10,"y":108,"w":82,"h":27},{"x":10,"y":152,"w":82,"h":38},{"x":108,"y":108,"w":34,"h":82},{"x":162,"y":108,"w":28,"h":82}],"roads":[{"x":92,"y":10,"w":16,"h":180},{"x":10,"y":92,"w":180,"h":16},{"x":40,"y":60,"w":120,"h":10},{"x":128,"y":60,"w":10,"h":40}],"nodes":{"HEIST_INTRO":{"x":100,"y":45,"rot":0,"goal":{"x":100,"y":45},"route":[],"sideBlips":[]},"HEIST_GRAB":{"x":100,"y":45,"rot":0,"goal":null,"route":[],"sideBlips":[]},"AERIAL_SPLIT":{"x":100,"y":45,"rot":0,"hideMap":true,"sideBlips":[]},"CART_ALLEY":{"x":100,"y":165,"rot":0,"goal":{"x":100,"y":140},"route":[[100,165],[100,140]],"sideBlips":[]},"SHOOT":{"x":100,"y":140,"rot":0,"goal":{"x":100,"y":140},"route":[],"sideBlips":[]},"SWITCH_NZH":{"x":100,"y":140,"rot":0,"hideMap":true,"sideBlips":[]},"APPROACH_CAR":{"x":100,"y":85,"rot":0,"goal":{"x":100,"y":65},"route":[[100,85],[100,65]],"sideBlips":[]},"CARJACK":{"x":100,"y":65,"rot":0,"goal":{"x":100,"y":65},"route":[],"sideBlips":[]},"DRIVE_FM":{"x":100,"y":75,"rot":90,"goal":{"x":140,"y":70},"route":[[100,75],[140,75],[140,70]],"sideBlips":[{"x":65,"y":75,"label":"保熟吗？"}]},"WATERMELON":{"x":65,"y":75,"rot":90,"goal":{"x":140,"y":70},"route":[[65,75],[100,75],[140,70]],"sideBlips":[]},"ROADBLOCK":{"x":140,"y":70,"rot":270,"goal":{"x":35,"y":100},"route":[[140,70],[100,70],[100,100],[35,100]],"sideBlips":[]},"SWITCH_NHL":{"x":140,"y":70,"rot":270,"hideMap":true,"sideBlips":[]},"WESTGATE":{"x":35,"y":100,"rot":270,"goal":{"x":20,"y":100},"route":[[35,100],[20,100]],"sideBlips":[]},"SWITCH_TO_INSURGENT":{"x":20,"y":100,"rot":270,"goal":{"x":10,"y":100},"route":[[20,100],[10,100]],"sideBlips":[]},"BREAKOUT":{"x":10,"y":100,"rot":270,"goal":null,"route":[],"sideBlips":[]},"RESULT":{"x":10,"y":100,"rot":270,"hideMap":true,"sideBlips":[]}}}; /* MAP_FALLBACK */

  /* ---------- 全局状态 ---------- */
  var state = {
    mode: "title",                 // title | playing
    story: null,
    characterData: null,
    characters: [],
    currentCharId: null,
    wheelOpen: false,
    popupOpen: false,
    cutsceneBusy: false,
    nodeTimers: [],
    activeInteract: null,          // 当前可交互配置（视频播完后出现的 E 交互）
    videoStarted: false,           // 当前片段是否已按键开始播放
    videoFinished: false,          // 当前片段是否已完整播放结束
    videoMissing: false,           // 当前片段素材是否缺失
    sourceReady: false,
    placeholderElapsed: 0,         // 缺失素材仅累计按住播放键的时间
    placeholderTimer: 0,
    timelineEvents: null,          // 当前节点的时间轴事件（含 fired 标记）
    hold: { active: false, accumulated: 0, duration: 0, cfg: null },
    look: { key: null, mainSrc: "", mainTime: 0 },
    nodeId: null,
    node: null,
    flags: { money: 0, health: 100, armor: 0, wanted: 0 },
    keys: { w: false, a: false, s: false, d: false },
    typing: false,
    skipTyping: null,
    typeTimer: 0,
    autoTimer: 0,
    toastTimer: 0,
    busy: false,                   // 黑场切换中锁定输入
    lastZone: null,
    lastBannerTitle: null,
    lastBannerObjective: null,
    selectedIdx: -1,
    muted: false,
    mapData: null,                 // 小地图数据（map.json）
    menuOpen: false,
    runActive: false,
    visited: [],
    completed: [],
    journal: [],
    playedMs: 0,
    sideQuest: "未选择",
    sixStar: false,
    weaponReady: true,
    weaponWheelOpen: false,
    ammoClip: 0,
    transientPanel: null,
    choicesActive: false           // 当前节点的 choices 是否在视频播完后激活
  };

  /* ============================================================
     剧情加载
     ============================================================ */
  function loadStory() {
    if (isLocalFile() && EMBEDDED_STORY && EMBEDDED_STORY.nodes) return Promise.resolve(EMBEDDED_STORY);
    return new Promise(function (resolve, reject) {
      fetch("story.json", { cache: "no-cache" })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(resolve)
        .catch(function () {
          if (EMBEDDED_STORY && EMBEDDED_STORY.nodes) resolve(EMBEDDED_STORY);
          else reject(new Error("剧情加载失败：story.json 不可用，且无内置兜底数据"));
        });
    });
  }

  /* ============================================================
     角色数据加载（同样优先 fetch，file:// 下用内置兜底）
     ============================================================ */
  function loadCharacters() {
    if (isLocalFile() && EMBEDDED_CHARACTERS && EMBEDDED_CHARACTERS.characters) return Promise.resolve(EMBEDDED_CHARACTERS);
    return new Promise(function (resolve, reject) {
      fetch("characters.json", { cache: "no-cache" })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(resolve)
        .catch(function () {
          if (EMBEDDED_CHARACTERS && EMBEDDED_CHARACTERS.characters) resolve(EMBEDDED_CHARACTERS);
          else reject(new Error("角色数据加载失败：characters.json 不可用，且无内置兜底数据"));
        });
    });
  }

  /* ============================================================
     任务数据加载：优先 missions/heist_stage01.json；
     file:// 下用内置任务兜底；都没有时回退到 story.json
     ============================================================ */
  function loadMission() {
    if (isLocalFile() && EMBEDDED_MISSION && EMBEDDED_MISSION.nodes) return Promise.resolve(EMBEDDED_MISSION);
    return new Promise(function (resolve, reject) {
      fetch("missions/heist_stage01.json", { cache: "no-cache" })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(resolve)
        .catch(function () {
          if (EMBEDDED_MISSION && EMBEDDED_MISSION.nodes) { resolve(EMBEDDED_MISSION); return; }
          loadStory().then(resolve).catch(reject);
        });
    });
  }

  /* ============================================================
     小地图数据加载：优先 map.json；file:// 下用内置兜底
     ============================================================ */
  function loadMap() {
    if (isLocalFile() && EMBEDDED_MAP) return Promise.resolve(EMBEDDED_MAP);
    return new Promise(function (resolve) {
      fetch("map.json", { cache: "no-cache" })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json();
        })
        .then(resolve)
        .catch(function () { resolve(EMBEDDED_MAP || null); });
    });
  }

  /* ============================================================
     视频播放
     ============================================================ */
  var playToken = 0;
  function playbackKey() {
    return ((state.node && state.node.controls && state.node.controls.playKey) || "W").toLowerCase();
  }
  function playbackLabel() {
    return (state.node && state.node.controls && state.node.controls.playLabel === "射击") ? "射击" : "前进";
  }
  function playbackKeyLabel() { return playbackKey() === "mouseleft" ? "鼠标左键" : playbackKey().toUpperCase(); }
  function canPlayback() {
    var node = state.node;
    return !!(state.mode === "playing" && node && !node.completeUI && !node.switchCutscene &&
      state.keys[playbackKey()] && !state.videoFinished && !state.busy &&
      !state.cutsceneBusy && !state.wheelOpen && !state.popupOpen && !state.menuOpen &&
      !state.choicesActive && state.weaponReady && !state.weaponWheelOpen && !stageUI.classList.contains("show") && !document.hidden);
  }
  function canLeaveNode() {
    return !state.node || !state.node.video || state.node.completeUI ||
      state.node.switchCutscene || state.videoFinished;
  }

  function usesPlaceholderPreview(node) {
    return !!(previewConfig.enabled && !(node && sceneInfo(node).useVideo));
  }

  // 仅用 load 加载首帧。加载/恢复视角的异步回调都重新检查当前按键。
  function loadVideoSource(src, position, loop) {
    var myToken = ++playToken;
    stopMediaClock();
    state.sourceReady = false;
    state.videoMissing = false;
    video.pause();
    video.autoplay = false;
    video.loop = !!loop;
    video.muted = !!state.muted;
    video.playbackRate = 1;
    game.classList.remove("video-missing");
    vfFilePath.textContent = src || "(未指定视频)";
    vfNodeId.textContent = state.nodeId || "—";
    video.onseeked = null;
    if (usesPlaceholderPreview(state.node)) {
      video.onerror = null;
      video.onloadeddata = null;
      video.removeAttribute("src");
      video.load();
      showMissingVideo(src);
      state.videoMissing = state.mode === "playing" && !!state.node;
      state.sourceReady = true;
      return;
    }
    video.onerror = function () {
      if (myToken !== playToken) return;
      if (state.look.key) {
        endLook();
        showToast("该视角素材尚未就绪，已返回主视角", 1400);
        return;
      }
      state.videoMissing = true;
      state.sourceReady = true;
      game.classList.add("video-missing", "preview-mode");
      showMissingVideo(src);
      refreshSceneUI();
      startPlayback();
    };
    video.onloadeddata = function () {
      if (myToken !== playToken) return;
      function ready() {
        if (myToken !== playToken) return;
        video.onseeked = null;
        state.sourceReady = true;
        refreshSceneUI();
        startPlayback();
      }
      if (position > 0) {
        video.onseeked = ready;
        video.currentTime = position;
      } else {
        ready();
      }
    };
    video.src = src || "";
    video.load();
  }
  function primeFirstFrame(src) { loadVideoSource(src, 0, false); }
  function showMissingVideo(src) {
    $("missing-video-file").textContent = (src || "未指定视频").split(/[\\/]/).pop();
    $("missing-video-path").textContent = src || "";
  }
  function stopMediaClock() {
    mediaClockToken++;
    if (mediaFrame !== null && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(mediaFrame);
    clearInterval(mediaTimer);mediaFrame = mediaTimer = null;
  }
  function sampleMediaClock(ms) {
    if (!canPlayback() || !state.videoStarted || !state.sourceReady || state.videoMissing || state.look.key || video.paused) return;
    var previous = state.lastMediaMs || 0;
    // timeupdate may report a later time than the most recently presented frame.
    if (ms < previous) return;
    state.playedMs += ms - previous;
    state.lastMediaMs = ms;
    fireDueTimeline(ms);expireSceneUI(ms);refreshSceneProgress();
  }
  function startMediaClock() {
    stopMediaClock();var token = mediaClockToken;
    if (video.requestVideoFrameCallback) {
      var frame = function (_, metadata) {
        if (token !== mediaClockToken) return;
        sampleMediaClock(metadata.mediaTime * 1000);
        if (canPlayback()) mediaFrame = video.requestVideoFrameCallback(frame);
      };
      mediaFrame = video.requestVideoFrameCallback(frame);
    } else mediaTimer = setInterval(function () { sampleMediaClock(video.currentTime * 1000); }, 20);
  }

  /* ============================================================
     黑场淡入淡出（切换节点的过场）
     ============================================================ */
  function withFade(midCallback) {
    state.busy = true;
    pausePlayback();
    fadeEl.classList.add("fading");
    setTimeout(function () {
      midCallback();
      setTimeout(function () {
        fadeEl.classList.remove("fading");
        state.busy = false;
        startPlayback();
      }, 80);
    }, 380);
  }

  /* ============================================================
     标志位（金钱/血量/护甲为增量；通缉等级为绝对值 0~5）
     ============================================================ */
  function applyFlags(patch) {
    if (!patch) return;
    var f = state.flags;
    if (typeof patch.money === "number")  f.money  = Math.max(0, f.money + patch.money);
    if (typeof patch.health === "number") f.health = Math.min(100, Math.max(0, f.health + patch.health));
    if (typeof patch.armor === "number")  f.armor  = Math.min(100, Math.max(0, f.armor + patch.armor));
    if (typeof patch.wanted === "number") f.wanted = Math.min(5, Math.max(0, patch.wanted));
    updateHUD(patch);
  }

  function updateHUD(patch) {
    var f = state.flags;
    if ($("wanted-special")) $("wanted-special").classList.toggle("hidden", !state.sixStar);
    var cur = (state.story && state.story.meta && state.story.meta.currency) || "¥";
    var num = f.money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    moneyEl.textContent = cur === "¥" ? "¥ " + num : num + " " + cur;
    if (patch && typeof patch.money === "number") {
      moneyEl.classList.remove("tick");
      void moneyEl.offsetWidth;
      moneyEl.classList.add("tick");
    }
    // 通缉星
    var prev = wantedEl.getAttribute("data-level");
    wantedEl.setAttribute("data-level", f.wanted);
    wantedEl.innerHTML = "";
    if (gameHUD) gameHUD.wanted(state.sixStar ? 6 : f.wanted);
    else {
    for (var i = 0; i < (state.sixStar ? 6 : 5); i++) {
      var s = document.createElement("span");
      s.textContent = "★";
      s.className = state.sixStar || i < f.wanted ? "star-on" : "star-off";
      wantedEl.appendChild(s);
    }
    }
    if (prev !== null && f.wanted > Number(prev)) {
      wantedEl.classList.remove("level-up");
      void wantedEl.offsetWidth;
      wantedEl.classList.add("level-up");
    }
    if (gameHUD) gameHUD.money(f.money);
    healthFill.style.width = f.health + "%";
    armorFill.style.width = f.armor + "%";
  }

  /* ============================================================
     对白：打字机效果
     ============================================================ */
  function typeDialogue(node, done) {
    clearInterval(state.typeTimer);
    speakerEl.textContent = node.speaker || "";
    var text = node.dialogue || "";
    if (!text) { dtextEl.textContent = ""; state.typing = false; done(); return; }
    state.typing = true;
    dtextEl.textContent = "";
    var i = 0;
    state.skipTyping = function () {
      clearInterval(state.typeTimer);
      dtextEl.textContent = text;
      state.typing = false;
      state.skipTyping = null;
      done();
    };
    state.typeTimer = setInterval(function () {
      i += 2;
      dtextEl.textContent = text.slice(0, i);
      if (i >= text.length && state.skipTyping) state.skipTyping();
    }, 30);
  }

  /* ============================================================
     选项按钮
     ============================================================ */
  function renderChoices(node) {
    choicesEl.innerHTML = "";
    state.selectedIdx = -1;
    (node.choices || []).forEach(function (c, idx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "choice-btn";
      var badge = document.createElement("span");
      badge.className = "choice-badge";
      badge.textContent = c.key || String(idx + 1);
      var label = document.createElement("span");
      label.textContent = c.text;
      b.appendChild(badge);
      b.appendChild(label);
      b.addEventListener("click", function (ev) { ev.stopPropagation(); choose(idx); });
      b.addEventListener("mouseenter", function () { state.selectedIdx = idx; });
      choicesEl.appendChild(b);
    });
  }

  // 视频节点的 choices：视频播完后才激活显示（如 DRIVE_FM）
  function activateChoices() {
    if (!state.node || !state.node.choices || !state.node.choices.length) return;
    state.choicesActive = true;
    choicesEl.style.visibility = "visible";
    $("choice-caption").classList.remove("hidden");
    refreshSceneUI();
  }

  function choose(idx) {
    if (state.busy || state.cutsceneBusy || state.menuOpen || state.wheelOpen || state.typing || state.popupOpen || !state.choicesActive || !canLeaveNode()) return;
    var list = (state.node && state.node.choices) || [];
    var c = list[idx];
    if (!c) return;
    if (state.nodeId === "DRIVE_FM") state.sideQuest = c.next === "WATERMELON" ? "已接受" : "已跳过";
    recordJournal("选择", c.text);
    state.choicesActive = false;
    $("choice-caption").classList.add("hidden");
    choicesEl.style.visibility = "hidden";
    applyFlags(c.setFlags);
    cutTo(c.next);
  }

  /* ============================================================
     节点进入 / 切换
     ============================================================ */
  function goTo(nodeId) {
    if (!canLeaveNode()) return;
    if (nodeId === "$title") { returnToTitle(); return; }
    var node = state.story.nodes[nodeId];
    if (!node) { showToast("缺少剧情节点：" + nodeId, 1800); return; }
    withFade(function () { enterNode(node); });
  }

  // 连贯剪辑：同一地点、前后连续的片段直接切，不做黑场渐隐
  function cutTo(nodeId) {
    if (!canLeaveNode()) return;
    if (nodeId === "$title") { returnToTitle(); return; }
    var node = state.story.nodes[nodeId];
    if (!node) { showToast("缺少剧情节点：" + nodeId, 1800); return; }
    enterNode(node);
  }

  function enterNode(node) {
    if (node.redirectTo) { enterNode(state.story.nodes[node.redirectTo]); return; }
    if (weaponUI) weaponUI.hide();
    pausePlayback();
    if (!state.runActive && node.id === state.story.meta.startNode) resetRunState();
    game.classList.add("chapter-active");
    if (gameHUD) gameHUD.enter();
    game.classList.toggle("preview-mode", usesPlaceholderPreview(node));
    game.classList.toggle("preview-tools", !!previewConfig.enabled);
    game.classList.remove("chapter-complete");
    sceneTasks = [];
    clearInterval(state.typeTimer);
    state.typing = false;
    state.skipTyping = null;
    clearTimeout(state.autoTimer);

    // 清理上一节点的计时器与动态 UI
    clearNodeTimers();
    resetDynamicUI();
    state.look.key = null;

    // 清掉上一节点残留的对白字幕（本节点若有对白或字幕事件，会随后重新设置）
    dialogueEl.classList.remove("radio");
    if (!node.dialogue) { speakerEl.textContent = ""; dtextEl.textContent = ""; }

    state.nodeId = node.id || "";
    state.node = node;
    if (state.visited.indexOf(node.id) < 0) state.visited.push(node.id);
    var scene = sceneInfo(node);
    recordJournal("场景", scene.title + (node.location ? " · " + node.location : ""));
    updateMapForNode(node.id);
    state.videoStarted = false;
    state.videoFinished = false;
    state.videoMissing = false;
    state.timelineEvents = null;
    state.placeholderElapsed = 0;
    state.lastMediaMs = 0;
    state.weaponWheelOpen = false;
    state.weaponReady = !node.weaponSelect;
    state.sourceReady = false;
    if (typeof node.moneyTotal === "number") { state.flags.money = node.moneyTotal; updateHUD(); }

    // 角色切换演出节点（进入后由演出接管，完成后再落目标节点）
    if (node.switchCutscene) { runSwitchCutscene(node.switchCutscene); return; }

    // 角色自动同步（脚本任务：节点指定角色）
    if (node.character) {
      var nc = getCharacter(node.character);
      if (nc && nc.id !== state.currentCharId) applyCharacter(nc);
    }

    // 电影黑边
    game.classList.toggle("cinematic", !!node.cinematic);

    // 区域 / 地点
    mapLocEl.textContent = node.location || "";
    if (node.location && node.location !== state.lastZone) {
      state.lastZone = node.location;
      zoneToast.textContent = node.location;
      zoneToast.classList.add("show");
      nodeTimer(setTimeout(function () { zoneToast.classList.remove("show"); }, 2200));
    }

    // 任务文字：主线任务 + 当前目标（+ 次行）
    var meta = state.story.meta || {};
    chapterEl.textContent = node.missionTitle || meta.missionTitle || "";
    objectiveEl.textContent = node.objective || "";
    subObjectiveEl.textContent = node.subObjective || "";
    $("mission-panel").classList.remove("alert");

    // 中央任务横幅：任务标题首次出现时大标题；目标变化时只显示目标
    if (node.missionTitle && node.missionTitle !== state.lastBannerTitle) {
      showMissionBanner(node.missionTitle, node.objective, true);
      state.lastBannerTitle = node.missionTitle;
    } else if (node.objective && node.objective !== state.lastBannerObjective) {
      showMissionBanner("", node.objective, false);
    }
    state.lastBannerObjective = node.objective || "";

    // 通缉等级（绝对值）
    if (typeof node.wantedLevel === "number") applyFlags({ wanted: node.wantedLevel });

    // HUD 自定义行（等级/现金/能力/怒气/载具等，数据驱动）
    renderHudExtra(node.hud);

    // 距离指示
    if (node.distance) {
      distancePill.classList.remove("hidden");
      distanceText.textContent = node.distance;
    } else {
      distancePill.classList.add("hidden");
    }
    nitroIcon.classList.remove("on");

    // 弹药初始化
    if (node.ammo) setupAmmo(node.ammo);
    else ammoDisplay.classList.add("hidden");

    // 入场标志位 & 提示
    applyFlags(node.setFlags);
    if (node.toast) showToast(node.toast, 1600);

    // 结局标题卡
    endingCard.classList.remove("show");
    if (node.endingTitle) {
      nodeTimer(setTimeout(function () {
        endingCard.textContent = node.endingTitle;
        endingCard.classList.add("show");
      }, 650));
      nodeTimer(setTimeout(function () { endingCard.classList.remove("show"); }, 3800));
    }

    // 选项按钮：先渲染、默认隐藏；dialogue 节点打字后激活，视频节点播完后由 finishPlayback 激活
    state.choicesActive = false;
    renderChoices(node);
    choicesEl.style.visibility = "hidden";
    if (node.dialogue) {
      typeDialogue(node, function () { activateChoices(); });
    }

    // 阶段完成 UI（RESULT）：不播放视频，直接显示结算，事件由计时器驱动
    if (node.completeUI) {
      refreshSceneUI();
      game.classList.remove("video-missing");
      video.pause();
      showCompleteUI(node.completeUI);
      (node.events || []).forEach(function (ev) {
        nodeTimer(setTimeout(function () {
          if (state.node === node) handleTimelineEvent(ev);
        }, ev.at));
      });
      return;
    }

    refreshSceneUI();
    // 所有视频片段：进入静止首帧，不自动播放（按 W 才播）
    video.loop = false;
    video.playbackRate = 1;
    setupTimeline(node);
    primeFirstFrame(node.video);
    refreshSceneUI();

    // 播放提示：按 W 开始
    var c = node.controls || {};
    showPlayPrompt(c.playKey || "W", c.playLabel || "继续");
    startPlayback();
  }

  /* ============================================================
     通用 toast
     ============================================================ */
  function showToast(msg, ms) {
    clearTimeout(state.toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    state.toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, ms || 1400);
  }

  /* ============================================================
     任务引擎通用机制（数据驱动）
     ============================================================ */

  // 节点级计时器：离开节点时全部清理，避免事件跨节点触发
  function nodeTimer(id) { state.nodeTimers.push(id); return id; }
  function clearNodeTimers() {
    state.nodeTimers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    state.nodeTimers = [];
  }

  // 重置所有动态 UI
  function resetDynamicUI() {
    interactPrompt.classList.remove("show", "nag");
    eventPopup.classList.remove("show");
    sysModal.classList.remove("show");
    vehiclePopup.classList.remove("show");
    stageUI.classList.remove("show");
    stageUnlock.classList.remove("show");
    switchHint.classList.remove("show");
    holdProgress.classList.remove("show");
    nitroIcon.classList.remove("on");
    state.activeInteract = null;
    state.pendingSwitchHint = false;
    state.choicesActive = false;
    $("choice-caption").classList.add("hidden");
    choicesEl.style.visibility = "hidden";
    missionBanner.classList.remove("show");
    zoneToast.classList.remove("show");
    toastEl.classList.remove("show");
    clearTimeout(state.toastTimer);
    audioEffects.forEach(function (a) { a.pause(); });
    audioEffects = [];
    video.playbackRate = 1;
    clearTimeout(state.nagTimer);
  }

  // 一次性音效（素材缺失时静默，不报错；全局静音时不播放）
  function playSound(src) {
    if (state.muted || usesPlaceholderPreview(state.node)) return;
    try {
      var a = new Audio(src);
      audioEffects.push(a);
      a.volume = 0.55;
      a.addEventListener("error", function () {});
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
    } catch (e) {}
  }

  // HUD 自定义行
  function renderHudExtra(rows) {
    hudExtra.innerHTML = "";
    (rows || []).forEach(function (r) {
      var d = document.createElement("div");
      d.className = "hud-row";
      var l = document.createElement("span"); l.className = "hr-label"; l.textContent = r.label;
      var v = document.createElement("span"); v.className = "hr-value"; v.textContent = r.value;
      d.appendChild(l); d.appendChild(v);
      hudExtra.appendChild(d);
    });
  }

  /* ============================================================
     小地图：数据驱动 SVG（静态层只渲染一次，动态层随节点更新）
     ============================================================ */
  var SVG_NS = "http://www.w3.org/2000/svg";
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVG_NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function renderMapBase() {
    var d = state.mapData;
    if (!d || !mapSvg) return;
    var p = d.palette || {}, vb = d.meta.viewBox;
    mapSvg.innerHTML = "";
    mapSvg.style.display = "";
    mapSvg.appendChild(svgEl("rect", { x: 0, y: 0, width: vb, height: vb, fill: p.background || "#0c0e11" }));
    (d.buildings || []).forEach(function (b) {
      mapSvg.appendChild(svgEl("rect", {
        x: b.x, y: b.y, width: b.w, height: b.h,
        fill: p.building || "#23272d", stroke: p.buildingEdge || "#2f343b", "stroke-width": 1
      }));
    });
    (d.roads || []).forEach(function (r) {
      mapSvg.appendChild(svgEl("rect", { x: r.x, y: r.y, width: r.w, height: r.h, fill: p.road || "#3b4047" }));
    });
    mapSvg.appendChild(svgEl("g", { id: "map-dynamic" }));
  }
  function updateMapForNode(nodeId) {
    var d = state.mapData;
    if (!d || !mapSvg) return;
    var g = mapSvg.querySelector("#map-dynamic");
    if (!g) return;
    g.innerHTML = "";
    var p = d.palette || {};
    var cfg = d.nodes[nodeId];
    if (!cfg) { mapSvg.style.display = ""; return; }
    if (cfg.hideMap) { mapSvg.style.display = "none"; return; }
    mapSvg.style.display = "";
    if (cfg.route && cfg.route.length > 1) {
      g.appendChild(svgEl("polyline", {
        points: cfg.route.map(function (q) { return q[0] + "," + q[1]; }).join(" "),
        fill: "none", stroke: p.route || "#f5c518", "stroke-width": 3.5,
        "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.95
      }));
    }
    (cfg.sideBlips || []).forEach(function (b) {
      g.appendChild(svgEl("circle", { cx: b.x, cy: b.y, r: 3.2, fill: p.sideGoal || "#7fb2ff" }));
    });
    if (cfg.goal) {
      g.appendChild(svgEl("circle", {
        cx: cfg.goal.x, cy: cfg.goal.y, r: 4,
        fill: p.goal || "#ff4d4d", stroke: "#ffffff", "stroke-width": 1
      }));
    }
    var tri = svgEl("polygon", { points: "0,-6 4.5,5 -4.5,5", fill: p.player || "#ffffff" });
    tri.setAttribute("transform", "translate(" + cfg.x + "," + cfg.y + ") rotate(" + (cfg.rot || 0) + ")");
    g.appendChild(tri);
  }

  // 弹药显示
  function setupAmmo(cfg) {
    ammoDisplay.classList.remove("hidden", "depleted");
    ammoWeapon.textContent = "微型冲锋枪";
    setAmmo(cfg.start, cfg.max);
  }
  function setAmmo(n, max) {
    state.ammoClip = n;
    ammoCount.textContent = n + " / " + max;
    if (gameHUD) gameHUD.ammo(n, state.node.ammo || {});
    ammoDisplay.classList.toggle("depleted", n === 0);
    ammoDisplay.classList.remove("fade-out");
    // 弹药耗尽后几秒，弹药显示淡出（GTA 式临时信息）
    if (n === 0) {
      nodeTimer(setTimeout(function () {
        ammoDisplay.classList.add("fade-out");
      }, 2600));
    }
  }

  // 中央提示：播放提示（W）/ 段后交互（E），复用同一居中提示组件
  function showCenterPrompt(key, text) {
    clearTimeout(state.nagTimer);
    interactPrompt.classList.remove("nag");
    interactPrompt.querySelector(".ip-key").textContent = key || "W";
    interactText.textContent = text || "继续";
    interactPrompt.classList.add("show");
  }
  function hideCenterPrompt() {
    interactPrompt.classList.remove("show", "nag");
    clearTimeout(state.nagTimer);
  }

  // 中央任务横幅：任务开始时显示大标题，目标更新时只显示目标，自动淡出
  function showMissionBanner(title, objective, big, alert) {
    missionBanner.classList.remove("show", "alert");
    mbTitle.style.display = big ? "block" : "none";
    mbTitle.textContent = big ? title : "";
    mbObjective.textContent = objective || "";
    if (gameHUD) gameHUD.missionBanner(big, state.nodeId);
    missionBanner.classList.toggle("alert", !!alert);
    // 强制重排以重新触发过渡
    void missionBanner.offsetWidth;
    missionBanner.classList.add("show");
    nodeTimer(setTimeout(function () {
      missionBanner.classList.remove("show");
    }, big ? 5000 : 2000));
  }
  // 入场播放提示（按 W 才开始播放）—— GTA 式键帽 + 简短动作
  function showPlayPrompt(key, text) {
    if (!state.weaponReady) showCenterPrompt("Tab", "选择微型冲锋枪");
    else showCenterPrompt(playbackKeyLabel(), playbackLabel());
  }
  // 段后 E 交互提示（支持 5 秒未操作闪烁 nag）
  function setupInteract(cfg) {
    state.activeInteract = cfg || null;
    if (!cfg) { hideCenterPrompt(); return; }
    showCenterPrompt(cfg.key || "E", (cfg.prompt || "交互").replace(/^按\s*[A-Z]\s*/i, ""));
    refreshSceneUI();
    if (cfg.nagAfter) {
      state.nagTimer = setTimeout(function () {
        interactPrompt.classList.add("nag");
        interactText.textContent = cfg.nagText || cfg.prompt;
      }, cfg.nagAfter);
    }
  }

  /* ---------- 按住播放，松开原地暂停；再次按住从原进度继续 ---------- */
  function startPlayback() {
    if (!canPlayback()) return;
    state.videoStarted = true;
    hideCenterPrompt();
    refreshSceneUI();
    if (state.videoMissing) {
      startPlaceholderPlayback(state.node);
      return;
    }
    if (!state.sourceReady || !video.paused) return;
    video.muted = !!state.muted;
    var token = playToken;
    var p = video.play();
    startMediaClock();
    if (p && p.catch) p.catch(function (err) {
      if (token !== playToken || !canPlayback() || err.name === "AbortError") return;
      var c = state.node.controls || {};
      showPlayPrompt(c.playKey || "W", "继续");
    });
  }

  function pausePlayback() {
    stopMediaClock();
    video.pause();
    // Include the partial final tick so quick presses still accumulate time.
    if (state.placeholderTimer && placeholderLastTick && !state.videoFinished) {
      var pending = Math.max(0, performance.now() - placeholderLastTick);
      state.placeholderElapsed = Math.min(sceneDuration(state.node), state.placeholderElapsed + pending);
      state.playedMs += pending;
    }
    placeholderLastTick = 0;
    clearInterval(state.placeholderTimer);
    state.placeholderTimer = 0;
    if (state.mode === "playing" && state.node && !state.videoFinished &&
        !state.node.completeUI && !state.node.switchCutscene && !state.wheelOpen && !state.menuOpen) {
      var c = state.node.controls || {};
      showPlayPrompt(c.playKey || "W", state.videoStarted ? "继续" : (c.playLabel || "继续"));
    }
    audioEffects.forEach(function (a) { a.pause(); });
    refreshSceneUI();
  }

  // 缺素材使用可暂停的累计时钟，字幕、弹药及后续节点不会在松键后推进。
  function startPlaceholderPlayback(node) {
    if (state.placeholderTimer) return;
    var duration = sceneDuration(node);
    placeholderLastTick = performance.now();
    fireDueTimeline(state.placeholderElapsed);
    expireSceneUI(state.placeholderElapsed);
    state.placeholderTimer = setInterval(function () {
      if (state.node !== node || !canPlayback()) { pausePlayback(); return; }
      var now = performance.now();
      var delta = Math.min(now - placeholderLastTick, duration - state.placeholderElapsed);
      state.placeholderElapsed += Math.max(0, delta);
      state.playedMs += Math.max(0, delta);
      placeholderLastTick = now;
      fireDueTimeline(state.placeholderElapsed);
      expireSceneUI(state.placeholderElapsed);
      refreshSceneProgress();
      if (state.placeholderElapsed >= duration) finishPlayback();
    }, 40);
  }

  // Test mode can advance both missing-video placeholders and supplied videos.
  // Execute every authored event in order, then use the regular completion path.
  function canAdvancePreview() {
    var node = state.node;
    return !!(previewConfig.enabled && previewConfig.quickStep !== false &&
      state.mode === "playing" && node && node.video && !node.completeUI && !node.switchCutscene &&
      state.sourceReady && state.weaponReady && !state.weaponWheelOpen && !state.videoFinished && !state.busy && !state.cutsceneBusy &&
      !state.menuOpen && !state.wheelOpen && !state.popupOpen && !state.choicesActive && !state.typing &&
      !state.look.key && !openingCard.classList.contains("show") && !stageUI.classList.contains("show") &&
      !document.hidden && (validationActive || !document.hasFocus || document.hasFocus()));
  }
  function advancePreview() {
    if (!canAdvancePreview()) return;
    var node = state.node, duration = sceneDuration(node);
    releaseControls();
    state.videoStarted = true;
    // Use one virtual cursor so skipped event lifetimes match either media type.
    // Skipped time is deliberately not added to the player's actual elapsed time.
    previewSeekMs = sceneElapsed();
    try {
      (state.timelineEvents || []).filter(function (item) { return !item.fired; })
        .sort(function (a, b) { return a.ev.at - b.ev.at; }).forEach(function (item) {
          if (state.node !== node) return;
          previewSeekMs = Math.max(previewSeekMs, Math.min(duration, item.ev.at));
          expireSceneUI(previewSeekMs);
          fireDueTimeline(previewSeekMs);
        });
      if (state.node !== node) return;
      state.placeholderElapsed = duration;
      previewSeekMs = duration;
      expireSceneUI(duration);
    } finally {
      previewSeekMs = null;
    }
    if (!state.videoMissing) video.currentTime = Math.max(0, duration / 1000 - .001);
    refreshSceneProgress();
    finishPlayback();
  }

  /* ---------- A/D 按住切换视角，松开返回主视角 ---------- */
  function isLookKey(k) {
    var node = state.node;
    return !!(node && node.controls && node.controls.look && node.controls.look[k]);
  }
  function startLook(k) {
    var node = state.node;
    var alt = node && node.alternateVideos && node.alternateVideos[k];
    if (!alt || state.look.key || !canPlayback() || !state.sourceReady || state.videoMissing) return;
    state.look.key = k;
    state.look.mainSrc = node.video;
    state.look.mainTime = video.currentTime;
    loadVideoSource(alt, 0, true);
  }
  function endLook() {
    if (!state.look.key) return;
    var src = state.look.mainSrc, t = state.look.mainTime;
    state.look.key = null;
    loadVideoSource(src, t, false);
  }

  /* ---------- 时间轴事件（真实视频按 currentTime 驱动） ---------- */
  function setupTimeline(node) {
    state.timelineEvents = (node.events || []).map(function (ev) {
      return { ev: ev, fired: false };
    });
  }
  function fireDueTimeline(ms) {
    if (!state.timelineEvents) return;
    state.timelineEvents.forEach(function (item) {
      if (!item.fired && item.ev.at <= ms) {
        item.fired = true;
        handleTimelineEvent(item.ev);
      }
    });
  }
  function handleTimelineEvent(ev) {
    if (gameHUD && ev.eventPopup) ev = Object.assign({}, ev, { eventPopup: gameHUD.eventCopy(state.nodeId, ev.eventPopup) });
    if (ev.toast && ev.toast.indexOf("六星") >= 0) state.sixStar = true;
    if (ev.subtitle) recordJournal(ev.speaker || "对白", ev.subtitle);
    if (ev.objective) recordJournal("目标", ev.objective);
    [ev.eventPopup, ev.sysModal, ev.vehiclePopup].forEach(function (cfg) {
      if (cfg) recordJournal(cfg.title, cfg.sub || cfg.name || "");
    });
    if (ev.showSwitchHint) {
      // The wheel becomes actionable only after this segment has finished.
      state.pendingSwitchHint = true;
    }
    if (typeof ev.moneyTotal === "number") { state.flags.money = ev.moneyTotal; updateHUD(); }
    if (ev.subtitle) {
      speakerEl.textContent = ev.speaker || "";
      dtextEl.textContent = ev.subtitle;
      dialogueEl.classList.toggle("radio", !!ev.radio);
      queueSceneUI("subtitle", function () { speakerEl.textContent = ""; dtextEl.textContent = ""; }, ev.subtitleDuration || 2400, ev.at);
    }
    if (typeof ev.objective === "string") {
      objectiveEl.textContent = ev.objective;
      // 时间轴驱动的目标变化：在新 HUD 中短暂居中提示（警报时红色）
      showMissionBanner("", ev.objective, false, !!ev.uiAlert);
    }
    if (typeof ev.subObjective === "string") subObjectiveEl.textContent = ev.subObjective;
    if (ev.uiAlert) $("mission-panel").classList.add("alert");
    if (typeof ev.wantedLevel === "number") applyFlags({ wanted: ev.wantedLevel });
    if (ev.sound) playSound(ev.sound);
    if (ev.toast) showToast(ev.toast, 1500);
    if (ev.smallToast) showToast(ev.smallToast, 1200);
    if (typeof ev.ammo === "number" && state.node.ammo) setAmmo(ev.ammo, state.node.ammo.max);
    if (ev.distance) distanceText.textContent = ev.distance;
    if (ev.sysModal) showSysModal(ev.sysModal);
    if (ev.eventPopup) showEventPopup(ev.eventPopup);
    if (ev.vehiclePopup) showVehiclePopup(ev.vehiclePopup);
    if (ev.showSwitchHint && state.videoFinished) showSwitchPrompt();
    if (ev.unlockUI) showUnlockUI(ev.unlockUI);
    refreshSceneUI();
  }

  function showSysModal(cfg) {
    smTitle.textContent = cfg.title;
    smSub.textContent = cfg.sub || "";
    sysModal.classList.add("show");
    queueSceneUI("system", function () { sysModal.classList.remove("show"); }, cfg.duration || 1600);
  }
  function showEventPopup(cfg) {
    epTitle.textContent = cfg.title;
    epSub.textContent = cfg.sub || "";
    if (gameHUD) gameHUD.event(cfg, state.nodeId);
    eventPopup.classList.add("show");
    queueSceneUI("event", function () { eventPopup.classList.remove("show"); }, cfg.duration || 2000);
  }
  function showVehiclePopup(cfg) {
    vpTitle.textContent = cfg.title;
    vpName.textContent = cfg.name;
    vpStats.innerHTML = "";
    (cfg.stats || []).forEach(function (s) {
      var d = document.createElement("div");
      d.className = "vp-stat";
      var l = document.createElement("span"); l.textContent = s.label;
      var v = document.createElement("span"); v.className = "vs-val"; v.textContent = s.value;
      d.appendChild(l); d.appendChild(v);
      vpStats.appendChild(d);
    });
    if (gameHUD) gameHUD.vehicle(cfg);
    vehiclePopup.classList.add("show");
    queueSceneUI("vehicle", function () { vehiclePopup.classList.remove("show"); }, cfg.duration || 3000);
  }

  /* ---------- 阶段完成 / 新阶段解锁 ---------- */
  function setTextOrHide(el, text) {
    el.textContent = text || "";
    el.style.display = text ? "" : "none";
  }
  function showCompleteUI(cfg) {
    releaseControls();
    game.classList.add("chapter-complete");
    state.videoFinished = true;
    state.sixStar = false;
    state.flags.wanted = 0;
    updateHUD();
    $("result-summary").textContent = "三人带着战利品，开向远方。";
    var extra = $("result-extra");
    extra.innerHTML = "";
    [["支线「保熟吗？」", state.sideQuest === "已完成" ? "已完成 · 全部现切" : "已跳过 · 继续接应"],
     ["完成片段", state.completed.length + " 段"],
     ["剧情推进用时", formatTime(state.playedMs)]].forEach(function (row) {
      var line = document.createElement("div"); line.className = "sr";
      var label = document.createElement("b"); label.textContent = row[0];
      var value = document.createElement("span"); value.textContent = row[1];
      line.appendChild(label); line.appendChild(value); extra.appendChild(line);
    });
    recordJournal("任务完成", cfg.title);
    video.pause();                 // 冻结最后一帧（视频已自然播完）
    video.playbackRate = 1;
    setTextOrHide($("sc-kicker"), cfg.kicker);
    setTextOrHide($("sc-title"), cfg.title);
    var rows = $("sc-rows"); rows.innerHTML = "";
    (cfg.rows || []).forEach(function (r) {
      var d = document.createElement("div");
      d.className = "sr";
      var b = document.createElement("b"); b.textContent = r.label;
      var v = document.createElement("span"); v.textContent = r.value;
      d.appendChild(b); d.appendChild(v);
      rows.appendChild(d);
    });
    setTextOrHide($("sc-special"), cfg.special ? "特殊奖励：" + cfg.special : "");
    if (gameHUD) gameHUD.result(cfg);
    stageComplete.style.display = "block";
    stageUnlock.classList.remove("show");
    stageUI.classList.add("show");
    $("restart-chapter").focus({ preventScroll: true });
    // 延时显示下一阶段解锁预告
    if (cfg.unlockAfter && cfg.unlockUI) {
      nodeTimer(setTimeout(function () { showUnlockUI(cfg.unlockUI); }, cfg.unlockAfter));
    }
  }
  function showUnlockUI(cfg) {
    video.pause();
    video.playbackRate = 1;
    setTextOrHide($("su-kicker"), cfg.kicker);
    setTextOrHide(suHandoff, cfg.handoff);
    setTextOrHide(suStage, cfg.stageLabel);
    setTextOrHide($("su-character"), cfg.character);
    setTextOrHide($("su-mission"), cfg.mission);
    setTextOrHide($("su-desc"), cfg.desc);
    setTextOrHide(suGuard, cfg.guard);
    var btn = $("su-button");
    btn.textContent = cfg.button || "继续";
    btn.onclick = function () { showToast(cfg.buttonToast || "Demo 到此结束", 2000); };
    stageComplete.style.display = "none";
    stageUnlock.classList.add("show");
    stageUI.classList.add("show");
  }

  /* ---------- GTA5 式角色切换演出（阶段淡入淡出，无复杂动画） ---------- */
  function runSwitchCutscene(cfg) {
    if (gameHUD) gameHUD.cutscene();
    state.cutsceneBusy = true;
    video.pause();
    hud.classList.add("hidden");
    var source = getCharacter(state.currentCharId);
    var target = getCharacter(cfg.target);
    var next = state.story.nodes[cfg.next];
    cutscene.querySelector(".am-from span").textContent = source ? source.name : "国库";
    cutscene.querySelector(".am-to span").textContent = target ? target.name : "";
    $("cutscene-caption").textContent = state.nodeId === "AERIAL_SPLIT" ? "分头逃亡" : "切换角色";
    $("cutscene-target").textContent = (target ? target.name : "") + " · " + (next ? next.location : "");
    if (cfg.sound) playSound(cfg.sound);
    cutscene.classList.add("play");
    csStages.forEach(function (s) { s.classList.remove("on"); });
    // These are interface transitions, not video clips. Freeze them while unfocused.
    var elapsed = 0, previous = performance.now(), owner = state.node;
    var timer = nodeTimer(setInterval(function () {
      var now = performance.now();
      if (state.node !== owner) { clearInterval(timer); return; }
      if (!document.hidden && !state.menuOpen && (validationActive || document.hasFocus())) elapsed += now - previous;
      previous = now;
      var index = elapsed < 600 ? 0 : elapsed < 1700 ? 1 : elapsed < 2300 ? 2 : 3;
      csStages.forEach(function (s, i) { s.classList.toggle("on", i === index); });
      if (elapsed < 2900) return;
      clearInterval(timer);
      cutscene.classList.remove("play");
      csStages.forEach(function (s) { s.classList.remove("on"); });
      state.cutsceneBusy = false;
      if (target) applyCharacter(target);
      hud.classList.remove("hidden");
      if (next) enterNode(next);
    }, 40));
  }

  /* ============================================================
     开始游戏 / 返回标题
     ============================================================ */
  /* ---------- GTA 式开场黑幕字幕（约 5 秒，细黑体白字渐显渐隐） ---------- */
  function playOpeningCard(line, done) {
    openingText.textContent = line;
    openingText.classList.remove("fade-in", "fade-out");
    openingCard.classList.add("show");
    // 渐显
    nodeTimer(setTimeout(function () { openingText.classList.add("fade-in"); }, 300));
    // 渐隐
    nodeTimer(setTimeout(function () {
      openingText.classList.remove("fade-in");
      openingText.classList.add("fade-out");
    }, 3300));
    // 黑幕撤去，进入第一个节点
    nodeTimer(setTimeout(function () {
      openingCard.classList.remove("show");
      done();
    }, 4600));
  }

  function startGame() {
    if (state.mode !== "title" || state.busy || !state.story) return;
    // 用户主动开始（点击按钮 / 按 W）= 明确用户手势，借此解除浏览器自动播放静音
    state.muted = false;
    video.muted = false;
    if (backgroundMusic) backgroundMusic.setMuted(false);
    withFade(function () {
      state.mode = "playing";
      state.lastZone = null;
      state.lastBannerTitle = null;
      state.lastBannerObjective = null;
      missionBanner.classList.remove("show");
      var init = state.story.meta.initialFlags || {};
      state.flags = {
        money:  init.money  || 0,
        health: init.health || 100,
        armor:  init.armor  || 0,
        wanted: init.wanted || 0
      };
      updateHUD();
      var defId = (state.story.meta && state.story.meta.defaultCharacter) ||
                  (state.characterData.meta && state.characterData.meta.defaultCharacter) ||
                  state.characters[0].id;
      applyCharacter(getCharacter(defId));
      titleScreen.classList.add("hidden");
      // 开场黑幕字幕期间隐藏 HUD，结束后再进入第一个节点
      hud.classList.add("hidden");
      var start = state.story.meta.startNode;
      var line = (state.story.meta && state.story.meta.openingLine) ||
                 "雍正年间，紫禁城，国库值房。";
      playOpeningCard(line, function () {
        hud.classList.remove("hidden");
        enterNode(state.story.nodes[start]);
      });
    });
  }

  function returnToTitle() {
    withFade(function () {
      cleanRunUI();
      state.mode = "title";
      releaseControls();
      clearNodeTimers();
      resetDynamicUI();
      state.node = null;
      state.nodeId = null;
      state.videoStarted = false;
      state.videoFinished = false;
      clearTimeout(state.autoTimer);
      clearInterval(state.typeTimer);
      game.classList.remove("cinematic");
      endingCard.classList.remove("show");
      hud.classList.add("hidden");
      titleScreen.classList.remove("hidden");
      primeFirstFrame(state.story.meta.titleVideo);
    });
  }

  /* ============================================================
     角色系统：应用角色 / 技能栏 / 切换轮盘
     ============================================================ */
  function getCharacter(id) {
    for (var i = 0; i < state.characters.length; i++)
      if (state.characters[i].id === id) return state.characters[i];
    return null;
  }

  function applyCharacter(char) {
    state.currentCharId = char.id;

    // 角色配色（驱动面板边框、chip、技能栏）
    document.documentElement.style.setProperty("--char-color", char.color || "var(--yellow)");

    // 角色 chip
    chipAvatar.src = char.avatar;
    chipName.textContent = char.name;

    // 当前任务（角色驱动，切换角色即变化）
    var m = char.currentMission || {};
    chapterEl.textContent = m.title || "";
    objectiveEl.textContent = m.objective || "";

    // 武器 / 载具
    gearEl.innerHTML = "<b>武器</b> " + (char.weapon || "—") +
                       "　<b>载具</b> " + (char.vehicle || "—");

    // 技能按钮
    renderSkillButtons(char);

    // 轮盘当前角色标记
    wheelSegs.forEach(function (seg, i) {
      seg.classList.toggle("current",
        !!state.characters[i] && state.characters[i].id === char.id);
    });
  }

  function renderSkillButtons(char) {
    skillBtnsEl.innerHTML = "";

    (char.skills || []).forEach(function (name, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "skill-btn";
      b.innerHTML = '<span class="sk-badge">' + (i + 1) + "</span>" + name;
      b.addEventListener("click", function (ev) {
        ev.stopPropagation();
        showToast("技能演示：" + name, 1200);
      });
      skillBtnsEl.appendChild(b);
    });

    var u = document.createElement("button");
    u.type = "button";
    u.className = "skill-btn ultimate";
    u.innerHTML = '<span class="sk-badge">绝</span>特殊能力<small>' +
                  (char.specialAbility || "") + "</small>";
    u.addEventListener("click", function (ev) {
      ev.stopPropagation();
      showToast("特殊能力演示：" + char.name, 1500);
    });
    skillBtnsEl.appendChild(u);
  }

  function openWheel() {
    if (state.mode !== "playing" || !state.node || openingCard.classList.contains("show") || state.menuOpen || state.busy || state.cutsceneBusy || state.node.completeUI) return;
    // 当前片段未看完时禁止切换角色（视频必须完整播放）
    if (state.node && state.node.video && !state.videoFinished) {
      showToast("请先看完当前片段", 1100);
      return;
    }
    state.wheelOpen = true;
    pausePlayback();
    hideCenterPrompt();
    // 世界降饱和、压暗
    video.classList.add("wheel-dim");
    game.classList.add("wheel-dim");
    applyWheelRules();
    wheel.classList.add("open");
    // 信息面板默认显示当前角色
    var curIdx = state.characters.findIndex(function (c) { return c.id === state.currentCharId; });
    updateWheelInfo(curIdx >= 0 ? curIdx : 0);
  }

  function closeWheel() {
    state.wheelOpen = false;
    wheel.classList.remove("open");
    wheelInfo.classList.remove("show");
    video.classList.remove("wheel-dim");
    game.classList.remove("wheel-dim");
    startPlayback();
    refreshSceneUI();
  }

  function characterLocation(id) {
    if (id === state.currentCharId && state.node) return state.node.location;
    var rules = state.node && state.node.wheelRules;
    var nextId = rules && rules.next && rules.next[id];
    var next = nextId && state.story.nodes[nextId];
    if (next && next.switchCutscene) next = state.story.nodes[next.switchCutscene.next];
    return next ? next.location : "正在执行其他任务";
  }

  function abilityName(c) {
    var s = c.specialAbility || "";
    var i = s.indexOf("——");
    return (i >= 0 ? s.slice(0, i) : s).trim() || s;
  }
  function isWheelLocked(idx) {
    var c = state.characters[idx];
    var rules = state.node && state.node.wheelRules;
    if (!c || !rules) return false;
    return !!((rules.disabled && rules.disabled[c.id]) || (rules.allowed && rules.allowed.indexOf(c.id) < 0));
  }
  // 仅被选中/悬停角色显示 名称 / 位置 / 特殊能力
  function updateWheelInfo(idx) {
    var c = state.characters[idx];
    if (!c) { wheelInfo.classList.remove("show"); return; }
    wiName.textContent = c.name;
    if (isWheelLocked(idx)) {
      wiLocation.textContent = "当前任务不可用";
      wiAbility.textContent = "";
    } else {
      wiLocation.textContent = "当前位置：" +
        characterLocation(c.id);
      wiAbility.textContent = "特殊能力：" + abilityName(c);
    }
    if (gameHUD) gameHUD.selectWheel(c.id, isWheelLocked(idx));
    wheelInfo.classList.add("show");
  }

  // 按当前节点的 wheelRules 标记锁定 / 高亮
  function applyWheelRules() {
    var rules = state.node && state.node.wheelRules;
    wheelSegs.forEach(function (seg, i) {
      var c = state.characters[i];
      seg.classList.remove("locked", "highlight");
      seg.disabled = isWheelLocked(i);
      seg.setAttribute("aria-disabled", String(seg.disabled));
      if (!rules || !c) return;
      var lockSpan = seg.querySelector(".seg-lock");
      if (rules.disabled && rules.disabled[c.id]) {
        seg.classList.add("locked");
        if (lockSpan) lockSpan.textContent = rules.disabled[c.id];
      }
      if (rules.highlight === c.id) seg.classList.add("highlight");
    });
  }

  function switchToIndex(i) {
    if (!state.wheelOpen || state.menuOpen || !canLeaveNode()) return;
    var c = state.characters[i];
    if (!c) return;
    var rules = state.node && state.node.wheelRules;
    if (rules) {
      if (rules.disabled && rules.disabled[c.id]) {
        showToast(c.name + "：" + rules.disabled[c.id], 1300);
        return;
      }
      if (rules.allowed && rules.allowed.indexOf(c.id) === -1) {
        showToast(c.name + "：当前任务不可用", 1200);
        return;
      }
      // 脚本任务：选择某角色 → 进入指定节点（含切换演出）
      if (rules.next && rules.next[c.id]) {
        closeWheel();
        cutTo(rules.next[c.id]);
        return;
      }
    }
    // Demo 结算/解锁阶段：轮盘仅作展示，不进入任何角色的新剧情
    if (stageUI.classList.contains("show")) {
      if (c.id === state.currentCharId) { closeWheel(); return; }
      var fb = rules && rules.feedback && rules.feedback[c.id];
      showToast(c.name + "：" + (fb || "敬请期待完整版"), 1700);
      return;
    }
    closeWheel();
    if (c.id === state.currentCharId) return;
    applyCharacter(c);
    showToast("已切换至 " + c.name, 1300);
  }

  // 轮盘交互（只绑定一次）
  wheelSegs.forEach(function (seg) {
    seg.addEventListener("click", function (ev) {
      ev.stopPropagation();
      switchToIndex(Number(seg.getAttribute("data-idx")));
    });
    seg.addEventListener("mouseenter", function () {
      updateWheelInfo(Number(seg.getAttribute("data-idx")));
    });
  });
  document.querySelector(".wheel-backdrop").addEventListener("click", closeWheel);

  /* ============================================================
     E 键交互 / 视频结束事件 / 任务完成弹窗
     ============================================================ */
  function handleInteract() {
    if (state.mode !== "playing" || state.busy || state.cutsceneBusy || state.menuOpen || state.wheelOpen || !canLeaveNode()) return;
    if (state.typing) { if (state.skipTyping) state.skipTyping(); return; }
    var it = state.activeInteract;
    if (!it) { showToast("附近没有可交互目标", 900); return; }
    state.activeInteract = null;
    recordJournal("交互", it.prompt);
    hideCenterPrompt();
    if (it.setFlags) applyFlags(it.setFlags);
    if (it.nitro) nitroIcon.classList.add("on");
    if (it.next) { cutTo(it.next); return; }
    showToast(it.feedback || "交互完成", 1200);
  }

  function openMissionPopup(mc) {
    mcName.textContent = mc.title || "任务完成";
    mcReward.textContent = mc.rewards || "";
    if (mc.setFlags) applyFlags(mc.setFlags);
    state.popupOpen = true;
    pausePlayback();
    mcWrap.classList.add("show");
  }

  function closeMissionPopup() {
    state.popupOpen = false;
    mcWrap.classList.remove("show");
    startPlayback();
  }

  // 所有播放入口的最终门禁：曾经按过 W 不代表现在仍允许播放。
  function enforcePlaybackGate() {
    if (!canPlayback() || !state.sourceReady) video.pause();
  }
  video.addEventListener("play", enforcePlaybackGate);
  video.addEventListener("playing", enforcePlaybackGate);

  video.addEventListener("timeupdate", function () { sampleMediaClock(video.currentTime * 1000); });

  function finishPlayback() {
    var node = state.node;
    if (!node || state.mode !== "playing" || !state.videoStarted ||
        state.videoFinished || state.look.key) return;
    state.videoFinished = true;
    if (state.completed.indexOf(node.id) < 0) state.completed.push(node.id);
    if (node.id === "WATERMELON") state.sideQuest = "已完成";
    pausePlayback();
    hideCenterPrompt();
    var post = (node.controls && node.controls.interact) || node.interact;
    if (post) { setupInteract(post); return; }
    // 视频节点选择（如 DRIVE_FM）：播完后激活 choices
    if (node.choices && node.choices.length) { activateChoices(); return; }
    var ev = node.onEnd || (node.endNext ? { next: node.endNext } : null);
    if (!ev) { showSwitchPrompt(); refreshSceneUI(); return; }
    if (ev.setFlags) applyFlags(ev.setFlags);
    if (ev.toast) showToast(ev.toast, 1500);
    // 结算节点 RESULT：视频播完后才触发
    if (ev.completeUI) { showCompleteUI(ev.completeUI); return; }
    if (ev.next) cutTo(ev.next);
  }

  // 只接受当前主视频自然结束；占位素材由其累计时钟单独结束。
  video.addEventListener("ended", function () {
    if (!state.sourceReady || state.videoMissing || state.look.key || !video.ended ||
        !state.node || video.getAttribute("src") !== state.node.video) return;
    fireDueTimeline(video.currentTime * 1000);
    finishPlayback();
  });

  mcConfirm.addEventListener("click", function (ev) {
    ev.stopPropagation(); closeMissionPopup();
  });

  /* ============================================================
     键盘：WASD / Alt / E 监听
     ============================================================ */
  function setKeyVisual(k) {
    var el = document.querySelector('.key[data-key="' + k + '"]');
    if (el) el.classList.toggle("active", state.keys[k]);
  }

  function handleDirection(k) {
    if (state.mode === "title") {
      if (k === "w") startGame();
      return;
    }
    // 打字中：按键 = 跳过打字
    if (state.typing) { if (state.skipTyping) state.skipTyping(); return; }
    // 查找该方向绑定的选项
    var list = (state.node && state.node.choices) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].key && list[i].key.toLowerCase() === k) { choose(i); return; }
    }
    showToast("该方向无法通行", 900);
  }

  function handleConfirm() {
    if (state.mode === "title") { startGame(); return; }
    if (state.typing) { if (state.skipTyping) state.skipTyping(); return; }
    var idx = state.selectedIdx >= 0 ? state.selectedIdx : 0;
    choose(idx);
  }

  function eventKey(e) {
    // 使用物理键位，兼容大写锁定及输入法。
    if (e.code === "Space") return " ";
    return /^Key[A-Z]$/.test(e.code || "") ? e.code.slice(3).toLowerCase() : e.key.toLowerCase();
  }
  document.addEventListener("keydown", function (e) {
    var k = eventKey(e);
    if (state.mode === "playing" && state.menuOpen && e.target && e.target.closest && e.target.closest("input,select,textarea")) {
      if (k === "escape") { e.preventDefault(); closeGameMenu(); }
      return;
    }
    if (state.mode === "playing" && state.node && state.node.completeUI && !state.menuOpen && (k === "escape" || k === "p")) {
      e.preventDefault();openGameMenu("pause");return;
    }
    if (state.mode === "playing" && !state.menuOpen && !state.busy && !state.cutsceneBusy && state.node && state.node.weaponSelect && !state.videoFinished) {
      if (k === "tab") { e.preventDefault(); if (!e.repeat) openWeaponSelection(); return; }
      if (state.weaponWheelOpen) {
        e.preventDefault();
        if (k === "escape") finishWeaponSelection(false);
        if (k === "enter") finishWeaponSelection(true);
        return;
      }
    }
    if (state.mode === "playing" && state.node && !state.busy && !state.cutsceneBusy && !openingCard.classList.contains("show")) {
      if (state.menuOpen) {
        if (e.repeat) return;
        if (k === "escape" || k === "p" || k === "j") { e.preventDefault(); closeGameMenu(); }
        else if (k !== "tab" && k !== "enter" && k !== " ") e.preventDefault();
        return;
      }
      if (!state.node.completeUI && (k === "p" || k === "j" || (k === "escape" && !state.wheelOpen && !state.popupOpen))) {
        e.preventDefault(); if (!e.repeat) openGameMenu(k === "j" ? "journal" : "pause"); return;
      }
    }
    if (state.node && state.node.completeUI && (k === "enter" || k === " ") && e.target && e.target.closest && e.target.closest("button")) return;
    if (k === " " && state.mode === "playing" && previewConfig.enabled && previewConfig.quickStep !== false &&
        (!state.node || !state.node.completeUI)) {
      e.preventDefault();
      if (!e.repeat) advancePreview();
      return;
    }
    var movement = k in state.keys || k === playbackKey();
    if (movement) e.preventDefault();
    if (e.repeat) return;
    // 即使处于加载/过场，也记录真实按键；播放仍由门禁控制。
    if (movement) { state.keys[k] = true; setKeyVisual(k); }
    if (state.cutsceneBusy || state.busy) { e.preventDefault(); return; }
    if (k === "alt") {
      e.preventDefault();
      state.wheelOpen ? closeWheel() : openWheel();
      return;
    }
    // 隐藏的声音 / 全屏按钮改用 M / F 键
    if (k === "m") { e.preventDefault(); toggleMute(); return; }
    if (k === "f") { e.preventDefault(); toggleFullscreen(); return; }
    if (k === "escape") {
      if (state.wheelOpen) { closeWheel(); return; }
      if (state.popupOpen) { closeMissionPopup(); return; }
    }
    if (state.popupOpen) {
      if (k === "e" || k === "enter" || k === " ") {
        e.preventDefault(); closeMissionPopup();
      }
      return;
    }
    if (state.wheelOpen) {
      if (k === "1" || k === "2" || k === "3") switchToIndex(Number(k) - 1);
      return;
    }
    // choices 激活时：按任意 choice.key 选择（支持 E / Q 等绑定键）
    if (state.choicesActive) {
      var cl = (state.node && state.node.choices) || [];
      for (var ci = 0; ci < cl.length; ci++) {
        if (cl[ci].key && cl[ci].key.toLowerCase() === k) {
          e.preventDefault(); choose(ci); return;
        }
      }
    }
    if (k === "e") { e.preventDefault(); handleInteract(); return; }
    if (k === "enter") { e.preventDefault(); handleConfirm(); return; }
    if (!movement) return;
    if (state.mode === "title") { if (k === "w") startGame(); return; }
    if (k === playbackKey() && !state.videoFinished) startPlayback();
    else if (isLookKey(k) && !state.videoFinished) startLook(k);
    else if (state.videoFinished) handleDirection(k);
  });

  document.addEventListener("keyup", function (e) {
    var k = eventKey(e);
    if (k === "tab" && state.weaponWheelOpen) { e.preventDefault(); finishWeaponSelection(true); return; }
    if (k in state.keys) {
      state.keys[k] = false;
      setKeyVisual(k);
      if (k === playbackKey()) pausePlayback();
      if (k === state.look.key) endLook();
    }
  });

  function releaseControls() {
    firePointer = null;
    Object.keys(state.keys).forEach(function (k) {
      state.keys[k] = false;
      setKeyVisual(k);
    });
    pausePlayback();
    endLook();
  }
  window.addEventListener("blur", function () { if (validationActive && !document.hidden) return; if (state.weaponWheelOpen) finishWeaponSelection(false); releaseControls(); });
  window.addEventListener("focus", refreshSceneUI);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (state.weaponWheelOpen) finishWeaponSelection(false); releaseControls(); }
    else refreshSceneUI();
  });

  /* ============================================================
     声音 / 全屏
     ============================================================ */
  function toggleMute() {
    state.muted = !state.muted;
    video.muted = state.muted;
    if (backgroundMusic) backgroundMusic.setMuted(state.muted);
    btnSound.textContent = "声音：" + (state.muted ? "关" : "开");
    $("btn-game-sound").innerHTML = (state.muted ? "声音关 " : "声音开 ") + "<kbd>M</kbd>";
    if (state.muted) audioEffects.forEach(function (a) { a.pause(); });
    showToast(state.muted ? "已静音（M 取消）" : "声音开启（M 静音）", 1000);
  }
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      var el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }
  btnSound.addEventListener("click", function (e) { e.stopPropagation(); toggleMute(); });
  btnFull.addEventListener("click", function (e) { e.stopPropagation(); toggleFullscreen(); });
  document.addEventListener("fullscreenchange", function () {
    btnFull.textContent = document.fullscreenElement ? "退出全屏" : "全屏";
  });

  // 点击画面：打字中可跳过对白
  game.addEventListener("click", function () {
    if (state.mode === "playing" && state.typing && state.skipTyping) state.skipTyping();
  });

  startBtn.addEventListener("click", function (e) { e.stopPropagation(); startGame(); });

  // 启动器标签：在线 / GTA+ 仅切换高亮；“故事”（start-btn）开始游戏
  var launcherTabs = document.querySelectorAll(".launcher-tab");
  launcherTabs.forEach(function (tab) {
    if (tab.id === "start-btn") return;
    tab.addEventListener("click", function () {
      launcherTabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
    });
  });
  startBtn.addEventListener("click", function () {
    launcherTabs.forEach(function (t) { t.classList.remove("active"); });
    startBtn.classList.add("active");
  });

  /* ---------- 第一章场景预览与完整游玩界面 ---------- */
  function sceneInfo(node) {
    node = node || {};
    return (previewConfig.scenes || {})[node.id] || { title: node.objective || "剧情", description: "" };
  }
  function sceneDuration(node) {
    if (!node) return 0;
    if (node === state.node && state.sourceReady && !state.videoMissing &&
        Number.isFinite(video.duration) && video.duration > 0) return video.duration * 1000;
    var duration = Math.max(5000, sceneInfo(node).durationMs || 0);
    (node.events || []).forEach(function (ev) {
      var tail = ev.subtitle ? 2400 : 1500;
      if (ev.eventPopup) tail = Math.max(tail, ev.eventPopup.duration || 2000);
      if (ev.sysModal) tail = Math.max(tail, ev.sysModal.duration || 1600);
      if (ev.vehiclePopup) tail = Math.max(tail, ev.vehiclePopup.duration || 3000);
      duration = Math.max(duration, ev.at + tail);
    });
    return duration;
  }
  function sceneElapsed() { return previewSeekMs !== null ? previewSeekMs : state.videoMissing ? state.placeholderElapsed : video.currentTime * 1000; }
  function formatTime(ms) {
    var seconds = Math.floor(Math.max(0, ms) / 1000);
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  }
  function queueSceneUI(key, callback, delay, startMs) {
    sceneTasks = sceneTasks.filter(function (t) { return t.key !== key; });
    sceneTasks.push({ key: key, at: (typeof startMs === "number" ? startMs : sceneElapsed()) + delay, callback: callback });
  }
  function expireSceneUI(ms) {
    var due = sceneTasks.filter(function (t) { return t.at <= ms; });
    sceneTasks = sceneTasks.filter(function (t) { return t.at > ms; });
    due.forEach(function (t) { t.callback(); });
  }
  function refreshSceneProgress() {
    if (!state.node) return;
    var duration = sceneDuration(state.node);
    var elapsed = Math.min(duration, sceneElapsed());
    $("scene-progress").value = duration ? elapsed / duration * 100 : 0;
    $("scene-elapsed").textContent = formatTime(elapsed);
    $("scene-duration").textContent = formatTime(duration);
    if (gameHUD) gameHUD.sync(state, sceneElapsed(), duration);
  }
  function refreshSceneUI() {
    var node = state.node;
    if (!node || !game.classList.contains("chapter-active")) return;
    var scene = sceneInfo(node), character = getCharacter(state.currentCharId);
    if (character) {
      $("active-portrait").src = character.avatar;
      $("active-portrait").alt = character.name;
      $("active-name").textContent = character.name;
    }
    var details = (node.hud || []).filter(function (r) { return r.label !== "现金"; });
    $("active-role").textContent = details.map(function (r) { return r.label + "：" + r.value; }).join(" · ");
    $("current-objective").textContent = objectiveEl.textContent || node.objective;
    $("current-subobjective").textContent = subObjectiveEl.textContent || "";
    var ids = Object.keys(previewConfig.scenes || {}).filter(function (id) { return state.story.nodes[id] && !state.story.nodes[id].redirectTo; });
    $("scene-number").textContent = "场景 " + String(ids.indexOf(node.id) + 1).padStart(2, "0") + " / " + ids.length;
    $("scene-title").textContent = scene.title;
    $("scene-description").textContent = scene.description;
    var status = !state.weaponReady ? "Tab 选择微型冲锋枪" : playbackKeyLabel() + " " + playbackLabel();
    if (state.menuOpen) status = "已暂停";
    else if (state.activeInteract) status = "片段结束 · 按 E 交互";
    else if (state.choicesActive) status = "片段结束 · 选择接下来的行动";
    else if (state.videoFinished) status = node.wheelRules && node.wheelRules.next ? "片段结束 · 按 Alt 切换角色" : "片段已结束";
    else if (canPlayback()) status = playbackLabel() + "中";
    $("scene-state").textContent = status;
    $("preview-hold").textContent = playbackKeyLabel() + " " + playbackLabel();
    $("preview-hold").disabled = !!(state.videoFinished || node.completeUI || node.switchCutscene || state.menuOpen);
    $("preview-hold").classList.toggle("held", canPlayback());
    var quickStep = !!(previewConfig.enabled && previewConfig.quickStep !== false);
    $("preview-next").hidden = !quickStep;
    $("preview-next-control").hidden = !quickStep;
    $("preview-next").disabled = !canAdvancePreview();
    $("btn-game-sound").innerHTML = (state.muted ? "声音关 " : "声音开 ") + "<kbd>M</kbd>";
    refreshSceneProgress();
  }
  function showSwitchPrompt() {
    var rules = state.node && state.node.wheelRules;
    if (!rules || !rules.next || !state.videoFinished) return;
    var target = getCharacter(rules.highlight || Object.keys(rules.next)[0]);
    switchHint.textContent = "按 Alt 切换" + (target ? target.name : "角色");
    switchHint.classList.add("show");
    showCenterPrompt("Alt", "选择" + (target ? target.name : "支援角色"));
  }
  function recordJournal(kind, text) {
    if (!state.runActive || !text) return;
    state.journal.push({ kind: kind, text: text, node: state.nodeId, at: state.playedMs });
  }
  function renderJournal() {
    var list = $("journal-list"); list.innerHTML = "";
    state.journal.forEach(function (entry) {
      var article = document.createElement("article"); article.className = "journal-entry";
      var heading = document.createElement("h3"); heading.textContent = entry.kind;
      var time = document.createElement("time"); time.textContent = formatTime(entry.at);
      var body = document.createElement("p"); body.textContent = entry.text;
      article.appendChild(heading); article.appendChild(time); article.appendChild(body); list.appendChild(article);
    });
    if (!state.journal.length) list.textContent = "本局剧情记录会显示在这里。";
    list.scrollTop = list.scrollHeight;
  }
  function openGameMenu(kind) {
    if (state.mode !== "playing" || !state.node || state.cutsceneBusy || state.busy || (state.node.completeUI && kind !== "pause")) return;
    menuFocus = document.activeElement;
    state.menuOpen = true;
    releaseControls();
    if (state.wheelOpen) closeWheel();
    hideCenterPrompt();
    $("pause-menu").classList.toggle("hidden", kind !== "pause");
    $("mission-journal").classList.toggle("hidden", kind !== "journal");
    if (kind === "journal") { renderJournal(); $("close-journal").focus(); }
    else $("resume-game").focus();
    refreshSceneUI();
  }
  function closeGameMenu() {
    state.transientPanel = null;
    if (gameHUD) gameHUD.closeTransient();
    $("pause-menu").classList.add("hidden");
    $("mission-journal").classList.add("hidden");
    state.menuOpen = false;
    releaseControls();
    if (state.activeInteract) showCenterPrompt(state.activeInteract.key || "E", state.activeInteract.prompt);
    else if (state.videoFinished) showSwitchPrompt();
    if (menuFocus && menuFocus.isConnected && !menuFocus.disabled) menuFocus.focus();
    menuFocus = null;
  }
  function resetRunState() {
    if (gameHUD) gameHUD.reset();
    state.runActive = true;
    state.visited = [];
    state.completed = [];
    state.journal = [];
    state.playedMs = 0;
    state.sideQuest = "未选择";
    state.sixStar = false;
    state.menuOpen = false;
  }
  function cleanRunUI() {
    if (weaponUI) weaponUI.hide();
    state.weaponWheelOpen = false; state.weaponReady = true; state.transientPanel = null;
    if (gameHUD) gameHUD.reset();
    state.menuOpen = true;
    releaseControls();
    clearNodeTimers();
    clearInterval(state.typeTimer);
    sceneTasks = [];
    state.node = null;
    state.nodeId = null;
    state.runActive = false;
    state.cutsceneBusy = false;
    state.typing = false;
    state.skipTyping = null;
    state.videoStarted = false;
    state.videoFinished = false;
    state.sixStar = false;
    closeWheel();
    state.menuOpen = false;
    state.popupOpen = false;
    mcWrap.classList.remove("show");
    cutscene.classList.remove("play");
    csStages.forEach(function (s) { s.classList.remove("on"); });
    $("pause-menu").classList.add("hidden");
    $("mission-journal").classList.add("hidden");
    resetDynamicUI();
    speakerEl.textContent = ""; dtextEl.textContent = "";
    game.classList.remove("chapter-active", "preview-mode", "preview-tools", "chapter-complete", "video-missing", "wheel-dim");
    hud.classList.add("hidden");
  }
  function restartChapter() {
    if (state.busy || state.cutsceneBusy) return;
    cleanRunUI();
    state.mode = "title";
    startGame();
  }

  $("preview-next").addEventListener("click", advancePreview);
  $("btn-pause").addEventListener("click", function () { openGameMenu("pause"); });
  $("btn-journal").addEventListener("click", function () { openGameMenu("journal"); });
  $("resume-game").addEventListener("click", closeGameMenu);
  $("close-journal").addEventListener("click", closeGameMenu);
  $("restart-game").addEventListener("click", restartChapter);
  $("restart-chapter").addEventListener("click", restartChapter);
  $("pause-title").addEventListener("click", returnToTitle);
  $("result-title-button").addEventListener("click", returnToTitle);
  $("btn-game-sound").addEventListener("click", toggleMute);
  $("btn-game-fullscreen").addEventListener("click", toggleFullscreen);
  // Shooting footage advances only while the left mouse button is held on the game view.
  var firePointer = null;
  game.addEventListener("pointerdown", function (e) {
    if (playbackKey() !== "mouseleft" || state.mode !== "playing" || !state.weaponReady ||
        state.weaponWheelOpen || state.videoFinished || state.menuOpen || state.wheelOpen ||
        state.busy || state.cutsceneBusy || e.button !== 0 || e.isPrimary === false) return;
    if (e.target.closest("button,input,select,textarea,a,[role=button],#status-tr,#scene-preview,#playthrough-toolbar,#game-weapon-panel,#switch-wheel,#pause-menu,#mission-journal,#stage-ui")) return;
    e.preventDefault();firePointer = e.pointerId;if (e.isTrusted) game.setPointerCapture(e.pointerId);
    state.keys.mouseleft = true;startPlayback();
  });
  function releaseFire(e) {
    if (firePointer === null || firePointer !== e.pointerId) return;
    firePointer = null;state.keys.mouseleft = false;pausePlayback();
  }
  document.addEventListener("pointerup", releaseFire);
  document.addEventListener("pointercancel", releaseFire);
  game.addEventListener("lostpointercapture", releaseFire);
  // Mouse/touch equivalent of holding the current scene's action key.

  var holdPointer = null;
  $("preview-hold").addEventListener("pointerdown", function (e) {
    if (e.button !== 0 || this.disabled) return;
    e.preventDefault();
    holdPointer = e.pointerId;
    this.setPointerCapture(e.pointerId);
    state.keys[playbackKey()] = true;
    startPlayback();
  });
  function releasePointer(e) {
    if (holdPointer !== e.pointerId) return;
    holdPointer = null;
    state.keys[playbackKey()] = false;
    pausePlayback();
  }
  $("preview-hold").addEventListener("pointerup", releasePointer);
  $("preview-hold").addEventListener("pointercancel", releasePointer);
  $("preview-hold").addEventListener("lostpointercapture", releasePointer);
  document.addEventListener("keydown", function (e) {
    if (!state.menuOpen || e.key !== "Tab") return;
    var panel = state.transientPanel ? $(state.transientPanel) : !$("pause-menu").classList.contains("hidden") ? $("pause-menu") : $("mission-journal");
    var buttons = panel.querySelectorAll("button:not([disabled]),select:not([disabled]),input:not([disabled])");
    var first = buttons[0], last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });


  /* ============================================================
     启动
     ============================================================ */
  function fatal(msg) {
    titleScreen.classList.remove("hidden");
    var box = document.createElement("div");
    box.style.cssText = "color:#ff8080;font-size:15px;margin-top:18px;max-width:80%;text-align:center;";
    box.textContent = msg;
    titleScreen.insertBefore(box, startBtn);
  }

  function init() {
    video.muted = true;
    Promise.all([loadMission(), loadCharacters(), loadMap()]).then(function (res) {
      var story = res[0], chars = res[1], mapData = res[2];
      state.story = story;
      state.characterData = chars;
      state.characters = chars.characters || [];
      state.mapData = mapData;
      renderMapBase();
      var initFlags = story.meta.initialFlags || {};
      state.flags = {
        money:  initFlags.money  || 0,
        health: initFlags.health || 100,
        armor:  initFlags.armor  || 0,
        wanted: initFlags.wanted || 0
      };
      primeFirstFrame(story.meta.titleVideo);
      updateHUD();

      if (diagnostics) diagnostics.bind({
        local:isLocalFile(),
        snapshot:function () {
          var node=state.node || {};
          return {mode:state.mode,node:state.nodeId,character:state.currentCharId,
            ready:state.sourceReady,placeholder:state.videoMissing,paused:video.paused,timer:!!state.placeholderTimer,
            playing:canPlayback() && state.sourceReady,elapsed:Math.max(0,Number(sceneElapsed())||0),
            cutscene:state.cutsceneBusy,busy:state.busy,menu:state.menuOpen,wheel:state.wheelOpen,
            weaponWheel:state.weaponWheelOpen,weaponReady:state.weaponReady,finished:state.videoFinished,
            interact:!!state.activeInteract,choices:state.choicesActive,complete:!!node.completeUI,
            ammo:node.ammo?state.ammoClip:null,reserve:node.ammo?node.ammo.reserve:null,
            money:state.flags.money,wanted:state.flags.wanted,completed:state.completed.slice()};
        },
        begin:function () {
          validationSaved={enabled:previewConfig.enabled,quickStep:previewConfig.quickStep,muted:state.muted};
          validationActive=true;previewConfig.enabled=true;previewConfig.quickStep=true;releaseControls();
          if(state.mode==="title") startGame();else restartChapter();
          state.muted=true;video.muted=true;
          if(backgroundMusic)backgroundMusic.setMuted(true);
        },
        end:function () {
          releaseControls();validationActive=false;
          if(validationSaved){previewConfig.enabled=validationSaved.enabled;previewConfig.quickStep=validationSaved.quickStep;
            state.muted=validationSaved.muted;video.muted=state.muted;validationSaved=null;
            if(backgroundMusic)backgroundMusic.setMuted(state.muted);}
          refreshSceneUI();
        },
        release:releaseControls,
        key:function(type,code){
          var key=code==="Space"?" ":code==="Alt"?"Alt":code.replace(/^Key/,"").replace(/^Digit/,"");
          document.dispatchEvent(new window.KeyboardEvent(type,{key:key,code:code==="Alt"?"AltLeft":code,bubbles:true,cancelable:true}));
        },
        pointer:function(type){
          var event=new window.PointerEvent(type,{pointerId:9001,pointerType:"mouse",button:0,isPrimary:true,bubbles:true,cancelable:true});
          (type==="pointerdown"?video:document).dispatchEvent(event);
        }
      });
      // 调试钩子（仅自检用）：window.__DEBUG = { autoStart:true, wheel:true, charId:'nianzhuohua' }
      if (window.__DEBUG) {
        window.__DEBUG.getState = function () { return state; };
        window.__DEBUG.gotoNode = function (id) { enterNode(state.story.nodes[id]); };
      }
      if (window.__DEBUG && window.__DEBUG.autoStart) {
        setTimeout(function () {
          startGame();
          setTimeout(function () {
            if (window.__DEBUG.charId) applyCharacter(getCharacter(window.__DEBUG.charId));
            if (window.__DEBUG.node) enterNode(state.story.nodes[window.__DEBUG.node]);
            if (window.__DEBUG.wheel) openWheel();
          }, 750);
        }, 200);
      }
    }).catch(function (err) { fatal(err.message); });
  }

  function openWeaponSelection() {
    if (!weaponUI || state.menuOpen || state.weaponWheelOpen || state.videoFinished || !state.node.weaponSelect) return;
    state.weaponWheelOpen = true;releaseControls();hideCenterPrompt();
    weaponUI.show(state.ammoClip, state.node.ammo.reserve);refreshSceneUI();
  }
  function finishWeaponSelection(confirm) {
    if (!state.weaponWheelOpen) return;
    state.weaponWheelOpen = false;
    if (confirm) state.weaponReady = true;
    if (weaponUI) weaponUI.hide();
    releaseControls();refreshSceneUI();
  }
  var progressOrder = ["HEIST_INTRO","HEIST_GRAB","CART_ALLEY","SHOOT","CARJACK","DRIVE_FM","WATERMELON","ROADBLOCK","WESTGATE","SWITCH_TO_INSURGENT","BREAKOUT","RESULT"];
  function jumpProgress(id) {
    if (!state.menuOpen || progressOrder.indexOf(id) < 0) return;
    var sideDone = state.sideQuest === "已完成", target = progressOrder.indexOf(id);
    cleanRunUI();state.mode = "playing";resetRunState();
    state.flags = Object.assign({money:0,health:100,armor:0,wanted:0}, state.story.meta.initialFlags || {});
    state.completed = progressOrder.slice(0,target).filter(function (key) { return key !== "WATERMELON" || sideDone; });
    state.visited = state.completed.slice();state.sideQuest = target > progressOrder.indexOf("WATERMELON") ? sideDone ? "已完成" : "已跳过" : id === "WATERMELON" ? "已接受" : "未选择";
    state.completed.forEach(function (key) {
      var node = state.story.nodes[key];
      if (typeof node.moneyTotal === "number") state.flags.money = node.moneyTotal;
      (node.events || []).forEach(function (ev) { if (typeof ev.moneyTotal === "number") state.flags.money = ev.moneyTotal; });
    });
    state.lastBannerTitle = state.story.meta.missionTitle;state.lastBannerObjective = null;
    titleScreen.classList.add("hidden");hud.classList.remove("hidden");
    recordJournal("测试跳转", sceneInfo(state.story.nodes[id]).title || state.story.nodes[id].objective);
    updateHUD();enterNode(state.story.nodes[id]);releaseControls();
    if (!state.node.completeUI) video.focus({preventScroll:true});
  }
  if (weaponUI) weaponUI.bind({choose:function () { finishWeaponSelection(true); }});
  if (gameHUD) gameHUD.bind({
    getState: function () { return state; },
    progressNodes: function () { return progressOrder.map(function (id) { var n = state.story.nodes[id]; return {id:id,label:sceneInfo(n).title || n.objective,missing:!sceneInfo(n).useVideo && !n.completeUI}; }); },
    jumpProgress: jumpProgress,
    openTransient: function (id) {
      if (state.mode !== "playing" || state.menuOpen || state.wheelOpen || state.weaponWheelOpen || state.cutsceneBusy || state.node.completeUI) return false;
      menuFocus = document.activeElement;state.menuOpen = true;state.transientPanel = id;releaseControls();hideCenterPrompt();refreshSceneUI();return true;
    },
    closeTransient: closeGameMenu,
    hover: updateWheelInfo,
    choose: switchToIndex,
    isLocked: function (id) { return isWheelLocked(state.characters.findIndex(function (c) { return c.id === id; })); }
  });
  init();
})();
