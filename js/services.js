"use strict";

/*
 * FixIt — Services Page
 *
 * Responsibilities:
 * - Mobile navigation
 * - Worker filtering
 * - Worker sorting
 * - URL filter handling
 * - Safe worker-card rendering
 * - Empty states
 *
 * Security:
 * - Uses textContent instead of injecting worker data with innerHTML
 * - Validates URL parameters against known options
 * - Validates worker IDs before creating profile URLs
 * - Adds noopener/noreferrer to external links
 * - Does not store secrets
 */

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initFilters();
  initCurrentYear();
  loadFiltersFromUrl();
  applyFilters();
});


/* =========================================================
   MOBILE MENU
========================================================= */

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!menuToggle || !mobileMenu) {
    return;
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileMenu.hasAttribute("hidden");

    if (isOpen) {
      mobileMenu.setAttribute("hidden", "");
    } else {
      mobileMenu.removeAttribute("hidden");
    }

    menuToggle.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen
        ? "Open navigation menu"
        : "Close navigation menu"
    );
  });
}


/* =========================================================
   FILTER INITIALIZATION
========================================================= */

function initFilters() {
  const filterForm = document.getElementById("filterForm");

  if (!filterForm) {
    return;
  }

  const filterElements = [
    document.getElementById("filterCategory"),
    document.getElementById("filterArea"),
    document.getElementById("filterRating"),
    document.getElementById("sortBy")
  ];

  filterElements.forEach((element) => {
    if (!element) {
      return;
    }

    element.addEventListener("change", () => {
      applyFilters();
      updateUrl();
    });
  });

  filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilters();
    updateUrl();
  });
}


/* =========================================================
   CURRENT YEAR
========================================================= */

function initCurrentYear() {
  const currentYear = document.getElementById("currentYear");

  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
}


/* =========================================================
   URL PARAMETERS
========================================================= */

function loadFiltersFromUrl() {
  const params = new URLSearchParams(window.location.search);

  const category = params.get("category");
  const area = params.get("area");

  const categorySelect =
    document.getElementById("filterCategory");

  const areaSelect =
    document.getElementById("filterArea");

  if (categorySelect && isValidSelectValue(categorySelect, category)) {
    categorySelect.value = category;
  }

  if (areaSelect && isValidSelectValue(areaSelect, area)) {
    areaSelect.value = area;
  }

  updatePageHeading();
}


function updateUrl() {
  const category =
    document.getElementById("filterCategory")?.value || "";

  const area =
    document.getElementById("filterArea")?.value || "";

  const rating =
    document.getElementById("filterRating")?.value || "";

  const sort =
    document.getElementById("sortBy")?.value || "rating";

  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (area) {
    params.set("area", area);
  }

  if (rating) {
    params.set("rating", rating);
  }

  if (sort && sort !== "rating") {
    params.set("sort", sort);
  }

  const queryString = params.toString();

  const newUrl =
    `${window.location.pathname}` +
    (queryString ? `?${queryString}` : "");

  window.history.replaceState(
    null,
    "",
    newUrl
  );

  updatePageHeading();
}


function isValidSelectValue(selectElement, value) {
  if (!selectElement || !value) {
    return false;
  }

  return Array.from(selectElement.options)
    .some((option) => option.value === value);
}


/* =========================================================
   PAGE HEADING
========================================================= */

function updatePageHeading() {
  const title =
    document.getElementById("pageTitle");

  const subtitle =
    document.getElementById("pageSubtitle");

  const category =
    document.getElementById("filterCategory")?.value || "";

  const area =
    document.getElementById("filterArea")?.value || "";

  if (!title || !subtitle) {
    return;
  }

  if (category && area) {
    title.textContent =
      `${category} workers in ${area}`;

    subtitle.textContent =
      `Find local ${category.toLowerCase()} professionals in ${area}.`;

    return;
  }

  if (category) {
    title.textContent =
      `${category} workers in Bengaluru`;

    subtitle.textContent =
      `Find local ${category.toLowerCase()} professionals near you.`;

    return;
  }

  if (area) {
    title.textContent =
      `Workers in ${area}`;

    subtitle.textContent =
      `Browse local service professionals available in ${area}.`;

    return;
  }

  title.textContent =
    "Find Workers in Bengaluru";

  subtitle.textContent =
    "Browse local service workers and find the right person for your job.";
}


/* =========================================================
   FILTER + SORT
========================================================= */

async function applyFilters() {
  const category = document.getElementById("filterCategory")?.value || "";
  const area = document.getElementById("filterArea")?.value || "";
  const rating = Number(document.getElementById("filterRating")?.value || 0);
  const sort = document.getElementById("sortBy")?.value || "rating";

  const resultsCount = document.getElementById("resultsCount");
  if (resultsCount) {
    resultsCount.textContent = "Loading workers...";
  }

  try {
    let workers = await window.FixItAPI.getWorkers({
      category,
      area,
      rating: rating > 0 ? rating : undefined,
      sort
    });

    workers = workers.filter((worker) => worker && typeof worker === "object");
    renderWorkers(workers);
  } catch (error) {
    console.error("Unable to load workers from API:", error);
    showErrorState();
  }
}


/* =========================================================
   DATE SAFETY
========================================================= */

function getDateValue(value) {
  const timestamp =
    Date.parse(String(value || ""));

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
}


/* =========================================================
   RENDER WORKERS
========================================================= */

function renderWorkers(workers) {
  const grid =
    document.getElementById("workersGrid");

  const emptyState =
    document.getElementById("emptyState");

  const resultsCount =
    document.getElementById("resultsCount");

  if (!grid || !emptyState || !resultsCount) {
    return;
  }

  grid.replaceChildren();


  if (workers.length === 0) {
    emptyState.removeAttribute("hidden");
    resultsCount.textContent =
      "0 workers found";

    return;
  }


  emptyState.setAttribute("hidden", "");

  resultsCount.textContent =
    `${workers.length} worker${
      workers.length === 1 ? "" : "s"
    } found`;


  const fragment =
    document.createDocumentFragment();

  workers.forEach((worker) => {
    if (!worker || typeof worker !== "object") {
      return;
    }

    fragment.appendChild(
      createWorkerCard(worker)
    );
  });

  grid.appendChild(fragment);
}


/* =========================================================
   WORKER CARD
========================================================= */

function createWorkerCard(worker) {
  const card =
    document.createElement("article");

  card.className = "worker-card";


  /* Top section */

  const top =
    document.createElement("div");

  top.className = "wc-top";


  /* Avatar */

  const avatar =
    document.createElement("div");

  avatar.className = "wc-avatar";

  avatar.textContent =
    getSafeAvatar(worker.name);

  avatar.setAttribute(
    "aria-hidden",
    "true"
  );


  /* Information */

  const info =
    document.createElement("div");

  info.className = "wc-info";


  const name =
    document.createElement("div");

  name.className = "wc-name";

  name.textContent =
    getSafeText(
      worker.name,
      "FixIt Worker"
    );


  const badges =
    document.createElement("div");

  badges.className = "wc-badges";


  /* Skill badge */

  const skillBadge =
    document.createElement("span");

  skillBadge.className =
    "badge-skill";

  const icon =
    SKILL_ICONS?.[worker.skill] || "🔧";

  skillBadge.textContent =
    `${icon} ${getSafeText(worker.skill, "Service")}`;

  badges.appendChild(skillBadge);


  /* Verification badge */

  if (worker.verified === true) {
    const verifiedBadge =
      document.createElement("span");

    verifiedBadge.className =
      "badge-verified";

    verifiedBadge.textContent =
      "✓ Verified";

    badges.appendChild(
      verifiedBadge
    );
  }


  info.appendChild(name);
  info.appendChild(badges);

  top.appendChild(avatar);
  top.appendChild(info);


  /* Meta information */

  const meta =
    document.createElement("div");

  meta.className = "wc-meta";


  const area =
    document.createElement("span");

  area.textContent =
    `📍 ${getSafeText(worker.area, "Bengaluru")}`;


  const experience =
    document.createElement("span");

  const years =
    Number(worker.experience);

  experience.textContent =
    `🕐 ${
      Number.isFinite(years) && years >= 0
        ? years
        : 0
    } yrs exp`;


  meta.appendChild(area);
  meta.appendChild(experience);


  /* Rating */

  const ratingRow =
    document.createElement("div");

  ratingRow.className =
    "wc-rating";


  const stars =
    document.createElement("span");

  stars.className = "stars";

  const rating =
    Number(worker.rating);

  stars.textContent =
    renderSafeStars(rating);

  stars.setAttribute(
    "aria-label",
    `Rating ${formatRating(rating)} out of 5`
  );


  const ratingNumber =
    document.createElement("span");

  ratingNumber.className =
    "rating-num";

  ratingNumber.textContent =
    rating > 0
      ? formatRating(rating)
      : "New";


  const reviews =
    Number(worker.reviews);


  if (
    Number.isFinite(reviews) &&
    reviews > 0
  ) {
    const reviewCount =
      document.createElement("span");

    reviewCount.className =
      "rating-count";

    reviewCount.textContent =
      `(${reviews} reviews)`;

    ratingRow.appendChild(
      reviewCount
    );
  }


  ratingRow.prepend(stars);
  ratingRow.prepend(ratingNumber);


  /* Buttons */

  const buttons =
    document.createElement("div");

  buttons.className = "wc-btns";


  /* Call */

  const phone =
    normalizePhone(worker.phone);

  if (phone) {
    const callButton =
      document.createElement("a");

    callButton.className =
      "btn-call";

    callButton.href =
      `tel:${phone}`;

    callButton.textContent =
      "📞 Call";

    buttons.appendChild(
      callButton
    );
  }


  /* WhatsApp */

  const whatsapp =
    normalizePhone(
      worker.whatsapp || worker.phone
    );

  if (whatsapp) {
    const whatsappButton =
      document.createElement("a");

    whatsappButton.className =
      "btn-wa";

    whatsappButton.href =
      createWhatsAppUrl(
        whatsapp,
        worker.name,
        worker.skill
      );

    whatsappButton.target =
      "_blank";

    whatsappButton.rel =
      "noopener noreferrer";

    whatsappButton.textContent =
      "💬 WhatsApp";

    buttons.appendChild(
      whatsappButton
    );
  }


  /* Profile */

  const workerId =
    Number(worker.id);

  if (
    Number.isInteger(workerId) &&
    workerId > 0
  ) {
    const profileButton =
      document.createElement("a");

    profileButton.className =
      "btn-view";

    profileButton.href =
      `profile.html?id=${encodeURIComponent(workerId)}`;

    profileButton.textContent =
      "View";

    buttons.appendChild(
      profileButton
    );
  }


  card.appendChild(top);
  card.appendChild(meta);
  card.appendChild(ratingRow);
  card.appendChild(buttons);

  return card;
}


/* =========================================================
   SAFE HELPERS
========================================================= */

function getSafeText(value, fallback) {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return fallback;
  }

  const text =
    String(value).trim();

  return text || fallback;
}


function getSafeAvatar(name) {
  const safeName =
    getSafeText(
      name,
      "FixIt Worker"
    );

  const words =
    safeName
      .split(/\s+/)
      .filter(Boolean);

  const initials =
    words
      .slice(0, 2)
      .map(
        (word) =>
          word.charAt(0)
      )
      .join("");

  return (
    initials ||
    "FW"
  ).toUpperCase();
}


function normalizePhone(value) {
  if (
    typeof value !== "string" &&
    typeof value !== "number"
  ) {
    return "";
  }

  const digits =
    String(value)
      .replace(/\D/g, "");

  /*
   * Basic validation only.
   * The backend will perform proper validation later.
   */

  if (
    digits.length < 10 ||
    digits.length > 15
  ) {
    return "";
  }

  return digits;
}


function formatRating(rating) {
  if (
    !Number.isFinite(rating) ||
    rating < 0
  ) {
    return "0.0";
  }

  return Math.min(rating, 5).toFixed(1);
}


function renderSafeStars(rating) {
  if (
    !Number.isFinite(rating) ||
    rating <= 0
  ) {
    return "☆☆☆☆☆";
  }

  const safeRating =
    Math.min(rating, 5);

  const full =
    Math.floor(safeRating);

  const half =
    safeRating - full >= 0.5
      ? 1
      : 0;

  const empty =
    5 - full - half;

  return (
    "★".repeat(full) +
    (half ? "½" : "") +
    "☆".repeat(empty)
  );
}


/* =========================================================
   WHATSAPP URL
========================================================= */

function createWhatsAppUrl(
  phone,
  workerName,
  skill
) {
  const normalized =
    normalizePhone(phone);

  if (!normalized) {
    return "#";
  }

  const safeName =
    getSafeText(
      workerName,
      "there"
    );

  const safeSkill =
    getSafeText(
      skill,
      "your service"
    );

  const message =
    `Hi ${safeName}, I found you on FixIt and need help with ${safeSkill}. Can we connect?`;

  return (
    `https://wa.me/${normalized}` +
    `?text=${encodeURIComponent(message)}`
  );
}


/* =========================================================
   ERROR STATE
========================================================= */

function showErrorState() {
  const grid =
    document.getElementById("workersGrid");

  const empty =
    document.getElementById("emptyState");

  const count =
    document.getElementById("resultsCount");

  if (grid) {
    grid.replaceChildren();
  }

  if (count) {
    count.textContent =
      "Unable to load workers";
  }

  if (empty) {
    empty.removeAttribute("hidden");

    const heading =
      empty.querySelector("h3");

    const paragraph =
      empty.querySelector("p");

    if (heading) {
      heading.textContent =
        "Something went wrong";
    }

    if (paragraph) {
      paragraph.textContent =
        "We couldn't load the worker list. Please refresh the page and try again.";
    }
  }
}