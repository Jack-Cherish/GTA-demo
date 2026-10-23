/* 流程测试：已就绪片段设 useVideo: true 使用真实视频，其余为带文件名的深灰占位。
   改为 enabled: false 即全部使用 JSON 视频路径，并关闭测试用快速推进。
   剧情、分支和开场设计仍由原项目提供。 */
window.GAME_PREVIEW = {
  enabled: true,
  quickStep: true, // 测试模式：Space / 下一步直接完成当前片段（含已加入的视频）。
  placeholderColor: "#303234",
  scenes: {
    HEIST_INTRO: {
      title: "国库 · 最后一箱",
      description: "三人已潜入国库。安春晓负责收走最后一箱银票金票，年灼华守门，钮祜禄指挥撤离。",
      durationMs: 5500
    },
    HEIST_GRAB: {
      title: "得手 · 警报响起",
      description: "财物装车后，国库警报响起。皇后阵营展开追捕，三人按计划分头逃亡。",
      durationMs: 10000
    },
    CART_ALLEY: {
      useVideo: true, // 02.mp4：安春晓推车跑，映射到 assets/videos/cart_alley.mp4。
      title: "夹道 · 前后包围",
      description: "安春晓推着战利品小车沿宫道撤离。报信声中，皇后小队从前后围来。",
      durationMs: 18080
    },
    SHOOT: {
      useVideo: true, // 03.mp4：掏枪、射击、弹药耗尽，映射到 assets/videos/shoot.mp4。
      title: "暗格 · 选择武器",
      description: "小车暗格里藏着微型冲锋枪。先选择微型冲锋枪；弹匣八发随实际枪声打完后，请求年灼华支援。",
      durationMs: 12064
    },
    APPROACH_CAR: {
      title: "御花园 · 皇帝御驾",
      description: "年灼华发现雍正的 Pegassi Zentorno。夺取这辆御驾，前往接应被围的安春晓。",
      durationMs: 6500
    },
    CARJACK: {
      useVideo: true, // 041.mp4：接近、夺车、驾驶离开，作为一个完整片段。
      title: "夺车 · 四星通缉",
      description: "年灼华拉开驾驶门，将雍正拽下御驾，驾驶 Zentorno 驶离。皇家御驾失窃已被记录。",
      durationMs: 27072
    },
    DRIVE_FM: {
      title: "大清 FM · 宫廷路况",
      description: "车载电台正在播报御驾失窃。接应途中发现瓜摊：可以接受支线，也可以直接赶往封锁处。",
      durationMs: 12500
    },
    WATERMELON: {
      title: "支线 · 保熟吗？",
      description: "年灼华向瓜摊老板问瓜，随后驾车撞向摊位。这场验证的结果是：全部现切。",
      durationMs: 22000
    },
    ROADBLOCK: {
      title: "景仁宫 · 突破封锁",
      description: "Zentorno 撞破皇后阵营的路障，接上安春晓和战利品。接下来由钮祜禄安排最终撤离。",
      durationMs: 22000
    },
    WESTGATE: {
      title: "西门 · 内应接应",
      description: "钮祜禄联络的内应打开西门。撤离路线已经打通，武装装甲车正在等待三人。",
      durationMs: 5500
    },
    SWITCH_TO_INSURGENT: {
      title: "汇合 · 换乘装甲车",
      description: "三人在西门外汇合，将战利品转移到 HVY Insurgent Pick-Up Custom，准备一同突围。",
      durationMs: 16000
    },
    BREAKOUT: {
      title: "突围 · 开向远方",
      description: "年灼华驾驶装甲车，安春晓操纵车顶机枪。三人突破追捕，带着战利品开向远方。",
      durationMs: 9000
    }
  }
};
