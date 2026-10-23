"use strict";

// Mission titles and result cards.
window.MISSION_CARD_PRESETS = [
  {
    id: "heist",
    label: "皇城劫案",
    start: { title: "皇城劫案", subtitle: "带上国库财物，冲出紫禁城。" },
    complete: {
      title: "任务完成",
      subtitle: "大清国库大劫案",
      rows: [
        ["团队集结", "3/3"],
        ["队友已接应", "安春晓"],
        ["最高通缉等级", "六星（大清限定）"],
        ["皇帝好感度", "-999"],
        ["追捕状态", "已脱离"]
      ],
      total: ["劫获财物", "30,000,000两"]
    }
  },
  {
    id: "watermelon",
    label: "瓜摊支线",
    start: { title: "保熟吗？", subtitle: "验证西瓜成熟度" },
    complete: {
      title: "生意结束",
      subtitle: "全部现切",
      rows: [
        ["到访顾客", "年灼华"],
        ["进店方式", "驾车撞入"]
      ],
      total: ["营业状态", "被迫歇业"]
    }
  }
];
