/* ==========================================================================
   Listing fixture — 159 East 63rd Street, Lenox Hill (28YSFQ_pid)
   Content mirrors the production LDP; photos are local copies of the real
   gallery assets, used here as placeholders.
   ========================================================================== */

window.LISTING = {
  address: "159 East 63rd Street",
  neighborhood: "Lenox Hill",
  city: "Manhattan",
  state: "NY",
  zip: "10065",
  county: "New York County",

  status: "Active",
  price: "$8,250,000",
  estMonthly: "$42,632/mo",

  beds: "7 beds",
  baths: "7 baths",
  sqft: "4,592 sqft",
  pricePerSqft: "$1,797/sqft",

  buildingInfo: {
    label: "159 E 63rd St",
    detail: "4 stories, Built 1920",
  },

  badges: [
    { text: "Listed By Sotheby's International Realty", variant: "source" },
    { text: "New Construction", variant: "status" },
  ],

  facts: [
    { icon: "home", value: "Townhouse", label: "Property Type" },
    { icon: "resize", value: "2,008 sq ft", label: "Lot Size" },
    { icon: "hammer", value: "1920", label: "Year Built" },
    { icon: "ruler", value: "$1,797/sq ft", label: "Price per sq ft" },
    { icon: "paw", value: "Pets welcome", label: "Pet policy" },
  ],

  description: {
    heading: "159 East 63rd Street",
    subheading: "Prime Lenox Hill Investment Opportunity",
    specLine:
      "20' x 100' Lot | Approx. 5,500 SF | Three Units Full Floorthru Garden & 2 Duplex Units",
    body: "159 East 63rd Street presents a rare opportunity to acquire a fully occupied, cash flowing townhouse asset in one of Manhattan's most established residential corridors. Located mid block between Lexington and Third Avenues, this classic Upper East Side townhouse offers immediate income with meaningful long term upside, supported by a highly flexible unit configuration and strong tenant demand in the surrounding market.",
  },

  agents: [
    {
      name: "Matthew J Perceval",
      role: "Listing Agent",
      brokerage: "Sotheby's International Realty",
      phone: "(212) 606-7790",
      photo: "assets/img/agent-perceval.webp",
    },
    {
      name: "Dana Kirshenbaum",
      role: "Alternative Listing Agent",
      brokerage: "Sotheby's International Realty",
      phone: "(917) 593-9741",
      photo: "assets/img/agent-kirshenbaum.webp",
    },
  ],

  meta: {
    daysOnMarket: "88 days",
    lastUpdated: "09/01/2026 12:08 PM",
    source: "RLS RESO",
    mls: "RLS20097839",
  },

  tour: {
    cta: "Request a tour",
    subtext: "as early as today at 3:30 PM",
  },

  payment: {
    monthly: "$42,632 per month",
    terms: "30 year fixed, 6.71% Interest",
    homePrice: "$8,250,000",
    downPayment: "$1,650,000",
    downPaymentPct: "20%",
    interest: "6.71%",
    rows: [
      { label: "Principal and Interest", value: "$42,632", swatch: "pi" },
      { label: "Property Taxes", value: "$0", swatch: "tax" },
      { label: "Maintenance/Common Charges", value: "$0", swatch: "maint" },
    ],
  },

  /* 15 gallery photos, in production order. Photo 15 is the floor plan. */
  photos: [
    { src: "assets/img/photo-01.webp", alt: "Garden and terrace" },
    { src: "assets/img/photo-02.webp", alt: "Living and dining room" },
    { src: "assets/img/photo-03.webp", alt: "Bedroom with fireplace" },
    { src: "assets/img/photo-04.webp", alt: "Kitchen" },
    { src: "assets/img/photo-05.webp", alt: "Living room with staircase" },
    { src: "assets/img/photo-06.webp", alt: "Entry hall and staircase" },
    { src: "assets/img/photo-07.webp", alt: "Parlor floor" },
    { src: "assets/img/photo-08.webp", alt: "Bedroom" },
    { src: "assets/img/photo-09.webp", alt: "Bathroom" },
    { src: "assets/img/photo-10.webp", alt: "Garden level" },
    { src: "assets/img/photo-11.webp", alt: "Upper floor bedroom" },
    { src: "assets/img/photo-12.webp", alt: "Kitchen detail" },
    { src: "assets/img/photo-13.webp", alt: "Rear garden" },
    { src: "assets/img/photo-14.webp", alt: "Townhouse façade" },
    { src: "assets/img/photo-15.webp", alt: "Floor plan" },
  ],
};
