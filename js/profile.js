"use strict";

function getSafeProfileId() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("id");
  const parsed = Number(rawId);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function createBadge(label, className) {
  const badge = document.createElement("span");
  badge.className = className;
  badge.textContent = label;
  return badge;
}

function createReviewCard(review) {
  const card = document.createElement("article");
  card.className = "review-item";

  const top = document.createElement("div");
  top.className = "review-top";

  const name = document.createElement("span");
  name.className = "reviewer-name";
  name.textContent = review.name || "Customer";

  const date = document.createElement("span");
  date.className = "review-date";
  date.textContent = review.date || "Recently";

  top.appendChild(name);
  top.appendChild(date);

  const stars = document.createElement("div");
  stars.className = "stars";
  stars.textContent = "★".repeat(Math.min(5, Number(review.rating) || 5)) + "☆".repeat(Math.max(0, 5 - (Number(review.rating) || 5)));

  const text = document.createElement("p");
  text.className = "review-text";
  text.textContent = review.text || "Great experience.";

  card.appendChild(top);
  card.appendChild(stars);
  card.appendChild(text);

  return card;
}

function getProfilePageUrl() {
  return "services.html";
}

function createEmptyProfileState(title, message) {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-profile";

  const icon = document.createElement("div");
  icon.className = "empty-icon";
  icon.textContent = "😕";

  const heading = document.createElement("h2");
  heading.textContent = title;

  const body = document.createElement("p");
  body.textContent = message;

  const link = document.createElement("a");
  link.href = "services.html";
  link.className = "btn-primary";
  link.textContent = "Browse all workers";

  wrapper.appendChild(icon);
  wrapper.appendChild(heading);
  wrapper.appendChild(body);
  wrapper.appendChild(link);
  return wrapper;
}

function getCallLink(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits ? `tel:${digits}` : "#";
}

function getWhatsAppLink(phone, name, skill) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits || digits.length < 10 || digits.length > 15) {
    return "#";
  }

  const message = `Hi ${String(name || "there")}, I found you on FixIt and need help with ${String(skill || "your service")}. Can we connect?`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

async function renderProfile() {
  const content = document.getElementById("profileContent");
  if (!content) {
    return;
  }

  const workerId = getSafeProfileId();
  if (!workerId) {
    content.replaceChildren();
    content.appendChild(createEmptyProfileState(
      "Worker not found",
      "This worker profile is no longer available or the link is invalid."
    ));
    return;
  }

  content.replaceChildren();
  const loading = document.createElement("div");
  loading.className = "loading-state";
  loading.textContent = "Loading profile...";
  content.appendChild(loading);

  try {
    const worker = await window.FixItAPI.getWorker(workerId);
    if (!worker) {
      throw new Error("Worker not found");
    }

    const safeName = String(worker.name || "FixIt Worker");
    const safeSkill = String(worker.skill || "Service");
    const safeArea = String(worker.area || "Bengaluru");
    const safeExperience = Number(worker.experience) >= 0 ? Number(worker.experience) : 0;
    const safeRating = Number(worker.rating) > 0 ? Number(worker.rating) : 0;
    const safeReviews = Number(worker.reviews) > 0 ? Number(worker.reviews) : 0;
    const initials = safeName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase() || "FW";

    content.replaceChildren();

    const page = document.createElement("div");
    page.className = "profile-page";

    const backLink = document.createElement("a");
    backLink.href = getProfilePageUrl();
    backLink.className = "back-link";
    backLink.textContent = "← Back to workers";

    const header = document.createElement("div");
    header.className = "profile-header";

    const avatar = document.createElement("div");
    avatar.className = "profile-avatar";
    avatar.textContent = initials;

    const info = document.createElement("div");
    info.className = "profile-info";

    const title = document.createElement("h1");
    title.className = "profile-name";
    title.textContent = safeName;

    const badges = document.createElement("div");
    badges.className = "profile-badges";
    badges.appendChild(createBadge(`${SKILL_ICONS[safeSkill] || "🔧"} ${safeSkill}`, "badge-skill"));
    badges.appendChild(createBadge(worker.verified ? "✓ Verified" : "Unverified", worker.verified ? "badge-verified" : "badge-unverified"));

    const meta = document.createElement("div");
    meta.className = "profile-meta";
    meta.appendChild(createBadge(`📍 ${safeArea}`, "meta-pill"));
    meta.appendChild(createBadge(`🕐 ${safeExperience} years experience`, "meta-pill"));
    meta.appendChild(createBadge(safeRating ? `★ ${safeRating.toFixed(1)} (${safeReviews} reviews)` : "⭐ New on FixIt", "meta-pill"));

    const actions = document.createElement("div");
    actions.className = "profile-btns";

    const callLink = document.createElement("a");
    callLink.href = getCallLink(worker.phone);
    callLink.className = "profile-btn-call";
    callLink.textContent = "📞 Call Now";

    const whatsappLink = document.createElement("a");
    whatsappLink.href = getWhatsAppLink(worker.whatsapp || worker.phone, worker.name, worker.skill);
    whatsappLink.className = "profile-btn-wa";
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.textContent = "💬 WhatsApp";

    actions.appendChild(callLink);
    actions.appendChild(whatsappLink);

    info.appendChild(title);
    info.appendChild(badges);
    info.appendChild(meta);
    info.appendChild(actions);

    header.appendChild(avatar);
    header.appendChild(info);

    const about = document.createElement("section");
    about.className = "profile-section";
    const aboutHeading = document.createElement("h3");
    aboutHeading.textContent = `About ${safeName.split(/\s+/)[0]}`;
    const aboutText = document.createElement("p");
    aboutText.textContent = worker.bio || "Experienced professional ready to help with your home service needs.";
    about.appendChild(aboutHeading);
    about.appendChild(aboutText);

    const servicesSection = document.createElement("section");
    servicesSection.className = "profile-section";
    const servicesHeading = document.createElement("h3");
    servicesHeading.textContent = "Services offered";
    const serviceTags = document.createElement("div");
    serviceTags.className = "services-tags";
    const serviceValues = Array.isArray(worker.services) && worker.services.length ? worker.services : ["Service details coming soon"];
    serviceValues.forEach((service) => {
      const tag = document.createElement("span");
      tag.className = "service-tag";
      tag.textContent = service;
      serviceTags.appendChild(tag);
    });
    servicesSection.appendChild(servicesHeading);
    servicesSection.appendChild(serviceTags);

    const areasSection = document.createElement("section");
    areasSection.className = "profile-section";
    const areasHeading = document.createElement("h3");
    areasHeading.textContent = "Areas served";
    const areaTags = document.createElement("div");
    areaTags.className = "areas-tags";
    const serviceAreas = Array.isArray(worker.areas) && worker.areas.length ? worker.areas : [safeArea];
    serviceAreas.forEach((area) => {
      const tag = document.createElement("span");
      tag.className = "area-tag";
      tag.textContent = `📍 ${area}`;
      areaTags.appendChild(tag);
    });
    areasSection.appendChild(areasHeading);
    areasSection.appendChild(areaTags);

    page.appendChild(backLink);
    page.appendChild(header);
    page.appendChild(about);
    page.appendChild(servicesSection);
    page.appendChild(areasSection);
    content.appendChild(page);

    const stickyCta = document.getElementById("stickyCta");
    const stickyCall = document.getElementById("stickyCall");
    const stickyWa = document.getElementById("stickyWa");

    if (stickyCall) stickyCall.href = getCallLink(worker.phone);
    if (stickyWa) {
      stickyWa.href = getWhatsAppLink(worker.whatsapp || worker.phone, worker.name, worker.skill);
      stickyWa.target = "_blank";
      stickyWa.rel = "noopener noreferrer";
    }
    if (stickyCta) stickyCta.style.display = "flex";
  } catch (error) {
    console.error("Failed to load worker profile from API:", error);
    content.replaceChildren();
    content.appendChild(createEmptyProfileState(
      "Worker not found",
      "This worker profile could not be loaded right now."
    ));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderProfile();
});

