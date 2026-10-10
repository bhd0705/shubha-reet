/* ═══════════════════════════════════════════════════════════
   WEDDING INVITATION — ALL EDITABLE DETAILS LIVE IN THIS FILE
   Change any text below, save, and refresh the page.
   (Only the link-preview title/description at the top of
   index.html has to be edited there by hand.)
═══════════════════════════════════════════════════════════ */
window.SITE = {

  /* ─── Couple ─── */
  couple: {
    first:  'Reet',
    second: 'Shubhangee'
  },

  /* ─── Headline date + venue (hero, footer) ─── */
  dateLine:  '1st & 2nd January 2027',
  venueLine: 'Shree Anantay, Ujjain',
  mapUrl:    'https://share.google/kTb61CeRaYJH6Zllu',
  mapLabel:  'View Venue on Map',

  /* ─── Intro screen + hero ─── */
  intro: { line1: 'Tap to Begin the', line2: 'Celebration' },
  hero:  { eyebrow: 'The Wedding Celebration of', scrollText: 'Scroll to view invitation' },

  /* ─── Background song (put the .mp3 in assets/music/) ─── */
  music: { src: 'assets/music/Tum_ho_toh.mp3' },

  /* ─── Invitation card ─── */
  invite: {
    blessingLabel: 'With the blessing of',
    elders:  ['VASANT FAMILY'],
    parents: ['S/O : Nitu Rishabha Jain', 'G/S : Sushila Sukanraj Jain'],
    prose:   ['Solicit your gracious presence & blessings',
              'on the auspicious occasion of',
              'the wedding of'],
    firstName:  'REET',
    joinWord:   '&',
    secondName: 'SHUBHANGEE',
    lineage: [
      { label: 'D/O :', text: 'Sushma Hukamchandji Chourdiya' },
      { label: 'G/D :', text: 'Rukhmadevi Mishrilalji Chourdiya' }
    ]
  },

  /* ─── Events ─── */
  eventsTitle:    'Wedding Weekend Events',
  eventsSubtitle: 'Two days of joy,<br> one moment at a time',
  events: [
    {
      theme: 'coastal-affair',
      name:  'Haldi',
      sub:   'Shades of Sunshine',
      date:  '1st January 2027',
      time:  '12:39 PM onwards',
      venue: 'Pool Side Lawn Area',
      tag:   'A golden start to the celebrations',
      mapsHref: 'https://share.google/kTb61CeRaYJH6Zllu'
    },
    {
      theme: 'sangeet',
      name:  'Sangeet',
      sub:   'A Night of Music & Dance',
      date:  '1st January 2027',
      time:  '7:00 PM Onwards',
      venue: 'Anantay Lawns',
      tag:   'Dance the night away with us',
      mapsHref: 'https://share.google/kTb61CeRaYJH6Zllu'
    },
    {
      theme: 'baraat',
      name:  'Baraat',
      sub:   'Safa Bandhai · 10:30 AM',
      date:  '2nd January 2027',
      time:  '11:00 AM Onwards',
      venue: 'Shree Anantay, Ujjain',
      tag:   'The groom arrives in style',
      mapsHref: 'https://share.google/kTb61CeRaYJH6Zllu'
    },
    {
      theme: 'phere',
      name:  'Hast Milan',
      sub:   'Samdhi Milan · 12:30 PM',
      date:  '2nd January 2027',
      time:  '2:00 PM',
      venue: 'Pool Side Mandap',
      tag:   'A sacred beginning',
      mapsHref: 'https://share.google/kTb61CeRaYJH6Zllu'
    },
    {
      theme: 'varmala',
      name:  'Reception',
      sub:   'An Evening of Blessings',
      date:  '2nd January 2027',
      time:  '7:00 PM Onwards',
      venue: 'Anantay Lawns',
      tag:   'Celebrate the newlyweds',
      mapsHref: 'https://share.google/kTb61CeRaYJH6Zllu'
    }
  ],

  /* ─── Wardrobe planner ─── */
  wardrobe: {
    show:     true,
    title:    'Wardrobe Planner',
    subtitle: 'Dress codes & colour palettes<br> for each event.',
    items: [
      { theme: 'coastal-affair', label: 'Haldi',     sub: 'Colourful attire',     desc: 'Breezy tones for a sun-kissed afternoon' },
      { theme: 'sangeet',        label: 'Sangeet',   sub: 'Glitz & Glamorous',    desc: 'Shimmer, sequins & the dance floor' },
      { theme: 'shaadi',         label: 'Wedding',   sub: 'Royal Elegance',       desc: 'Rich hues for a timeless celebration' },
      { theme: 'welcome-lunch',  label: 'Reception', sub: 'Starlit glam',         desc: 'Evening elegance with a desi twist' }
    ]
  },

  /* ─── Blessings card ─── */
  blessings: {
    heading: 'With Love & Blessings',
    subtext: ['Our families, with joy in their hearts,', 'await your gracious presence.'],
    groups: [
      {
        label: 'Blessings from Vasant Family',
        names: [
          'Ashokji & Fancyben',
          'Sukanrajji & Sushilaben',
          'Rameshji & Pushpa',
          'Vikram & Neeta',
          'Rishabha & Nitu',
          'Shreepal & Bhavana',
          'Shrenik & Seema',
          'Vipul & Madhuri',
          'Dearest,',
          'Anjana & Sanjayji',
        ]
      },
      {
        label: 'With Love',
        names: ['Sayyam, Henish, Hiya & Ditvi']
      }
    ]
  },

  /* ─── RSVP ─── */
  rsvp: {
    heading:  'RSVP',
    contacts: []
  }
};

/* ─── Invitation visual corrections ─── */
window.addEventListener('DOMContentLoaded', function () {
  var style = document.createElement('style');
  style.textContent = `
    .invite-card .invite-ganpati-block {
      display: flex !important;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      width: 100%;
      margin: 0 0 0.9rem;
      position: relative;
      z-index: 10;
    }
    .invite-card .invite-ganpati {
      width: 78px !important;
      height: auto !important;
      display: block !important;
      margin: 0 auto 0.35rem !important;
      border-radius: 0 !important;
      object-fit: contain !important;
    }
    .invite-card .invite-prayer {
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      color: #5C5045 !important;
      font-family: 'Cormorant Garamond', Georgia, serif !important;
      font-size: 12px !important;
      font-weight: 400 !important;
      font-style: normal !important;
      line-height: 1.35 !important;
      letter-spacing: 0.03em !important;
      margin: 0.05rem 0 !important;
      text-align: center !important;
      white-space: nowrap !important;
    }
    /* Stylish wedding typography, but restrained so both names remain balanced. */
    .invite-card .invite-name {
      font-family: 'Cormorant Garamond', Georgia, serif !important;
      font-size: clamp(2.45rem, 10vw, 2.9rem) !important;
      font-weight: 500 !important;
      font-style: italic !important;
      letter-spacing: 0.02em !important;
      line-height: 1.02 !important;
      color: #2F2924 !important;
      margin: 0 !important;
      white-space: nowrap !important;
      text-transform: uppercase !important;
    }
    .invite-card .invite-name--groom,
    .invite-card .invite-name--bride {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }

    /* ALL FOUR family/parent lines intentionally share exactly the same typography. */
    .invite-card .invite-parent,
    .invite-card .invite-lineage-label,
    .invite-card .invite-lineage {
      font-family: 'Cormorant Garamond', Georgia, serif !important;
      font-size: 16px !important;
      font-weight: 400 !important;
      font-style: normal !important;
      letter-spacing: 0.01em !important;
      line-height: 1.4 !important;
      color: #5C5045 !important;
      text-transform: none !important;
    }
    .invite-card .invite-parent {
      margin-top: 0.1rem !important;
      margin-bottom: 0 !important;
      white-space: nowrap !important;
    }

    /* Keep d/o + name and g/d + name together on one line. */
    .invite-card .invite-block:has(.invite-lineage-label) {
      display: flex !important;
      flex-direction: row !important;
      align-items: baseline !important;
      justify-content: center !important;
      gap: 0.28rem !important;
      width: 100% !important;
      padding: 0.15rem 0 !important;
      margin-bottom: 0.55rem !important;
      white-space: nowrap !important;
    }
    .invite-card .invite-lineage-label {
      display: inline-block !important;
      flex: 0 0 auto !important;
      margin: 0 !important;
      white-space: nowrap !important;
    }
    .invite-card .invite-lineage {
      display: inline-block !important;
      flex: 0 1 auto !important;
      max-width: none !important;
      margin: 0 !important;
      white-space: nowrap !important;
    }

    @media (max-width: 519px) {
      .invite-card .invite-ganpati { width: 72px !important; }
      .invite-card .invite-name {
        font-size: clamp(2.45rem, 10vw, 2.9rem) !important;
      }
      /* Keep the same exact typography on mobile too. */
      .invite-card .invite-parent,
      .invite-card .invite-lineage-label,
      .invite-card .invite-lineage {
        font-size: 15px !important;
      }
      .invite-card .invite-block:has(.invite-lineage-label) {
        gap: 0.22rem !important;
      }
    }
  `;
  document.head.appendChild(style);

  setTimeout(function () {
    var prayers = document.querySelectorAll('.invite-prayer');
    if (prayers[0]) prayers[0].textContent = '|| Shree Shankheshwar Parshvanthay Namah ||';
  }, 0);
});
