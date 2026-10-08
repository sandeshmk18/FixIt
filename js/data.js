/*

* FixIt — Frontend Data Layer
*
* IMPORTANT:
* This file is public.
* Never place passwords, API keys, admin credentials,
* private documents, or other secrets here.
*
* Worker contact information will eventually come
* from the backend/database instead of this file.
  */

// =========================================================
// WORKER DATA
// =========================================================

const WORKERS = [
{
id: 1,
name: "Ravi Kumar",
skill: "Electrician",
experience: 8,
area: "Koramangala",
areas: ["Koramangala", "HSR Layout", "BTM Layout"],
phone: "9876543210",
whatsapp: "9876543210",
rating: 4.8,
reviews: 42,
verified: true,
bio: "Licensed electrician with 8 years experience. Specialise in home wiring, switchboard repairs, and inverter installations.",
services: [
"Home wiring",
"Switchboard repair",
"Inverter installation",
"Fan & light fitting"
],
photo: "",
joined: "2024-01-05"
},

{
id: 2,
name: "Suresh Gowda",
skill: "Plumber",
experience: 12,
area: "Whitefield",
areas: ["Whitefield", "Marathahalli", "Indiranagar"],
phone: "9845678901",
whatsapp: "9845678901",
rating: 4.9,
reviews: 78,
verified: true,
bio: "Expert plumber handling pipe repairs, bathroom fittings, and water tank cleaning.",
services: [
"Pipe repair",
"Bathroom fitting",
"Tank cleaning",
"Drainage unblocking"
],
photo: "",
joined: "2024-01-10"
},

{
id: 3,
name: "Manjunath B.",
skill: "Civil Contractor",
experience: 15,
area: "Jayanagar",
areas: ["Jayanagar", "JP Nagar", "Banashankari"],
phone: "9731234567",
whatsapp: "9731234567",
rating: 4.7,
reviews: 31,
verified: true,
bio: "Civil contractor with 15 years in residential and commercial construction.",
services: [
"House construction",
"Room addition",
"Renovation",
"Flooring",
"Waterproofing"
],
photo: "",
joined: "2024-01-15"
},

{
id: 4,
name: "Praveen Raj",
skill: "Painter",
experience: 6,
area: "Indiranagar",
areas: ["Indiranagar", "Koramangala", "HSR Layout"],
phone: "9880123456",
whatsapp: "9880123456",
rating: 4.6,
reviews: 55,
verified: true,
bio: "Interior and exterior painter offering residential painting services.",
services: [
"Interior painting",
"Exterior painting",
"Texture painting",
"Waterproof coating"
],
photo: "",
joined: "2024-01-18"
},

{
id: 5,
name: "Anand Naik",
skill: "Carpenter",
experience: 10,
area: "HSR Layout",
areas: ["HSR Layout", "BTM Layout", "Electronic City"],
phone: "9900112233",
whatsapp: "9900112233",
rating: 4.8,
reviews: 63,
verified: true,
bio: "Custom furniture and modular kitchen specialist.",
services: [
"Modular kitchen",
"Wardrobe",
"Custom furniture",
"Door repair",
"Bed design"
],
photo: "",
joined: "2024-01-20"
},

{
id: 6,
name: "Kiran Shetty",
skill: "AC Repair",
experience: 7,
area: "Marathahalli",
areas: ["Marathahalli", "Whitefield", "Hebbal"],
phone: "9741122334",
whatsapp: "9741122334",
rating: 4.5,
reviews: 89,
verified: false,
bio: "AC service and repair specialist handling multiple AC brands.",
services: [
"AC service",
"Gas refilling",
"Repair",
"Installation",
"AMC contract"
],
photo: "",
joined: "2024-01-22"
},

{
id: 7,
name: "Deepa M.",
skill: "Home Cleaning",
experience: 5,
area: "BTM Layout",
areas: ["BTM Layout", "Jayanagar", "Banashankari"],
phone: "9611223344",
whatsapp: "9611223344",
rating: 4.9,
reviews: 107,
verified: true,
bio: "Home cleaning specialist offering deep cleaning and sanitisation services.",
services: [
"Deep cleaning",
"Sofa shampooing",
"Kitchen cleaning",
"Bathroom sanitising",
"Post-construction cleaning"
],
photo: "",
joined: "2024-01-25"
},

{
id: 8,
name: "Vinod Kumar",
skill: "Locksmith",
experience: 9,
area: "Yeshwanthpur",
areas: ["Yeshwanthpur", "Hebbal", "Banashankari"],
phone: "9632233445",
whatsapp: "9632233445",
rating: 4.7,
reviews: 44,
verified: false,
bio: "Locksmith providing lock replacement, key duplication and digital lock services.",
services: [
"Lock replacement",
"Duplicate key",
"Digital lock",
"Safe opening",
"Door lock repair"
],
photo: "",
joined: "2024-01-28"
},

{
id: 9,
name: "Lokesh Reddy",
skill: "Packers & Movers",
experience: 11,
area: "Electronic City",
areas: ["Electronic City", "Whitefield", "Marathahalli"],
phone: "9523344556",
whatsapp: "9523344556",
rating: 4.6,
reviews: 38,
verified: true,
bio: "House shifting and office relocation service provider.",
services: [
"House shifting",
"Office relocation",
"Packing & unpacking",
"Vehicle transport",
"Storage"
],
photo: "",
joined: "2024-02-01"
},

{
id: 10,
name: "Nagesha T.",
skill: "Gardener",
experience: 14,
area: "Hebbal",
areas: ["Hebbal", "Yeshwanthpur", "Banashankari"],
phone: "9414455667",
whatsapp: "9414455667",
rating: 4.8,
reviews: 29,
verified: false,
bio: "Garden maintenance and terrace garden service provider.",
services: [
"Lawn trimming",
"Garden maintenance",
"Plant supply",
"Terrace garden",
"Potting & repotting"
],
photo: "",
joined: "2024-02-05"
}
];

// =========================================================
// AREAS
// =========================================================

const AREAS = [
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

// =========================================================
// SERVICE TYPES
// =========================================================

const SKILLS = [
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

// =========================================================
// SERVICE ICONS
// =========================================================

const SKILL_ICONS = {
"Electrician": "⚡",
"Plumber": "🔧",
"Civil Contractor": "🏗️",
"Painter": "🎨",
"Carpenter": "🪟",
"AC Repair": "❄️",
"Home Cleaning": "🧹",
"Locksmith": "🔒",
"Packers & Movers": "📦",
"Gardener": "🌿",
"Fabricator": "🔨",
"Interior Designer": "🏠"
};

// =========================================================
// FIND WORKER
// =========================================================

function getWorkerById(id) {
const workerId = Number(id);

if (!Number.isInteger(workerId)) {
return null;
}

return getAllWorkers().find(worker => worker.id === workerId) || null;
}

// =========================================================
// CREATE WORKER AVATAR
// =========================================================

function getAvatar(name) {
if (!name || typeof name !== "string") {
return "??";
}

const initials = name
.trim()
.split(/\s+/)
.map(part => part.charAt(0))
.join("")
.substring(0, 2);

return initials.toUpperCase() || "??";
}

// =========================================================
// RENDER RATING STARS
// =========================================================

function renderStars(rating) {
const safeRating = Number(rating);

if (!Number.isFinite(safeRating) || safeRating <= 0) {
return "☆☆☆☆☆";
}

const fullStars = Math.min(5, Math.floor(safeRating));
const hasHalfStar = safeRating % 1 >= 0.5;

let stars = "";

for (let i = 0; i < fullStars; i++) {
stars += "★";
}

if (hasHalfStar && fullStars < 5) {
stars += "½";
}

while (stars.replace("½", "x").length < 5) {
stars += "☆";
}

return stars;
}

// =========================================================
// LOCAL STORAGE
// =========================================================
//
// TEMPORARY PROTOTYPE STORAGE.
//
// This is NOT secure storage.
// It should only be used until FixIt has a real backend.
//
// Never store passwords, authentication tokens,
// government IDs, payment information or private
// documents in localStorage.
//

const STORAGE_KEY = "fixit_workers";

function getStoredWorkers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const workers = JSON.parse(stored);
    return Array.isArray(workers) ? workers : [];
  } catch (error) {
    console.error("Unable to read stored workers:", error);
    return [];
  }
}

function saveWorker(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid worker data.");
  }

  const workers = getStoredWorkers();

  const worker = {
    ...data,
    id: Date.now(),
    rating: 0,
    reviews: 0,
    verified: false,
    joined: new Date().toISOString().split("T")[0]
  };

  workers.push(worker);

  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(workers)
    );
  } catch (error) {
    console.error("Unable to save worker:", error);
    throw new Error("Unable to save worker information on this device.");
  }

  return worker;
}

// =========================================================
// GET ALL WORKERS
// =========================================================

function getAllWorkers() {

const storedWorkers = getStoredWorkers();

return [
...WORKERS,
...storedWorkers
];
}
