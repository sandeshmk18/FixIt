// ===== HAMBURGER MENU =====
function toggleMenu() {
  const m = document.getElementById("mobileMenu");
  m.classList.toggle("open");
}

// ===== SEARCH =====
function doSearch() {
  const cat = document.getElementById("searchCategory").value;
  const area = document.getElementById("searchArea").value;
  let url = "pages/services.html";
  const params = [];
  if (cat) params.push("category=" + encodeURIComponent(cat));
  if (area) params.push("area=" + encodeURIComponent(area));
  if (params.length) url += "?" + params.join("&");
  window.location.href = url;
}

// Enter key on search
document.addEventListener("keydown", function(e) {
  if (e.key === "Enter") doSearch();
});

// ===== RENDER RECENT WORKERS =====
function renderWorkerCard(w, basePath = "") {
  const initials = getAvatar(w.name);
  const icon = SKILL_ICONS[w.skill] || "🔧";
  const waMsg = encodeURIComponent(`Hi ${w.name}, I found you on FixIt and need help with ${w.skill}. Can we connect?`);
  return `
    <div class="worker-card">
      <div class="wc-top">
        <div class="wc-avatar">${initials}</div>
        <div class="wc-info">
          <div class="wc-name">${w.name}</div>
          <div class="wc-badges">
            <span class="badge-skill">${icon} ${w.skill}</span>
            ${w.verified ? '<span class="badge-verified">✅ Verified</span>' : ""}
          </div>
        </div>
      </div>
      <div class="wc-meta">
        <span>📍 ${w.area}</span>
        <span>🕐 ${w.experience} yrs exp</span>
      </div>
      <div class="wc-rating">
        <span class="stars">${renderStars(w.rating)}</span>
        <span class="rating-num">${w.rating > 0 ? w.rating.toFixed(1) : "New"}</span>
        ${w.reviews > 0 ? `<span class="rating-count">(${w.reviews} reviews)</span>` : ""}
      </div>
      <div class="wc-btns">
        <a href="tel:${w.phone}" class="btn-call">📞 Call</a>
        <a href="https://wa.me/91${w.whatsapp}?text=${waMsg}" target="_blank" class="btn-wa">💬 WhatsApp</a>
        <a href="${basePath}pages/profile.html?id=${w.id}" class="btn-view">View</a>
      </div>
    </div>
  `;
}

// Render recent workers on homepage
const recentEl = document.getElementById("recentWorkers");
if (recentEl) {
  const recent = [...WORKERS].slice(0, 4);
  recentEl.innerHTML = recent.map(w => renderWorkerCard(w)).join("");
}
