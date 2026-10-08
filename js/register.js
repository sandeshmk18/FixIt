"use strict";

const REGISTER_ALLOWED_SKILLS = [
  "Electrician",
  "Plumber",
  "Civil Contractor",
  "Painter",
  "Carpenter",
  "AC Repair",
  "Home Cleaning",
  "Locksmith",
  "Packers & Movers",
  "Gardener",
  "Fabricator",
  "Interior Designer"
];

const REGISTER_ALLOWED_AREAS = [
  "Koramangala",
  "HSR Layout",
  "Whitefield",
  "Indiranagar",
  "Jayanagar",
  "Marathahalli",
  "Electronic City",
  "Hebbal",
  "BTM Layout",
  "Banashankari",
  "JP Nagar",
  "Yeshwanthpur"
];

function sanitizeText(value, maxLength) {
  if (typeof value !== "string") {
    return "";
  }

  const cleaned = value
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength || 200);

  return cleaned;
}

function normalizePhone(value) {
  const digits = String(value ?? "").replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) {
    return "";
  }

  return digits;
}

function getDraftFromStorage() {
  try {
    const raw = localStorage.getItem("fixit_reg_draft");

    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);

    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Unable to read registration draft:", error);
    return {};
  }
}

function saveProgress() {
  const draft = {
    name: sanitizeText(document.getElementById("fname")?.value || "", 80),
    phone: normalizePhone(document.getElementById("fphone")?.value || ""),
    bio: sanitizeText(document.getElementById("fbio")?.value || "", 500),
    skill: document.getElementById("fskill")?.value || "",
    exp: document.getElementById("fexp")?.value || ""
  };

  try {
    localStorage.setItem("fixit_reg_draft", JSON.stringify(draft));
  } catch (error) {
    console.error("Unable to save draft:", error);
  }
}

function loadProgress() {
  const draft = getDraftFromStorage();

  if (!draft || typeof draft !== "object") {
    return;
  }

  if (draft.name) {
    const nameInput = document.getElementById("fname");
    if (nameInput) nameInput.value = sanitizeText(draft.name, 80);
  }

  if (draft.phone) {
    const phoneInput = document.getElementById("fphone");
    if (phoneInput) phoneInput.value = normalizePhone(draft.phone);
  }

  if (draft.bio) {
    const bioInput = document.getElementById("fbio");
    if (bioInput) bioInput.value = sanitizeText(draft.bio, 500);
  }

  if (draft.skill && REGISTER_ALLOWED_SKILLS.includes(draft.skill)) {
    const skillSelect = document.getElementById("fskill");
    if (skillSelect) skillSelect.value = draft.skill;
  }

  if (draft.exp) {
    const expInput = document.getElementById("fexp");
    if (expInput) expInput.value = String(draft.exp).slice(0, 3);
  }
}

function clearErrors() {
  document.querySelectorAll(".form-error").forEach((element) => {
    element.textContent = "";
  });
}

function showError(id, message) {
  const errorNode = document.getElementById(id);
  if (errorNode) {
    errorNode.textContent = message;
  }
}

function validateName() {
  const name = sanitizeText(document.getElementById("fname")?.value || "", 80);

  if (!name) {
    showError("err-fname", "Please enter your full name.");
    return false;
  }

  if (name.length < 2) {
    showError("err-fname", "Name must be at least 2 characters long.");
    return false;
  }

  if (name.length > 80) {
    showError("err-fname", "Name is too long.");
    return false;
  }

  return true;
}

function validatePhone() {
  const phone = normalizePhone(document.getElementById("fphone")?.value || "");

  if (!phone) {
    showError("err-fphone", "Please enter a valid 10- to 15-digit phone number.");
    return false;
  }

  return true;
}

function validateSkill() {
  const skill = document.getElementById("fskill")?.value || "";

  if (!REGISTER_ALLOWED_SKILLS.includes(skill)) {
    showError("err-fskill", "Please select a valid service category.");
    return false;
  }

  return true;
}

function validateExperience() {
  const value = Number(document.getElementById("fexp")?.value || "");

  if (!Number.isFinite(value) || value < 0 || value > 60) {
    showError("err-fexp", "Please enter a valid experience value between 0 and 60 years.");
    return false;
  }

  return true;
}

function validateAreas() {
  const selected = [...document.querySelectorAll("input[name='area']:checked")]
    .map((checkbox) => checkbox.value)
    .filter((value) => REGISTER_ALLOWED_AREAS.includes(value));

  if (selected.length === 0) {
    showError("err-fareas", "Please select at least one service area.");
    return false;
  }

  return true;
}

function validateDescription() {
  const description = sanitizeText(document.getElementById("fbio")?.value || "", 500);

  if (description.length > 500) {
    showError("err-fbio", "Profile description is too long.");
    return false;
  }

  return true;
}

function buildSummary() {
  const summaryBox = document.getElementById("summaryBox");

  if (!summaryBox) {
    return;
  }

  const fields = [
    ["Name", sanitizeText(document.getElementById("fname")?.value || "", 80)],
    ["Phone", normalizePhone(document.getElementById("fphone")?.value || "")],
    ["Service", document.getElementById("fskill")?.value || "Not chosen"],
    ["Experience", `${document.getElementById("fexp")?.value || "0"} years`],
    [
      "Areas",
      [...document.querySelectorAll("input[name='area']:checked")]
        .map((checkbox) => checkbox.value)
        .filter(Boolean)
        .join(", ") || "Not selected"
    ],
    [
      "Services",
      sanitizeText(document.getElementById("fservices")?.value || "", 200) || "Not specified"
    ],
    [
      "About",
      sanitizeText(document.getElementById("fbio")?.value || "", 500) || "Not provided"
    ]
  ];

  const summaryList = document.createElement("div");
  summaryList.className = "summary-list";

  fields.forEach(([label, value]) => {
    const row = document.createElement("div");
    const rowLabel = document.createElement("strong");
    rowLabel.textContent = `${label}: `;
    const rowValue = document.createElement("span");
    rowValue.textContent = value;
    row.appendChild(rowLabel);
    row.appendChild(rowValue);
    summaryList.appendChild(row);
  });

  summaryBox.replaceChildren(summaryList);
}

function goStep(stepNumber) {
  clearErrors();

  if (stepNumber === 2 && !validateName()) {
    return;
  }

  if (stepNumber === 2 && !validatePhone()) {
    return;
  }

  if (stepNumber === 2 && !validateDescription()) {
    return;
  }

  if (stepNumber === 3 && !validateSkill()) {
    return;
  }

  if (stepNumber === 3 && !validateExperience()) {
    return;
  }

  if (stepNumber === 3 && !validateAreas()) {
    return;
  }

  if (stepNumber === 3) {
    buildSummary();
  }

  [1, 2, 3].forEach((index) => {
    const stepNode = document.getElementById(`step${index}`);
    const progressNode = document.getElementById(`ps${index}`);

    if (stepNode) {
      stepNode.style.display = index === stepNumber ? "block" : "none";
    }

    if (progressNode) {
      progressNode.className = "progress-step" + (index < stepNumber ? " done" : index === stepNumber ? " active" : "");
    }
  });

  const labels = [
    "Step 1 of 3 — Personal Details",
    "Step 2 of 3 — Work Details",
    "Step 3 of 3 — Review & Submit"
  ];

  const stepLabel = document.getElementById("stepLabel");
  if (stepLabel) {
    stepLabel.textContent = labels[stepNumber - 1];
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
  saveProgress();
}

function handleSamePhoneToggle() {
  const isSame = document.getElementById("samePhone")?.checked;
  const whatsappInput = document.getElementById("fwhatsapp");
  const phoneInput = document.getElementById("fphone");

  if (!whatsappInput || !phoneInput) {
    return;
  }

  if (isSame) {
    whatsappInput.value = normalizePhone(phoneInput.value);
    whatsappInput.disabled = true;
    return;
  }

  whatsappInput.disabled = false;
}

async function submitForm() {
  clearErrors();

  if (!document.getElementById("agreeCheck")?.checked) {
    showError("err-agree", "Please agree to the terms before submitting.");
    return;
  }

  if (!validateName() || !validatePhone() || !validateSkill() || !validateExperience() || !validateAreas()) {
    return;
  }

  const email = String(document.getElementById("registerEmail")?.value || "").trim();
  const password = String(document.getElementById("registerPassword")?.value || "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("err-registerEmail", "Please enter a valid email address.");
    return;
  }

  if (!password || password.length < 6) {
    showError("err-registerPassword", "Please create a password with at least 6 characters.");
    return;
  }

  const name = sanitizeText(document.getElementById("fname")?.value || "", 80);
  const phone = normalizePhone(document.getElementById("fphone")?.value || "");
  const whatsapp = normalizePhone(document.getElementById("fwhatsapp")?.value || phone) || phone;
  const bio = sanitizeText(document.getElementById("fbio")?.value || "", 500);
  const skill = document.getElementById("fskill")?.value || "";
  const experience = Number(document.getElementById("fexp")?.value || "0");
  const selectedAreas = [...document.querySelectorAll("input[name='area']:checked")]
    .map((checkbox) => checkbox.value)
    .filter((value) => REGISTER_ALLOWED_AREAS.includes(value));
  const services = sanitizeText(document.getElementById("fservices")?.value || "", 200)
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 12);

  try {
    const registerResult = await window.FixItAPI.registerUser({
      email,
      password,
      full_name: name,
      phone,
      city: "Bengaluru",
      role: "worker"
    });

    if (!registerResult || !registerResult.access_token) {
      throw new Error("Registration succeeded but no access token was returned.");
    }

    window.FixItAPI.setAuthSession(registerResult.access_token, { email });

    const profileResponse = await window.FixItAPI.apiRequest("/api/workers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${registerResult.access_token}`
      },
      body: JSON.stringify({
        skill,
        experience_years: Number.isFinite(experience) ? experience : 0,
        area: selectedAreas[0] || "Bengaluru",
        areas: selectedAreas,
        bio,
        phone,
        whatsapp,
        rating: 0,
        reviews: 0,
        verified: false,
        services,
        photo: ""
      })
    });

    if (!profileResponse) {
      throw new Error("Worker profile could not be created.");
    }

    localStorage.removeItem("fixit_reg_draft");

    const successScreen = document.getElementById("successScreen");
    const registerForm = document.getElementById("registerForm");
    if (successScreen) successScreen.style.display = "block";
    if (registerForm) registerForm.style.display = "none";

    const shareButton = document.getElementById("shareProfileButton");
    if (shareButton) {
      shareButton.addEventListener("click", () => {
        const pageUrl = window.location.href.replace(/register\.html.*$/, "services.html");
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(pageUrl)
            .then(() => {
              shareButton.textContent = "Link copied";
            })
            .catch(() => {
              shareButton.textContent = "Copy unavailable";
            });
        } else {
          shareButton.textContent = "Demo only";
        }
      }, { once: true });
    }
  } catch (error) {
    console.error("Unable to register worker profile:", error);
    showError("err-agree", error.message || "Unable to register right now. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const areasGrid = document.getElementById("areasGrid");

  if (areasGrid) {
    REGISTER_ALLOWED_AREAS.forEach((area) => {
      const label = document.createElement("label");
      label.className = "checkbox-item";

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "area";
      input.value = area;

      const text = document.createElement("span");
      text.textContent = area;

      label.appendChild(input);
      label.appendChild(text);
      areasGrid.appendChild(label);
    });
  }

  const samePhoneToggle = document.getElementById("samePhone");
  if (samePhoneToggle) {
    samePhoneToggle.addEventListener("change", handleSamePhoneToggle);
  }

  document.querySelectorAll(".btn-next, .btn-back, .btn-submit").forEach((button) => {
    button.addEventListener("click", (event) => {
      const stepNumber = Number(button.dataset.step || 0);
      if (!Number.isFinite(stepNumber) || stepNumber <= 0) {
        return;
      }
      event.preventDefault();
      goStep(stepNumber);
    });
  });

  const submitButton = document.getElementById("submitButton");
  if (submitButton) {
    submitButton.addEventListener("click", (event) => {
      event.preventDefault();
      submitForm();
    });
  }

  loadProgress();
});
