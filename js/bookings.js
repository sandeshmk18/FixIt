"use strict";

const bookingPageState = {
  bookings: [],
  workerNames: new Map(),
  selectedStatus: ""
};

function createBookingElement(tagName, text, className = "") {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  element.textContent = String(text ?? "");
  return element;
}

function getBookingsLoginUrl() {
  return `login.html?next=${encodeURIComponent("bookings.html")}`;
}

function redirectToBookingsLogin() {
  window.location.replace(getBookingsLoginUrl());
}

function formatBookingDate(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "Flexible date";
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  const date = isoDate
    ? new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    : new Date(raw);

  if (Number.isNaN(date.getTime())) {
    return raw;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

function formatBookingStatus(status) {
  const value = String(status || "Unknown").trim();
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Unknown";
}

function createBookingStatusBadge(status) {
  const value = String(status || "unknown").trim() || "unknown";
  const badge = createBookingElement("span", formatBookingStatus(value), "booking-status");
  const safeClass = value.toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  badge.classList.add(`booking-status-${safeClass}`);
  return badge;
}

function createBookingCard(booking) {
  const card = document.createElement("article");
  card.className = "customer-booking-card";

  const top = document.createElement("div");
  top.className = "customer-booking-top";
  top.appendChild(createBookingElement("h2", booking.service_name || "Service request", "customer-booking-title"));
  top.appendChild(createBookingStatusBadge(booking.status));

  const workerId = Number(booking.worker_id);
  const workerName = bookingPageState.workerNames.get(workerId) || `Worker #${workerId}`;
  const worker = createBookingElement("p", workerName, "customer-booking-worker");

  const meta = document.createElement("div");
  meta.className = "customer-booking-meta";
  meta.appendChild(createBookingElement("div", `Requested date: ${formatBookingDate(booking.requested_date)}`));
  if (booking.message) {
    meta.appendChild(createBookingElement("div", `Details: ${booking.message}`));
  }

  const actions = document.createElement("div");
  actions.className = "customer-booking-actions";
  const detailsButton = createBookingElement("button", "View Details", "btn-primary booking-details-button");
  detailsButton.type = "button";
  detailsButton.addEventListener("click", () => showBookingDetails(booking));
  actions.appendChild(detailsButton);

  card.appendChild(top);
  card.appendChild(worker);
  card.appendChild(meta);
  card.appendChild(actions);
  return card;
}

function appendBookingDetail(fields, label, value) {
  fields.appendChild(createBookingElement("dt", label));
  fields.appendChild(createBookingElement("dd", value || "Not provided"));
}

function showBookingDetails(booking) {
  const dialog = document.getElementById("bookingDetailsDialog");
  const title = document.getElementById("bookingDetailsTitle");
  const fields = document.getElementById("bookingDetailsFields");
  if (!dialog || !title || !fields) {
    return;
  }

  title.textContent = `Booking #${booking.id}`;
  fields.replaceChildren();
  appendBookingDetail(fields, "Service", booking.service_name);
  appendBookingDetail(fields, "Worker", bookingPageState.workerNames.get(Number(booking.worker_id)) || `Worker #${booking.worker_id}`);
  appendBookingDetail(fields, "Requested date", formatBookingDate(booking.requested_date));
  appendBookingDetail(fields, "Status", formatBookingStatus(booking.status));
  appendBookingDetail(fields, "Customer details", booking.message);
  dialog.showModal();
}

function renderBookingFilters() {
  const filters = document.getElementById("bookingFilters");
  if (!filters) {
    return;
  }

  const statusCounts = new Map();
  bookingPageState.bookings.forEach((booking) => {
    const status = String(booking.status || "Unknown").trim() || "Unknown";
    const key = status.toLowerCase();
    const entry = statusCounts.get(key) || { value: status, count: 0 };
    entry.count += 1;
    statusCounts.set(key, entry);
  });

  const entries = [{ value: "", label: "All", count: bookingPageState.bookings.length }];
  [...statusCounts.values()]
    .sort((left, right) => left.value.localeCompare(right.value))
    .forEach((entry) => entries.push({ value: entry.value, label: formatBookingStatus(entry.value), count: entry.count }));

  filters.replaceChildren();
  entries.forEach((entry) => {
    const button = createBookingElement("button", entry.label, "booking-filter");
    button.type = "button";
    button.setAttribute("aria-pressed", String(bookingPageState.selectedStatus.toLowerCase() === entry.value.toLowerCase()));

    const count = createBookingElement("span", ` (${entry.count})`, "booking-filter-count");
    button.appendChild(count);
    button.addEventListener("click", () => {
      bookingPageState.selectedStatus = entry.value;
      renderBookingFilters();
      renderBookingsList();
    });
    filters.appendChild(button);
  });
}

function renderEmptyBookings(container) {
  const state = document.createElement("section");
  state.className = "bookings-empty-state";
  state.appendChild(createBookingElement("h2", "No bookings yet"));
  state.appendChild(createBookingElement("p", "Your service requests will appear here once you book a worker."));
  const link = createBookingElement("a", "Find a Service", "btn-primary");
  link.href = "services.html";
  state.appendChild(link);
  container.replaceChildren(state);
}

function renderBookingsList() {
  const container = document.getElementById("bookingsList");
  if (!container) {
    return;
  }

  if (!bookingPageState.bookings.length) {
    renderEmptyBookings(container);
    return;
  }

  const visibleBookings = bookingPageState.selectedStatus
    ? bookingPageState.bookings.filter((booking) => String(booking.status || "Unknown").toLowerCase() === bookingPageState.selectedStatus.toLowerCase())
    : bookingPageState.bookings;

  if (!visibleBookings.length) {
    container.replaceChildren(createBookingElement("p", `No ${formatBookingStatus(bookingPageState.selectedStatus).toLowerCase()} bookings.`));
    return;
  }

  const cards = visibleBookings.map(createBookingCard);
  container.replaceChildren(...cards);
}

function renderBookingsError(error) {
  const list = document.getElementById("bookingsList");
  const filters = document.getElementById("bookingFilters");
  if (!list) {
    return;
  }

  filters?.replaceChildren();
  const status = Number(error?.status);
  const message = status === 403
    ? "This account cannot access customer bookings."
    : status === 404
      ? "The bookings resource could not be found. Please try again."
      : status === 422
        ? "The bookings request was not accepted. Please try again."
        : "Unable to load your bookings. Please try again.";

  const state = document.createElement("section");
  state.className = "bookings-error-state";
  state.setAttribute("role", "alert");
  state.appendChild(createBookingElement("h2", "Bookings unavailable"));
  state.appendChild(createBookingElement("p", message));
  const retryButton = createBookingElement("button", "Try Again", "btn-primary");
  retryButton.type = "button";
  retryButton.addEventListener("click", loadCustomerBookings);
  state.appendChild(retryButton);
  list.replaceChildren(state);
}

async function loadWorkerNames(bookings) {
  const workerIds = [...new Set(bookings.map((booking) => Number(booking.worker_id)).filter((id) => Number.isInteger(id) && id > 0))];
  const entries = await Promise.all(workerIds.map(async (workerId) => {
    try {
      const worker = await window.FixItAPI.getWorker(workerId);
      return [workerId, worker?.name || `Worker #${workerId}`];
    } catch (error) {
      if (Number(error?.status) === 401) {
        throw error;
      }
      return [workerId, `Worker #${workerId}`];
    }
  }));
  return new Map(entries);
}

async function loadCustomerBookings() {
  const list = document.getElementById("bookingsList");
  const filters = document.getElementById("bookingFilters");
  if (!list) {
    return;
  }

  list.replaceChildren(createBookingElement("p", "Loading your bookings...", "bookings-loading-state"));
  filters?.replaceChildren();

  if (!window.FixItAPI?.isAuthenticated()) {
    redirectToBookingsLogin();
    return;
  }

  try {
    const user = await window.FixItAPI.apiRequest("/api/auth/me");
    if (String(user?.role || "").toLowerCase() !== "customer") {
      list.replaceChildren();
      const state = document.createElement("section");
      state.className = "bookings-access-state";
      state.appendChild(createBookingElement("h2", "Customer account required"));
      state.appendChild(createBookingElement("p", "My Bookings is available to customer accounts."));
      list.appendChild(state);
      return;
    }

    const bookings = await window.FixItAPI.getMyBookings();
    bookingPageState.bookings = bookings;
    bookingPageState.workerNames = await loadWorkerNames(bookings);
    bookingPageState.selectedStatus = "";
    renderBookingFilters();
    renderBookingsList();
  } catch (error) {
    if (Number(error?.status) === 401) {
      redirectToBookingsLogin();
      return;
    }
    renderBookingsError(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("bookingDetailsDialog");
  const closeButton = document.querySelector("[data-close-booking-details]");
  closeButton?.addEventListener("click", () => dialog?.close());
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  loadCustomerBookings();
});