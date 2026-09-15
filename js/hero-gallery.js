/* ==========================================================================
   HeroGallery — the LDP hero media carousel
   --------------------------------------------------------------------------
   A dependency-free replacement for the Flickity instance production uses,
   written from scratch so the behaviour we care about is in one readable
   file: grouped paging, `contain`, pointer drag with velocity snapping, and
   a responsive slide layout.

   LAYOUT MODEL
   ------------
   The band is full-bleed at a fixed height H, with a 16px page gutter and a
   12px gap. A view holds one big photo plus a grid of small ones. How many
   small ones is a function of viewport width — matching production's ladder
   (measured on /homedetails/93-W-13th-St-Unit-12-…):

     < 768      1 photo per slide          band 336
     768–1023   big + 2  (1 col × 2 rows)  band 354
     1024–1535  big + 4  (2 cols × 2 rows) band 450
     ≥ 1536     big + 6  (3 cols × 2 rows) band 450

   SEQUENCE
   --------
   Production's rule: the first photo gets a slide to itself, the rest are
   packed `columns × 2` to a slide, and any tail too short to fill a grid
   falls back to big photos. 15 photos with a 2×2 grid gives

       big, grid, grid, grid, big, big

   with the last two at 50% each. Every slide is the same width, which is what
   lets a page tile flush against both edges of the band.

   ULTRA-WIDE
   ----------
   Production caps the whole gallery at max-width: 2000px and centres it, so
   past ~2030px the photos stop growing. We stay full-bleed — but a 50% slide
   at 2560 would be 1258×450, a 2.80 letterbox of a photo shot at 1.50. So
   past the width where two slides would each exceed `maxSlideRatio`, a third
   comes into view instead of letting them stretch:

     ≥ ~2030   3 per view   (big photo holds ~1.85)
     ≥ ~2700   4 per view
     … driven by the ratio, not by hard-coded breakpoints.

   That keeps the sequence and the per-grid count intact at every width, and
   puts the surplus width into showing more of the listing rather than fewer,
   wider photos. Paging walks real slide offsets, so the same code handles two,
   three or four slides per view.
   ========================================================================== */

(function (global) {
  "use strict";

  /* Below this viewport width the band shows one photo per slide. */
  const STACK_BELOW = 768;

  /* Columns per grid, keyed on the width of the slide holding it rather than
     on the viewport. The thresholds are production's own breakpoints restated
     as slide widths — at two slides per view, a 1024 viewport gives a 506px
     slide and a 1536 one gives 746px — so this reproduces production exactly
     while still sizing the grid sensibly when a third slide comes into view
     and every slide gets narrower. */
  const COLUMN_LADDER = [
    { min: 746, columns: 3 },
    { min: 506, columns: 2 },
    { min: 0, columns: 1 },
  ];

  const DEFAULTS = {
    photos: [],
    /* Slides per view. Every slide is the same width — a big photo and a grid
       occupy identical footprints — which is what lets pages tile flush. */
    perView: 2,
    /* Aspect we aim the big photo at. The band would grow taller to hold it,
       but `maxHeight` pins it at production's own 450 — so this only has teeth
       if that ceiling is raised. */
    heroRatio: 1.56,
    /* Hard ceiling on the band: the hero section is never taller than it is
       in production. */
    maxHeight: 450,
    /* With the band pinned, the only way to stop the big photo stretching is
       to bring another slide into view, which happens once a slide would be
       wider than this. 2.1 is just above the 2.08 a slide reaches at 1920, so
       every production width keeps two per view. */
    maxSlideRatio: 2.1,
    /* Add a column once cells would be wider than this — only past the top of
       the breakpoint ladder, where production caps the gallery instead. */
    maxRatio: 1.85,
    /* Drag distance (px) past which a release always changes page. */
    dragThreshold: 60,
    /* Flick speed (px/ms) past which a release changes page regardless. */
    flickVelocity: 0.45,
    onPhotoActivate: null,
  };

  class HeroGallery {
    constructor(root, options) {
      this.root = root;
      this.opts = Object.assign({}, DEFAULTS, options);

      this.viewport = root.querySelector(".ldp-gallery__viewport");
      this.track = root.querySelector(".ldp-gallery__track");
      this.prevBtn = root.querySelector(".ldp-gallery__nav--prev");
      this.nextBtn = root.querySelector(".ldp-gallery__nav--next");

      this.page = 0;
      this.position = 0;
      this.slides = [];
      this.pages = [0];
      this._listeners = {};
      this._columns = null;

      this._bindControls();
      this._bindDrag();
      this._bindKeyboard();
      this._bindResize();

      this.render();
    }

    /* --- Public API ------------------------------------------------------ */

    on(event, handler) {
      (this._listeners[event] || (this._listeners[event] = [])).push(handler);
      return this;
    }

    next() {
      this.goTo(this.page + 1);
    }

    prev() {
      this.goTo(this.page - 1);
    }

    goTo(page, { animate = true } = {}) {
      this.page = clamp(page, 0, this.pages.length - 1);
      this._setPosition(this.pages[this.page], animate);
      this._syncControls();
      this._emit("change", this.state());
    }

    state() {
      return {
        page: this.page,
        pageCount: this.pages.length,
        photoIndex: this._photoIndexOfPage(this.page),
        photoCount: this.opts.photos.length,
        columns: this._columns,
        ratio: this._ratio,
      };
    }

    /* --- Geometry --------------------------------------------------------
       CSS owns the band height, gap and gutter; JS solves the widths and
       writes them back as custom properties for the stylesheet to consume.
       -------------------------------------------------------------------- */

    solve() {
      const styles = getComputedStyle(this.root);
      const num = (prop) => parseFloat(styles.getPropertyValue(prop)) || 0;

      this.gap = num("--gallery-gap");
      this.width = this.viewport.getBoundingClientRect().width;

      /* `--gallery-height` is the band's *base* height per breakpoint; the
         solved height can exceed it to hold the big photo's aspect. */
      const baseHeight = num("--gallery-height");

      const maxRatio = num("--gallery-max-ratio") || this.opts.maxRatio;
      const perViewMin = num("--gallery-per-view") || this.opts.perView;
      const maxSlideRatio =
        num("--gallery-max-slide-ratio") || this.opts.maxSlideRatio;
      const heroRatio = num("--gallery-hero-ratio") || this.opts.heroRatio;
      const maxHeight = num("--gallery-max-height") || this.opts.maxHeight;

      const top = COLUMN_LADDER[0].columns;

      /* A one-photo listing has no grid to balance against — the photo just
         fills the band, same as the stacked breakpoint. */
      if (window.innerWidth < STACK_BELOW || this.opts.photos.length < 2) {
        this._columns = 0;
        this._perView = 1;
        this.height = baseHeight;
        this._ratio = this.width / this.height;
        this.cellH = this.height;
        this.cellW = this.width;
        this.slideW = this.width;
      } else {
        /* Every slide is the same width, so a page fills the band exactly and
           the right edge stays flush — a big photo and a grid are
           interchangeable footprints.

           As the band gets wider the big photo would stretch, which is what
           made zooming out distort it. Instead the band grows *taller* to hold
           `heroRatio`, so the composition stays proportional and it's the grid
           cells that get readjusted. Past `maxHeight` the band stops growing;
           if the photo then widens past `maxSlideRatio`, a third slide comes
           into view rather than letting it become a strip. */
        const slideWidth = (n) => (this.width - this.gap * (n - 1)) / n;
        let pv = perViewMin;
        let sW = slideWidth(pv);
        let bH = clamp(sW / heroRatio, baseHeight, maxHeight);

        while (sW / bH > maxSlideRatio && pv < 6) {
          pv++;
          sW = slideWidth(pv);
          bH = clamp(sW / heroRatio, baseHeight, maxHeight);
        }

        this._perView = pv;
        this.slideW = sW;
        this.height = bH;
        this.cellH = (bH - this.gap) / 2;

        /* How many photos go in a grid follows the slide it has to fit in.
           The extra column growth is a safety that only fires if a cell would
           still be too wide after the steps above. */
        let c = COLUMN_LADDER.find((b) => this.slideW >= b.min).columns;
        if (c === top) {
          while (this._cellRatioFor(c) > maxRatio && c < 12) c++;
        }

        this._columns = c;
        this.cellW = (this.slideW - (c - 1) * this.gap) / c;
        this._ratio = this.cellW / this.cellH;
      }

      this.root.style.setProperty("--gallery-band-height", px(this.height));

      /* Kept as aliases so the stylesheet keeps one name per concept. */
      this.heroW = this.slideW;
      this.groupW = this.slideW;

      this.root.style.setProperty("--gallery-columns", String(this._columns));
      this.root.style.setProperty("--gallery-hero-width", px(this.heroW));
      this.root.style.setProperty("--gallery-group-width", px(this.groupW));
      this.root.style.setProperty("--gallery-cell-width", px(this.cellW));
      this.root.style.setProperty("--gallery-cell-height", px(this.cellH));
    }

    _cellRatioFor(c) {
      return (this.slideW - (c - 1) * this.gap) / c / this.cellH;
    }

    /* Group slides are always full now — a short tail becomes big photos
       instead — so they just take the shared slide width and column count. */
    _applyGroupGeometry() {
      [...this.track.children].forEach((el) => {
        if (!el.classList.contains("ldp-gallery__slide--group")) return;
        el.style.gridTemplateColumns = "";
        el.style.width = "";
      });
    }

    /* --- Slide building --------------------------------------------------
       Production's rule: the first photo gets a slide to itself, the rest are
       packed `columns × 2` to a slide, and any tail too short to fill a grid
       falls back to big photos. With 15 photos and a 2×2 grid that gives
       big, grid, grid, grid, big, big — the last two at 50% each.
       -------------------------------------------------------------------- */

    buildSlides() {
      const photos = this.opts.photos;
      const perGroup = this._columns * 2;

      if (perGroup === 0) {
        return photos.map((photo) => ({ type: "hero", photos: [photo] }));
      }

      const slides = [{ type: "hero", photos: [photos[0]] }];

      let i = 1;
      while (photos.length - i >= perGroup) {
        slides.push({ type: "group", photos: photos.slice(i, i + perGroup) });
        i += perGroup;
      }
      for (; i < photos.length; i++) {
        slides.push({ type: "hero", photos: [photos[i]] });
      }
      return slides;
    }

    /* --- Rendering ------------------------------------------------------- */

    render() {
      this.solve();
      this.slides = this.buildSlides();

      /* Map each slide to the index of its first photo, so `change` can
         report "showing photo 8 of 15" rather than "page 2 of 3". */
      this._slidePhotoIndex = [];
      let seen = 0;
      this.slides.forEach((slide) => {
        this._slidePhotoIndex.push(seen);
        seen += slide.photos.length;
      });

      this.track.innerHTML = "";
      this.slides.forEach((slide, i) => {
        this.track.appendChild(this._renderSlide(slide, i));
      });

      this._applyGroupGeometry();
      this.measure();
      this.goTo(0, { animate: false });
    }

    _renderSlide(slide, slideIndex) {
      const el = document.createElement("div");
      const group = slide.type === "group";
      el.className =
        "ldp-gallery__slide ldp-gallery__slide--" + (group ? "group" : "hero");
      el.setAttribute("role", "group");
      el.setAttribute("aria-roledescription", "slide");

      const base = this._slidePhotoIndex[slideIndex];
      slide.photos.forEach((photo, i) => {
        el.appendChild(this._renderCell(photo, base + i, slideIndex));
      });
      return el;
    }

    _renderCell(photo, photoIndex, slideIndex) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "ldp-gallery__cell";
      cell.dataset.photoIndex = String(photoIndex);
      cell.setAttribute(
        "aria-label",
        "View photo " + (photoIndex + 1) + " of " + this.opts.photos.length
      );

      const img = document.createElement("img");
      img.className = "ldp-gallery__img";
      img.src = photo.src;
      img.alt = photo.alt || "";
      img.draggable = false;
      /* Only the opening view is eager; the rest waits for the scroll. */
      img.loading = slideIndex < 2 ? "eager" : "lazy";
      img.decoding = "async";

      cell.appendChild(img);
      cell.addEventListener("click", () => {
        if (this._didDrag) return; /* swallow the click that ends a drag */
        if (typeof this.opts.onPhotoActivate === "function") {
          this.opts.onPhotoActivate(photoIndex, photo);
        }
      });
      return cell;
    }

    /* --- Paging ----------------------------------------------------------
       Slide widths are uneven (a big photo is narrower than its grid), so
       pages are packed from real offsets instead of a fixed step.
       -------------------------------------------------------------------- */

    measure() {
      const children = [...this.track.children];
      if (!children.length) return;

      this.width = this.viewport.getBoundingClientRect().width;

      this._offsets = [];
      this._widths = [];
      let x = 0;
      children.forEach((el) => {
        const w = el.getBoundingClientRect().width;
        this._offsets.push(x);
        this._widths.push(w);
        x += w + this.gap;
      });

      const trackWidth = x - this.gap;
      this.maxPosition = Math.max(0, trackWidth - this.width);

      /* Greedily pack whole slides into each band-wide page. */
      const pages = [];
      let i = 0;
      while (i < children.length) {
        pages.push(Math.min(this._offsets[i], this.maxPosition));
        let acc = 0;
        let j = i;
        while (j < children.length && acc + this._widths[j] <= this.width + 1) {
          acc += this._widths[j] + this.gap;
          j++;
        }
        if (j === i) j = i + 1; /* a slide wider than the band */
        i = j;
      }

      /* Drop pages that collapse onto the contained end position. */
      this.pages = pages.filter(
        (p, idx) => idx === 0 || p > pages[idx - 1] + 1
      );
      this.page = clamp(this.page, 0, this.pages.length - 1);
    }

    _photoIndexOfPage(page) {
      const pos = this.pages[page];
      const slide = this._offsets.findIndex((o) => o >= pos - 1);
      return this._slidePhotoIndex[Math.max(0, slide)] || 0;
    }

    _setPosition(position, animate) {
      this.position = position;
      this.track.classList.toggle("is-animating", !!animate);
      this.track.style.transform = "translate3d(" + -position + "px, 0, 0)";
    }

    _nearestPage(position) {
      let best = 0;
      let bestDist = Infinity;
      this.pages.forEach((p, i) => {
        const d = Math.abs(p - position);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      return best;
    }

    _syncControls() {
      if (this.prevBtn) this.prevBtn.disabled = this.page === 0;
      if (this.nextBtn) {
        this.nextBtn.disabled = this.page >= this.pages.length - 1;
      }
    }

    _emit(event, payload) {
      (this._listeners[event] || []).forEach((fn) => fn(payload));
    }

    /* --- Interaction ----------------------------------------------------- */

    _bindControls() {
      if (this.prevBtn) this.prevBtn.addEventListener("click", () => this.prev());
      if (this.nextBtn) this.nextBtn.addEventListener("click", () => this.next());
    }

    _bindKeyboard() {
      this.root.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          this.next();
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          this.prev();
        }
      });
    }

    _bindDrag() {
      let startX = 0;
      let startPos = 0;
      let lastX = 0;
      let lastT = 0;
      let velocity = 0;
      let pointerId = null;

      const onDown = (e) => {
        if (e.button !== undefined && e.button !== 0) return;
        pointerId = e.pointerId;
        startX = lastX = e.clientX;
        startPos = this.position;
        lastT = e.timeStamp;
        velocity = 0;
        this._didDrag = false;
        this.viewport.classList.add("is-dragging");
        this.viewport.setPointerCapture(pointerId);
      };

      const onMove = (e) => {
        if (pointerId === null || e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        if (!this._didDrag && Math.abs(dx) > 4) this._didDrag = true;
        if (!this._didDrag) return;

        const dt = e.timeStamp - lastT;
        if (dt > 0) velocity = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastT = e.timeStamp;

        /* Rubber-band past the ends rather than hard-stopping. */
        let next = startPos - dx;
        if (next < 0) next *= 0.35;
        else if (next > this.maxPosition) {
          next = this.maxPosition + (next - this.maxPosition) * 0.35;
        }
        this._setPosition(next, false);
      };

      const onUp = (e) => {
        if (pointerId === null) return;
        this.viewport.releasePointerCapture(pointerId);
        pointerId = null;
        this.viewport.classList.remove("is-dragging");
        if (!this._didDrag) return;

        const dx = e.clientX - startX;
        const flicked = Math.abs(velocity) > this.opts.flickVelocity;
        const dragged = Math.abs(dx) > this.opts.dragThreshold;

        let page;
        if (flicked || dragged) {
          page = this.page + (dx < 0 ? 1 : -1);
        } else {
          page = this._nearestPage(this.position);
        }
        this.goTo(page);

        setTimeout(() => {
          this._didDrag = false;
        }, 0);
      };

      this.viewport.addEventListener("pointerdown", onDown);
      this.viewport.addEventListener("pointermove", onMove);
      this.viewport.addEventListener("pointerup", onUp);
      this.viewport.addEventListener("pointercancel", onUp);
      this.viewport.addEventListener("dragstart", (e) => e.preventDefault());
    }

    _bindResize() {
      let frame = null;
      const onResize = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const cols = this._columns;
          const height = this.height;
          this.solve();
          /* Column count and band height drive the slide sequence, so either
             changing needs a rebuild; anything else is just new widths. */
          if (this._columns !== cols || this.height !== height) {
            this.render();
          } else {
            this._applyGroupGeometry();
            this.measure();
            this.goTo(this.page, { animate: false });
          }
        });
      };
      window.addEventListener("resize", onResize);
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function px(value) {
    return Math.round(value * 100) / 100 + "px";
  }

  HeroGallery.COLUMN_LADDER = COLUMN_LADDER;
  global.HeroGallery = HeroGallery;
})(window);
