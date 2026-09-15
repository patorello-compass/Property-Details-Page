/* ==========================================================================
   Page wiring — binds the listing fixture into the static shell and boots
   the hero gallery. Deliberately plain: no framework, no build step.
   ========================================================================== */

(function () {
  "use strict";

  const listing = window.LISTING;
  const $ = (sel) => document.querySelector(sel);
  /* Both page variants share this file, so anything a variant may omit is
     read through a guard rather than assumed present. */
  const set = (sel, fn) => {
    const el = $(sel);
    if (el) fn(el);
  };

  /* --- Hero ---------------------------------------------------------------
     Two unrelated treatments: a multi-photo listing gets the carousel, a
     one-photo listing gets a plain image. Each page includes only its own
     markup, CSS and (for the carousel) script, so this just wires whichever
     one is present.
     ----------------------------------------------------------------------- */

  /* Badges are the one piece both share; the host names its own class. */
  set("[data-badge-class]", (host) => {
    const base = host.dataset.badgeClass;
    listing.badges.forEach((badge) => {
      const el = document.createElement("span");
      el.className = base + " " + base + "--" + badge.variant;
      el.textContent = badge.text;
      host.appendChild(el);
    });
  });

  /* Single image */
  set("#hero-photo", (el) => {
    const photo = listing.photos[0];
    el.src = photo.src;
    el.alt = photo.alt || "";
  });

  set("#hero-caption", (el) => {
    el.textContent = (listing.hero && listing.hero.caption) || "";
  });

  /* Carousel */
  set("#hero-gallery", (root) => {
    set("#photo-count-label", (el) => {
      el.textContent = listing.photos.length + " Photos";
    });

    const gallery = new HeroGallery(root, {
      photos: listing.photos,
      onPhotoActivate(index) {
        /* Lightbox is intentionally out of scope — see README. */
        console.log("photo activated:", index + 1);
      },
    });

    set("#gallery-counter", (counter) => {
      gallery.on("change", ({ photoIndex, photoCount }) => {
        counter.textContent = photoIndex + 1 + " of " + photoCount;
      });
    });
  });

  /* --- Summary ----------------------------------------------------------- */

  $("#summary-status").textContent = listing.status;
  $("#summary-price").textContent = listing.price;
  $("#summary-est").textContent = listing.estMonthly;

  if (listing.statusColor) {
    $(".ldp-status__dot").style.background = listing.statusColor;
  }

  $("#summary-specs").innerHTML = [
    listing.beds,
    '<a class="cx-link" href="#">' + listing.baths + "</a>",
    listing.sqft,
    listing.pricePerSqft,
  ].join('<span class="ldp-specs__sep"></span>');

  $("#summary-address").textContent = [
    listing.address,
    listing.neighborhood,
    listing.zip && listing.city !== "Manhattan" ? listing.zip : null,
  ]
    .filter(Boolean)
    .join(", ");

  /* Only NYC-style listings carry a building record. */
  const building = $("#summary-building");
  if (listing.buildingInfo) {
    building.innerHTML =
      "Building Info: " +
      '<a class="cx-link" href="#">' +
      listing.buildingInfo.label +
      "</a>, " +
      listing.buildingInfo.detail;
  } else {
    building.remove();
  }

  /* --- Key facts --------------------------------------------------------- */

  const ICONS = {
    home: '<path d="M3 9l7-6 7 6v9H3z"/><path d="M8 18v-5h4v5"/>',
    resize: '<path d="M3 3h6M3 3v6M3 3l6 6"/><path d="M17 17h-6M17 17v-6M17 17l-6-6"/>',
    hammer: '<path d="M4 16l7-7"/><path d="M9 6l5-3 4 4-3 5-3-3z"/>',
    ruler: '<rect x="2" y="7" width="16" height="6"/><path d="M6 7v3M10 7v3M14 7v3"/>',
    paw:
      '<circle cx="6" cy="7" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="14" cy="7" r="2"/>' +
      '<path d="M10 10c3 0 4.5 2 4.5 3.6S13 17 10 17s-4.5-1.8-4.5-3.4S7 10 10 10z"/>',
    check: '<path d="M10 2l6 2.4v5.2c0 3.6-3.4 6.3-6 7.4-2.6-1.1-6-3.8-6-7.4V4.4z"/><path d="M7 10l2 2 4-4.5"/>',
    car:
      '<path d="M3 12.5h14"/><path d="M4.5 12.5V9l1.8-3.6h7.4L15.5 9v3.5"/>' +
      '<path d="M4 12.5v2h2.5v-2M13.5 12.5v2H16v-2"/><path d="M6.5 9.8h7"/>',
  };

  $("#facts-grid").innerHTML = listing.facts
    .map(
      (fact) => `
      <li class="ldp-fact">
        <svg class="cx-icon cx-icon--stroke ldp-fact__icon" width="20" height="20" viewBox="0 0 20 20">${
          ICONS[fact.icon] || ""
        }</svg>
        <span class="ldp-fact__text">
          <span class="ldp-fact__value">${fact.value}</span>
          <span class="ldp-fact__label">${fact.label}</span>
        </span>
      </li>`
    )
    .join("");

  /* --- Description ------------------------------------------------------- */

  const d = listing.description;
  $("#description-body").innerHTML = [
    `<p class="cx-body1-medium">${d.heading}</p>`,
    `<p class="cx-body1">${d.subheading}</p>`,
    `<p class="cx-body1">${d.specLine}</p>`,
    `<p class="cx-body1 ldp-description__clamp">${d.body}</p>`,
  ].join("");

  /* Listings without agent cards carry a "Listed by" attribution line. */
  set("#listed-by", (el) => {
    if (d.listedBy) el.textContent = d.listedBy;
    else el.remove();
  });

  $(".ldp-readmore").addEventListener("click", function () {
    const body = document.querySelector(".ldp-description__clamp");
    const open = body.classList.toggle("is-open");
    this.firstChild.textContent = open ? "Show Less " : "Continue Reading ";
    this.classList.toggle("is-open", open);
  });

  /* --- Agents ------------------------------------------------------------ */

  const agentMarkup = (agent) => `
    <li class="ldp-agent">
      <img class="ldp-agent__photo" src="${agent.photo}" alt="${agent.name}" />
      <div class="ldp-agent__body">
        <p class="cx-body1-medium">${agent.name}</p>
        <p class="cx-body2 cx-text-subtle">${agent.role}</p>
        <p class="cx-body2 cx-text-subtle">${agent.brokerage}</p>
        <p class="cx-body2">P: <a class="cx-link" href="tel:${agent.phone.replace(
          /\D/g,
          ""
        )}">${agent.phone}</a></p>
      </div>
    </li>`;

  const lead = listing.agents[0];

  /* A listing with no agent cards (production shows a "Listed by" line
     instead) drops the Listing Agents section and the sidebar contact block. */
  set("#agents-list", (el) => {
    if (lead) el.innerHTML = listing.agents.map(agentMarkup).join("");
    else el.closest("section").remove();
  });

  set("#sidebar-agent", (el) => {
    if (!lead) return el.remove();
    el.innerHTML = `
      <img class="ldp-contact__photo" src="${lead.photo}" alt="${lead.name}" />
      <div class="ldp-contact__body">
        <p class="ldp-contact__name">${lead.name}</p>
        <p class="ldp-contact__company">${lead.brokerage}</p>
        <p class="ldp-contact__phone">P: <a class="cx-link" href="tel:${lead.phone.replace(
          /\D/g,
          ""
        )}">${lead.phone}</a></p>
      </div>`;
  });

  /* --- Meta -------------------------------------------------------------- */

  set("#meta-days-row", (el) => {
    if (listing.meta.daysOnMarket) $("#meta-days").textContent = listing.meta.daysOnMarket;
    else el.remove();
  });
  $("#meta-source").textContent =
    "Last updated: " +
    listing.meta.lastUpdated +
    " • Source: " +
    listing.meta.source +
    ", MLS#: " +
    listing.meta.mls;

  /* --- Tour CTA ---------------------------------------------------------- */

  set("#tour-label", (el) => (el.textContent = listing.tour.cta));
  set("#tour-sub", (el) => (el.textContent = listing.tour.subtext));

  /* --- Maps -------------------------------------------------------------- */

  if (listing.maps) {
    set("#map-wide", (el) => (el.src = listing.maps.wide));
    set("#map-thumb", (el) => (el.src = listing.maps.thumb));
  }

  /* --- Breadcrumbs ------------------------------------------------------- */

  $("#breadcrumbs").innerHTML = [
    "Homepage",
    listing.state,
    listing.county,
    listing.city,
    listing.neighborhood,
    listing.zip,
    listing.address,
  ]
    .map((crumb, i, all) =>
      i === all.length - 1
        ? `<span>${crumb}</span>`
        : `<a class="cx-link" href="#">${crumb}</a><span class="ldp-breadcrumbs__sep">›</span>`
    )
    .join("");

  /* --- Payment calculator ------------------------------------------------ */

  const p = listing.payment;
  $("#calc-monthly").textContent = p.monthly;
  $("#calc-terms").textContent = p.terms;
  $("#calc-price").value = p.homePrice;
  $("#calc-down").value = p.downPayment;
  $("#calc-down-pct").value = p.downPaymentPct;

  $("#calc-breakdown").innerHTML = p.rows
    .map(
      (row) => `
      <li class="ldp-calc__row">
        <span class="ldp-calc__swatch ldp-calc__swatch--${row.swatch}"></span>
        <span class="cx-body2">${row.label}</span>
        <span class="cx-body2 ldp-calc__value">${row.value}</span>
      </li>`
    )
    .join("");
})();
