const API_BASE_URL = "http://127.0.0.1:8002";
const AUTH_TOKEN_KEY = "fixit_token";
const AUTH_USER_KEY = "fixit_user";

function getStoredToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch (error) {
    console.error("Unable to read auth token:", error);
    return "";
  }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.error("Unable to read auth user:", error);
    return null;
  }
}

function setAuthSession(token, user) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user || null));
  } catch (error) {
    console.error("Unable to store auth session:", error);
  }
}

function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  } catch (error) {
    console.error("Unable to clear auth session:", error);
  }
}

function getAuthUser() {
  return getStoredUser();
}

function getAuthHeaders(extraHeaders = {}) {
  const token = getStoredToken();
  return {
    Accept: "application/json",
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function apiRequest(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(options.headers || {}),
      ...(options.body && !options.headers?.["Content-Type"] && !options.headers?.["content-type"]
        ? { "Content-Type": "application/json" }
        : {}),
    }
  });

  if (response.status === 401 && !options.skipAuthRefresh) {
    clearAuthSession();
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const detail =
      (payload && typeof payload === "object" && "detail" in payload)
        ? payload.detail
        : (typeof payload === "string" ? payload : "Request failed");
    const message = Array.isArray(detail)
      ? detail.map((entry) => entry.msg || entry).join("; ")
      : String(detail || "Request failed");
    throw new Error(message);
  }

  return payload;
}

async function registerUser(payload) {
  return apiRequest("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    skipAuthRefresh: true
  });
}

async function loginUser(email, password) {
  const body = new URLSearchParams({
    username: String(email || "").trim(),
    password: String(password || "")
  });

  const result = await apiRequest("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: body.toString(),
    skipAuthRefresh: true
  });

  if (result && result.access_token) {
    setAuthSession(result.access_token, { email: String(email || "").trim() });
  }

  return result;
}

async function getCurrentUser() {
  try {
    const user = await apiRequest("/api/auth/me");
    if (user && user.email) {
      const saved = getStoredUser();
      setAuthSession(getStoredToken(), { ...saved, ...user });
      return user;
    }
    return null;
  } catch (error) {
    clearAuthSession();
    return null;
  }
}

function normalizeWorker(data) {
  if (!data || typeof data !== "object") {
    return null;
  }

  return {
    id: Number(data.id) || 0,
    user_id: Number(data.user_id) || Number(data.id) || 0,
    name: data.name || data.full_name || "FixIt Worker",
    skill: data.skill || "Service",
    experience: Number(data.experience_years ?? data.experience ?? 0),
    area: data.area || "Bengaluru",
    areas: Array.isArray(data.areas) ? data.areas : [],
    phone: data.phone || "",
    whatsapp: data.whatsapp || data.phone || "",
    rating: Number(data.rating ?? 0),
    reviews: Number(data.reviews ?? 0),
    verified: Boolean(data.verified),
    bio: data.bio || "",
    services: Array.isArray(data.services) ? data.services : [],
    photo: data.photo || "",
    joined: data.joined || new Date().toISOString().slice(0, 10)
  };
}

async function getWorkers(params = {}) {
  const query = new URLSearchParams();
  if (params.category) query.set("category", params.category);
  if (params.area) query.set("area", params.area);
  if (params.rating) query.set("rating", String(params.rating));
  if (params.sort) query.set("sort", params.sort);

  const data = await apiRequest(`/api/workers${query.toString() ? `?${query.toString()}` : ""}`);
  const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  return items.map(normalizeWorker).filter(Boolean);
}

async function getWorker(workerId) {
  const data = await apiRequest(`/api/workers/${encodeURIComponent(workerId)}`);
  return normalizeWorker(data);
}

async function getServices() {
  try {
    const data = await apiRequest("/api/services");
    if (Array.isArray(data) && data.length) {
      return data.map((item) => ({
        name: item.name || "Service",
        icon: item.icon || "🔧"
      }));
    }
  } catch (error) {
    console.warn("Service endpoint unavailable, falling back to static list:", error);
  }

  return [
    { name: "Electrician", icon: "⚡" },
    { name: "Plumber", icon: "🔧" },
    { name: "Civil Contractor", icon: "🏗️" },
    { name: "Painter", icon: "🎨" },
    { name: "Carpenter", icon: "🪟" },
    { name: "AC Repair", icon: "❄️" },
    { name: "Home Cleaning", icon: "🧹" },
    { name: "Locksmith", icon: "🔒" },
    { name: "Packers & Movers", icon: "📦" },
    { name: "Gardener", icon: "🌿" },
    { name: "Fabricator", icon: "🔨" },
    { name: "Interior Designer", icon: "🏠" }
  ];
}

async function createBooking(payload) {
  return apiRequest("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

async function getBookings() {
  try {
    return await apiRequest("/api/bookings");
  } catch (error) {
    console.warn("Bookings endpoint unavailable:", error);
    return [];
  }
}

async function updateBookingStatus(bookingId, status) {
  return apiRequest(`/api/bookings/${encodeURIComponent(bookingId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
}

async function createReview() {
  throw new Error("Review endpoint is not implemented yet.");
}

async function getAdminStats() {
  return apiRequest("/api/admin/stats");
}

async function getAdminWorkers() {
  const workers = await apiRequest("/api/admin/workers");
  return Array.isArray(workers) ? workers.map(normalizeWorker).filter(Boolean) : [];
}

async function setWorkerVerification(workerId, verified) {
  return apiRequest(`/api/admin/workers/${encodeURIComponent(workerId)}/verify`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verified })
  });
}

function hasAuthRole(roleName) {
  const user = getStoredUser();
  return Boolean(user && String(user.role || "").toLowerCase() === String(roleName || "").toLowerCase());
}

function isAuthenticated() {
  return Boolean(getStoredToken() && getStoredUser());
}

function logoutUser() {
  clearAuthSession();
  const loginPath = window.location.pathname.includes("/pages/") ? "login.html" : "pages/login.html";
  if (window.location.pathname.endsWith("/login.html") || window.location.pathname.includes("login.html")) {
    window.location.reload();
    return;
  }
  window.location.href = loginPath;
}

window.FixItAPI = {
  API_BASE_URL,
  getStoredToken,
  getStoredUser,
  setAuthSession,
  clearAuthSession,
  getAuthUser,
  isAuthenticated,
  hasAuthRole,
  apiRequest,
  registerUser,
  loginUser,
  getCurrentUser,
  getWorkers,
  getWorker,
  getServices,
  createBooking,
  getBookings,
  updateBookingStatus,
  createReview,
  getAdminStats,
  getAdminWorkers,
  setWorkerVerification,
  logoutUser
};
