"use strict";

function getAdminAuthState() {
  const storedUser = window.FixItAPI?.getStoredUser?.();
  const role = String(storedUser?.role || "").toLowerCase();
  return role === "admin" ? storedUser : null;
}

function formatStatCard(value, label, tone = "") {
  const card = document.createElement("div");
  card.className = "stat-card";

  const valueNode = document.createElement("div");
  valueNode.className = "stat-val";
  if (tone === "amber") valueNode.style.color = "#f59e0b";
  if (tone === "danger") valueNode.style.color = "#ef4444";
  valueNode.textContent = String(value);

  const labelNode = document.createElement("div");
  labelNode.className = "stat-lbl";
  labelNode.textContent = label;

  card.appendChild(valueNode);
  card.appendChild(labelNode);
  return card;
}

function renderAdminStats(stats) {
  const statsRow = document.getElementById("statsRow");
  if (!statsRow) return;

  const safeStats = stats && typeof stats === "object" ? stats : {
    total_users: 0,
    total_workers: 0,
    total_bookings: 0,
    total_customers: 0,
  };

  statsRow.replaceChildren();
  statsRow.appendChild(formatStatCard(safeStats.total_users ?? 0, "Total Users"));
  statsRow.appendChild(formatStatCard(safeStats.total_workers ?? 0, "Total Workers", "amber"));
  statsRow.appendChild(formatStatCard(safeStats.total_bookings ?? 0, "Bookings"));
  statsRow.appendChild(formatStatCard(safeStats.total_customers ?? 0, "Customers", "danger"));
}

function renderAdminTable(workers) {
  const query = (document.getElementById("adminSearch")?.value || "").trim().toLowerCase();
  const filter = document.getElementById("adminFilter")?.value || "";
  const tbody = document.getElementById("adminTableBody");
  const empty = document.getElementById("adminEmpty");

  if (!tbody || !empty) {
    return;
  }

  const source = Array.isArray(workers) ? workers : [];
  let filteredWorkers = source.filter((worker) => worker && typeof worker === "object");

  if (query) {
    filteredWorkers = filteredWorkers.filter((worker) => {
      const text = [worker.name, worker.skill, worker.area].join(" ").toLowerCase();
      return text.includes(query);
    });
  }

  if (filter === "verified") {
    filteredWorkers = filteredWorkers.filter((worker) => Boolean(worker.verified));
  }

  if (filter === "unverified") {
    filteredWorkers = filteredWorkers.filter((worker) => !worker.verified);
  }

  tbody.replaceChildren();

  if (!filteredWorkers.length) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  const fragment = document.createDocumentFragment();
  filteredWorkers.forEach((worker, index) => {
    const row = document.createElement("tr");

    const cells = [
      String(index + 1),
      worker.name || "Unknown worker",
      `${SKILL_ICONS?.[worker.skill] || "🔧"} ${worker.skill || "Service"}`,
      worker.area || "Bengaluru",
      worker.phone || "—",
      Number(worker.rating) > 0 ? `★ ${Number(worker.rating).toFixed(1)}` : "New",
      worker.joined || "—",
      Boolean(worker.verified) ? "✅ Verified" : "⬜ Unverified"
    ];

    cells.forEach((cellValue) => {
      const cell = document.createElement("td");
      cell.textContent = cellValue;
      row.appendChild(cell);
    });

    const actions = document.createElement("td");
    const verifyButton = document.createElement("button");
    verifyButton.type = "button";
    verifyButton.className = worker.verified ? "toggle-verified is-verified" : "toggle-verified not-verified";
    verifyButton.textContent = worker.verified ? "✅ Verified" : "⬜ Verify";
    verifyButton.addEventListener("click", async () => {
      try {
        const result = await window.FixItAPI.setWorkerVerification(worker.id, !worker.verified);
        if (result && result.id) {
          await loadAdminData();
        }
      } catch (error) {
        alert(error.message || "Unable to update worker verification.");
      }
    });

    actions.appendChild(verifyButton);
    row.appendChild(actions);
    fragment.appendChild(row);
  });

  tbody.appendChild(fragment);
}

async function loadAdminData() {
  const loginScreen = document.getElementById("loginScreen");
  const adminPanel = document.getElementById("adminPanel");

  try {
    const [stats, workers] = await Promise.all([
      window.FixItAPI.getAdminStats(),
      window.FixItAPI.getAdminWorkers()
    ]);

    renderAdminStats(stats);
    renderAdminTable(workers);

    if (loginScreen) loginScreen.style.display = "none";
    if (adminPanel) adminPanel.style.display = "block";
  } catch (error) {
    console.error("Unable to load admin data:", error);
    if (loginScreen) loginScreen.style.display = "block";
    if (adminPanel) adminPanel.style.display = "none";

    const errorNode = document.getElementById("loginErr");
    if (errorNode) {
      errorNode.textContent = error.message || "Unable to load admin data.";
    }
  }
}

async function doAdminLogin() {
  const emailInput = document.getElementById("adminEmail");
  const passwordInput = document.getElementById("adminPass");
  const errorNode = document.getElementById("loginErr");

  if (!emailInput || !passwordInput || !errorNode) {
    return;
  }

  const email = (emailInput.value || "").trim();
  const password = (passwordInput.value || "").trim();

  if (!email || !password) {
    errorNode.textContent = "Please enter your admin email and password.";
    return;
  }

  try {
    const result = await window.FixItAPI.loginUser(email, password);
    if (!result || !result.access_token) {
      throw new Error("Invalid admin credentials.");
    }

    const user = await window.FixItAPI.getCurrentUser();
    if (!user || String(user.role || "").toLowerCase() !== "admin") {
      throw new Error("Admin access is required.");
    }

    await loadAdminData();
  } catch (error) {
    errorNode.textContent = error.message || "Invalid admin credentials.";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const loginButton = document.getElementById("adminLoginButton");
  const passwordInput = document.getElementById("adminPass");
  const emailInput = document.getElementById("adminEmail");
  const searchInput = document.getElementById("adminSearch");
  const filterSelect = document.getElementById("adminFilter");
  const refreshButton = document.getElementById("refreshAdminTable");

  if (getAdminAuthState()) {
    await loadAdminData();
  }

  if (loginButton) {
    loginButton.addEventListener("click", doAdminLogin);
  }

  if (passwordInput) {
    passwordInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        doAdminLogin();
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        doAdminLogin();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const adminData = window.FixItAPI?.getAdminWorkers?.();
      adminData.then((workers) => renderAdminTable(workers)).catch(() => renderAdminTable([]));
    });
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const adminData = window.FixItAPI?.getAdminWorkers?.();
      adminData.then((workers) => renderAdminTable(workers)).catch(() => renderAdminTable([]));
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener("click", () => {
      loadAdminData();
    });
  }
});
