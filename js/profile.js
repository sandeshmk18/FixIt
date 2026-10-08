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

function getLoginRedirectUrl() {
  return window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
}

function createBookingStatusChip(status) {
  const value = String(status || "pending").trim() || "pending";
  const chip = document.createElement("span");
  chip.className = `booking-status booking-status-${value.toLowerCase().replace(/\s+/g, "-")}`;
  chip.textContent = value.charAt(0).toUpperCase() + value.slice(1);
  return chip;
}

function formatBookingDate(dateValue) {
  if (!dateValue) {
    return "Flexible date";
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return String(dateValue);
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function createBookingCard(booking) {
  const card = document.createElement("article");
  card.className = "booking-item";

  const top = document.createElement("div");
  top.className = "booking-item-top";

  const title = document.createElement("strong");
  title.textContent = booking?.service_name || "Service request";

  const status = createBookingStatusChip(booking?.status);
  top.appendChild(title);
  top.appendChild(status);

  const meta = document.createElement("div");
  meta.className = "booking-meta";
  meta.innerHTML = `
    <span>📅 ${formatBookingDate(booking?.requested_date)}</span>
    <span>📝 ${booking?.message ? String(booking.message).trim() || "No notes provided" : "No notes provided"}</span>
  `;

  const footer = document.createElement("div");
  footer.className = "booking-item-footer";
  footer.textContent = `Booking #${booking?.id ?? "-"}`;

  card.appendChild(top);
  card.appendChild(meta);
  card.appendChild(footer);
  return card;
}

async function loadCustomerBookings(container, workerId) {
  if (!container) {
    return;
  }

  const list = document.createElement("div");
  list.className = "booking-list";

  try {
    const data = await window.FixItAPI.getBookings();
    const bookings = Array.isArray(data) ? data : [];
    const relevant = bookings.filter((booking) => Number(booking?.worker_id) === Number(workerId));

    if (!relevant.length) {
      const empty = document.createElement("div");
      empty.className = "booking-empty";
      empty.textContent = "No bookings yet for this worker.";
      list.appendChild(empty);
      container.appendChild(list);
      return;
    }

    relevant.forEach((booking) => list.appendChild(createBookingCard(booking)));
    container.appendChild(list);
  } catch (error) {
    console.error("Unable to load bookings:", error);
    const empty = document.createElement("div");
    empty.className = "booking-empty";
    empty.textContent = "Unable to load your bookings right now.";
    list.appendChild(empty);
    container.appendChild(list);
  }
}

async function renderBookingSection(worker) {
  const section = document.createElement("section");
  section.className = "booking-panel";

  const heading = document.createElement("h3");
  heading.textContent = "Book this worker";

  const user = window.FixItAPI?.getStoredUser?.() || null;
  const role = String(user?.role || "customer").toLowerCase();

  if (!user) {
    const loginWrap = document.createElement("div");
    loginWrap.className = "booking-login-card";

    const note = document.createElement("p");
    note.textContent = "Log in to request a booking with this professional.";

    const loginLink = document.createElement("a");
    loginLink.href = getLoginRedirectUrl();
    loginLink.className = "btn-primary";
    loginLink.textContent = "Login to book";

    loginWrap.appendChild(note);
    loginWrap.appendChild(loginLink);
    section.appendChild(heading);
    section.appendChild(loginWrap);
    return section;
  }

  const isCustomerFlow = role === "customer" || role === "admin";
  const formWrap = document.createElement("div");
  formWrap.className = "booking-form-wrap";

  if (!isCustomerFlow) {
    const note = document.createElement("p");
    note.className = "booking-guard";
    note.textContent = "Only customers can request a booking. Worker and admin accounts are managed separately.";
    formWrap.appendChild(note);
    section.appendChild(heading);
    section.appendChild(formWrap);
    return section;
  }

  const form = document.createElement("form");
  form.className = "booking-form";

  const serviceLabel = document.createElement("label");
  serviceLabel.textContent = "Service needed";
  const serviceInput = document.createElement("input");
  serviceInput.type = "text";
  serviceInput.name = "service_name";
  serviceInput.value = worker?.skill || "Service";
  serviceInput.required = true;
  serviceLabel.appendChild(serviceInput);

  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Preferred date";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.name = "requested_date";
  const today = new Date();
  const isoToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = isoToday;
  dateInput.required = true;
  dateLabel.appendChild(dateInput);

  const messageLabel = document.createElement("label");
  messageLabel.textContent = "Project details";
  const messageInput = document.createElement("textarea");
  messageInput.name = "message";
  messageInput.rows = 4;
  messageInput.placeholder = "Tell us what kind of help you need, the issue, and any timing details.";
  messageLabel.appendChild(messageInput);

  const statusBox = document.createElement("p");
  statusBox.className = "booking-status-message";
  statusBox.setAttribute("aria-live", "polite");

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.className = "btn-primary";
  submitButton.textContent = "Request booking";

  form.appendChild(serviceLabel);
  form.appendChild(dateLabel);
  form.appendChild(messageLabel);
  form.appendChild(statusBox);
  form.appendChild(submitButton);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const payload = {
      worker_id: Number(worker?.id),
      service_name: String(serviceInput.value || worker?.skill || "Service").trim(),
      requested_date: String(dateInput.value || "").trim(),
      message: String(messageInput.value || "").trim()
    };

    if (!payload.worker_id || !payload.service_name || !payload.requested_date) {
      statusBox.textContent = "Please fill in the service, date, and details before submitting.";
      statusBox.classList.add("booking-status-error");
      return;
    }

    submitButton.disabled = true;
    statusBox.classList.remove("booking-status-error");
    statusBox.textContent = "Submitting your booking...";

    try {
      await window.FixItAPI.createBooking(payload);
      statusBox.textContent = "Booking request sent successfully. The worker will see it in their dashboard.";
      statusBox.classList.add("booking-status-success");
      form.reset();
      serviceInput.value = worker?.skill || "Service";
      dateInput.min = isoToday;
      dateInput.value = "";

      const bookingsWrap = document.getElementById(`booking-list-${worker?.id || "default"}`);
      if (bookingsWrap) {
        bookingsWrap.replaceChildren();
        await loadCustomerBookings(bookingsWrap, worker.id);
      }
    } catch (error) {
      console.error("Booking request failed:", error);
      statusBox.textContent = error?.message || "Your booking request could not be sent.";
      statusBox.classList.add("booking-status-error");
    } finally {
      submitButton.disabled = false;
    }
  });

  formWrap.appendChild(form);
  section.appendChild(heading);
  section.appendChild(formWrap);

  const bookingsWrap = document.createElement("div");
  bookingsWrap.id = `booking-list-${worker?.id || "default"}`;
  bookingsWrap.className = "my-bookings";

  const bookingsHeading = document.createElement("h4");
  bookingsHeading.textContent = "Your recent bookings";

  section.appendChild(bookingsHeading);
  section.appendChild(bookingsWrap);
  await loadCustomerBookings(bookingsWrap, worker.id);

  return section;
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

    const bookingSection = await renderBookingSection(worker);
    page.appendChild(bookingSection);

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

