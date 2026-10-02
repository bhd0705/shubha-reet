/* Fills index.html from config.js. Runs before script.js. */
(function () {
  'use strict';
  var S = window.SITE;
  if (!S) return;

  function esc (t) {
    return String(t == null ? '' : t)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function $ (sel) { return document.querySelector(sel); }
  function text (sel, val) { var el = $(sel); if (el && val != null) el.textContent = val; }
  function html (sel, val) { var el = $(sel); if (el && val != null) el.innerHTML = val; }
  function lines (arr) { return (arr || []).map(esc).join('<br />'); }
  function hide (sel) { var el = $(sel); if (el) el.setAttribute('data-hidden-by-config', ''); }

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
    '<div class="invite-inner-rule" aria-hidden="true"><span class="invite-inner-line"></span>' +
      '<span class="invite-inner-dot">◆</span><span class="invite-inner-line"></span></div>' +
    block(p('invite-parent', I.parents)) +
    '<div class="invite-spacer-rule" aria-hidden="true"><span class="invite-rule-line"></span></div>' +
    block('<p class="invite-prose">' + lines(I.prose) + '</p>') +
    block('<h2 class="invite-name invite-name--bride">' + esc(I.firstName) + '</h2>', true) +
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
    var waIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';
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
