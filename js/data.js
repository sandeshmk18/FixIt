const WORKERS = [
  {
    id: 1,
    name: "Ravi Kumar",
    skill: "Electrician",
    experience: 8,
    area: "Koramangala",
    areas: ["Koramangala","HSR Layout","BTM Layout"],
    phone: "9876543210",
    whatsapp: "9876543210",
    rating: 4.8,
    reviews: 42,
    verified: true,
    bio: "Licensed electrician with 8 years experience. Specialise in home wiring, switchboard repairs, and inverter installations.",
    services: ["Home wiring","Switchboard repair","Inverter installation","Fan & light fitting"],
    photo: "",
    joined: "2024-01-05"
  },
  {
    id: 2,
    name: "Suresh Gowda",
    skill: "Plumber",
    experience: 12,
    area: "Whitefield",
    areas: ["Whitefield","Marathahalli","Indiranagar"],
    phone: "9845678901",
    whatsapp: "9845678901",
    rating: 4.9,
    reviews: 78,
    verified: true,
    bio: "Expert plumber handling all pipe repairs, bathroom fittings, and water tank cleaning. Available 7 days a week.",
    services: ["Pipe repair","Bathroom fitting","Tank cleaning","Drainage unblocking"],
    photo: "",
    joined: "2024-01-10"
  },
  {
    id: 3,
    name: "Manjunath B.",
    skill: "Civil Contractor",
    experience: 15,
    area: "Jayanagar",
    areas: ["Jayanagar","JP Nagar","Banashankari"],
    phone: "9731234567",
    whatsapp: "9731234567",
    rating: 4.7,
    reviews: 31,
    verified: true,
    bio: "Civil contractor with 15 years in residential and commercial construction. From small repairs to full house construction.",
    services: ["House construction","Room addition","Renovation","Flooring","Waterproofing"],
    photo: "",
    joined: "2024-01-15"
  },
  {
    id: 4,
    name: "Praveen Raj",
    skill: "Painter",
    experience: 6,
    area: "Indiranagar",
    areas: ["Indiranagar","Koramangala","HSR Layout"],
    phone: "9880123456",
    whatsapp: "9880123456",
    rating: 4.6,
    reviews: 55,
    verified: true,
    bio: "Interior and exterior painter. Use premium Asian Paints and Berger products. Clean and professional finish guaranteed.",
    services: ["Interior painting","Exterior painting","Texture painting","Waterproof coating"],
    photo: "",
    joined: "2024-01-18"
  },
  {
    id: 5,
    name: "Anand Naik",
    skill: "Carpenter",
    experience: 10,
    area: "HSR Layout",
    areas: ["HSR Layout","BTM Layout","Electronic City"],
    phone: "9900112233",
    whatsapp: "9900112233",
    rating: 4.8,
    reviews: 63,
    verified: true,
    bio: "Custom furniture and modular kitchen expert. Wardrobes, beds, study tables — all made to your exact measurements.",
    services: ["Modular kitchen","Wardrobe","Custom furniture","Door repair","Bed design"],
    photo: "",
    joined: "2024-01-20"
  },
  {
    id: 6,
    name: "Kiran Shetty",
    skill: "AC Repair",
    experience: 7,
    area: "Marathahalli",
    areas: ["Marathahalli","Whitefield","Hebbal"],
    phone: "9741122334",
    whatsapp: "9741122334",
    rating: 4.5,
    reviews: 89,
    verified: false,
    bio: "AC service and repair specialist. Handle all brands — Samsung, LG, Voltas, Daikin. Gas refilling and full servicing.",
    services: ["AC service","Gas refilling","Repair","Installation","AMC contract"],
    photo: "",
    joined: "2024-01-22"
  },
  {
    id: 7,
    name: "Deepa M.",
    skill: "Home Cleaning",
    experience: 5,
    area: "BTM Layout",
    areas: ["BTM Layout","Jayanagar","Banashankari"],
    phone: "9611223344",
    whatsapp: "9611223344",
    rating: 4.9,
    reviews: 107,
    verified: true,
    bio: "Deep home cleaning, sofa shampooing, kitchen degreasing and bathroom sanitising. Fully trained team of 3 members.",
    services: ["Deep cleaning","Sofa shampooing","Kitchen cleaning","Bathroom sanitising","Post-construction cleaning"],
    photo: "",
    joined: "2024-01-25"
  },
  {
    id: 8,
    name: "Vinod Kumar",
    skill: "Locksmith",
    experience: 9,
    area: "Yeshwanthpur",
    areas: ["Yeshwanthpur","Hebbal","Banashankari"],
    phone: "9632233445",
    whatsapp: "9632233445",
    rating: 4.7,
    reviews: 44,
    verified: false,
    bio: "24/7 locksmith service. Lock replacement, duplicate key making, digital lock installation, and safe opening.",
    services: ["Lock replacement","Duplicate key","Digital lock","Safe opening","Door lock repair"],
    photo: "",
    joined: "2024-01-28"
  },
  {
    id: 9,
    name: "Lokesh Reddy",
    skill: "Packers & Movers",
    experience: 11,
    area: "Electronic City",
    areas: ["Electronic City","Whitefield","Marathahalli"],
    phone: "9523344556",
    whatsapp: "9523344556",
    rating: 4.6,
    reviews: 38,
    verified: true,
    bio: "Safe and affordable house shifting. Own truck, packing materials included. Handle fragile items with extra care.",
    services: ["House shifting","Office relocation","Packing & unpacking","Vehicle transport","Storage"],
    photo: "",
    joined: "2024-02-01"
  },
  {
    id: 10,
    name: "Nagesha T.",
    skill: "Gardener",
    experience: 14,
    area: "Hebbal",
    areas: ["Hebbal","Yeshwanthpur","Banashankari"],
    phone: "9414455667",
    whatsapp: "9414455667",
    rating: 4.8,
    reviews: 29,
    verified: false,
    bio: "Garden maintenance, lawn trimming, plant nursery supply, and terrace garden setup. Regular weekly service available.",
    services: ["Lawn trimming","Garden maintenance","Plant supply","Terrace garden","Potting & repotting"],
    photo: "",
    joined: "2024-02-05"
  }
];

const AREAS = [
  "Koramangala","HSR Layout","Whitefield","Indiranagar","Jayanagar",
  "Marathahalli","Electronic City","Hebbal","BTM Layout",
  "Banashankari","JP Nagar","Yeshwanthpur"
];

const SKILLS = [
  "Electrician","Plumber","Civil Contractor","Painter","Carpenter",
  "AC Repair","Home Cleaning","Locksmith","Packers & Movers","Gardener",
  "Fabricator","Interior Designer"
];

const SKILL_ICONS = {
  "Electrician":"⚡","Plumber":"🔧","Civil Contractor":"🏗️",
  "Painter":"🎨","Carpenter":"🪟","AC Repair":"❄️",
  "Home Cleaning":"🧹","Locksmith":"🔒","Packers & Movers":"📦",
  "Gardener":"🌿","Fabricator":"🔨","Interior Designer":"🏠"
};

function getWorkerById(id) {
  return WORKERS.find(w => w.id === parseInt(id));
}

function getAvatar(name) {
  return name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = "";
  for (let i = 0; i < full; i++) stars += "★";
  if (half) stars += "½";
  while (stars.replace("½","x").length < 5) stars += "☆";
  return stars;
}

function saveWorker(data) {
  const all = JSON.parse(localStorage.getItem("fixit_workers") || "[]");
  data.id = Date.now();
  data.rating = 0;
  data.reviews = 0;
  data.verified = false;
  data.joined = new Date().toISOString().split("T")[0];
  all.push(data);
  localStorage.setItem("fixit_workers", JSON.stringify(all));
  return data;
}

function getAllWorkers() {
  const stored = JSON.parse(localStorage.getItem("fixit_workers") || "[]");
  return [...WORKERS, ...stored];
}
