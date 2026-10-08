"use strict";

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

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu"
    );
  });
}

function initSearchForm() {
  const searchForm = document.getElementById("searchForm");

  if (!searchForm) {
    return;
  }

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const category = document.getElementById("searchCategory")?.value?.trim() || "";
    const area = document.getElementById("searchArea")?.value?.trim() || "";
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    if (area) {
      params.set("area", area);
    }

    const destination = params.toString()
      ? `pages/services.html?${params.toString()}`
      : "pages/services.html";

    window.location.assign(destination);
  });
}

function createTextElement(tagName, text, className = "") {
  const element = document.createElement(tagName);

  if (className) {
    element.className = className;
  }

  element.textContent = typeof text === "string" ? text : String(text ?? "");
  return element;
}

function getSafeText(value, fallback = "") {
  if (typeof value !== "string" && typeof value !== "number") {
    return fallback;
  }

  const result = String(value).trim();
  return result || fallback;
}

function getSafeAvatar(name) {
  const safeName = getSafeText(name, "FixIt Worker");
  const words = safeName.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word.charAt(0)).join("");
  return (initials || "FW").toUpperCase();
}

function formatRating(rating) {
  const number = Number(rating);
  return Number.isFinite(number) && number >= 0 ? Math.min(number, 5).toFixed(1) : "0.0";
}

function renderStars(rating) {
  const number = Number(rating);

  if (!Number.isFinite(number) || number <= 0) {
    return "☆☆☆☆☆";
  }

  const safeRating = Math.min(number, 5);
  const fullStars = Math.floor(safeRating);
  const hasHalf = safeRating - fullStars >= 0.5 && fullStars < 5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return `${"★".repeat(fullStars)}${hasHalf ? "½" : ""}${"☆".repeat(emptyStars)}`;
}

function createWorkerProfileUrl(workerId) {
  const numericId = Number(workerId);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    return "pages/services.html";
  }

  return `pages/profile.html?id=${encodeURIComponent(String(numericId))}`;
}

function createWhatsAppUrl(worker) {
  const phone = typeof worker?.whatsapp === "string" ? worker.whatsapp.replace(/\D/g, "") : "";

  if (!phone) {
    return null;
  }

  const message = `Hi ${getSafeText(worker?.name, "there")}, I found you on FixIt and need help with ${getSafeText(worker?.skill, "your service")}. Can we connect?`;
  return `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`;
}

function renderWorkerCard(worker) {
  if (!worker || typeof worker !== "object") {
    return null;
  }

  const card = document.createElement("article");
  card.className = "worker-card";

  const header = document.createElement("div");
  header.className = "wc-top";

  const avatar = createTextElement("div", getSafeAvatar(worker.name), "wc-avatar");
  const info = document.createElement("div");
  info.className = "wc-info";

  const name = createTextElement("div", getSafeText(worker.name, "FixIt Worker"), "wc-name");
  const badges = document.createElement("div");
  badges.className = "wc-badges";

  const skillBadge = document.createElement("span");
  skillBadge.className = "badge-skill";
  const icon = SKILL_ICONS?.[worker.skill] || "🔧";
  skillBadge.textContent = `${icon} ${getSafeText(worker.skill, "Service")}`;
  badges.appendChild(skillBadge);

  if (worker.verified === true) {
    const verifiedBadge = document.createElement("span");
    verifiedBadge.className = "badge-verified";
    verifiedBadge.textContent = "✓ Verified";
    badges.appendChild(verifiedBadge);
  }

  info.appendChild(name);
  info.appendChild(badges);
  header.appendChild(avatar);
  header.appendChild(info);

  const meta = document.createElement("div");
  meta.className = "wc-meta";

  const area = createTextElement("span", `📍 ${getSafeText(worker.area, "Bengaluru")}`);
  const years = Number(worker.experience);
  const experienceText = Number.isFinite(years) && years >= 0 ? `${years} yrs exp` : "Experience not listed";
  const experience = createTextElement("span", `🕐 ${experienceText}`);

  meta.appendChild(area);
  meta.appendChild(experience);

  const ratingRow = document.createElement("div");
  ratingRow.className = "wc-rating";

  const ratingValue = createTextElement("span", formatRating(worker.rating), "rating-num");
  const stars = createTextElement("span", renderStars(worker.rating), "stars");

  ratingRow.appendChild(ratingValue);
  ratingRow.appendChild(stars);

  const rating = Number(worker.reviews);
  if (Number.isFinite(rating) && rating > 0) {
    const reviewCount = createTextElement("span", `(${rating} reviews)`, "rating-count");
    ratingRow.appendChild(reviewCount);
  }

  const buttons = document.createElement("div");
  buttons.className = "wc-btns";

  const phone = typeof worker.phone === "string" || typeof worker.phone === "number" ? String(worker.phone).replace(/\D/g, "") : "";
  if (phone && phone.length >= 10) {
    const callLink = document.createElement("a");
    callLink.href = `tel:${phone}`;
    callLink.className = "btn-call";
    callLink.textContent = "📞 Call";
    buttons.appendChild(callLink);
  }

  const whatsappNumber = typeof worker.whatsapp === "string" || typeof worker.whatsapp === "number" ? String(worker.whatsapp).replace(/\D/g, "") : phone;
  if (whatsappNumber && whatsappNumber.length >= 10) {
    const whatsappLink = document.createElement("a");
    const whatsappUrl = createWhatsAppUrl({ ...worker, whatsapp: whatsappNumber });
    whatsappLink.href = whatsappUrl || "#";
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.className = "btn-wa";
    whatsappLink.textContent = "💬 WhatsApp";
    buttons.appendChild(whatsappLink);
  }

  const workerId = Number(worker.id);
  if (Number.isInteger(workerId) && workerId > 0) {
    const profileLink = document.createElement("a");
    profileLink.href = createWorkerProfileUrl(workerId);
    profileLink.className = "btn-view";
    profileLink.textContent = "View";
    buttons.appendChild(profileLink);
  }

  card.appendChild(header);
  card.appendChild(meta);
  card.appendChild(ratingRow);
  card.appendChild(buttons);

  return card;
}

function renderRecentWorkers() {
  const container = document.getElementById("recentWorkers");
  if (!container) {
    return;
  }

  const workers = typeof getAllWorkers === "function" ? getAllWorkers() : [];
  const recentWorkers = [...workers]
    .sort((a, b) => Number(new Date(b.joined || 0)) - Number(new Date(a.joined || 0)))
    .slice(0, 3);

  container.replaceChildren();

  const fragment = document.createDocumentFragment();
  recentWorkers.forEach((worker) => {
    const card = renderWorkerCard(worker);
    if (card) {
      fragment.appendChild(card);
    }
  });

  container.appendChild(fragment);
}

function initPage() {
  initMobileMenu();
  initSearchForm();
  renderRecentWorkers();

  const currentYear = document.getElementById("currentYear");
  if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
  }
}

function resolveAuthPage(targetPage) {
  return window.location.pathname.includes("/pages/") ? targetPage : `pages/${targetPage}`;
}

function syncCustomerBookingsNavigation(user) {
  const isCustomer = String(user?.role || "").toLowerCase() === "customer";
  const navs = document.querySelectorAll(".nav-links, .mobile-menu");

  navs.forEach((nav) => {
    const existingLink = nav.querySelector("[data-my-bookings-link]");
    if (!isCustomer) {
      existingLink?.remove();
      return;
    }

    if (existingLink) {
      return;
    }

    const link = document.createElement("a");
    link.href = resolveAuthPage("bookings.html");
    link.textContent = "My Bookings";
    link.dataset.myBookingsLink = "true";

    const authLink = nav.querySelector("[data-auth-link]");
    if (authLink) {
      nav.insertBefore(link, authLink);
    } else {
      nav.appendChild(link);
    }
  });
}

function syncAuthNavigation() {
  const authLinks = document.querySelectorAll("[data-auth-link]");
  if (!window.FixItAPI || typeof window.FixItAPI.getStoredUser !== "function") {
    return;
  }

  const user = window.FixItAPI.getStoredUser();
  syncCustomerBookingsNavigation(user);

  authLinks.forEach((link) => {
    if (!user) {
      link.textContent = "Login";
      link.href = resolveAuthPage("login.html");
      link.dataset.action = "login";
      link.onclick = null;
      return;
    }

    const role = String(user.role || "customer").toLowerCase();
    const targetPage = role === "admin" ? "admin.html" : role === "worker" ? "profile.html" : "services.html";
    const label = role === "admin" ? "Admin" : role === "worker" ? "Profile" : "Account";

    link.textContent = label;
    link.href = resolveAuthPage(targetPage);
    link.dataset.action = "logout";
    link.onclick = (event) => {
      event.preventDefault();
      window.FixItAPI.logoutUser();
    };
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initPage();
  syncAuthNavigation();
});
