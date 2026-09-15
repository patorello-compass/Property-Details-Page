/* ==========================================================================
   Portrait-hero variant — the same listing as data/listing-single.js with a
   portrait photo swapped in, so the only variable on portrait.html is the
   photo's orientation. Loaded *after* the single fixture, which it overrides.
   ========================================================================== */

window.LISTING.photos = [
  {
    src: "assets/img/portrait-hero.jpg",
    alt: "Courtyard between the residences",
  },
];

/* 2:3 — the case the landscape frame can't crop without losing the subject. */
window.LISTING.hero.orientation = "portrait";
