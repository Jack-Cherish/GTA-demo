"use strict";
// In-game notifications, vehicle labels and objective highlights.
window.QingHudData = {
  "presets": {
    "notifications": [
      {
        "label": "已掠夺财物总价值",
        "node": "HEIST_GRAB",
        "title": "已掠夺财物总价值",
        "text": "30,000,000两"
      },
      {
        "label": "警报：国库遭劫",
        "node": "HEIST_GRAB",
        "title": "警报：国库遭劫",
        "text": "皇后阵营已进入追捕状态"
      },
      {
        "label": "当前角色无法完成任务",
        "node": "SHOOT",
        "title": "当前角色无法完成任务",
        "text": "需要更强火力支援"
      },
      {
        "label": "发现高性能载具",
        "node": "APPROACH_CAR",
        "title": "发现高性能载具",
        "text": "Pegassi Zentorno"
      },
      {
        "label": "附近随机事件",
        "node": "DRIVE_FM",
        "title": "附近随机事件",
        "text": "保熟吗？"
      },
      {
        "label": "生意结束",
        "node": "WATERMELON",
        "title": "生意结束",
        "text": "全部现切"
      },
      {
        "label": "队友已接应：安春晓",
        "node": "ROADBLOCK",
        "title": "队友已接应：安春晓",
        "text": "安春晓已上车"
      },
      {
        "label": "内应已就位",
        "node": "WESTGATE",
        "title": "内应已就位",
        "text": "撤离路线已开放"
      },
      {
        "label": "团队已集结",
        "node": "SWITCH_TO_INSURGENT",
        "title": "团队已集结",
        "text": "3/3"
      },
      {
        "label": "逃逸载具已就位",
        "node": "SWITCH_TO_INSURGENT",
        "title": "逃逸载具已就位",
        "text": "HVY Insurgent Pick-Up Custom"
      },
      {
        "label": "年氏集团军火补给已到账",
        "node": "BREAKOUT",
        "title": "年氏集团军火补给已到账",
        "text": "弹药充足"
      },
      {
        "label": "载具已获得",
        "node": "CARJACK",
        "title": "载具已获得",
        "text": "Pegassi Zentorno · 皇帝好感度 -999"
      }
    ],
    "vehicle": [
      {
        "label": "夺取皇帝御驾",
        "node": "CARJACK",
        "title": "Pegassi Zentorno",
        "text": "超级跑车 · 皇帝御驾"
      },
      {
        "label": "换乘逃逸载具",
        "node": "SWITCH_TO_INSURGENT",
        "title": "HVY Insurgent Pick-Up Custom",
        "text": "武装装甲车"
      },
      {
        "label": "年灼华原载具",
        "node": "APPROACH_CAR",
        "title": "双涡轮八抬大轿",
        "text": "宫廷高性能载具"
      }
    ],
    "objective": [
      {
        "label": "紫禁城 · 国库 · 拿走最后一箱财物",
        "node": "HEIST_INTRO",
        "text": "拿走最后一箱财物",
        "highlight": "最后一箱财物"
      },
      {
        "label": "延禧宫夹道 · 携带战利品沿宫道撤离",
        "node": "CART_ALLEY",
        "text": "携带战利品沿宫道撤离",
        "highlight": "宫道"
      },
      {
        "label": "紫禁城上空 · 分头逃亡",
        "node": "AERIAL_SPLIT",
        "text": "分头逃亡",
        "highlight": "分头"
      },
      {
        "label": "延禧宫夹道 · 突破包围",
        "node": "SHOOT",
        "text": "突破包围",
        "highlight": "包围"
      },
      {
        "label": "御花园宫道 · 夺取皇帝御驾",
        "node": "APPROACH_CAR",
        "text": "夺取皇帝御驾",
        "highlight": "皇帝御驾"
      },
      {
        "label": "紫禁城宫道 · 前往接应安春晓",
        "node": "DRIVE_FM",
        "text": "前往接应安春晓",
        "highlight": "安春晓"
      },
      {
        "label": "紫禁城宫道 · 瓜摊 · 验证西瓜成熟度",
        "node": "WATERMELON",
        "text": "验证西瓜成熟度",
        "highlight": "西瓜成熟度"
      },
      {
        "label": "景仁宫前 · 突破皇后阵营封锁",
        "node": "ROADBLOCK",
        "text": "突破皇后阵营封锁",
        "highlight": "皇后阵营封锁"
      },
      {
        "label": "紫禁城 · 西门 · 开放最终撤离路线",
        "node": "WESTGATE",
        "text": "开放最终撤离路线",
        "highlight": "最终撤离路线"
      },
      {
        "label": "紫禁城 · 西门外 · 三人汇合，换乘装甲车",
        "node": "SWITCH_TO_INSURGENT",
        "text": "三人汇合，换乘装甲车",
        "highlight": "装甲车"
      },
      {
        "label": "逃离中 · 紫禁城西门 · 逃离紫禁城",
        "node": "BREAKOUT",
        "text": "逃离紫禁城",
        "highlight": "紫禁城"
      }
    ]
  }
};
