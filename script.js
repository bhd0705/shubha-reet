/* ═══════════════════════════════════════════════════════════════
   KARAN & SANJANA — WEDDING WEBSITE
   script.js  ·  Vanilla JS  ·  No frameworks
═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── DOM REFS ────────────────────────────────────────────── */
  const introScreen    = document.getElementById('intro-screen');
  const tapHint        = document.getElementById('intro-tap-hint');
  const video          = document.getElementById('intro-video');
  const mainContent    = document.getElementById('main-content');
  const heroContent    = document.getElementById('hero-content');
  const whiteFlash     = document.getElementById('white-flash');
  const bgMusic        = document.getElementById('bg-music');
  const musicBtn       = document.getElementById('music-btn');

  const botanical      = document.querySelector('.hero-botanical');
  const cornerTL       = document.querySelector('.hero-corner--tl');
  const cornerBR       = document.querySelector('.hero-corner--br');
  const heroBgImg      = document.querySelector('.hero-bg-img');

  /* ─── STATE ───────────────────────────────────────────────── */
  let tapped        = false;
  let introComplete = false;
  let fallbackTimer = null;


  /* ═══════════════════════════════════════════════════════════
     REDUCED MOTION — skip intro, go straight to hero
  ═══════════════════════════════════════════════════════════ */
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    skipToHero();
    return;
  }


  /* ═══════════════════════════════════════════════════════════
     BOOT
     ─────────────────────────────────────────────────────────
     Design notes (READ BEFORE EDITING):

     1. The tap hint is now faded in by CSS, not JS. That removes
        the "hint waits for script.js to download" delay.

     2. We DO NOT fetch the MP4 ourselves and swap to a blob URL.
        That approach (a) duplicates the download with the
        <link rel=preload> tag, (b) mutates video.src async OUTSIDE
        any user-gesture window, which causes iOS Safari to
        silently refuse the subsequent play() call when the user
        actually taps. Instead we rely on the browser's own
        preload="auto" + an explicit one-shot .load() at boot.

     3. video.play() must be the FIRST statement inside the touch
        handler, with no async work, no src changes, no awaits
        before it. Anything else burns the user-gesture token.
  ═══════════════════════════════════════════════════════════ */
  lockScroll(true);

  // ── Kick off native video buffering as early as possible ─────
  // preload="auto" on the element is a hint; calling load() makes
  // it concrete. Wrapped in try/catch because some old browsers
  // throw if no source is resolvable yet.
  try { video.load(); } catch (_) {}

  // If the network can't deliver the video, don't trap the user
  // on the intro screen forever — auto-skip after the error.
  video.addEventListener('error', function () {
    if (!introComplete) scheduleSkip(800);
  });

  // ── Gesture listeners ─────────────────────────────────────────
  // On iOS Safari, `click` fires ~300 ms after touchend. That delay
  // can push video.play() outside the user-gesture trust window.
  // `touchstart` fires synchronously the instant the finger lands,
  // keeping play() inside the trust window. We suppress the
  // subsequent `click` to avoid double-firing.
  var _touchHandled = false;

  // pointerdown also fires synchronously on touch + mouse + pen,
  // so it gives us the fastest, most universal first-gesture hook.
  // We listen on the *capture* phase so nothing in between can
  // call preventDefault and burn the gesture token.
  function gestureStart (e) {
    if (tapped) return;
    _touchHandled = true;
    onFirstTap();
  }

  introScreen.addEventListener('touchstart', gestureStart, { passive: true });
  introScreen.addEventListener('pointerdown', gestureStart, { passive: true });

  introScreen.addEventListener('click', function (e) {
    if (_touchHandled) { _touchHandled = false; return; } // already handled
    onFirstTap();
  });

  introScreen.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFirstTap(); }
  });


  /* ═══════════════════════════════════════════════════════════
     FIRST TAP
     CRITICAL: video.play() must be called synchronously inside
     the gesture handler. Any setTimeout, await, or src change
     before play() breaks iOS Safari's user-gesture trust and the
     play() call gets blocked silently.
  ═══════════════════════════════════════════════════════════ */
  function onFirstTap () {
    if (tapped) return;
    tapped = true;

    // 1) PLAY FIRST — no DOM mutation, no src change, nothing.
    //    These three properties are re-asserted in case any
    //    intermediate code (third-party scripts, devtools, etc.)
    //    flipped them; they are idempotent and gesture-safe.
    video.muted       = true;
    video.playsInline = true;
    video.defaultMuted = true;

    var p;
    try {
      p = video.play();
    } catch (err) {
      // Synchronous throw (very rare) — bail to hero.
      scheduleSkip(400);
      return;
    }

    // 2) NOW do the cosmetic side-effects, after play() is queued.
    if (tapHint) tapHint.classList.add('is-gone');

    // 3) Start background music — the user gesture from this same tap
    //    satisfies the autoplay policy, so we can call bgMusic.play()
    //    here without a separate interaction.
    if (bgMusic) {
      bgMusic.volume = 0.72;        // full volume straight away, no fade
      var musicPlay = null;
      try { musicPlay = bgMusic.play(); } catch (_) {}
      // If the browser refuses this first attempt, retry on the next
      // tap / click / key press anywhere on the page.
      if (musicPlay && typeof musicPlay.catch === 'function') {
        musicPlay.catch(function () {
          var retryEvents = ['click', 'touchend', 'keydown'];
          var retry = function () {
            bgMusic.play().then(function () {
              retryEvents.forEach(function (ev) { document.removeEventListener(ev, retry, true); });
            }).catch(function () {});
          };
          retryEvents.forEach(function (ev) { document.addEventListener(ev, retry, true); });
        });
      }
    }

    // 3) Wire up the success / failure paths.
    if (p && typeof p.then === 'function') {
      p.then(function () {
        fallbackTimer = setTimeout(revealHero, 12000);
        video.addEventListener('ended', revealHero, { once: true });
        watchForStall();
      }).catch(function (err) {
        // Most common cause here is iOS still not having the first
        // frame ready. Retry once after the next tick — by then the
        // browser has usually decoded enough to play. If the retry
        // also fails, gracefully skip to hero.
        setTimeout(function () {
          var p2;
          try { p2 = video.play(); } catch (_) { p2 = null; }
          if (p2 && typeof p2.then === 'function') {
            p2.then(function () {
              fallbackTimer = setTimeout(revealHero, 12000);
              video.addEventListener('ended', revealHero, { once: true });
              watchForStall();
            }).catch(function () { scheduleSkip(400); });
          } else if (p2 !== null) {
            // No promise — assume success
            fallbackTimer = setTimeout(revealHero, 12000);
            video.addEventListener('ended', revealHero, { once: true });
            watchForStall();
          } else {
            scheduleSkip(400);
          }
        }, 60);
      });
    } else {
      // Old browser, no promise from play()
      fallbackTimer = setTimeout(revealHero, 12000);
      video.addEventListener('ended', revealHero, { once: true });
      watchForStall();
    }
  }


  /* ─── Stall guard ─────────────────────────────────────────
     If the video freezes mid-play (network hiccup), skip to
     hero after 6 s. The old 2.5 s was too aggressive — mobile
     networks often take 3–5 s to buffer even after play() is
     called, causing the intro to cut away before it could play.
     With the blob preload this fires only as a true last resort. */
  function watchForStall () {
    var stallTimer = null;
    video.addEventListener('waiting', function onWaiting () {
      if (introComplete) { video.removeEventListener('waiting', onWaiting); return; }
      stallTimer = setTimeout(function () {
        if (!introComplete) revealHero();
      }, 6000);
    });
    video.addEventListener('playing', function onPlaying () {
      if (stallTimer) { clearTimeout(stallTimer); stallTimer = null; }
      if (introComplete) video.removeEventListener('playing', onPlaying);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     REVEAL HERO
  ═══════════════════════════════════════════════════════════ */
  function revealHero () {
    if (introComplete) return;
    introComplete = true;

    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }

    try { video.pause(); } catch (_) {}

    /* ── Step 1: slowly darken to deep cinematic black (0.65s bloom) ── */
    if (whiteFlash) {
      whiteFlash.classList.add('is-blooming');
    }

    /* ── Step 2: while dark — swap screens & let intro recession complete ── */
    setTimeout(function () {
      introScreen.classList.add('is-fading');
      introScreen.addEventListener('transitionend', function done () {
        introScreen.removeEventListener('transitionend', done);
        introScreen.classList.add('is-gone');
      });

      lockScroll(false);
      mainContent.removeAttribute('aria-hidden');
      mainContent.classList.add('is-visible');
    }, 900);

    /* ── Step 3: hero content begins emerging, still behind the dark veil ── */
    setTimeout(function () {
      heroContent.classList.add('is-visible');
    }, 1100);

    /* ── Step 4: hold darkness for a breath, then begin the long dawn reveal ── */
    setTimeout(function () {
      if (whiteFlash) {
        whiteFlash.classList.remove('is-blooming');
        whiteFlash.classList.add('is-retreating');
      }
    }, 1800);

    /* ── Step 5: remove layer after full retreat (1800 + 5000 = 6.8s) ── */
    setTimeout(function () {
      if (whiteFlash) whiteFlash.classList.add('is-gone');
    }, 7000);

    /* ── Staggered section inits ── */
    setTimeout(function () {
      if (botanical) botanical.classList.add('is-loaded');
      if (cornerTL)  cornerTL.classList.add('is-loaded');
      if (cornerBR)  cornerBR.classList.add('is-loaded');
    }, 2000);

    setTimeout(initInviteAnimations,  2200);
    setTimeout(initEventsSection,     2400);
    setTimeout(initBirds,             2600);
    setTimeout(initPetals,            2800);
    setTimeout(initWardrobeSection,      3000);
    setTimeout(initBlessingsSection,     3100);

    /* ── Show & wire music button once hero is settled ──────── */
    setTimeout(initMusicBtn, 2400);
  }


  /* ─── Utility: schedule a skip ────────────────────────────── */
  function scheduleSkip (ms) {
    if (!introComplete) setTimeout(revealHero, ms);
  }


  /* ─── Skip entirely (reduced motion / no assets) ─────────── */
  function skipToHero () {
    introScreen.classList.add('is-gone');
    mainContent.removeAttribute('aria-hidden');
    mainContent.classList.add('is-visible');
    heroContent.classList.add('is-visible');
    if (botanical) botanical.classList.add('is-loaded');
    if (cornerTL)  cornerTL.classList.add('is-loaded');
    if (cornerBR)  cornerBR.classList.add('is-loaded');
    document.querySelectorAll('[data-invite-block]').forEach(function (b) {
      b.style.opacity = '1';
      b.style.transform = 'none';
    });
    /* Also initialise events immediately */
    initEventsSection();
    initBirds();
    initPetals();
    initWardrobeSection();
    initBlessingsSection();
  }


  /* ═══════════════════════════════════════════════════════════
     SCROLL LOCK
  ═══════════════════════════════════════════════════════════ */
  function lockScroll (lock) {
    document.body.style.overflow = lock ? 'hidden' : '';
  }


  /* ═══════════════════════════════════════════════════════════
     PARALLAX
  ═══════════════════════════════════════════════════════════ */

  /* ─── Touch detection ────────────────────────────────────── */
  var isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  document.querySelectorAll('.hero-corner').forEach(function (el) {
    el.style.transition = [
      'opacity 1s cubic-bezier(0.16,1,0.3,1)',
      'transform 1s cubic-bezier(0.22,1,0.36,1)'
    ].join(', ');
  });

  let scrollTicking = false;

  window.addEventListener('scroll', function () {
    if (!introComplete || scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(function () {
      if (heroBgImg) {
        /* Layer a gentle parallax-scroll on top of CSS Ken Burns */
        var shift = window.scrollY * 0.028;
        heroBgImg.style.marginTop = shift + 'px';
      }
      scrollTicking = false;
    });
  }, { passive: true });

  let px = 0, py = 0;
  let pRaf = null;

  function applyPointerParallax () {
    pRaf = null;
    /* Background subtle drift on mouse move — adds 3-D depth */
    if (heroBgImg) {
      var bx = -(px * 18);
      var by = -(py * 12);
      heroBgImg.style.transform = 'translate(' + bx + 'px, ' + by + 'px)';
    }
    /* Hero text content drifts opposite direction — parallax layers */
    if (heroContent) {
      var cx = px * 6;
      var cy = py * 4;
      heroContent.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
    }
    /* Corner elements (if ever re-enabled) */
    var corners = document.querySelectorAll('.hero-corner[data-parallax]');
    corners.forEach(function (el) {
      var f  = parseFloat(el.dataset.parallax) || 0.03;
      var tx = -(px * 22 * f * 100);
      var ty = -(py * 22 * f * 100);
      el.style.transform = 'translate(' + tx + 'px, ' + ty + 'px)';
    });
  }

  /* Only wire up pointer/orientation parallax on non-touch devices */
  if (!isTouchDevice) {
    window.addEventListener('mousemove', function (e) {
      if (!introComplete) return;
      px = (e.clientX / window.innerWidth)  - 0.5;
      py = (e.clientY / window.innerHeight) - 0.5;
      if (!pRaf) pRaf = requestAnimationFrame(applyPointerParallax);
    }, { passive: true });
  }

  if (!isTouchDevice && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function (e) {
      if (!introComplete) return;
      px =  Math.max(-30, Math.min(30, e.gamma || 0)) / 60;
      py =  Math.max(-20, Math.min(20, (e.beta || 0) - 20)) / 40;
      if (!pRaf) pRaf = requestAnimationFrame(applyPointerParallax);
    }, { passive: true });
  }


  /* ─── Change 12: Hide scroll cue after user starts scrolling ── */
  var scrollCta = document.querySelector('.hero-scroll-cta');
  var scrollCtaHidden = false;

  window.addEventListener('scroll', function () {
    if (!scrollCta) return;
    if (window.scrollY > 10 && !scrollCtaHidden) {
      scrollCtaHidden = true;
      scrollCta.classList.add('is-hidden');
    } else if (window.scrollY <= 10 && scrollCtaHidden) {
      scrollCtaHidden = false;
      scrollCta.classList.remove('is-hidden');
    }
  }, { passive: true });


  /* ═══════════════════════════════════════════════════════════
     INVITE SECTION — scroll-triggered block animations
  ═══════════════════════════════════════════════════════════ */

  function initInviteAnimations () {
    var blocks = document.querySelectorAll('[data-invite-block]');
    if (!blocks.length) return;

    if (!('IntersectionObserver' in window)) {
      blocks.forEach(function (b) { b.classList.add('is-visible'); });
      return;
    }

    blocks.forEach(function (block, idx) {
      block.style.transitionDelay = (idx * 90) + 'ms';
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });

    blocks.forEach(function (b) { observer.observe(b); });
  }


  /* ═══════════════════════════════════════════════════════════
     INVITE PARALLAX
  ═══════════════════════════════════════════════════════════ */

  var inviteSection    = document.getElementById('invite');
  var inviteOrnaments  = document.querySelectorAll('[data-invite-parallax]');
  var inviteBgImg      = document.querySelector('.invite-bg-img');

  window.addEventListener('scroll', function () {
    if (!inviteSection || !inviteOrnaments.length) return;

    var sectionTop    = inviteSection.getBoundingClientRect().top + window.scrollY;
    var scrollIntoSection = window.scrollY - sectionTop;

    if (scrollIntoSection < -window.innerHeight || scrollIntoSection > inviteSection.offsetHeight) return;

    requestAnimationFrame(function () {
      inviteOrnaments.forEach(function (el) {
        var factor = parseFloat(el.dataset.inviteParallax) || 0;
        var shift  = scrollIntoSection * factor;
        el.style.transform = 'translateX(-50%) translateY(' + shift + 'px)';
      });

      if (inviteBgImg) {
        var bgShift = scrollIntoSection * 0.018;
        inviteBgImg.style.transform = 'scale(1.05) translateY(' + bgShift + 'px)';
      }
    });
  }, { passive: true });


  /* ═══════════════════════════════════════════════════════════
     WEDDING WEEKEND EVENTS — carousel
  ═══════════════════════════════════════════════════════════ */

  /* ─── Event data ──────────────────────────────────────────── */
  var EVENT_THEMES = [
    {
      id:          'welcome-lunch',
      name:        'The Grand Welcome',
      date:        '20th June 2026',
      time:        '1:00 PM Onwards',
      venue:       'Grand Atrium',
      tag:         'A breezy start to the weekend',
      accent:           '#C9A968',
      clrTitle:         '#4B4134',
      clrDateTime:      '#5C5348',
      clrVenue:         '#5C9394',
      clrQuote:         '#3F342A',
      clrQuoteFade:     'rgba(255,244,220,0.45)',
      bgImg:       'assets/Event/welcome-lunch-bg.webp',
      coupleImg:   'assets/Event/welcome-lunch-couple.webp',
      coupleAlt:   'Welcome Lunch couple illustration',
      fallbackBg:  'linear-gradient(160deg, #1a3535 0%, #2c4e4e 100%)',
      mapsHref:    '#'
    },
    {
      id:          'hi-tea',
      name:        'Azure Evenings',
      sub:         'Hi-Tea by the Sea',
      date:        '20th June 2026',
      time:        '4:00 PM Onwards',
      venue:       'Grill Lawn',
      tag:         'Sundowners by the shore',
      accent:           '#C89A58',
      clrTitle:         '#2F5560',
      clrDateTime:      '#5D554A',
      clrVenue:         '#5C8F8F',
      clrQuote:         '#3A302A',
      clrQuoteFade:     'rgba(255,244,220,0.48)',
      bgImg:       'assets/Event/hi-tea-bg.webp',
      coupleImg:   'assets/Event/hi-tea-couple.webp',
      coupleAlt:   'Azure Evenings illustration',
      fallbackBg:  'linear-gradient(160deg, #0d2e30 0%, #1a4540 100%)',
      mapsHref:    '#'
    },
    {
      id:          'sangeet',
      name:        'The Celestial Night',
      date:        '20th June 2026',
      time:        '8:00 PM Onwards',
      venue:       'Grand Ballroom',
      tag:         'Followed by Dinner',
      accent:           '#D8A64F',
      clrTitle:         '#FFF0D3',
      clrDateTime:      '#FFF1C2',
      clrVenue:         '#FFD580',
      clrQuote:         '#FFF0D3',
      clrQuoteFade:     'rgba(20,22,20,0.38)',
      bgImg:       'assets/Event/sangeet-bg.webp',
      coupleImg:   'assets/Event/sangeet-couple.webp',
      coupleAlt:   'The Celestial Night illustration',
      fallbackBg:  'linear-gradient(160deg, #0e2c2c 0%, #1a4040 100%)',
      mapsHref:    '#'
    },
    {
      id:          'coastal-affair',
      name:        'The Coastal Affair',
      sub:         'Ring Ceremony & Luncheon',
      date:        '21st June 2026',
      time:        '11:00 AM Onwards',
      venue:       'Pool Bar & Grill Lawn',
      tag:         'A sun-kissed celebration by the coast',
      accent:           '#CDAA66',
      clrTitle:         '#2F5560',
      clrDateTime:      '#5D554A',
      clrVenue:         '#5F9691',
      clrQuote:         '#35444A',
      clrQuoteFade:     'rgba(255,244,220,0.45)',
      bgImg:       'assets/Event/coastal-affair-bg.webp',
      coupleImg:   'assets/Event/coastal-affair-couple.webp',
      coupleAlt:   'Coastal Affair couple illustration',
      fallbackBg:  'linear-gradient(160deg, #1a3028 0%, #2c4a3e 100%)',
      mapsHref:    '#'
    },
    {
      id:          'baraat',
      name:        'The Baraat',
      sub:         'The Procession of Celebration',
      date:        '21st June 2026',
      time:        '4:00 PM',
      venue:       'The Chappel Lawn-4',
      tag:         'Let the celebration begin',
      accent:           '#C88A34',
      clrTitle:         '#563922',
      clrDateTime:      '#3F3328',
      clrVenue:         '#B86D28',
      clrQuote:         '#3F2A1B',
      clrQuoteFade:     'rgba(255,244,220,0.46)',
      bgImg:       'assets/Event/baraat-bg.webp',
      coupleImg:   'assets/Event/baraat-couple.webp',
      coupleAlt:   'Baraat procession illustration',
      fallbackBg:  'linear-gradient(160deg, #2e1a08 0%, #4a2e10 100%)',
      mapsHref:    '#'
    },
    {
      id:          'varmala',
      name:        'The Moment in Gold',
      sub:         'Varmala',
      date:        '21st June 2026',
      time:        '6:00 PM Onwards',
      venue:       'Lawn-3',
      tag:         'Followed by Dinner',
      accent:           '#D29A89',
      clrTitle:         '#7C3A38',
      clrDateTime:      '#54372F',
      clrVenue:         '#B96A5F',
      clrQuote:         '#FFF1D8',
      clrQuoteFade:     'rgba(75,35,30,0.34)',
      bgImg:       'assets/Event/varmala-bg.webp',
      coupleImg:   'assets/Event/varmala-couple.webp',
      coupleAlt:   'Varmala ceremony illustration',
      fallbackBg:  'linear-gradient(160deg, #2e1010 0%, #4a2020 100%)',
      mapsHref:    '#'
    },
    {
      id:          'phere',
      name:        'Forever Begins Here',
      sub:         'The Wedding Pheras',
      date:        '21st June 2026',
      time:        '10:30 PM',
      venue:       'Grand Ballroom',
      tag:         'A sacred beginning',
      accent:           '#C08442',
      clrTitle:         '#7B302D',
      clrDateTime:      '#755441',
      clrVenue:         '#A86638',
      clrQuote:         '#FFF1D8',
      clrQuoteFade:     'rgba(60,28,22,0.42)',
      bgImg:       'assets/Event/phere-bg.webp',
      coupleImg:   'assets/Event/phere-couple.webp',
      coupleAlt:   'Phere ceremony illustration',
      fallbackBg:  'linear-gradient(160deg, #1e1008 0%, #321a0a 100%)',
      mapsHref:    '#'
    }
  ];

  /* Events come from config.js; each picks artwork + colours via "theme" */
  var EVENTS = ((window.SITE && SITE.events) || []).map(function (e) {
    var base = EVENT_THEMES.filter(function (t) { return t.id === e.theme; })[0] || EVENT_THEMES[0];
    var out = { theme: base.id }, k;
    for (k in base) out[k] = base[k];
    delete out.sub;
    for (k in e) out[k] = e[k];
    out.id = out.theme;
    out.coupleAlt = out.name + ' illustration';
    return out;
  });


  /* ─── Mood class map — drives readability veil + text palette ── */
  var MOOD_CLASS = {
    'welcome-lunch':  'light-card',
    'hi-tea':         'coastal-sunset-card',
    'sangeet':        'dark-card celestial-night',
    'coastal-affair': 'coastal-light-card',
    'baraat':         'warm-light-card',
    'varmala':        'floral-light-card moment-in-gold',
    'phere':          'floral-light-card forever-begins'
  };

  /* ─── Build card HTML string ──────────────────────────────── */
  function buildCardHTML (ev, idx) {
    var moodClass = MOOD_CLASS[ev.id] ? ' ' + MOOD_CLASS[ev.id] : '';
    var cssVars =
      '--evt-accent:'       + ev.accent         + ';' +
      '--evt-title:'        + ev.clrTitle        + ';' +
      '--evt-datetime:'     + ev.clrDateTime     + ';' +
      '--evt-venue:'        + ev.clrVenue        + ';' +
      '--evt-quote:'        + ev.clrQuote        + ';' +
      '--evt-quote-fade:'   + ev.clrQuoteFade    + ';';

    return (
      '<article' +
        ' class="event-card' + moodClass + '"' +
        ' data-event-id="' + ev.id + '"' +
        ' data-card-idx="' + idx + '"' +
        ' data-card-entering' +
        ' aria-roledescription="slide"' +
        ' aria-label="' + ev.name + '"' +
        ' style="' + cssVars + '"' +
      '>' +

        /* Background image */
        '<div class="event-card-bg">' +
          '<img' +
            ' class="event-card-bg-img"' +
            ' src="' + ev.bgImg + '"' +
            ' alt=""' +
            ' draggable="false"' +
            ' onerror="this.closest(\'.event-card\').dataset.fallback=\'true\'"' +
          ' />' +
          '<div class="event-card-bg-fallback" style="background:' + ev.fallbackBg + '"></div>' +
        '</div>' +

        /* Vignette overlay */
        '<div class="event-card-overlay"></div>' +

        /* Couple cutout */
        '<div class="event-card-couple">' +
          '<img' +
            ' class="event-card-couple-img"' +
            ' src="' + ev.coupleImg + '"' +
            ' alt="' + ev.coupleAlt + '"' +
            ' draggable="false"' +
          ' />' +
        '</div>' +

        /* Text panel — no background rectangle */
        '<div class="event-card-panel">' +
          '<p class="event-card-date">' + ev.date + '</p>' +
          '<h3 class="event-card-name">' + ev.name + '</h3>' +
          (ev.sub ? '<p class="event-card-sub">' + ev.sub + '</p>' : '') +
          '<p class="event-card-time">' + ev.time + '</p>' +
          '<p class="event-card-venue">' +
            (ev.mapsHref && ev.mapsHref !== '#'
              ? '<a class="event-card-map" href="' + ev.mapsHref + '" target="_blank" rel="noopener noreferrer">' + ev.venue + '</a>'
              : ev.venue) +
          '</p>' +
          '<div class="event-card-rule" aria-hidden="true">' +
            '<span class="event-card-rule-line"></span>' +
            '<span class="event-card-rule-dot">◆</span>' +
            '<span class="event-card-rule-line"></span>' +
          '</div>' +
        '</div>' +

        /* Quote pill — anchored to bottom of card */
        '<p class="event-card-tag">' + ev.tag + '</p>' +

        /* Glow border */
        '<div class="event-card-glow" aria-hidden="true"></div>' +

      '</article>'
    );
  }


  /* ─── Build dot button HTML ────────────────────────────────── */
  function buildDotHTML (ev, idx) {
    return (
      '<button' +
        ' class="events-dot"' +
        ' data-dot-idx="' + idx + '"' +
        ' role="tab"' +
        ' aria-label="Go to ' + ev.name + '"' +
        ' aria-selected="false"' +
        ' type="button"' +
      '></button>'
    );
  }


  /* ─── Main init ──────────────────────────────────────────────
     Called after intro completes (or immediately if reduced-motion)
  ═══════════════════════════════════════════════════════════ */
  function initEventsSection () {

    var track     = document.getElementById('events-track');
    var dotsWrap  = document.getElementById('events-dots');
    var prevBtn   = document.getElementById('events-prev');
    var nextBtn   = document.getElementById('events-next');
    var header    = document.querySelector('[data-events-header]');

    if (!track || !dotsWrap) return;

    /* ── Inject cards & dots ── */
    var cardsHTML = EVENTS.map(buildCardHTML).join('');
    var dotsHTML  = EVENTS.map(buildDotHTML).join('');
    track.innerHTML   = cardsHTML;
    dotsWrap.innerHTML = dotsHTML;

    var cards = track.querySelectorAll('.event-card');
    var dots  = dotsWrap.querySelectorAll('.events-dot');

    /* ── State ── */
    var activeIdx = 0;
    var isDragging = false;
    var dragStartX = 0;
    var dragScrollLeft = 0;

    /* ── Mark active ── */
    function setActive (idx) {
      idx = Math.max(0, Math.min(idx, cards.length - 1));
      activeIdx = idx;

      cards.forEach(function (c, i) {
        var isActive = (i === idx);
        var isRight  = (i > idx);
        c.classList.toggle('is-active', isActive);
        c.classList.toggle('is-right',  !isActive && isRight);
        c.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === idx);
        d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });

      if (prevBtn) prevBtn.disabled = (idx === 0);
      if (nextBtn) nextBtn.disabled = (idx === cards.length - 1);
    }

    /* ── Scroll to card ── */
    function scrollToCard (idx) {
      var card = cards[idx];
      if (!card) return;
      var trackRect = track.getBoundingClientRect();
      var cardRect  = card.getBoundingClientRect();
      var offset    = cardRect.left - trackRect.left - (trackRect.width - cardRect.width) / 2;
      track.scrollBy({ left: offset, behavior: 'smooth' });
    }

    function goTo (idx) {
      setActive(idx);
      scrollToCard(idx);
    }

    /* ── Arrow buttons ── */
    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        goTo(activeIdx - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        goTo(activeIdx + 1);
      });
    }

    /* ── Dot buttons ── */
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goTo(i); });
    });

    /* ── Keyboard navigation on section ── */
    var eventsSection = document.getElementById('events');
    if (eventsSection) {
      eventsSection.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(activeIdx - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(activeIdx + 1); }
      });
    }

    /* ── Scroll-snap: detect active card after scroll ends ── */
    var snapTimer = null;
    track.addEventListener('scroll', function () {
      clearTimeout(snapTimer);
      snapTimer = setTimeout(function () {
        /* Find which card centre is closest to track centre */
        var trackCx = track.getBoundingClientRect().left + track.clientWidth / 2;
        var closest = 0;
        var minDist = Infinity;

        cards.forEach(function (c, i) {
          var cx   = c.getBoundingClientRect().left + c.offsetWidth / 2;
          var dist = Math.abs(cx - trackCx);
          if (dist < minDist) { minDist = dist; closest = i; }
        });

        if (closest !== activeIdx) setActive(closest);
      }, 80);
    }, { passive: true });

    /* ── Mouse drag on desktop ── */
    track.addEventListener('mousedown', function (e) {
      isDragging    = true;
      dragStartX    = e.pageX - track.offsetLeft;
      dragScrollLeft = track.scrollLeft;
      track.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      var x    = e.pageX - track.offsetLeft;
      var walk = (x - dragStartX) * 1.1;
      track.scrollLeft = dragScrollLeft - walk;
    });

    function endDrag () {
      if (!isDragging) return;
      isDragging = false;
      track.style.cursor = 'grab';
    }

    window.addEventListener('mouseup',    endDrag);
    window.addEventListener('mouseleave', endDrag);

    /* ── Scroll entrance animation for cards ── */
    function animateCardsIn () {
      cards.forEach(function (card, i) {
        setTimeout(function () {
          card.removeAttribute('data-card-entering');
        }, 120 + i * 80);
      });
    }

    /* ── Intersection Observer: header & cards entrance ── */
    if ('IntersectionObserver' in window) {

      /* Header fade-up */
      if (header) {
        var headerObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              headerObserver.unobserve(entry.target);
            }
          });
        }, { threshold: 0.15 });

        headerObserver.observe(header);
      }

      /* Cards entrance when section enters viewport */
      var cardsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCardsIn();
            cardsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });

      if (eventsSection) cardsObserver.observe(eventsSection);

    } else {
      /* No IO support — show immediately */
      if (header) header.classList.add('is-visible');
      animateCardsIn();
    }

    /* ── Reduced motion: skip float animation ── */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cards.forEach(function (c) {
        c.style.transition = 'none';
      });
    }

    /* ── Swipe hint — injected once after dots, auto-hides via CSS animation ── */
    var eventsSection2 = document.getElementById('events');
    if (eventsSection2 && !eventsSection2.querySelector('.events-swipe-hint')) {
      var hint = document.createElement('div');
      hint.className = 'events-swipe-hint';
      hint.setAttribute('aria-hidden', 'true');
      hint.innerHTML = '<span class="events-swipe-hint-icon">☞</span><span class="events-swipe-hint-text">Swipe to explore</span>';
      /* Insert after dots wrapper so it flows below */
      dotsWrap.insertAdjacentElement('afterend', hint);
    }

    /* ── Init active state ── */
    setActive(0);

    /* Give the DOM a moment to paint before scrolling to initial card */
    requestAnimationFrame(function () {
      scrollToCard(0);
    });
  }


  /* ═══════════════════════════════════════════════════════════
     BIRDS — realistic canvas flock in the sky
  ═══════════════════════════════════════════════════════════ */

  function initBirds () {
    var canvas = document.getElementById('hero-birds');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ctx   = canvas.getContext('2d');
    var W, H, dpr;
    var birds = [];
    var rafId = null;
    var heroEl = document.getElementById('hero');
    var startTime = null;

    /* ── Resize canvas to match hero pixel density ─────────── */
    function resize () {
      dpr = window.devicePixelRatio || 1;
      W   = canvas.offsetWidth;
      H   = canvas.offsetHeight;
      canvas.width  = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ── Create one bird ───────────────────────────────────── */
    function makeBird (idx) {
      return {
        x:          -0.05 - Math.random() * 0.20,  /* start off left edge */
        y:          0.04  + Math.random() * 0.28,   /* 0-1 top sky band, upper third */
        vx:         0.000130 + Math.random() * 0.000110,  /* rightward drift — slightly faster for visibility */
        vy:        (Math.random() - 0.50) * 0.000008,    /* near-zero vertical — birds fly horizontally */
        flapPhase:  Math.random() * Math.PI * 2,
        flapSpeed:  0.050 + Math.random() * 0.030, /* wing beat rate */
        flapAmp:    0.50  + Math.random() * 0.35,  /* 0=flat, 1=deep flap */
        size:       3.0   + Math.random() * 3.2,   /* half-span in px */
        opacity:    0,
        targetOp:   0.68 + Math.random() * 0.24,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.00040 + Math.random() * 0.00030, /* very slow vertical oscillation */
        driftAmp:   0.00050 + Math.random() * 0.00040, /* tiny vertical wobble only */
        entryAt:    300 + idx * 600 + Math.random() * 400,  /* staggered left-edge entry */
        born:       false,
        birthTime:  null,
      };
    }

    /* ── Draw one bird as bezier-wing silhouette ───────────── */
    function drawBird (b, now) {
      if (!b.born) {
        if (now < b.entryAt) return;
        b.born      = true;
        b.birthTime = now;
      }

      /* Smooth fade-in over 1.1 s */
      var age   = now - b.birthTime;
      b.opacity = Math.min(b.targetOp, b.targetOp * (age / 1100));

      var px   = b.x * W;
      var py   = b.y * H;
      var sz   = b.size;
      var flap = Math.sin(b.flapPhase) * b.flapAmp;  /* -1..+1 */

      ctx.save();
      ctx.translate(px, py);
      ctx.globalAlpha  = b.opacity;
      ctx.strokeStyle  = 'rgba(22,16,8,0.90)';
      ctx.lineWidth    = Math.max(0.85, sz * 0.17);
      ctx.lineCap      = 'round';
      ctx.lineJoin     = 'round';

      /* Left wing — three-point bezier gives naturalistic primary/secondary feather curve */
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -sz * 0.42,  flap * sz * 0.52,
        -sz * 0.78,  flap * sz * 0.76,
        -sz,         flap * sz * 0.60
      );
      ctx.stroke();

      /* Right wing — mirror */
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
         sz * 0.42,  flap * sz * 0.52,
         sz * 0.78,  flap * sz * 0.76,
         sz,         flap * sz * 0.60
      );
      ctx.stroke();

      /* Tiny head nub so silhouette reads as a real bird */
      ctx.beginPath();
      ctx.arc(sz * 0.08, -sz * 0.08, sz * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(22,16,8,0.82)';
      ctx.fill();

      ctx.restore();
    }

    /* ── Physics tick ──────────────────────────────────────── */
    function tickBird (b) {
      b.flapPhase  += b.flapSpeed;
      b.driftPhase += b.driftSpeed;
      b.x += b.vx;
      b.y += b.vy + Math.sin(b.driftPhase) * b.driftAmp;

      /* Soft altitude boundary — birds stay in sky, near-horizontal */
      if (b.y < 0.02) b.vy += 0.0000020;
      if (b.y > 0.35) b.vy -= 0.0000025;
      b.vy *= 0.9990; /* stronger damping keeps vertical speed near zero */

      /* Re-enter from left when off right edge */
      if (b.x > 1.10) {
        b.x         = -0.05 - Math.random() * 0.12;
        b.y         =  0.04 + Math.random() * 0.28;
        b.vy        = (Math.random() - 0.50) * 0.000008; /* near-zero vertical reset */
        b.opacity   = 0;
        b.born      = false;
        b.birthTime = null;
        b.entryAt   = 100 + Math.random() * 400;
      }
    }

    /* ── RAF loop ──────────────────────────────────────────── */
    function loop (ts) {
      if (!startTime) startTime = ts;
      var now = ts - startTime;

      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < birds.length; i++) {
        tickBird(birds[i]);
        drawBird(birds[i], now);
      }

      rafId = requestAnimationFrame(loop);
    }

    /* ── Pause RAF when hero not visible ───────────────────── */
    if ('IntersectionObserver' in window && heroEl) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(loop);
          } else {
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          }
        });
      }, { threshold: 0.05 }).observe(heroEl);
    }

    /* ── Boot ──────────────────────────────────────────────── */
    resize();
    window.addEventListener('resize', resize, { passive: true });

    /* 7 birds — feels like a natural coastal flock, not a murmuration */
    for (var b = 0; b < 7; b++) birds.push(makeBird(b));

    rafId = requestAnimationFrame(loop);
  }


  /* ═══════════════════════════════════════════════════════════
     PETALS — realistic falling petals over the hero section
  ═══════════════════════════════════════════════════════════ */

  function initPetals () {
    var heroEl = document.getElementById('hero');
    if (!heroEl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var COUNT = 9;
    /* First 4–5 petals are "already in the air" — start within the visible hero */
    var WARM_START = 5;

    /* ── Container ──────────────────────────────────────────── */
    var container = document.createElement('div');
    container.className = 'petals-container';
    container.setAttribute('aria-hidden', 'true');
    heroEl.appendChild(container);

    var petals = [];
    var rafId  = null;
    var W = heroEl.offsetWidth;
    var H = heroEl.offsetHeight;

    function resize () {
      W = heroEl.offsetWidth;
      H = heroEl.offsetHeight;
    }
    window.addEventListener('resize', resize, { passive: true });

    /* ── Factory ────────────────────────────────────────────── */
    function makePetal (idx) {
      var img = document.createElement('img');
      img.src       = 'assets/Hero/Petal.webp';
      img.className = 'hero-petal';
      img.draggable = false;
      container.appendChild(img);

      /* First WARM_START petals start visibly on screen (spread across upper 60% of hero)
         so guests immediately see petals falling. Remaining start above the viewport. */
      var startY;
      if (idx < WARM_START) {
        startY = (idx / WARM_START) * H * 0.60 + Math.random() * (H * 0.12);
      } else {
        startY = -(40 + Math.random() * H * 0.5);
      }

      return {
        el:          img,
        x:           Math.random() * W,
        y:           startY,
        size:        16 + Math.random() * 14,          /* 16–30 px */
        speedY:      0.28 + Math.random() * 0.28,      /* slower fall: 0.28–0.56 px/frame */
        rot:         Math.random() * 360,
        rotSpeed:    (Math.random() < 0.5 ? 1 : -1)
                       * (0.25 + Math.random() * 0.55), /* gentler rotation */
        swingPhase:  Math.random() * Math.PI * 2,
        swingSpeed:  0.005 + Math.random() * 0.006,    /* slower sway frequency */
        swingAmp:    28 + Math.random() * 42,           /* slightly wider lazy sway */
        driftX:      (Math.random() - 0.5) * 0.12,     /* gentle lateral drift */
        opacity:     0.72 + Math.random() * 0.22,
        /* tiny wobble in fall speed to feel organic */
        bobPhase:    Math.random() * Math.PI * 2,
        bobSpeed:    0.012 + Math.random() * 0.009,
        bobAmp:      0.14 + Math.random() * 0.16,
      };
    }

    /* ── Per-frame update ───────────────────────────────────── */
    function tickPetal (p) {
      p.swingPhase += p.swingSpeed;
      p.bobPhase   += p.bobSpeed;

      /* Pendulum horizontal sway */
      var swingX = Math.sin(p.swingPhase) * p.swingAmp;

      /* Slight speed wobble (catches / slows like a real petal in air) */
      var speedMod = 1 + Math.sin(p.bobPhase) * p.bobAmp;

      p.x   += p.driftX + (Math.cos(p.swingPhase) * p.swingAmp * 0.012);
      p.y   += p.speedY * speedMod;
      p.rot += p.rotSpeed;

      /* Wrap horizontally so petals don't escape sideways */
      if (p.x > W + p.size)  p.x = -p.size;
      if (p.x < -p.size)     p.x = W + p.size;

      /* Reset to top when below hero */
      if (p.y > H + p.size + 10) {
        p.y = -(p.size + 10 + Math.random() * 60);
        p.x = Math.random() * W;
      }

      p.el.style.cssText =
        'width:'     + p.size            + 'px;'  +
        'height:'    + p.size            + 'px;'  +
        'left:'      + (p.x + swingX)    + 'px;'  +
        'top:'       + p.y               + 'px;'  +
        'opacity:'   + p.opacity         + ';'    +
        'transform:rotate(' + p.rot      + 'deg);';
    }

    /* ── RAF loop ───────────────────────────────────────────── */
    function loop () {
      for (var i = 0; i < petals.length; i++) tickPetal(petals[i]);
      rafId = requestAnimationFrame(loop);
    }

    /* ── Pause when hero not visible ────────────────────────── */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            if (!rafId) rafId = requestAnimationFrame(loop);
          } else {
            if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          }
        });
      }, { threshold: 0.05 }).observe(heroEl);
    }

    /* ── Spawn petals ───────────────────────────────────────── */
    for (var i = 0; i < COUNT; i++) petals.push(makePetal(i));

    rafId = requestAnimationFrame(loop);
  }


  /* ═══════════════════════════════════════════════════════════
     WARDROBE PLANNER — Section 04
     Sliding outfit rail + footwear fade/lift
  ═══════════════════════════════════════════════════════════ */

  function initWardrobeSection () {

    /* ── Event data ────────────────────────────────────────── */
    var BASE = 'assets/wardrobe/';

    var WARDROBE_THEMES = [
      {
        id:       'welcome-lunch',
        label:    'The Grand Welcome',
        sub:      'Indo Western',
        desc:     'Relaxed elegance with a desi twist',
        outfit:   'Lunch_outfit.webp',
        footwear: 'Lunch_footwear.webp',
        button:   'lunch_button.webp'
      },
      {
        id:       'sangeet',
        label:    'The Celestial Night',
        sub:      'Starlit Glam',
        desc:     'Shimmer, sequins & the dance floor',
        outfit:   'Sangeet_outfit.webp',
        footwear: 'Sangeet_footwear.webp',
        button:   'Sangeet_button.webp'
      },
      {
        id:       'coastal-affair',
        label:    'The Coastal Affair',
        sub:      'Pastel Hues',
        desc:     'Breezy tones for a sun-kissed afternoon',
        outfit:   'Coastal_affair_outfit.webp',
        footwear: 'Coastal_affair_footwear.webp',
        button:   'Coastal_affair_button.webp'
      },
      {
        id:       'shaadi',
        label:    'Shaadi',
        sub:      'Royal Elegance',
        desc:     'Rich hues for a timeless celebration',
        outfit:   'varmala_outfit.webp',
        footwear: 'Varmala_footwear.webp',
        button:   'Shaadi_button.webp'
      }
    ];
    /* Wardrobe entries come from config.js; each picks artwork via "theme" */
    var WARDROBE_EVENTS = ((window.SITE && SITE.wardrobe && SITE.wardrobe.items) || []).map(function (w) {
      var base = WARDROBE_THEMES.filter(function (t) { return t.id === w.theme; })[0] || WARDROBE_THEMES[0];
      var out = {}, k;
      for (k in base) out[k] = base[k];
      for (k in w) out[k] = w[k];
      return out;
    });
    if (!WARDROBE_EVENTS.length) return;

    /* ── DOM refs ──────────────────────────────────────────── */
    var section      = document.getElementById('wardrobe');
    var header       = section && section.querySelector('[data-wardrobe-header]');
    var btnsWrap     = document.getElementById('wardrobe-btns');
    var scene        = document.getElementById('wardrobe-scene');
    var outfitVP     = document.getElementById('wardrobe-outfit-vp');
    var footwearVP   = document.getElementById('wardrobe-footwear-vp');

    if (!btnsWrap || !outfitVP || !footwearVP) return;

    /* ── Theme label — overlaid inside the scene in the open space
       above the almirah's gold hanging rod. ── */
    var themeLabel = document.createElement('div');
    themeLabel.className = 'wardrobe-theme-label';
    themeLabel.innerHTML =
      '<p class="wardrobe-theme-text">' + WARDROBE_EVENTS[0].sub + '</p>' +
      '<p class="wardrobe-theme-desc">' + WARDROBE_EVENTS[0].desc + '</p>';
    /* Insert as first child of scene so it sits above the outfit viewport */
    if (scene) {
      scene.insertBefore(themeLabel, scene.firstChild);
    }

    /* ── State ─────────────────────────────────────────────── */
    var currentIdx  = 0;
    /* Track per-event cleanup timers so an interrupting click can
       cancel an in-flight transition and start a fresh one instantly. */
    var enterTimer  = null;
    var cleanupTimer = null;

    /* ── Build hanging rail selector ──────────────────────────── */
    /* Structure:
         .wardrobe-btns
           .wardrobe-rail          ← the gold rod
           .wardrobe-rail-items    ← flex row of hanging items
             button.wardrobe-btn   ← each event item
               span.wardrobe-btn-string   ← the hanging string
               span.wardrobe-btn-label    ← event name text
    */

    /* Rail bar */
    var rail = document.createElement('div');
    rail.className = 'wardrobe-rail';
    rail.setAttribute('aria-hidden', 'true');
    btnsWrap.appendChild(rail);

    /* Items row */
    var itemsRow = document.createElement('div');
    itemsRow.className = 'wardrobe-rail-items';
    btnsWrap.appendChild(itemsRow);

    WARDROBE_EVENTS.forEach(function (ev, idx) {
      var btn = document.createElement('button');
      btn.className = 'wardrobe-btn' + (idx === 0 ? ' is-active' : '');
      btn.setAttribute('type',          'button');
      btn.setAttribute('role',          'tab');
      btn.setAttribute('aria-selected',  idx === 0 ? 'true' : 'false');
      btn.setAttribute('data-idx',       String(idx));
      btn.setAttribute('data-event',     ev.id);
      btn.setAttribute('aria-label',     ev.label + ' — ' + ev.sub);

      btn.innerHTML =
        '<span class="wardrobe-btn-string" aria-hidden="true"></span>' +
        '<span class="wardrobe-btn-label">'  + ev.label + '</span>';

      btn.addEventListener('click', function () { switchEvent(idx); });

      /* Touch: prevent 300ms delay */
      btn.addEventListener('touchstart', function (e) {
        e.preventDefault();
        switchEvent(idx);
      }, { passive: false });

      itemsRow.appendChild(btn);
    });

    /* ── Build outfit images ───────────────────────────────── */
    var outfitImgs = [];
    WARDROBE_EVENTS.forEach(function (ev, idx) {
      var img = document.createElement('img');
      img.src       = BASE + ev.outfit;
      img.alt       = '';
      img.className = 'wardrobe-outfit-img' + (idx === 0 ? ' is-active' : '');
      img.setAttribute('data-event', ev.id);
      img.draggable = false;
      outfitVP.appendChild(img);
      outfitImgs.push(img);
    });

    /* ── Build footwear images ─────────────────────────────── */
    var footwearImgs = [];
    WARDROBE_EVENTS.forEach(function (ev, idx) {
      var img = document.createElement('img');
      img.src       = BASE + ev.footwear;
      img.alt       = '';
      img.className = 'wardrobe-footwear-img' + (idx === 0 ? ' is-active' : '');
      img.draggable = false;
      footwearVP.appendChild(img);
      footwearImgs.push(img);
    });

    /* ── Core switch function ──────────────────────────────── */
    /* Each click is INSTANT — no animation lock. If a previous
       transition is still running, we cancel its pending timers
       and start a fresh one immediately. */
    function switchEvent (newIdx) {
      if (newIdx === currentIdx) return;

      /* Cancel any pending timers from a previous in-flight switch */
      if (enterTimer)   { clearTimeout(enterTimer);   enterTimer   = null; }
      if (cleanupTimer) { clearTimeout(cleanupTimer); cleanupTimer = null; }

      var oldIdx    = currentIdx;
      currentIdx    = newIdx;
      var goForward = newIdx > oldIdx;

      /* Update button states */
      var allBtns = btnsWrap.querySelectorAll('.wardrobe-btn');
      allBtns.forEach(function (btn, i) {
        var active = i === newIdx;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      /* Update theme label — timed to feel in step with the exit */
      var themeTextEl = themeLabel.querySelector('.wardrobe-theme-text');
      var themeDescEl = themeLabel.querySelector('.wardrobe-theme-desc');
      if (themeTextEl) {
        themeTextEl.style.transition = 'opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)';
        themeTextEl.style.opacity = '0';
        if (themeDescEl) {
          themeDescEl.style.transition = 'opacity 400ms cubic-bezier(0.22, 1, 0.36, 1)';
          themeDescEl.style.opacity = '0';
        }
        setTimeout(function () {
          themeTextEl.textContent = WARDROBE_EVENTS[newIdx].sub;
          themeTextEl.style.transition = 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)';
          themeTextEl.style.opacity = '1';
          if (themeDescEl) {
            themeDescEl.textContent = WARDROBE_EVENTS[newIdx].desc;
            themeDescEl.style.transition = 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1)';
            themeDescEl.style.opacity = '1';
          }
        }, 900);
      }

      /* Helper: prep new image at off-screen entry position */
      function snapEntry (img) {
        img.classList.remove(
          'is-active', 'is-exiting-fwd', 'is-exiting-bwd',
          'is-entering-fwd', 'is-entering-bwd'
        );
        img.classList.add(goForward ? 'is-entering-fwd' : 'is-entering-bwd');
      }

      /* Helper: force-reset any image that isn't old or new so a
         rapidly-interrupted previous transition doesn't leave
         stale state behind. */
      function resetOther (img, i) {
        if (i !== oldIdx && i !== newIdx) {
          img.classList.remove(
            'is-active', 'is-exiting-fwd', 'is-exiting-bwd',
            'is-entering-fwd', 'is-entering-bwd'
          );
        }
      }
      outfitImgs.forEach(resetOther);
      footwearImgs.forEach(resetOther);

      /* ── Outfit + Footwear: directional slide IN SYNC ───── */
      var outOld = outfitImgs[oldIdx];
      var outNew = outfitImgs[newIdx];
      var shoeOld = footwearImgs[oldIdx];
      var shoeNew = footwearImgs[newIdx];

      /* ── PHASE 1: Snap new images to off-screen (no transition) ── */
      snapEntry(outNew);
      snapEntry(shoeNew);

      /* Force reflow so snap is committed before any transition starts */
      void outNew.offsetHeight;
      void shoeNew.offsetHeight;

      /* ── PHASE 2: Exit old images ────────────────────────────── */
      outOld.classList.remove('is-active');
      outOld.classList.add(goForward ? 'is-exiting-fwd' : 'is-exiting-bwd');

      shoeOld.classList.remove('is-active');
      shoeOld.classList.add(goForward ? 'is-exiting-fwd' : 'is-exiting-bwd');

      /* ── PHASE 3: After exit completes, bring in new images ──── */
      enterTimer = setTimeout(function () {
        enterTimer = null;
        outNew.classList.remove('is-entering-fwd', 'is-entering-bwd');
        outNew.classList.add('is-active');

        shoeNew.classList.remove('is-entering-fwd', 'is-entering-bwd');
        shoeNew.classList.add('is-active');
      }, 900);

      /* ── PHASE 4: Clean up exit classes after everything finishes ── */
      cleanupTimer = setTimeout(function () {
        cleanupTimer = null;
        outfitImgs.forEach(function (img, i) {
          if (i !== currentIdx) {
            img.classList.remove(
              'is-active', 'is-exiting-fwd', 'is-exiting-bwd',
              'is-entering-fwd', 'is-entering-bwd'
            );
          }
        });
        footwearImgs.forEach(function (img, i) {
          if (i !== currentIdx) {
            img.classList.remove(
              'is-active', 'is-exiting-fwd', 'is-exiting-bwd',
              'is-entering-fwd', 'is-entering-bwd'
            );
          }
        });
      }, 4200);
    }

    /* ── Cinematic scroll-triggered reveals ─────────────────── */
    /*
       Each layer reveals slightly later than the one before it, creating
       a slow, deliberate, film-like "camera pulls focus" entrance.
       Trigger fires earlier (lower threshold + rootMargin) so the user
       starts seeing motion as the section enters frame, not after it lands.
       Per-layer stagger delays are baked into the CSS transitions.
    */
    function observeReveal (el) {
      if (!el) return;
      if (!('IntersectionObserver' in window)) {
        el.classList.add('is-visible');
        return;
      }
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.08,
        rootMargin: '0px 0px -8% 0px'
      }).observe(el);
    }

    observeReveal(header);
    observeReveal(btnsWrap);
    observeReveal(themeLabel);
    observeReveal(scene);
  }



  /* ═══════════════════════════════════════════════════════════
     BLESSINGS BY THE SHORE — Section 05
  ═══════════════════════════════════════════════════════════ */
  function initBlessingsSection () {
    var section   = document.getElementById('blessings');
    var cardWrap  = document.getElementById('blessings-card-wrap');
    var petalsEl  = document.getElementById('blessings-petals');
    var diyasEl   = document.getElementById('blessings-diyas');
    var bgImg     = section ? section.querySelector('.blessings-bg-img') : null;

    if (!section || !cardWrap) return;

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Reduced motion: reveal everything immediately ─────── */
    if (reducedMotion) {
      cardWrap.classList.add('is-visible');
      section.querySelectorAll('[data-blessings-reveal]').forEach(function (el) {
        el.classList.add('is-visible');
      });
      section.querySelectorAll('.blessings-rule').forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    /* ── IntersectionObserver: trigger reveals on scroll ────── */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          obs.unobserve(entry.target);

          /* Card wrap fades up first */
          cardWrap.classList.add('is-visible');

          /* Staggered inner reveals */
          var reveals = section.querySelectorAll('[data-blessings-reveal]');
          reveals.forEach(function (el, i) {
            setTimeout(function () {
              el.classList.add('is-visible');
            }, 180 + i * 120);
          });

          /* Rules reveal on their own stagger */
          var rules = section.querySelectorAll('.blessings-rule');
          rules.forEach(function (el, i) {
            setTimeout(function () {
              el.classList.add('is-visible');
            }, 240 + i * 100);
          });

          /* Spawn petals once section is in view */
          spawnPetals();
        });
      }, {
        threshold: 0.06,
        rootMargin: '0px 0px -5% 0px'
      }).observe(section);

    } else {
      /* No IntersectionObserver — show everything immediately */
      cardWrap.classList.add('is-visible');
      section.querySelectorAll('[data-blessings-reveal], .blessings-rule').forEach(function (el) {
        el.classList.add('is-visible');
      });
      spawnPetals();
    }

    /* ── Petal spawner ─────────────────────────────────────── */
    function spawnPetals () {
      if (!petalsEl) return;

      var COUNT    = 16;
      var petalSrc = 'assets/blessings/blessings-petal.webp';

      for (var i = 0; i < COUNT; i++) {
        var img = document.createElement('img');
        img.src = petalSrc;
        img.alt = '';
        img.className = 'blessings-petal';
        img.setAttribute('aria-hidden', 'true');
        img.draggable = false;

        var size  = 18 + Math.random() * 22;         /* 18–40 px */
        var left  = Math.random() * 100;             /* 0–100 % */
        var dur   = 10 + Math.random() * 14;         /* 10–24 s */
        var delay = Math.random() * 18;              /* 0–18 s (negative = mid-cycle) */
        var drift = (Math.random() - 0.5) * 90;      /* ±45 px */
        var rot   = Math.random() * 360;

        img.style.cssText =
          'width:' + size + 'px;' +
          'left:'  + left + '%;' +
          '--petal-drift:' + drift + 'px;' +
          'animation-duration:'   + dur   + 's;' +
          'animation-delay:-'     + delay + 's;' +
          'transform:rotate('     + rot   + 'deg);' +
          'filter:drop-shadow(0 1px 3px rgba(180,80,40,0.16));';

        petalsEl.appendChild(img);
      }
    }

    /* ── Scroll parallax for background & diyas ────────────── */
    var bTicking = false;

    function onBlessingsScroll () {
      if (bTicking) return;
      bTicking = true;
      requestAnimationFrame(function () {
        bTicking = false;

        var rect     = section.getBoundingClientRect();
        var vh       = window.innerHeight;

        /* Only run when section is near viewport */
        if (rect.bottom < -vh || rect.top > vh * 2) return;

        var progress = (vh / 2 - rect.top) / (rect.height + vh);

        if (bgImg) {
          bgImg.style.transform = 'translateY(' + (progress * -44) + 'px)';
        }
        if (diyasEl) {
          diyasEl.style.transform = 'translateX(-50%) translateY(' + (progress * 16) + 'px)';
        }
      });
    }

    window.addEventListener('scroll', onBlessingsScroll, { passive: true });
  }


  /* ═══════════════════════════════════════════════════════════
     MUSIC BUTTON — play / pause toggle
  ═══════════════════════════════════════════════════════════ */
  function initMusicBtn () {
    if (!musicBtn || !bgMusic) return;

    // Reveal the button
    musicBtn.removeAttribute('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        musicBtn.classList.add('is-visible');
      });
    });

    // Toggle on click / tap
    function toggleMusic (e) {
      e.stopPropagation();

      if (bgMusic.paused) {
        bgMusic.play().catch(function () {});
        musicBtn.classList.remove('is-paused');
        musicBtn.setAttribute('aria-label', 'Pause music');
      } else {
        bgMusic.pause();
        musicBtn.classList.add('is-paused');
        musicBtn.setAttribute('aria-label', 'Play music');
      }
    }

    musicBtn.addEventListener('click',     toggleMusic);
    musicBtn.addEventListener('touchstart', function (e) {
      e.preventDefault();   // prevent ghost click
      toggleMusic(e);
    }, { passive: false });

    musicBtn.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMusic(e);
      }
    });
  }


  /* ─── RSVP — staggered scroll reveal ─────────────────────── */
  (function () {
    var section = document.getElementById('rsvp');
    if (!section) return;
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        section.classList.add('is-revealed');
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(section);
  }());


}());