/* Fills index.html from config.js. Runs before script.js. */
(function () {
  'use strict';
  var S = window.SITE;
  if (!S) return;

  function esc (t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\"/g, '&quot;');
  }
  function $ (sel) { return document.querySelector(sel); }
  function text (sel, val) { var el = $(sel); if (el && val != null) el.textContent = val; }
  function html (sel, val) { var el = $(sel); if (el && val != null) el.innerHTML = val; }
  function lines (arr) { return (arr || []).map(esc).join('<br />'); }
  function hide (sel) { var el = $(sel); if (el) el.setAttribute('data-hidden-by-config', ''); }

  /* ── Invitation reference layout ──────────────────────────
     Layout-only override. Existing site styling/assets/behaviour
     stay intact; this arranges the invitation text in the order
     shown in the handwritten reference.
  ──────────────────────────────────────────────────────────── */
  var inviteLayoutStyle = document.createElement('style');
  inviteLayoutStyle.id = 'invite-reference-layout';
  inviteLayoutStyle.textContent = `
    /* Neutralise the previous invitation-layout override */
    .invite { min-height: 100vh; align-items: flex-start; }
    .invite-card {
      max-width: 560px;
      width: 100%;
      min-height: 100vh;
      padding: 5.5rem 2rem 8rem;
      justify-content: flex-start;
    }
    .invite-ornament--top {
      top: -3%;
      width: clamp(160px, 60vw, 340px);
    }
    .invite-ornament--bottom {
      bottom: 4%;
      width: clamp(130px, 48vw, 280px);
    }

    /* Reference composition: blessing → family → prose → Reet →
       groom-side parents → with → Shubhangee → bride-side lineage. */
    .invite-rule--open { margin-bottom: 1.8rem; }
    .invite-inner-rule,
    .invite-spacer-rule { display: none; }

    .invite-block {
      width: 100%;
      padding: 0.2rem 0;
      margin-bottom: 1.15rem;
    }
    .invite-block--focal { margin-top: 0; margin-bottom: 0.35rem; }

    .invite-blessing-label {
      font-size: 11.2px;
      letter-spacing: 0.22em;
      margin-bottom: 1.4rem;
    }
    .invite-ancestor {
      font-size: 17px;
      line-height: 1.52;
    }
    .invite-prose {
      max-width: 340px;
      font-size: 17px;
      line-height: 1.55;
      margin: 0 auto 1.9rem;
    }
    .invite-name {
      font-size: clamp(3.4rem, 15vw, 3.75rem);
      line-height: 1.05;
    }
    .invite-parent {
      font-size: 16px;
      line-height: 1.52;
      margin-top: 0.15rem;
    }
    .invite-with {
      font-size: 14px;
      margin: 0.2rem 0;
    }
    .invite-name--bride { margin-bottom: 0.15rem; }
    .invite-name--groom { margin-top: 0; }
    .invite-rule--mid {
      margin-top: 0.9rem;
      margin-bottom: 1.45rem;
    }
    .invite-lineage-label {
      font-size: 9px;
      letter-spacing: 0.24em;
      margin-bottom: 0.4rem;
    }
    .invite-lineage {
      max-width: 390px;
      font-size: 16px;
      line-height: 1.55;
      margin-bottom: 1.4rem;
    }
    .invite-rule--close { margin-top: 0.6rem; }

    @media (max-width: 519px) {
      .invite-card {
        max-width: 100%;
        min-height: 1180px;
        padding: 6.5rem 2rem 7.5rem;
      }
      .invite-ornament--top { top: -1%; width: clamp(160px, 60vw, 300px); }
      .invite-ornament--bottom { bottom: 3%; width: clamp(130px, 48vw, 260px); }
      .invite-blessing-label { margin-bottom: 1.5rem; }
      .invite-ancestor { font-size: 17px; }
      .invite-prose { max-width: 310px; margin-bottom: 2.15rem; }
      .invite-name { font-size: clamp(3.35rem, 15vw, 3.9rem); }
      .invite-parent { max-width: 320px; }
      .invite-lineage { max-width: 320px; font-size: 15px; }
      .invite-block { margin-bottom: 1.3rem; }
      .invite-block--focal { margin-bottom: 0.45rem; }
    }
  `;
  document.head.appendChild(inviteLayoutStyle);

  var pair = S.couple.first + ' & ' + S.couple.second;

  /* ── Intro ── */
  var tap = document.querySelectorAll('.intro-tap-label');
  if (tap[0]) tap[0].textContent = S.intro.line1;
  if (tap[1]) tap[1].textContent = S.intro.line2;

  /* ── Hero ── */
  text('.hero-eyebrow', S.hero.eyebrow);
  var heroNames = document.querySelectorAll('.hero-name');
  if (heroNames[0]) heroNames[0].textContent = S.couple.first;
  if (heroNames[1]) heroNames[1].textContent = S.couple.second;
  text('.hero-date', S.dateLine);
  text('.hero-venue', S.venueLine);
  text('.hero-scroll-cta > span', S.hero.scrollText);
  var hero = $('#hero');
  if (hero) hero.setAttribute('aria-label', pair + ' Wedding');

  /* ── Music ── */
  var audio = $('#bg-music');
  if (audio && S.music && S.music.src) audio.src = S.music.src;

  /* ── Invitation card ── */
  var I = S.invite;
  var rule = function (cls) {
    return '<div class="invite-rule ' + cls + '" aria-hidden="true">' +
      '<span class="invite-rule-line"></span><span class="invite-rule-motif">✦</span><span class="invite-rule-line"></span></div>';
  };
  var block = function (inner, focal) {
    return '<div class="invite-block' + (focal ? ' invite-block--focal' : '') + '" data-invite-block>' + inner + '</div>';
  };
  var p = function (cls, arr) {
    return (arr || []).map(function (t) { return '<p class="' + cls + '">' + esc(t) + '</p>'; }).join('');
  };
  html('.invite-card',
    '<p class="invite-section-num" aria-hidden="true">02</p>' +
    rule('invite-rule--open') +
    block('<p class="invite-blessing-label">' + esc(I.blessingLabel) + '</p>') +
    block(p('invite-ancestor', I.elders)) +
    block('<p class="invite-prose">' + lines(I.prose) + '</p>') +
    block('<h2 class="invite-name invite-name--bride">' + esc(I.firstName) + '</h2>', true) +
    block(p('invite-parent', I.parents)) +
    block('<p class="invite-with">' + esc(I.joinWord) + '</p>') +
    block('<h2 class="invite-name invite-name--groom">' + esc(I.secondName) + '</h2>', true) +
    rule('invite-rule--mid') +
    (I.lineage || []).map(function (l) {
      return block('<p class="invite-lineage-label">' + esc(l.label) + '</p><p class="invite-lineage">' + esc(l.text) + '</p>');
    }).join('') +
    rule('invite-rule--close')
  );

  /* ── Events header (cards are built in script.js from SITE.events) ── */
  text('.events-title', S.eventsTitle);
  html('.events-subtitle', S.eventsSubtitle);

  /* ── Wardrobe ── */
  if (!S.wardrobe || !S.wardrobe.show || !(S.wardrobe.items || []).length) {
    hide('#wardrobe');
  } else {
    text('.wardrobe-title', S.wardrobe.title);
    html('.wardrobe-subtitle', S.wardrobe.subtitle);
  }

  /* ── Blessings card ── */
  var B = S.blessings;
  var bRule = function (cls, motif) {
    return '<div class="blessings-rule ' + cls + '" aria-hidden="true" data-blessings-reveal>' +
      '<span class="blessings-rule-line"></span><span class="blessings-rule-motif">' + motif + '</span><span class="blessings-rule-line"></span></div>';
  };
  var dots = '<div class="blessings-inner-rule" aria-hidden="true" data-blessings-reveal><span class="blessings-inner-dot">· · ·</span></div>';
  html('.blessings-card-content',
    '<p class="blessings-section-num" aria-hidden="true">06</p>' +
    bRule('blessings-rule--top', '✦') +
    '<h2 class="blessings-heading" data-blessings-reveal>' + esc(B.heading) + '</h2>' +
    '<p class="blessings-subtext" data-blessings-reveal>' + lines(B.subtext) + '</p>' +
    bRule('blessings-rule--mid', '◆') +
    (B.groups || []).map(function (g) {
      return '<div class="blessings-group" data-blessings-reveal>' +
        '<p class="blessings-group-label">' + esc(g.label) + '</p>' +
        '<p class="blessings-group-names">' + lines(g.names) + '</p></div>';
    }).join(dots) +
    bRule('blessings-rule--close', '✦')
  );
  html('.blessings-footer',
    '<p class="blessings-closing-names">' + esc(pair) + '</p>' +
    '<p class="blessings-closing-date">' + esc(S.dateLine) + '</p>' +
    '<p class="blessings-closing-venue">' + esc(S.venueLine) + '</p>' +
    (S.mapUrl ? '<a class="blessings-closing-map" href="' + esc(S.mapUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(S.mapLabel || 'View on Map') + '</a>' : '')
  );

  /* ── RSVP ── */
  var contacts = (S.rsvp && S.rsvp.contacts) || [];
  if (!contacts.length) {
    hide('#rsvp');
  } else {
    text('.rsvp-heading', S.rsvp.heading);
    var phoneIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.32.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.29 21 3 13.71 3 4.5c0-.55.45-1 1-1H7.5c.55 0 1 .45 1 1 0 1.26.2 2.46.57 3.57.12.36.03.76-.24 1.02L6.6 10.8z"/></svg>';
    var waIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-3.8-7.6 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
    html('.rsvp-contacts', contacts.map(function (c) {
      var digits = String(c.phone).replace(/\D/g, '');
      var wa = digits.length === 10 ? '91' + digits : digits;
      return '<li class="rsvp-row">' +
        '<div class="rsvp-identity"><span class="rsvp-name">' + esc(c.name) + '</span><span class="rsvp-num">' + esc(c.phone) + '</span></div>' +
        '<div class="rsvp-actions">' +
          '<a href="tel:' + digits + '" class="rsvp-action rsvp-action--phone" aria-label="Call ' + esc(c.name) + '">' + phoneIcon + '</a>' +
          '<a href="https://wa.me/' + wa + '" class="rsvp-action rsvp-action--wa" aria-label="WhatsApp ' + esc(c.name) + '" target="_blank" rel="noopener noreferrer">' + waIcon + '</a>' +
        '</div></li>';
    }).join(''));
  }
})();
