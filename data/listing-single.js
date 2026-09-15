/* ==========================================================================
   Listing fixture — 807 Lake St S, Unit 301, Kirkland WA (1S0KVJ_pid)
   A single-photo listing. Same shape as data/listing.js; the only structural
   difference is `hero.variant` and a one-item `photos` array.
   ========================================================================== */

window.LISTING = {
  address: "807 Lake St S, Unit 301",
  neighborhood: "Moss Bay",
  city: "Kirkland",
  state: "WA",
  zip: "98033",
  county: "King County",

  status: "Coming Soon",
  statusColor: "var(--cx-color-listingComingSoon)",
  price: "$1,500,000",
  estMonthly: "$10,282/mo",

  beds: "2 beds",
  baths: "2 baths",
  sqft: "939 sqft",
  pricePerSqft: "$1,597/sqft",

  buildingInfo: null,

  /* Hero configuration — the only part that differs from the 15-photo page. */
  hero: {
    variant: "single",
    /* Production drops Floor Plan and the photo-count button here, and shows
       the MLS attribution line under the image instead. */
    actions: ["Street View"],
    showPhotoCount: false,
    caption:
      "Listing provided courtesy of Keller Williams Eastside • Source: Northwest MLS",
  },

  badges: [{ text: "First Look", variant: "comingSoon" }],

  facts: [
    { icon: "home", value: "Condo", label: "Property Type" },
    { icon: "hammer", value: "1978", label: "Year Built" },
    { icon: "ruler", value: "$1,597/sq ft", label: "Price per sq ft" },
    { icon: "check", value: "$1,476/mo", label: "HOA Fees" },
    { icon: "car", value: "2 cars", label: "Parking Spaces" },
  ],

  description: {
    heading: "Sunset Condominiums, Unit 301",
    subheading: "Top-floor residence with unobstructed Lake Washington views",
    specLine: "2 Beds | 2 Baths | 939 SF | ~200 SF Deck | Top Floor",
    body: "Unobstructed Lake Washington views, spectacular sunsets and a coveted top-floor setting define this special residence at Sunset Condominiums. Perched on the top floor, Unit 301 captures an expansive western outlook encompassing Lake Washington, Olympic Mountains, Seattle and the 520 floating bridge. From the ~200-sq.ft. deck, watch the changing light across the lake, enjoy vibrant sunsets and experience the seasonal progression of the sun along the horizon. Skylights bring additional natural light throughout the day.",
    /* Rendered in place of the Listing Agents section, as in production. */
    listedBy:
      "Listed by: Sherri Bellefeuille 425.285.3200 sherrib@kw.com • Keller Williams Eastside",
  },

  /* No agent cards on this listing — production shows the "Listed by" line
     instead, and the sidebar is CTAs only. */
  agents: [],

  meta: {
    daysOnMarket: null,
    lastUpdated: "09/06/2026 08:12 PM",
    source: "NWMLS as distributed by MLS GRID",
    mls: "2564157",
  },

  tour: {
    cta: "Request a tour",
    subtext: "as early as today at 2:30 PM",
  },

  maps: {
    wide: "assets/img/map-wide-kirkland.svg",
    thumb: "assets/img/map-thumb-kirkland.svg",
  },

  payment: {
    monthly: "$10,282 per month",
    terms: "30 year fixed, 6.71% Interest",
    homePrice: "$1,500,000",
    downPayment: "$300,000",
    downPaymentPct: "20%",
    interest: "6.71%",
    rows: [
      { label: "Principal and Interest", value: "$7,754", swatch: "pi" },
      { label: "Property Taxes", value: "$1,052", swatch: "tax" },
      { label: "Maintenance/Common Charges", value: "$1,476", swatch: "maint" },
    ],
  },

  photos: [
    { src: "assets/img/single-hero.jpg", alt: "807 Lake St S at dusk" },
  ],
};
