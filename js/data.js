/* Y1io selects: content + copy. Edit CONTACT below with your real links. */
window.Y1 = {
  CONTACT: {
    email: 'y1iostudio11@gmail.com',
    links: [
      { id: 'github', label: 'GitHub', url: 'https://github.com/y1io', icon: 'github-logo' },
      // TODO: fill in or delete. Entries with an empty url are hidden.
      { id: 'instagram', label: 'Instagram', url: '', icon: 'instagram-logo' },
      { id: 'tiktok', label: 'TikTok / 抖音', url: '', icon: 'tiktok-logo' },
      { id: 'youtube', label: 'YouTube / Bilibili', url: '', icon: 'youtube-logo' }
    ]
  },

  PROJECTS: [
    {
      id: 'jesko', img: 'assets/img/jesko.jpg', url: 'https://y1io.github.io/works/jesko/', live: true,
      tags: ['Three.js', 'JavaScript', 'GLB'],
      en: { title: 'JeskoStudio', kind: 'Browser 3D car showroom and customiser', cta: 'Open project',
        desc: 'Material, lighting and camera controls, GLB import and export, engineering hotspots and a visual wind-tunnel mode. Product presentation that runs in a browser tab.',
        bullets: ['Material, lighting and camera controls', 'GLB import / export, 3D hotspots', 'Visual wind-tunnel mode'],
        note: 'Car model: “2024 Koenigsegg Jesko Attack” by HYPR:IMPS 3D, CC BY 4.0. The wind tunnel is a visual illustration, not engineering CFD.' },
      zh: { title: 'JeskoStudio', kind: '浏览器里的 3D 汽车展厅与定制器', cta: '打开项目',
        desc: '材质、灯光、镜头全可调，支持 GLB 导入导出、工程热点标注和可视化风洞模式。在浏览器标签页里就能做产品展示。',
        bullets: ['材质 / 灯光 / 镜头控制', 'GLB 导入导出、3D 热点', '可视化风洞模式'],
        note: '车模：“2024 Koenigsegg Jesko Attack”，作者 HYPR:IMPS 3D，CC BY 4.0。风洞为视觉演示，不是工程 CFD。' }
    },
    {
      id: 'air3s', img: 'assets/img/air3s.jpg', url: 'https://y1io.github.io/works/air3s/', live: true,
      tags: ['Three.js', 'GLSL', 'JavaScript'],
      en: { title: 'AIR 3S Aero Lab', kind: 'Drone anatomy and flight explorer', cta: 'Open project',
        desc: 'A DJI Air 3S study built entirely in code, no imported model. Explode the airframe layer by layer, focus any part, fold the arms, then fly it with WASD.',
        bullets: ['100% code-generated model, custom GLSL surfaces', 'Explode, focus-detail and fold views', 'Flight demo: WASD, altitude, heading, cruise'],
        note: 'Shape calibrated to the official bounding box; not engineering-accurate.' },
      zh: { title: 'AIR 3S 空气动力实验室', kind: '无人机结构拆解与飞行演示', cta: '打开项目',
        desc: '一台完全用代码生成的 DJI Air 3S，没有导入任何模型。逐层爆炸拆解、聚焦任意零件、折叠机臂，再切到飞行模式用 WASD 操控。',
        bullets: ['100% 代码建模，自定义 GLSL 材质', '爆炸 / 细节聚焦 / 折叠视图', '飞行演示：WASD、高度、航向、巡航'],
        note: '外形按官方尺寸包围盒校准，非工程精度。' }
    },
    {
      id: 'pagoda', img: 'assets/img/pagoda.jpg', url: 'https://y1io.github.io/works/pagoda.html', live: true,
      tags: ['Three.js', 'WebGL', 'Procedural'],
      en: { title: 'Fogong Pagoda', kind: 'Interactive architectural 3D study', cta: 'Open project',
        desc: 'A procedural multi-level pagoda with architectural detail. Orbit and first-person viewing, camera presets, day / night and fog controls.',
        bullets: ['Procedural multi-level pagoda', 'Orbit + first-person, camera presets', 'Day / night and fog controls'],
        note: 'Conceptual study inspired by the Yingxian Wooden Pagoda, not a validated digital twin.' },
      zh: { title: '佛宫寺释迦塔', kind: '可交互的古建筑 3D 研究', cta: '打开项目',
        desc: '程序化生成的多层木塔，带建筑细节。支持环绕与第一人称视角、镜头预设、昼夜与雾效切换。',
        bullets: ['程序化多层塔体', '环绕 + 第一人称、镜头预设', '昼夜与雾效控制'],
        note: '受应县木塔启发的概念研究，并非经过验证的数字孪生。' }
    },
    {
      id: 'pocket', img: 'assets/img/pocket.jpg', url: 'https://y1io.github.io/works/pocket/', live: true,
      tags: ['React', 'TypeScript', 'Three.js'],
      en: { title: 'Pocket Universe', kind: '3D mini-game across tiny planets', cta: 'Play game',
        desc: 'Walk an astronaut around six themed miniature planets, find landmarks and listen to procedural audio. Desktop and touch controls, bilingual guide.',
        bullets: ['Six themed planets to explore', 'Spherical walking, desktop + touch', 'Procedural audio, Chinese / English guide'],
        note: 'Playable in the browser, desktop or touch.' },
      zh: { title: '口袋宇宙', kind: '小星球 3D 探索小游戏', cta: '开始游戏',
        desc: '操控宇航员在六颗主题小星球上行走，寻找地标、聆听程序化生成的音效。支持键鼠和触屏，中英双语指引。',
        bullets: ['六颗主题星球', '球面行走，键鼠 + 触屏', '程序化音频、中英指引'],
        note: '浏览器直接游玩，电脑和手机都可以。' }
    },
    {
      id: 'ezreview', img: 'assets/img/ezliiv-review.jpg', url: 'https://y1io.github.io/works/ezliiv-review.html', live: true,
      tags: ['Three.js', 'JavaScript', 'GLB'],
      en: { title: 'Ezliiv Model Review', kind: 'Interactive 3D product review', cta: 'Open project',
        desc: 'A shopping-trolley concept built for client review: labelled parts, exploded assembly, bag cut-away, lift tray, folding seat and wheel-cluster rotation, plus GLB export.',
        bullets: ['Assembled / exploded / cut-away views', 'Sliders for tray, seat, flap and wheels', 'Labelled components, GLB export'],
        note: 'Photo-informed concept. Dimensions and load ratings are not verified.' },
      zh: { title: 'Ezliiv 产品评审', kind: '交互式 3D 产品评审', cta: '打开项目',
        desc: '为客户评审做的购物拉车概念模型：零件标注、爆炸装配、袋体剖切、内部升降托盘、折叠座椅和轮组旋转，并可导出 GLB。',
        bullets: ['组装 / 爆炸 / 剖切视图', '托盘、座椅、翻盖、轮组滑杆', '零件标注、GLB 导出'],
        note: '依据照片推测的概念模型，尺寸与承重未经验证。' }
    },
    {
      id: 'ezvideo', img: 'assets/img/ezliiv-video.jpg', video: 'assets/video/ezliiv-loop.mp4', url: 'https://y1io.github.io/works/ezliiv-explainer.mp4', live: false,
      tags: ['3D', 'Motion', 'Copywriting'],
      en: { title: 'Ezliiv Explainer', kind: '40-second product explainer film', cta: 'Watch film',
        desc: 'The same model turned into a short marketing film: eight chapters, from “Shop easily” to the three-wheel stair assembly, with on-screen copy and camera moves.',
        bullets: ['8 chapters, 40 s, 1080p', 'Camera choreography on the 3D model', 'Copywriting + motion typography'],
        note: 'Rendered from the Ezliiv model review.' },
      zh: { title: 'Ezliiv 产品短片', kind: '40 秒产品讲解片', cta: '观看短片',
        desc: '把同一个模型做成营销短片：八个章节，从「轻松购物」到三轮爬楼结构，配合屏幕文案与镜头运动。',
        bullets: ['8 章节、40 秒、1080p', '基于 3D 模型的镜头编排', '文案 + 动态排版'],
        note: '由 Ezliiv 评审模型渲染。' }
    },
    {
      id: 'sportzone', img: 'assets/img/sportzone.jpg', url: 'https://y1io.github.io/works/sportzone.html', live: true,
      tags: ['HTML', 'Tailwind', 'JavaScript'],
      en: { title: 'SportZone', kind: 'E-commerce customer journey prototype', cta: 'Open project',
        desc: 'Product search, cart and checkout, delivery or collection, and simulated order updates. A full shopping journey you can click through.',
        bullets: ['Product search, cart and checkout', 'Delivery or collection choice', 'Simulated order-status updates'],
        note: 'Demo prototype. Payments are simulated.' },
      zh: { title: 'SportZone', kind: '电商购物流程原型', cta: '打开项目',
        desc: '商品搜索、购物车与结账，配送或自提选择，以及模拟的订单状态更新。一条可以完整点击走通的购物流程。',
        bullets: ['商品搜索、购物车与结账', '配送 / 自提选择', '模拟订单状态更新'],
        note: '演示原型，支付为模拟。' }
    },
    {
      id: 'vhs', img: 'assets/img/vhs.jpg', url: 'https://y1io.github.io/works/vhs-archive.html', live: true,
      tags: ['HTML', 'CSS', 'JavaScript'],
      en: { title: 'VHS Archive', kind: 'A tape-deck portfolio experiment', cta: 'Open project',
        desc: 'A cassette-shelf archive of everything I make: 15 tapes, each with its own generated cover art. Pick a tape, read the sleeve, then open the live project from it.',
        bullets: ['15 tapes with generated cover art', 'Spin the shelf, open a sleeve', 'Every tape links to its live project'],
        note: '' },
      zh: { title: 'VHS 录像带档案馆', kind: '录像带式作品档案实验', cta: '打开项目',
        desc: '把所有作品做成一排录像带：15 盒磁带，每盒都有生成的封面。挑一盒、读封套，再从封套直接打开在线项目。',
        bullets: ['15 盒带封面的磁带', '旋转货架、打开封套', '每盒磁带都链接到在线项目'],
        note: '' }
    }
  ],

  /* Capability timeline (EDL). Each clip points at real work above. */
  TRACKS: [
    { id: 'V1', en: '3D / WebGL', zh: '3D / WebGL', clips: [['jesko', 0, 22], ['air3s', 24, 46], ['pagoda', 48, 66], ['ezreview', 70, 96]] },
    { id: 'V2', en: 'Interface + motion', zh: '界面 + 动效', clips: [['sportzone', 6, 34], ['vhs', 40, 64], ['pocket', 68, 88]] },
    { id: 'FX', en: 'Shaders + simulation', zh: '着色器 + 模拟', clips: [['air3s', 10, 38], ['jesko', 52, 74]] },
    { id: 'A1', en: 'Film + sound', zh: '影片 + 声音', clips: [['pocket', 18, 44], ['ezvideo', 58, 98]] }
  ],

  I18N: {
    en: {
      'skip': 'Skip intro', 'nav.work': 'Work', 'nav.edl': 'Process', 'nav.bin': 'Tools', 'nav.operator': 'Operator', 'nav.contact': 'Contact',
      'sound.on': 'Sound on', 'sound.off': 'Sound off',
      'hero.l1': 'Every frame', 'hero.l2': 'runs live.',
      'hero.sub': 'Y1io builds 3D web experiences, browser games, product presentations and short films, all in code.',
      'hero.cta': 'Scrub the rail', 'cta.contact': 'Get in touch',
      'hint.scroll': 'Scroll to scrub', 'hint.swipe': 'Swipe up to scrub', 'hint.click': 'Click a frame to open it',
      'rail.frame': 'Frame', 'rail.view': 'View frame', 'rail.live': 'Live demo', 'rail.film': 'Film',
      'resume.text': 'You stopped at frame', 'resume.go': 'Jump back', 'resume.no': 'Dismiss',
      'edl.title': 'One bench, four tracks.', 'edl.sub': 'Every clip on this timeline is a project on the rail. Scroll to run the playhead; click a clip to open it.',
      'bin.title': 'Trims in the bin.', 'bin.sub': 'The tools these frames were cut with. Hover or tap a trim to swing it.',
      'cat.business': 'Business + productivity', 'cat.design': 'Design, video + audio', 'cat.3d': '3D + interactive', 'cat.ai': 'AI + development', 'cat.web': 'Web',
      'op.title': 'The operator.', 'op.body': 'Y1io is the name on the slate. No CV on this page: what you see on the rail is the introduction. Same operator, different engine, tap the slate to change the take.',
      'op.take': 'Take', 'op.f1': 'frames on the rail', 'op.f2': 'tools in the bin', 'op.f3': 'run live in a browser',
      'c.title': 'End of reel.', 'c.sub': 'Have a product to show, a world to build or a film to cut? Send a brief.',
      'c.email': 'Email', 'c.copy': 'Copy', 'c.copied': 'Copied',
      'f.name': 'Your name', 'f.what': 'What should we make?', 'f.msg': 'Brief', 'f.msg.help': 'A few lines on the idea, timing and where it will live.',
      'f.send': 'Send brief', 'f.err.name': 'Add a name so I know who to reply to.', 'f.err.msg': 'Write at least a sentence about the project.',
      'f.ok': 'Your mail app should open with the brief filled in.',
      'chip.web': '3D website', 'chip.product': 'Product viewer', 'chip.game': 'Browser game', 'chip.film': 'Short film', 'chip.other': 'Something else',
      'v.close': 'Close', 'v.next': 'Next frame', 'v.prev': 'Previous frame', 'v.in': 'In', 'v.out': 'Out', 'v.notes': 'Notes', 'v.stack': 'Stack',
      'foot.rewind': 'Rewind to head', 'foot.line': 'Cut by hand, in code.',
      'keys': 'Keys: ← → frames · Enter open · Esc close · M sound · L language'
    },
    zh: {
      'skip': '跳过开场', 'nav.work': '作品', 'nav.edl': '流程', 'nav.bin': '工具', 'nav.operator': '剪辑师', 'nav.contact': '联系',
      'sound.on': '声音开', 'sound.off': '声音关',
      'hero.l1': '每一帧', 'hero.l2': '都能实时运行。',
      'hero.sub': 'Y1io 用代码做 3D 网页、浏览器小游戏、产品展示和短片。',
      'hero.cta': '拖动胶片', 'cta.contact': '联系我',
      'hint.scroll': '向下滚动拖动胶片', 'hint.swipe': '上滑拖动胶片', 'hint.click': '点击画格查看作品',
      'rail.frame': '画格', 'rail.view': '查看画格', 'rail.live': '在线演示', 'rail.film': '短片',
      'resume.text': '上次你停在第', 'resume.go': '跳回去', 'resume.no': '不用了',
      'edl.title': '一张剪辑台，四条轨道。', 'edl.sub': '时间线上的每个片段都是胶片轨上的作品。滚动推动播放头，点击片段直接打开。',
      'bin.title': '素材箱里的胶片头。', 'bin.sub': '剪出这些画格用到的工具。鼠标悬停或轻点，胶片会晃起来。',
      'cat.business': '商务与效率', 'cat.design': '设计、视频与音频', 'cat.3d': '3D 与交互', 'cat.ai': 'AI 与开发', 'cat.web': '网页技术',
      'op.title': '剪辑师。', 'op.body': '场记板上只写 Y1io。这里没有简历：胶片轨上的作品就是自我介绍。同一个人，不同的引擎，点场记板换一条。',
      'op.take': '第', 'op.f1': '格作品在轨', 'op.f2': '件工具在箱', 'op.f3': '个可在浏览器实时运行',
      'c.title': '片尾。', 'c.sub': '有产品要展示、有世界要搭建、或者有片子要剪？发个需求过来。',
      'c.email': '邮箱', 'c.copy': '复制', 'c.copied': '已复制',
      'f.name': '你的称呼', 'f.what': '想做什么？', 'f.msg': '需求', 'f.msg.help': '简单写写想法、时间和最终投放在哪里。',
      'f.send': '发送需求', 'f.err.name': '留个称呼，方便我回复你。', 'f.err.msg': '至少写一句关于项目的描述。',
      'f.ok': '邮件应用会打开，并自动填好需求内容。',
      'chip.web': '3D 网站', 'chip.product': '产品展示器', 'chip.game': '网页游戏', 'chip.film': '短片', 'chip.other': '其他',
      'v.close': '关闭', 'v.next': '下一格', 'v.prev': '上一格', 'v.in': '入点', 'v.out': '出点', 'v.notes': '备注', 'v.stack': '技术',
      'foot.rewind': '倒带回片头', 'foot.line': '手工剪辑，用代码。',
      'keys': '快捷键：← → 切换画格 · Enter 打开 · Esc 关闭 · M 声音 · L 语言'
    }
  }
};
