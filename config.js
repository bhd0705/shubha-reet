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
    parents: ['s/o : Nitu Rishabha Jain', 'g/s : Sushila Sukanraj Jain'],
    prose:   ['Solicit your gracious presence & blessings',
              'on the auspicious occasion of',
              'the wedding of'],
    firstName:  'REET',
    joinWord:   '&',
    secondName: 'SHUBHANGEE',
    lineage: [
      { label: 'd/o :', text: 'Sushma Hukumchandji Jain' },
      { label: 'g/d :', text: 'Rukhmadevi Mishrilalji Jain' }
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
      time:  '12 Noon Onwards',
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
      font-size: 11px !important;
      font-weight: 400 !important;
      font-style: normal !important;
      line-height: 1.2 !important;
      letter-spacing: 0.02em !important;
      margin: 0.04rem 0 !important;
      text-align: center !important;
      white-space: nowrap !important;
    }
    .invite-card .invite-name {
      font-family: 'Great Vibes', 'Pinyon Script', cursive !important;
      font-size: clamp(3.4rem, 15vw, 3.75rem) !important;
      font-weight: 400 !important;
      letter-spacing: -0.03em !important;
      line-height: 1.05 !important;
      color: #2F2924 !important;
      margin: 0 !important;
    }
    .invite-card .invite-name--groom,
    .invite-card .invite-name--bride {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    @media (max-width: 519px) {
      .invite-card .invite-ganpati { width: 72px !important; }
      .invite-card .invite-name {
        font-size: clamp(3.15rem, 15.8vw, 3.85rem) !important;
        line-height: 0.98 !important;
      }
    }
  `;
  document.head.appendChild(style);

  setTimeout(function () {
    var prayers = document.querySelectorAll('.invite-prayer');
    if (prayers[0]) prayers[0].textContent = 'Shree Shankheshwar Parshwanathay namah';
    if (prayers[1]) prayers[1].textContent = 'Shree Ganeshay namah';
  }, 0);
});
