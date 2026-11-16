/* Y1io / SELECTS: cutting-bench engine */
(() => {
  'use strict';

  const Y1 = window.Y1;
  const Y1G = window.Y1G;
  if (!Y1 || !Y1G) return;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pad2 = n => String(n).padStart(2, '0');

  const prefersRM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const searchParams = new URLSearchParams(window.location.search);
  const skipQuery = searchParams.has('skipIntro');
  const stillQuery = searchParams.has('still');
  if (prefersRM) document.documentElement.classList.add('rm');

  const STATE = {
    lang: localStorage.getItem('y1_lang') || 'zh',
    sound: false,
    activeFrame: 0,
    viewerIdx: -1,
    takeIdx: 0,
    viewed: new Set(JSON.parse(localStorage.getItem('y1_viewed') || '[]')),
    introDone: false,
    lenis: null,
    railST: null
  };

  /* -------------------------------------------------------------
     1. ICONS & SIGNATURE SVG INJECTION
  ------------------------------------------------------------- */
  function iconSvg(name) {
    const body = Y1G.icons[name];
    if (!body) return '';
    return `<svg class="ico" viewBox="0 0 256 256" aria-hidden="true">${body}</svg>`;
  }

  function injectIcons() {
    qsa('[data-ico]').forEach(el => {
      el.outerHTML = iconSvg(el.dataset.ico);
    });
  }

  function buildSignatureSvg(idPrefix, includeUnderline) {
    const { bb, glyphs } = Y1G.sig;
    const vx = bb.x1 - 16;
    const vy = bb.y1 - 16;
    const vw = (bb.x2 - bb.x1) + 32;
    const vh = (bb.y2 - bb.y1) + (includeUnderline ? 58 : 32);

    // Calligraphic mask backbone strokes tracing Y -> 1 -> i -> o + dot
    const maskStrokes = [
      'M -12 104 Q 70 86 172 16 Q 105 90 90 120 Q 152 105 245 14 Q 140 165 -30 322',
      'M 184 112 Q 222 86 256 64 L 172 206',
      'M 222 195 Q 252 156 274 130',
      'M 294 102 L 290 110',
      'M 326 142 Q 290 135 264 188 Q 272 204 330 172'
    ];

    const maskPathsHtml = maskStrokes.map((d, i) =>
      `<path class="sig-mask-stroke" data-ms="${i}" d="${d}" />`
    ).join('');

    const glyphFillHtml = glyphs.map((d, i) =>
      `<path class="sig-fill" data-gf="${i}" d="${d}" />`
    ).join('');

    const glyphTraceHtml = glyphs.map((d, i) =>
      `<path class="sig-trace" data-gt="${i}" d="${d}" fill="none" stroke="#ff5a1f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`
    ).join('');

    const underHtml = includeUnderline
      ? `<path class="sig-under" data-under="1" d="M 10 ${bb.y2 + 12} Q 165 ${bb.y2 - 2} ${bb.x2 + 6} ${bb.y2 + 8}" />`
      : '';

    return `
      <svg viewBox="${vx.toFixed(1)} ${vy.toFixed(1)} ${vw.toFixed(1)} ${vh.toFixed(1)}" aria-hidden="true">
        <defs>
          <mask id="${idPrefix}-mask">${maskPathsHtml}</mask>
        </defs>
        <g mask="url(#${idPrefix}-mask)">${glyphFillHtml}</g>
        ${glyphTraceHtml}
        ${underHtml}
      </svg>`;
  }

  /* -------------------------------------------------------------
     2. WEBAUDIO SYNTHETIC BENCH AUDIO
  ------------------------------------------------------------- */
  const Sfx = (() => {
    let ctx = null;
    function ensure() {
      if (!STATE.sound) return null;
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
      }
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    }
    return {
      unlock() {
        const c = ensure();
        if (c && c.state === 'suspended') c.resume().catch(() => {});
      },
      tick() {
        const c = ensure();
        if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1180, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.025);
        g.gain.setValueAtTime(0.06, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.028);
        osc.connect(g).connect(c.destination);
        osc.start(now);
        osc.stop(now + 0.03);
      },
      beep(freq = 1000, dur = 0.045) {
        const c = ensure();
        if (!c) return;
        const now = c.currentTime;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        osc.connect(g).connect(c.destination);
        osc.start(now);
        osc.stop(now + dur + 0.01);
      },
      clap() {
        const c = ensure();
        if (!c) return;
        const now = c.currentTime;
        const len = Math.floor(c.sampleRate * 0.09);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.14));
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const bp = c.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1400;
        bp.Q.value = 1.2;
        const g = c.createGain();
        g.gain.value = 0.24;
        src.connect(bp).connect(g).connect(c.destination);
        src.start(now);
      },
      burn() {
        const c = ensure();
        if (!c) return;
        const now = c.currentTime;
        const len = Math.floor(c.sampleRate * 0.18);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(680, now);
        lp.frequency.exponentialRampToValueAtTime(140, now + 0.18);
        const g = c.createGain();
        g.gain.value = 0.11;
        src.connect(lp).connect(g).connect(c.destination);
        src.start(now);
      },
      rustle() {
        const c = ensure();
        if (!c) return;
        const now = c.currentTime;
        const len = Math.floor(c.sampleRate * 0.06);
        const buf = c.createBuffer(1, len, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
        const src = c.createBufferSource();
        src.buffer = buf;
        const hp = c.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 2600;
        const g = c.createGain();
        g.gain.value = 0.04;
        src.connect(hp).connect(g).connect(c.destination);
        src.start(now);
      }
    };
  })();

  /* -------------------------------------------------------------
     3. GLOBAL VFX CANVAS (#fx): INK/CALLIGRAPHY BRUSH + SPARKS + BURN
     Only runs rAF while trails, particles or burns are active.
  ------------------------------------------------------------- */
  const Fx = (() => {
    const canvas = qs('#fx');
    const ctx = canvas.getContext('2d');
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0;
    let raf = 0;
    const trail = [];
    const sparks = [];
    const burns = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function wake() {
      if (!raf && !prefersRM) raf = requestAnimationFrame(tick);
    }

    function addPoint(x, y) {
      if (prefersRM) return;
      trail.push({ x, y, life: 1 });
      if (trail.length > 26) trail.shift();
      wake();
    }

    function burst(x, y, count = 16, speedBoost = 1) {
      if (prefersRM) return;
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = (1.6 + Math.random() * 7.5) * speedBoost;
        sparks.push({
          x, y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 1.5,
          g: 0.22,
          r: 1.3 + Math.random() * 2.2,
          life: 1,
          decay: 0.02 + Math.random() * 0.025,
          orange: Math.random() < 0.72
        });
      }
      wake();
    }

    function triggerBurn(x = W * 0.5, y = H * 0.5) {
      if (prefersRM) return;
      burns.push({ x, y, life: 1 });
      wake();
    }

    function tick() {
      raf = 0;
      ctx.clearRect(0, 0, W, H);

      // Calligraphic speed-sensitive brush trail (from Inkcore algorithm)
      if (trail.length > 1) {
        for (let i = 1; i < trail.length; i++) {
          const p0 = trail[i - 1];
          const p1 = trail[i];
          const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
          const w = Math.max(0.8, Math.min(8, (11 - dist * 0.12) * p1.life));
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = i > trail.length - 5
            ? `rgba(255, 90, 31, ${p1.life * 0.55})`
            : `rgba(242, 242, 242, ${p1.life * 0.28})`;
          ctx.lineWidth = w;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      }
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.065;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }

      // Physical spark particles
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.96;
        s.vy = s.vy * 0.96 + s.g;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.orange ? '#ff5a1f' : '#f2f2f2';
        ctx.fillRect(s.x - s.r * 0.5, s.y - s.r * 0.5, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      // Film-burn flash rings
      for (let i = burns.length - 1; i >= 0; i--) {
        const b = burns[i];
        b.life -= 0.05;
        if (b.life <= 0) {
          burns.splice(i, 1);
          continue;
        }
        const rad = (1 - b.life) * Math.max(W, H) * 0.72 + 40;
        const grad = ctx.createRadialGradient(b.x, b.y, rad * 0.1, b.x, b.y, rad);
        grad.addColorStop(0, `rgba(255, 220, 170, ${b.life * 0.28})`);
        grad.addColorStop(0.45, `rgba(255, 90, 31, ${b.life * 0.36})`);
        grad.addColorStop(1, 'rgba(10, 10, 10, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      if (trail.length || sparks.length || burns.length) {
        raf = requestAnimationFrame(tick);
      }
    }

    return { addPoint, burst, triggerBurn };
  })();

  /* -------------------------------------------------------------
     4. CUSTOM CURSOR
  ------------------------------------------------------------- */
  const Cursor = (() => {
    const el = qs('#cursor');
    const lbl = qs('#cursorLabel');
    if (!el || window.matchMedia('(pointer: coarse)').matches || prefersRM) return { setLabel() {} };

    let tx = -100, ty = -100, cx = -100, cy = -100;
    let moving = false;

    window.addEventListener('pointermove', e => {
      tx = e.clientX;
      ty = e.clientY;
      el.classList.add('on');
      Fx.addPoint(tx, ty);
      if (!moving) {
        moving = true;
        requestAnimationFrame(step);
      }
      const target = e.target.closest('[data-cursor]');
      if (target) {
        lbl.textContent = target.dataset.cursor;
        el.classList.add('has-label');
      } else {
        el.classList.remove('has-label');
      }
    }, { passive: true });

    window.addEventListener('pointerdown', e => {
      Fx.burst(e.clientX, e.clientY, 10, 0.75);
    }, { passive: true });

    document.addEventListener('mouseleave', () => el.classList.remove('on'));

    function step() {
      cx += (tx - cx) * 0.24;
      cy += (ty - cy) * 0.24;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (Math.abs(tx - cx) > 0.2 || Math.abs(ty - cy) > 0.2) {
        requestAnimationFrame(step);
      } else {
        moving = false;
      }
    }

    return {
      setLabel(t) { lbl.textContent = t || ''; }
    };
  })();

  /* -------------------------------------------------------------
     5. SCROLL LOCK WITH SCROLLBAR WIDTH COMPENSATION
  ------------------------------------------------------------- */
  function setLocked(locked) {
    if (locked) {
      const sbw = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      document.documentElement.style.setProperty('--sbw', sbw + 'px');
      document.body.classList.add('is-locked');
      if (STATE.lenis) STATE.lenis.stop();
    } else {
      document.body.classList.remove('is-locked');
      document.documentElement.style.setProperty('--sbw', '0px');
      if (STATE.lenis) STATE.lenis.start();
    }
  }

  /* -------------------------------------------------------------
     6. ASYMMETRIC DOUBLE-LAYER CURTAIN WIPE (PTS #02)
  ------------------------------------------------------------- */
  function playCurtainWipe(onMid) {
    const wrap = qs('#curtain');
    const sub = qs('.curtain__layer--sub', wrap);
    const main = qs('.curtain__layer--main', wrap);
    if (prefersRM) {
      if (onMid) onMid();
      return Promise.resolve();
    }
    return new Promise(resolve => {
      wrap.classList.add('on');
      sub.style.transition = 'none';
      main.style.transition = 'none';
      sub.style.transformOrigin = 'bottom';
      main.style.transformOrigin = 'bottom';
      sub.style.transform = 'scaleY(0)';
      main.style.transform = 'scaleY(0)';
      void wrap.offsetWidth;

      const ease = 'cubic-bezier(.85, 0, .15, 1)';
      sub.style.transition = `transform 360ms ${ease}`;
      main.style.transition = `transform 360ms ${ease} 55ms`;
      sub.style.transform = 'scaleY(1)';
      main.style.transform = 'scaleY(1)';

      setTimeout(() => {
        if (onMid) onMid();
        sub.style.transformOrigin = 'top';
        main.style.transformOrigin = 'top';
        void wrap.offsetWidth;
        sub.style.transition = `transform 420ms ${ease} 55ms`;
        main.style.transition = `transform 420ms ${ease}`;
        sub.style.transform = 'scaleY(0)';
        main.style.transform = 'scaleY(0)';
        setTimeout(() => {
          wrap.classList.remove('on');
          [sub, main].forEach(l => { l.style.transition = ''; l.style.transform = ''; l.style.transformOrigin = ''; });
          resolve();
        }, 490);
      }, 430);
    });
  }

  /* -------------------------------------------------------------
     7. OPENING COUNTDOWN LEADER + HANDWRITTEN SIGNATURE REVEAL
  ------------------------------------------------------------- */
  const Intro = (() => {
    const leader = qs('#leader');
    const countPane = qs('#leaderCount');
    const sigPane = qs('#leaderSig');
    const sigSlot = qs('#leaderSigSvg');
    const numEl = qs('#leaderNum');
    const sweepEl = qs('#leaderSweep');
    let tl = null;
    let finished = false;

    sigSlot.innerHTML = buildSignatureSvg('lsig', true);
    const navSig = qs('#navSig');
    if (navSig) navSig.innerHTML = buildSignatureSvg('nsig', false);
    // Keep nav signature always visible immediately
    qsa('#navSig .sig-mask-stroke').forEach(p => {
      p.style.strokeDasharray = 'none';
      p.style.strokeDashoffset = '0';
    });
    qsa('#navSig .sig-trace').forEach(p => { p.style.opacity = '0'; });

    function prepareSigPaths() {
      const maskStrokes = qsa('#leaderSigSvg .sig-mask-stroke');
      const traces = qsa('#leaderSigSvg .sig-trace');
      const under = qs('#leaderSigSvg .sig-under');
      maskStrokes.forEach(p => {
        const len = Math.ceil(p.getTotalLength());
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        p.dataset.len = String(len);
      });
      traces.forEach(p => {
        const len = Math.ceil(p.getTotalLength());
        p.style.strokeDasharray = String(len);
        p.style.strokeDashoffset = String(len);
        p.style.opacity = '1';
        p.dataset.len = String(len);
      });
      if (under) {
        const len = Math.ceil(under.getTotalLength());
        under.style.strokeDasharray = String(len);
        under.style.strokeDashoffset = String(len);
        under.dataset.len = String(len);
      }
      return { maskStrokes, traces, under };
    }

    function finish(immediate = false) {
      if (finished) return;
      finished = true;
      STATE.introDone = true;
      if (tl) { tl.kill(); tl = null; }
      const revealBench = () => {
        leader.hidden = true;
        setLocked(false);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        animateHeroIn(immediate);
        maybeShowResumeToast();
      };
      if (immediate || prefersRM) {
        revealBench();
      } else {
        playCurtainWipe(revealBench);
      }
    }

    function play(skipCountdown = false) {
      finished = false;
      if (tl) { tl.kill(); tl = null; }
      if (prefersRM || skipQuery) {
        finish(true);
        return;
      }

      setLocked(true);
      leader.hidden = false;
      countPane.style.opacity = skipCountdown ? '0' : '1';
      sigPane.style.opacity = skipCountdown ? '1' : '0';

      const { maskStrokes, traces, under } = prepareSigPaths();
      const svgEl = qs('#leaderSigSvg svg');
      const nums = ['08', '07', '06', '05', '04', '03', '02'];
      tl = gsap.timeline({
        onComplete: () => finish(false)
      });

      if (!skipCountdown) {
        nums.forEach((txt, idx) => {
          tl.call(() => {
            numEl.textContent = txt;
            sweepEl.style.transform = 'rotate(0deg)';
            Sfx.beep(idx === nums.length - 1 ? 1200 : 880, 0.04);
          });
          tl.to(sweepEl, { rotation: 360, duration: 0.24, ease: 'none', transformOrigin: '300px 300px' });
        });
        tl.to(countPane, { opacity: 0, duration: 0.14, ease: 'power2.in' });
        tl.set(sigPane, { opacity: 1 });
      }

      // Calligraphic handwritten reveal of Y1io + pen-tip sparks
      let lastSpark = 0;
      const emitTipSpark = (pathEl, progress) => {
        const now = performance.now();
        if (now - lastSpark < 32 || !svgEl) return;
        lastSpark = now;
        const len = Number(pathEl.dataset.len || 0);
        if (!len) return;
        const pt = pathEl.getPointAtLength(clamp(progress, 0, 1) * len);
        const ctm = pathEl.getScreenCTM();
        if (!ctm) return;
        const sx = pt.x * ctm.a + pt.y * ctm.c + ctm.e;
        const sy = pt.x * ctm.b + pt.y * ctm.d + ctm.f;
        Fx.burst(sx, sy, 3, 0.55);
      };

      const sigDur = 1.45;
      tl.addLabel('sigStart');
      traces.forEach((p, i) => {
        const d = i * 0.22;
        const dur = i === 0 ? 0.65 : 0.42;
        tl.to(p, {
          strokeDashoffset: 0,
          duration: dur,
          ease: 'power2.inOut',
          onUpdate() { emitTipSpark(p, this.progress()); }
        }, `sigStart+=${d}`);
      });
      maskStrokes.forEach((p, i) => {
        const d = i * 0.19;
        const dur = i === 0 ? 0.68 : 0.36;
        tl.to(p, {
          strokeDashoffset: 0,
          duration: dur,
          ease: 'power2.out'
        }, `sigStart+=${d + 0.06}`);
      });
      tl.to(traces, { opacity: 0.18, duration: 0.28 }, `sigStart+=${sigDur - 0.3}`);
      if (under) {
        tl.to(under, {
          strokeDashoffset: 0,
          duration: 0.38,
          ease: 'power3.out',
          onUpdate() { emitTipSpark(under, this.progress()); }
        }, `sigStart+=${sigDur - 0.35}`);
      }
      tl.to({}, { duration: 0.28 });
    }

    qs('#skipIntro').addEventListener('click', () => finish(false));
    qs('#replaySig').addEventListener('click', e => {
      e.preventDefault();
      if (STATE.lenis) STATE.lenis.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
      play(false);
    });

    return { play, finish };
  })();

  function animateHeroIn(immediate) {
    const lines = qsa('#heroTitle .l > span');
    const sub = qs('.bench__sub');
    const ctas = qs('.bench__ctas');
    const side = qs('.bench__side');
    if (immediate || prefersRM) {
      gsap.set([...lines, sub, ctas, side], { clearProps: 'all' });
      return;
    }
    gsap.fromTo(lines,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.72, stagger: 0.08, ease: 'power4.out' }
    );
    gsap.fromTo([sub, ctas, side],
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, stagger: 0.07, delay: 0.12, ease: 'power3.out' }
    );
  }

  /* -------------------------------------------------------------
     8. PERFORATED SELECT RAIL & SCROLL-DRIVEN SCRUB + INK FILTER
  ------------------------------------------------------------- */
  function buildRail() {
    const strip = qs('#strip');
    const ruler = qs('#ruler');
    const projects = Y1.PROJECTS;
    const lang = STATE.lang;

    const headLeader = `
      <div class="frame frame--leader" aria-hidden="true">
        <div class="frame__win">
          <div class="lead-txt">HEAD LEADER<small>Y1IO · 35MM · START</small></div>
        </div>
      </div>`;

    const framesHtml = projects.map((p, i) => {
      const n = pad2(i + 1);
      const copy = p[lang];
      const viewed = STATE.viewed.has(i) ? ' is-viewed' : '';
      const active = i === STATE.activeFrame ? ' is-active' : '';
      const media = p.video
        ? `<video src="${p.video}" poster="${p.img}" muted loop playsinline autoplay preload="metadata"></video>`
        : `<img src="${p.img}" alt="${copy.title}" loading="${i < 3 ? 'eager' : 'lazy'}" />`;
      const mark = `<svg class="frame__mark" viewBox="0 0 46 34" aria-hidden="true"><path d="M5,4 L41,30 M41,4 L5,30"/></svg>`;
      return `
        <article class="frame${active}${viewed}" data-frame="${i}">
          <span class="frame__code">FR ${n} · ${p.id.toUpperCase()}</span>
          ${mark}
          <button class="frame__win" type="button" data-open-frame="${i}" data-cursor="${lang === 'zh' ? '查看' : 'OPEN'}" aria-label="${n} ${copy.title}">
            ${media}
          </button>
        </article>`;
    }).join('');

    const tailLeader = `
      <div class="frame frame--leader" aria-hidden="true">
        <div class="frame__win">
          <div class="lead-txt">TAIL LEADER<small>END OF REEL 01</small></div>
        </div>
      </div>`;

    strip.innerHTML = `<div class="grainlayer"></div>${headLeader}${framesHtml}${tailLeader}`;

    const totalCells = projects.length + 2;
    let rulerHtml = '';
    for (let c = 0; c < totalCells; c++) {
      const tc = c === 0 ? '00:00:00:00' : (c <= projects.length ? `00:00:${pad2(c * 5)}:00` : '00:00:45:00');
      rulerHtml += `<div class="ruler__cell"><span>${tc}</span></div>`;
    }
    ruler.innerHTML = rulerHtml;

    qsa('[data-open-frame]', strip).forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.openFrame);
        if (idx === STATE.activeFrame || prefersRM) {
          openViewer(idx);
        } else {
          scrollToFrame(idx, () => openViewer(idx));
        }
      });
    });
  }

  function updateReadout(idx, animate = true) {
    const p = Y1.PROJECTS[idx];
    if (!p) return;
    const copy = p[STATE.lang];
    const total = pad2(Y1.PROJECTS.length);
    const numStr = pad2(idx + 1);

    qs('#roNum').innerHTML = `${numStr}<small>/${total}</small>`;
    qs('#roTitle').textContent = copy.title;
    qs('#roKind').textContent = copy.kind;
    qs('#roLiveLink').href = p.url;
    qs('#roLiveLabel').textContent = p.live ? Y1.I18N[STATE.lang]['rail.live'] : Y1.I18N[STATE.lang]['rail.film'];
    qs('#gateNum').textContent = numStr;
    qs('#hudFr').textContent = numStr;
    qs('#hudTc').textContent = `00:00:${pad2((idx + 1) * 5)}:00`;

    qs('#prevFrame').disabled = idx === 0;
    qs('#nextFrame').disabled = idx === Y1.PROJECTS.length - 1;

    qsa('.frame[data-frame]').forEach(el => {
      el.classList.toggle('is-active', Number(el.dataset.frame) === idx);
    });

    if (animate && !prefersRM) {
      const ro = qs('#readout');
      ro.classList.remove('is-cut');
      void ro.offsetWidth;
      ro.classList.add('is-cut');
    }

    localStorage.setItem('y1_last_frame', String(idx));
  }

  function initRailScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    const track = qs('#railTrack');
    const bench = qs('#work');
    const progressBar = qs('#railProgress');
    const displace = qs('#inkDisplace');
    const hud = qs('#hud');
    const count = Y1.PROJECTS.length;

    const frameWidth = () => {
      const f = qs('.frame', track);
      return f ? f.getBoundingClientRect().width : 340;
    };
    const startX = () => {
      const fw = frameWidth();
      return window.innerWidth * 0.5 - 1.5 * fw; // center project frame 0 (DOM index 1)
    };
    const travel = () => frameWidth() * (count - 1);

    if (prefersRM || stillQuery) {
      track.style.transform = `translate3d(${startX()}px, 0, 0)`;
      return;
    }

    let settleTimer = 0;
    let lastScale = 0;

    const tween = gsap.fromTo(track,
      { x: () => startX() },
      {
        x: () => startX() - travel(),
        ease: 'none',
        scrollTrigger: {
          trigger: bench,
          start: 'top top',
          end: () => `+=${Math.max(1400, travel() * 1.15)}`,
          pin: true,
          scrub: 0.45,
          invalidateOnRefresh: true,
          snap: {
            snapTo: 1 / (count - 1),
            duration: { min: 0.14, max: 0.36 },
            delay: 0.08,
            ease: 'power2.out'
          },
          onUpdate(self) {
            progressBar.style.transform = `scaleX(${self.progress})`;
            hud.classList.toggle('on', self.progress > 0.01 && self.progress < 0.99);

            const idx = clamp(Math.round(self.progress * (count - 1)), 0, count - 1);
            if (idx !== STATE.activeFrame) {
              STATE.activeFrame = idx;
              updateReadout(idx, true);
              Sfx.tick();
            }

            // SVG turbulence displacement proportional to scroll velocity, stops cleanly at 0
            if (displace) {
              const vel = Math.min(18, Math.abs(self.getVelocity()) / 190);
              if (vel > 0.4 || lastScale > 0) {
                const target = vel > 0.4 ? Number(vel.toFixed(1)) : 0;
                if (target !== lastScale) {
                  lastScale = target;
                  displace.setAttribute('scale', String(target));
                }
              }
              clearTimeout(settleTimer);
              settleTimer = setTimeout(() => {
                if (lastScale !== 0) {
                  lastScale = 0;
                  displace.setAttribute('scale', '0');
                }
              }, 90);
            }
          }
        }
      }
    );

    STATE.railST = tween.scrollTrigger;
  }

  function scrollToFrame(idx, onDone) {
    idx = clamp(idx, 0, Y1.PROJECTS.length - 1);
    const st = STATE.railST;
    if (!st || prefersRM) {
      STATE.activeFrame = idx;
      const track = qs('#railTrack');
      const f = qs('.frame', track);
      const fw = f ? f.getBoundingClientRect().width : 340;
      track.style.transform = `translate3d(${window.innerWidth * 0.5 - (idx + 1.5) * fw}px, 0, 0)`;
      updateReadout(idx, false);
      if (onDone) onDone();
      return;
    }
    const targetY = st.start + (st.end - st.start) * (idx / (Y1.PROJECTS.length - 1));
    if (STATE.lenis) {
      STATE.lenis.scrollTo(targetY, {
        duration: 0.75,
        onComplete: () => { if (onDone) onDone(); }
      });
    } else {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      if (onDone) setTimeout(onDone, 520);
    }
  }

  /* -------------------------------------------------------------
     9. RESUME TOAST (persisted stopped frame)
  ------------------------------------------------------------- */
  function maybeShowResumeToast() {
    const saved = Number(localStorage.getItem('y1_last_frame'));
    if (!Number.isInteger(saved) || saved <= 0 || saved >= Y1.PROJECTS.length) return;
    const toast = qs('#resumeToast');
    const txt = qs('#resumeTxt');
    const num = pad2(saved + 1);
    const updateTxt = () => {
      txt.textContent = STATE.lang === 'zh'
        ? `${Y1.I18N.zh['resume.text']} ${num} 格`
        : `${Y1.I18N.en['resume.text']} ${num}`;
    };
    updateTxt();
    toast.classList.add('on');

    const hide = () => toast.classList.remove('on');
    const timer = setTimeout(hide, 7000);
    qs('#resumeGo').onclick = () => {
      clearTimeout(timer);
      hide();
      scrollToFrame(saved);
    };
    qs('#resumeNo').onclick = () => {
      clearTimeout(timer);
      hide();
    };
  }

  /* -------------------------------------------------------------
     10. FULLSCREEN FRAME VIEWER
  ------------------------------------------------------------- */
  function renderViewerContent(idx) {
    const p = Y1.PROJECTS[idx];
    if (!p) return;
    const lang = STATE.lang;
    const copy = p[lang];
    const t = Y1.I18N[lang];
    const num = pad2(idx + 1);
    const total = pad2(Y1.PROJECTS.length);

    qs('#vBarNum').textContent = `${num}`;
    qs('.viewer__bar .count').innerHTML = `FRAME <b id="vBarNum">${num}</b> / ${total}`;
    qs('#vNum').textContent = num;
    qs('#vTitle').textContent = copy.title;
    qs('#vKind').textContent = copy.kind;
    qs('#vDesc').textContent = copy.desc;

    const mediaBox = qs('#vMedia');
    mediaBox.innerHTML = p.video
      ? `<video src="${p.video}" poster="${p.img}" controls autoplay loop playsinline></video>`
      : `<img src="${p.img}" alt="${copy.title}" />`;

    const inTc = `00:00:${pad2((idx + 1) * 5)}:00`;
    const outTc = `00:00:${pad2((idx + 2) * 5)}:00`;
    qs('#vEdgeTc').textContent = `${inTc} — ${outTc}`;
    qs('#vEdgeCode').textContent = `Y1IO · 5219 · ${p.id.toUpperCase()}`;

    const specs = [
      [t['v.in'], inTc],
      [t['v.out'], outTc],
      [t['v.stack'], p.tags.join(' · ')],
      [t['v.notes'], copy.bullets.join(' · ')]
    ];
    qs('#vSpecs').innerHTML = specs.map(([k, v]) => `<li><small>${k}</small><span>${v}</span></li>`).join('');

    const noteEl = qs('#vNote');
    if (copy.note) {
      noteEl.hidden = false;
      noteEl.textContent = copy.note;
    } else {
      noteEl.hidden = true;
    }

    const launch = qs('#vLaunch');
    launch.href = p.url;
    qs('#vLaunchTxt').textContent = copy.cta;
    qs('#vPrev').disabled = idx === 0;
    qs('#vNext').disabled = idx === Y1.PROJECTS.length - 1;
  }

  function openViewer(idx) {
    idx = clamp(idx, 0, Y1.PROJECTS.length - 1);
    STATE.viewerIdx = idx;
    STATE.viewed.add(idx);
    localStorage.setItem('y1_viewed', JSON.stringify(Array.from(STATE.viewed)));
    const frameEl = qs(`.frame[data-frame="${idx}"]`);
    if (frameEl) frameEl.classList.add('is-viewed');

    Fx.triggerBurn(window.innerWidth * 0.5, window.innerHeight * 0.5);
    Sfx.burn();
    renderViewerContent(idx);
    setLocked(true);
    const v = qs('#viewer');
    v.classList.add('on');
    v.scrollTop = 0;
    qs('#vClose').focus();
  }

  function closeViewer() {
    if (STATE.viewerIdx < 0) return;
    STATE.viewerIdx = -1;
    qs('#viewer').classList.remove('on');
    qs('#vMedia').innerHTML = '';
    setLocked(false);
    Sfx.tick();
  }

  /* -------------------------------------------------------------
     11. FOUR-TRACK EDL TIMELINE
  ------------------------------------------------------------- */
  function buildEdl() {
    const root = qs('#edlTracks');
    const lang = STATE.lang;
    const projMap = new Map(Y1.PROJECTS.map((p, i) => [p.id, { p, i }]));

    root.innerHTML = Y1.TRACKS.map(tr => {
      const clipsHtml = tr.clips.map(([pid, s, e]) => {
        const entry = projMap.get(pid);
        if (!entry) return '';
        const { p, i } = entry;
        return `
          <button class="clip" type="button" data-open-edl="${i}" data-s="${s}" data-e="${e}"
            style="left:${s}%;width:${e - s}%" data-cursor="${lang === 'zh' ? '打开' : 'OPEN'}">
            <img src="${p.img}" alt="" />
            <span>${pad2(i + 1)} ${p[lang].title}</span>
          </button>`;
      }).join('');
      return `
        <div class="track">
          <div class="track__label">
            <b>${tr.id}</b>
            <span>${tr[lang]}</span>
          </div>
          <div class="track__lane">${clipsHtml}</div>
        </div>`;
    }).join('');

    qsa('[data-open-edl]', root).forEach(btn => {
      btn.addEventListener('click', () => openViewer(Number(btn.dataset.openEdl)));
    });
  }

  function initEdlScroll() {
    if (prefersRM || typeof ScrollTrigger === 'undefined') return;
    const sec = qs('#edl');
    const board = qs('#edlBoard');
    const head = qs('#playhead');
    const tcEl = qs('#edlTc');

    ScrollTrigger.create({
      trigger: sec,
      start: 'top 70%',
      end: 'bottom 35%',
      scrub: true,
      onUpdate(self) {
        const pct = clamp(self.progress * 100, 0, 100);
        const laneW = Math.max(200, board.clientWidth - 150);
        head.style.left = `${150 + laneW * (pct / 100)}px`;
        const totalSec = 40 * (pct / 100);
        const s = Math.floor(totalSec);
        const f = Math.floor((totalSec - s) * 24);
        tcEl.textContent = `00:${pad2(s)}:${pad2(f)}`;

        qsa('.clip', board).forEach(c => {
          const cs = Number(c.dataset.s);
          const ce = Number(c.dataset.e);
          c.classList.toggle('is-hot', pct >= cs && pct <= ce);
        });
      }
    });
  }

  /* -------------------------------------------------------------
     12. HANGING FILM TRIMS TOOL BIN (Damped pendulum physics)
  ------------------------------------------------------------- */
  function buildBin() {
    const root = qs('#binRows');
    const lang = STATE.lang;
    const cats = [
      ['3d', Y1.I18N[lang]['cat.3d']],
      ['web', Y1.I18N[lang]['cat.web']],
      ['design', Y1.I18N[lang]['cat.design']],
      ['ai', Y1.I18N[lang]['cat.ai']],
      ['business', Y1.I18N[lang]['cat.business']]
    ];

    root.innerHTML = cats.map(([cat, label]) => {
      const items = Y1G.tools.filter(t => t.cat === cat);
      const trimsHtml = items.map(t => `
        <button class="trim" type="button" aria-label="${t.name}">
          <span class="trim__pin" aria-hidden="true"></span>
          <span class="trim__film">
            <span class="trim__win"><img src="assets/icons/tools/${t.id}-paper.svg" alt="" /></span>
            <span class="trim__name">${t.name}</span>
          </span>
        </button>`).join('');
      return `
        <div class="wire">
          <div class="wire__label">${label}</div>
          <div class="wire__line">${trimsHtml}</div>
        </div>`;
    }).join('');

    // Localized spring pendulum rAF that sleeps when all trims stop moving
    const active = new Map();
    let swingRaf = 0;

    function tickSwing() {
      swingRaf = 0;
      active.forEach((st, el) => {
        st.vel += (-0.11 * st.ang);
        st.vel *= 0.90;
        st.ang += st.vel;
        el.style.transform = `rotate(${st.ang.toFixed(2)}deg)`;
        if (Math.abs(st.ang) < 0.08 && Math.abs(st.vel) < 0.08) {
          el.style.transform = '';
          active.delete(el);
        }
      });
      if (active.size) swingRaf = requestAnimationFrame(tickSwing);
    }

    function kick(el, impulse) {
      if (prefersRM) return;
      const st = active.get(el) || { ang: 0, vel: 0 };
      st.vel += impulse;
      active.set(el, st);
      Sfx.rustle();
      if (!swingRaf) swingRaf = requestAnimationFrame(tickSwing);
    }

    qsa('.trim', root).forEach(el => {
      el.addEventListener('pointerenter', e => {
        const rect = el.getBoundingClientRect();
        const dir = e.clientX < rect.left + rect.width / 2 ? 4.2 : -4.2;
        kick(el, dir);
      });
      el.addEventListener('click', () => kick(el, (Math.random() > 0.5 ? 1 : -1) * 5.2));
    });
  }

  /* -------------------------------------------------------------
     13. OPERATOR CLAPPERBOARD + TAKE 04 "Y1 TRI-RENDER"
     (3 polygon vertices from Y1 mark rendered in RGB dispersion + CAD)
  ------------------------------------------------------------- */
  const Y1_POLYS = [
    [[197, 304], [289, 304], [404, 438], [355, 489]],
    [[499, 304], [545, 304], [545, 390], [420, 520], [420, 632], [342, 714], [342, 550], [483, 408], [403, 408]],
    [[529, 468], [545, 468], [545, 714], [490, 714], [490, 540], [460, 540]]
  ];

  const TAKES = [
    { type: 'video', src: 'assets/video/y1-laptop.mp4', poster: 'assets/img/avatar-anime.jpg', label: 'TAKE 01 / ANIME' },
    { type: 'img', src: 'assets/img/avatar-block.jpg', label: 'TAKE 02 / VOXEL' },
    { type: 'img', src: 'assets/img/avatar-pixel.jpg', label: 'TAKE 03 / 8-BIT' },
    { type: 'tri', label: 'TAKE 04 / Y1 TRI-RENDER' }
  ];

  function initSlate() {
    const slate = qs('#slate');
    const win = qs('#slateWin');
    const takeEl = qs('#slateTake');
    let triRaf = 0;
    let inView = true;

    function stopTri() {
      if (triRaf) { cancelAnimationFrame(triRaf); triRaf = 0; }
    }

    function startTri(canvas) {
      stopTri();
      const ctx = canvas.getContext('2d');
      let mx = 0.5, my = 0.5, pmx = 0.5, pmy = 0.5, vx = 0, vy = 0, t = 0;

      canvas.addEventListener('pointermove', e => {
        const r = canvas.getBoundingClientRect();
        mx = clamp((e.clientX - r.left) / r.width, 0, 1);
        my = clamp((e.clientY - r.top) / r.height, 0, 1);
      }, { passive: true });
      canvas.addEventListener('pointerleave', () => { mx = 0.5; my = 0.5; });

      const drawPoly = (pts, sx, sy, scale, ox, oy, fill, stroke) => {
        ctx.beginPath();
        pts.forEach(([x, y], idx) => {
          // Pointer repulsion near cursor
          const nx = (x - 371) * scale + sx + ox;
          const ny = (y - 509) * scale + sy + oy;
          const dx = nx - mx * canvas.width;
          const dy = ny - my * canvas.height;
          const d = Math.hypot(dx, dy);
          const push = d < 95 ? ((95 - d) / 95) * 14 : 0;
          const px = nx + (d ? (dx / d) * push : 0);
          const py = ny + (d ? (dy / d) * push : 0);
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        if (fill) { ctx.fillStyle = fill; ctx.fill(); }
        if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1.4; ctx.stroke(); }
      };

      const render = () => {
        triRaf = 0;
        if (!inView || STATE.takeIdx !== 3) return;
        const w = canvas.width = Math.max(200, Math.floor(canvas.clientWidth));
        const h = canvas.height = Math.max(200, Math.floor(canvas.clientHeight));
        t += 0.03;
        vx += (mx - pmx) * 38; vy += (my - pmy) * 38;
        pmx = mx; pmy = my;
        vx *= 0.85; vy *= 0.85;

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, w, h);

        // Subtle CAD grid
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 1;
        for (let g = 24; g < w; g += 28) {
          ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, h); ctx.stroke();
        }
        for (let g = 24; g < h; g += 28) {
          ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(w, g); ctx.stroke();
        }

        const scale = Math.min(w, h) / 520;
        const cx = w * 0.5;
        const cy = h * 0.48;
        const ox = Math.sin(t) * 2.5 + vx;
        const oy = Math.cos(t * 1.1) * 2.5 + vy;

        ctx.globalCompositeOperation = 'screen';
        Y1_POLYS.forEach(poly => {
          drawPoly(poly, cx, cy, scale, -ox * 0.9 - 2, -oy * 0.5, 'rgba(255, 90, 31, 0.88)', null);
          drawPoly(poly, cx, cy, scale, ox * 0.9 + 2, oy * 0.5, 'rgba(180, 225, 255, 0.55)', null);
        });
        ctx.globalCompositeOperation = 'source-over';
        Y1_POLYS.forEach(poly => {
          drawPoly(poly, cx, cy, scale, 0, 0, 'rgba(242, 242, 242, 0.88)', '#ff5a1f');
        });

        triRaf = requestAnimationFrame(render);
      };
      render();
    }

    function renderTake(idx) {
      stopTri();
      const tk = TAKES[idx];
      takeEl.textContent = tk.label;
      if (tk.type === 'video') {
        win.innerHTML = (stillQuery || prefersRM)
          ? `<img src="${tk.poster}" alt="Y1io ${tk.label}" />`
          : `<img src="${tk.poster}" alt="Y1io ${tk.label}" /><video src="${tk.src}" poster="${tk.poster}" muted loop playsinline autoplay></video>`;
      } else if (tk.type === 'img') {
        win.innerHTML = `<img src="${tk.src}" alt="Y1io ${tk.label}" />`;
      } else {
        win.innerHTML = `<canvas aria-label="Y1 three-mode liquid and CAD render"></canvas><span class="slate__tri-hint"><span>LIQUID + CAD</span><span>MOVE CURSOR</span></span>`;
        startTri(qs('canvas', win));
      }
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (inView && STATE.takeIdx === 3) {
          const c = qs('canvas', win);
          if (c) startTri(c);
        } else {
          stopTri();
        }
      }, { threshold: 0.1 }).observe(slate);
    }

    renderTake(0);

    slate.addEventListener('click', e => {
      const r = slate.getBoundingClientRect();
      Fx.burst(e.clientX || (r.left + r.width / 2), e.clientY || r.top, 20, 1.15);
      Sfx.clap();
      slate.classList.add('is-clap');
      setTimeout(() => slate.classList.remove('is-clap'), 180);
      STATE.takeIdx = (STATE.takeIdx + 1) % TAKES.length;
      renderTake(STATE.takeIdx);
    });
  }

  /* -------------------------------------------------------------
     14. CONTACT LINKS, COPY EMAIL, & BRIEF FORM
  ------------------------------------------------------------- */
  function initContact() {
    const mailEl = qs('#mailAddr');
    mailEl.textContent = Y1.CONTACT.email;
    mailEl.href = `mailto:${Y1.CONTACT.email}`;

    const visibleLinks = Y1.CONTACT.links.filter(l => l.url && l.url.trim());
    qs('#socialLinks').innerHTML = visibleLinks.map(l => `
      <li>
        <a href="${l.url}" target="_blank" rel="noopener">
          ${iconSvg(l.icon)}
          <span>${l.label}</span>
          ${iconSvg('arrow-up-right')}
        </a>
      </li>`).join('');

    qs('#copyMailBtn').addEventListener('click', async e => {
      const t = Y1.I18N[STATE.lang];
      try {
        await navigator.clipboard.writeText(Y1.CONTACT.email);
      } catch {
        const tmp = document.createElement('input');
        tmp.value = Y1.CONTACT.email;
        document.body.appendChild(tmp);
        tmp.select();
        document.execCommand('copy');
        tmp.remove();
      }
      const txt = qs('#copyMailTxt');
      txt.textContent = t['c.copied'];
      const r = e.currentTarget.getBoundingClientRect();
      Fx.burst(r.left + r.width / 2, r.top + r.height / 2, 12, 0.8);
      Sfx.tick();
      setTimeout(() => { txt.textContent = Y1.I18N[STATE.lang]['c.copy']; }, 1800);
    });

    qsa('#topicChips .chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const cur = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!cur));
        Sfx.tick();
      });
    });

    const form = qs('#briefForm');
    const inName = qs('#inName');
    const inMsg = qs('#inMsg');
    const errName = qs('#errName');
    const errMsg = qs('#errMsg');
    const fName = qs('#fieldName');
    const fMsg = qs('#fieldMsg');
    const okEl = qs('#formOk');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const t = Y1.I18N[STATE.lang];
      let valid = true;

      const nameVal = inName.value.trim();
      const msgVal = inMsg.value.trim();

      if (!nameVal) {
        fName.classList.add('is-bad');
        errName.textContent = t['f.err.name'];
        valid = false;
      } else {
        fName.classList.remove('is-bad');
        errName.textContent = '';
      }

      if (msgVal.length < 4) {
        fMsg.classList.add('is-bad');
        errMsg.textContent = t['f.err.msg'];
        valid = false;
      } else {
        fMsg.classList.remove('is-bad');
        errMsg.textContent = '';
      }

      if (!valid) return;

      const topics = qsa('#topicChips .chip[aria-pressed="true"]').map(c => c.textContent.trim());
      const subject = encodeURIComponent(`[Y1io Brief] ${topics.join(' / ') || 'Project'} — ${nameVal}`);
      const body = encodeURIComponent(`From: ${nameVal}\nType: ${topics.join(', ') || '-'}\n\n${msgVal}`);
      okEl.textContent = t['f.ok'];
      Sfx.clap();
      window.location.href = `mailto:${Y1.CONTACT.email}?subject=${subject}&body=${body}`;
    });
  }

  /* -------------------------------------------------------------
     15. BILINGUAL SWITCHER + NAVIGATION + SHORTCUTS
  ------------------------------------------------------------- */
  function setLang(lang) {
    STATE.lang = lang === 'en' ? 'en' : 'zh';
    localStorage.setItem('y1_lang', STATE.lang);
    document.documentElement.lang = STATE.lang;

    const dict = Y1.I18N[STATE.lang];
    qsa('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (!dict[k]) return;
      if (k === 'hint.scroll' && (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 860)) {
        el.textContent = dict['hint.swipe'];
      } else {
        el.textContent = dict[k];
      }
    });

    qsa('#langBtn span[data-lang]').forEach(s => {
      s.classList.toggle('on', s.dataset.lang === STATE.lang);
    });

    const soundBtn = qs('#soundBtn');
    qs('#soundLabel').textContent = STATE.sound ? dict['sound.on'] : dict['sound.off'];
    soundBtn.setAttribute('aria-pressed', String(STATE.sound));

    buildRail();
    buildEdl();
    buildBin();
    updateReadout(STATE.activeFrame, false);
    if (STATE.viewerIdx >= 0) renderViewerContent(STATE.viewerIdx);
    if (STATE.railST) {
      // Re-apply track position after rebuilding rail
      STATE.railST.refresh();
    }
  }

  function initNavAndControls() {
    qs('#langBtn').addEventListener('click', () => {
      Sfx.tick();
      setLang(STATE.lang === 'zh' ? 'en' : 'zh');
    });

    qs('#soundBtn').addEventListener('click', () => {
      STATE.sound = !STATE.sound;
      const dict = Y1.I18N[STATE.lang];
      qs('#soundBtn').setAttribute('aria-pressed', String(STATE.sound));
      qs('#soundLabel').textContent = STATE.sound ? dict['sound.on'] : dict['sound.off'];
      if (STATE.sound) {
        Sfx.unlock();
        Sfx.tick();
      }
    });

    qs('#scrubBtn').addEventListener('click', () => {
      const next = STATE.activeFrame === 0 ? 1 : (STATE.activeFrame + 1) % Y1.PROJECTS.length;
      scrollToFrame(next);
    });
    qs('#roViewBtn').addEventListener('click', () => openViewer(STATE.activeFrame));
    qs('#prevFrame').addEventListener('click', () => scrollToFrame(STATE.activeFrame - 1));
    qs('#nextFrame').addEventListener('click', () => scrollToFrame(STATE.activeFrame + 1));

    qs('#vClose').addEventListener('click', closeViewer);
    qs('#vPrev').addEventListener('click', () => {
      if (STATE.viewerIdx > 0) openViewer(STATE.viewerIdx - 1);
    });
    qs('#vNext').addEventListener('click', () => {
      if (STATE.viewerIdx < Y1.PROJECTS.length - 1) openViewer(STATE.viewerIdx + 1);
    });

    qs('#rewindBtn').addEventListener('click', () => {
      Sfx.burn();
      if (STATE.lenis) STATE.lenis.scrollTo(0, { duration: 1.1 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile sheet menu
    const sheet = qs('#sheetnav');
    const menuBtn = qs('#menuBtn');
    const toggleSheet = open => {
      sheet.classList.toggle('on', open);
      sheet.setAttribute('aria-hidden', String(!open));
      menuBtn.setAttribute('aria-expanded', String(open));
      setLocked(open);
    };
    menuBtn.addEventListener('click', () => toggleSheet(true));
    qs('#menuClose').addEventListener('click', () => toggleSheet(false));
    qsa('a', sheet).forEach(a => a.addEventListener('click', () => toggleSheet(false)));

    // Smooth anchor links with Lenis
    qsa('.nav__links a, .sheetnav a, .bench__ctas a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const href = a.getAttribute('href');
        if (!href || !href.startsWith('#')) return;
        const target = qs(href);
        if (!target) return;
        e.preventDefault();
        if (STATE.lenis) STATE.lenis.scrollTo(target);
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Section active nav indicator
    if ('IntersectionObserver' in window) {
      const secs = ['work', 'edl', 'bin', 'operator', 'contact'].map(id => qs('#' + id)).filter(Boolean);
      const navLinks = new Map(qsa('[data-nav]').map(a => [a.dataset.nav, a]));
      const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (!en.isIntersecting) return;
          navLinks.forEach((a, k) => a.classList.toggle('is-active', k === en.target.id));
        });
      }, { rootMargin: '-40% 0px -45% 0px' });
      secs.forEach(s => obs.observe(s));
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }
      if (!STATE.introDone && (e.key === 'Escape' || e.key === ' ')) {
        e.preventDefault();
        Intro.finish(false);
        return;
      }
      if (STATE.viewerIdx >= 0) {
        if (e.key === 'Escape') closeViewer();
        else if (e.key === 'ArrowLeft' && STATE.viewerIdx > 0) openViewer(STATE.viewerIdx - 1);
        else if (e.key === 'ArrowRight' && STATE.viewerIdx < Y1.PROJECTS.length - 1) openViewer(STATE.viewerIdx + 1);
        return;
      }
      if (e.key === 'ArrowLeft') scrollToFrame(STATE.activeFrame - 1);
      else if (e.key === 'ArrowRight') scrollToFrame(STATE.activeFrame + 1);
      else if (e.key === 'Enter' && document.activeElement === document.body) openViewer(STATE.activeFrame);
      else if (e.key === 'm' || e.key === 'M') qs('#soundBtn').click();
      else if (e.key === 'l' || e.key === 'L') qs('#langBtn').click();
    });
  }

  /* -------------------------------------------------------------
     16. SECTION TITLE REVEALS & LENIS SMOOTH SCROLL
  ------------------------------------------------------------- */
  function initScrollReveals() {
    if (prefersRM || skipQuery || stillQuery || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    qsa('.reveal-line > span').forEach(span => {
      gsap.from(span, {
        y: 22,
        opacity: 0.45,
        duration: 0.55,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: span.closest('.sec'),
          start: 'top 90%',
          once: true
        }
      });
    });
  }

  function initLenis() {
    if (prefersRM || stillQuery || typeof Lenis === 'undefined') return;
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    STATE.lenis = lenis;
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  /* -------------------------------------------------------------
     BOOT
  ------------------------------------------------------------- */
  injectIcons();
  initLenis();
  setLang(STATE.lang);
  initRailScroll();
  initEdlScroll();
  initScrollReveals();
  initSlate();
  initContact();
  initNavAndControls();
  Intro.play(false);
})();
