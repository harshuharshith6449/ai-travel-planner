/* =========================================================
   AI Travel Planner - script.js
   This is a "rule-based AI": it uses a built-in knowledge base
   (the DESTINATIONS object) plus logic to build the plan.
   No server or API key is needed, so it works on GitHub Pages.
   ========================================================= */

// ---------- 1. KNOWLEDGE BASE ----------
// dailyCost = approx. mid-range cost per person per day in INR
// (stay + food + local transport + activities)
const DESTINATIONS = {
  goa: {
    name: "Goa", dailyCost: 4500,
    spots: ["Baga & Calangute Beach", "Fort Aguada", "Basilica of Bom Jesus & Old Goa churches",
            "Dudhsagar Falls", "Anjuna Flea Market", "Palolem Beach", "Fontainhas Latin Quarter"],
    food: ["Fish thali at a beach shack", "Goan pork vindaloo or prawn curry", "Bebinca dessert"],
    evening: ["Sunset at Chapora Fort", "Beach-side dinner", "Cruise on the Mandovi river"]
  },
  jaipur: {
    name: "Jaipur", dailyCost: 3500,
    spots: ["Amber Fort", "City Palace", "Hawa Mahal", "Jantar Mantar",
            "Nahargarh Fort", "Jal Mahal", "Albert Hall Museum"],
    food: ["Dal baati churma", "Laal maas", "Pyaaz kachori at Rawat Mishthan Bhandar"],
    evening: ["Shopping at Johari Bazaar", "Chokhi Dhani village dinner", "Sunset at Nahargarh"]
  },
  manali: {
    name: "Manali", dailyCost: 3500,
    spots: ["Solang Valley", "Hadimba Devi Temple", "Old Manali", "Rohtang Pass (permit needed)",
            "Jogini Waterfalls", "Vashisht Hot Springs", "Naggar Castle"],
    food: ["Siddu with ghee", "Trout fish", "Café hopping in Old Manali"],
    evening: ["Mall Road walk", "Bonfire at your stay", "Riverside café in Old Manali"]
  },
  kerala: {
    name: "Kerala", dailyCost: 4000,
    spots: ["Alleppey backwater houseboat", "Munnar tea gardens", "Fort Kochi & Chinese fishing nets",
            "Periyar Wildlife Sanctuary", "Varkala Cliff & Beach", "Athirappilly Falls"],
    food: ["Kerala sadya on banana leaf", "Appam with stew", "Karimeen pollichathu"],
    evening: ["Kathakali show in Kochi", "Sunset at Varkala", "Houseboat dinner"]
  },
  delhi: {
    name: "Delhi", dailyCost: 3500,
    spots: ["Red Fort", "Humayun's Tomb", "India Gate & Kartavya Path", "Qutub Minar",
            "Lotus Temple", "Akshardham Temple", "Chandni Chowk"],
    food: ["Parathas at Paranthe Wali Gali", "Chole bhature", "Butter chicken at Moti Mahal"],
    evening: ["Connaught Place", "Dilli Haat shopping", "Light show at Akshardham"]
  },
  mumbai: {
    name: "Mumbai", dailyCost: 5000,
    spots: ["Gateway of India", "Elephanta Caves", "Marine Drive", "Chhatrapati Shivaji Terminus",
            "Haji Ali Dargah", "Colaba Causeway", "Sanjay Gandhi National Park"],
    food: ["Vada pav", "Pav bhaji at Juhu", "Bombay sandwich & cutting chai"],
    evening: ["Sunset at Marine Drive", "Juhu Beach", "Bandra street-art walk"]
  },
  bangkok: {
    name: "Bangkok", dailyCost: 6000,
    spots: ["Grand Palace", "Wat Pho", "Wat Arun", "Chatuchak Weekend Market",
            "Jim Thompson House", "Damnoen Saduak Floating Market"],
    food: ["Pad Thai from street stalls", "Mango sticky rice", "Tom yum soup"],
    evening: ["Chao Phraya dinner cruise", "Khao San Road", "Rooftop bar view"]
  },
  dubai: {
    name: "Dubai", dailyCost: 12000,
    spots: ["Burj Khalifa", "Dubai Mall & Fountain", "Palm Jumeirah", "Old Dubai & Gold Souk",
            "Desert Safari", "Dubai Frame", "Museum of the Future"],
    food: ["Shawarma and falafel", "Arabic mezze platter", "Karak chai"],
    evening: ["Dhow cruise at Dubai Marina", "Fountain show", "Desert BBQ dinner"]
  },
  singapore: {
    name: "Singapore", dailyCost: 11000,
    spots: ["Gardens by the Bay", "Marina Bay Sands SkyPark", "Sentosa Island", "Singapore Zoo",
            "Chinatown & Buddha Tooth Relic Temple", "Little India"],
    food: ["Hainanese chicken rice at a hawker centre", "Chilli crab", "Kaya toast"],
    evening: ["Spectra light show", "Clarke Quay", "Night Safari"]
  },
  paris: {
    name: "Paris", dailyCost: 15000,
    spots: ["Eiffel Tower", "Louvre Museum", "Notre-Dame area & Île de la Cité", "Montmartre & Sacré-Cœur",
            "Palace of Versailles", "Musée d'Orsay", "Champs-Élysées & Arc de Triomphe"],
    food: ["Croissant and café au lait", "Crêpes", "French onion soup"],
    evening: ["Seine river cruise", "Eiffel Tower sparkle", "Dinner in Le Marais"]
  },
  tokyo: {
    name: "Tokyo", dailyCost: 12000,
    spots: ["Senso-ji Temple, Asakusa", "Shibuya Crossing", "Meiji Shrine", "Akihabara",
            "Tsukiji Outer Market", "Shinjuku Gyoen", "Day trip to Mt. Fuji / Hakone"],
    food: ["Sushi or ramen", "Takoyaki street snacks", "Matcha desserts"],
    evening: ["Shinjuku neon streets", "Izakaya dinner", "Tokyo Skytree views"]
  },
  london: {
    name: "London", dailyCost: 16000,
    spots: ["Tower of London", "British Museum", "Buckingham Palace", "London Eye & Southbank",
            "Camden Market", "Westminster Abbey & Big Ben", "Greenwich"],
    food: ["Fish and chips", "Sunday roast", "Afternoon tea"],
    evening: ["West End show", "Thames walk", "Pub dinner"]
  }
};

// Used when the destination is not in the knowledge base
const GENERIC = {
  dailyCost: 6000,
  spots: ["City centre walking tour", "Main museum or heritage site", "Famous local landmark",
          "Local market or bazaar", "Nearby nature spot or park", "Popular viewpoint"],
  food: ["A famous local dish at a well-rated restaurant", "Street food tour", "Local dessert"],
  evening: ["Relaxed dinner at a local restaurant", "Evening stroll in the old town", "Sunset at a viewpoint"]
};

// Cost multipliers for travel style
const STYLE = {
  budget:   { factor: 0.6, label: "Budget" },
  standard: { factor: 1.0, label: "Standard" },
  luxury:   { factor: 2.2, label: "Luxury" }
};

// How the daily cost is divided
const SPLIT = [
  { label: "🏨 Accommodation", share: 0.40 },
  { label: "🍽️ Food",           share: 0.25 },
  { label: "🚕 Local transport", share: 0.15 },
  { label: "🎟️ Activities",     share: 0.15 },
  { label: "🛍️ Misc / shopping", share: 0.05 }
];

// ---------- 2. HELPERS ----------
const $ = (id) => document.getElementById(id);

// Prevent users typing HTML into our page (security)
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatINR(n) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

function titleCase(text) {
  return text.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

// ---------- 3. CORE LOGIC ----------
function findDestination(input) {
  const key = input.trim().toLowerCase();
  if (DESTINATIONS[key]) return DESTINATIONS[key];
  // partial match, e.g. "goa india" or "paris, france"
  for (const k in DESTINATIONS) {
    if (key.includes(k)) return DESTINATIONS[k];
  }
  return { ...GENERIC, name: titleCase(input.trim()), isGeneric: true };
}

function buildItinerary(dest, days) {
  const plan = [];
  for (let d = 0; d < days; d++) {
    const morning   = dest.spots[(d * 2) % dest.spots.length];
    const afternoon = dest.spots[(d * 2 + 1) % dest.spots.length];
    const food      = dest.food[d % dest.food.length];
    const evening   = dest.evening[d % dest.evening.length];

    let note = "";
    if (d === 0) note = "Arrive, check in and relax before starting.";
    if (d === days - 1 && days > 1) note = "Pack up, shop for souvenirs and head to the airport/station.";

    plan.push({ day: d + 1, morning, afternoon, food, evening, note });
  }
  return plan;
}

function estimateBudget(dest, days, travelers, styleKey) {
  const perPersonPerDay = dest.dailyCost * STYLE[styleKey].factor;
  const total = perPersonPerDay * days * travelers;
  const breakdown = SPLIT.map((s) => ({ label: s.label, amount: total * s.share }));
  return { perPersonPerDay, total, breakdown };
}

// ---------- 4. RENDER TO PAGE ----------
function renderBudget(est, userBudget, days, travelers, styleKey) {
  const diff = userBudget - est.total;
  const ok = diff >= 0;

  const rows = est.breakdown
    .map((b) => `<tr><td>${b.label}</td><td>${formatINR(b.amount)}</td></tr>`)
    .join("");

  $("budget-card").innerHTML = `
    <h3>💰 Estimated budget (${STYLE[styleKey].label})</h3>
    <div class="budget-total">${formatINR(est.total)}</div>
    <small>${formatINR(est.perPersonPerDay)} per person per day × ${days} days × ${travelers} traveler(s)</small>
    <div class="status ${ok ? "ok" : "over"}">
      ${ok
        ? `✅ Within your budget of ${formatINR(userBudget)} — ${formatINR(diff)} to spare.`
        : `⚠️ Over your budget of ${formatINR(userBudget)} by ${formatINR(-diff)}. Try fewer days, "Budget" style or fewer travelers.`}
    </div>
    <table>${rows}</table>
    <small>Flights/train tickets to the destination are not included.</small>
  `;
}

function renderItinerary(plan) {
  $("itinerary").innerHTML = plan.map((p) => `
    <div class="card day">
      <h4>Day ${p.day}</h4>
      ${p.note ? `<div class="slot"><em>${escapeHTML(p.note)}</em></div>` : ""}
      <div class="slot"><span class="time">🌅 Morning</span> ${escapeHTML(p.morning)}</div>
      <div class="slot"><span class="time">🍴 Lunch</span> ${escapeHTML(p.food)}</div>
      <div class="slot"><span class="time">☀️ Afternoon</span> ${escapeHTML(p.afternoon)}</div>
      <div class="slot"><span class="time">🌙 Evening</span> ${escapeHTML(p.evening)}</div>
    </div>
  `).join("");
}

// ---------- 5. EVENTS ----------
// Fill the suggestions dropdown
$("destination-list").innerHTML = Object.values(DESTINATIONS)
  .map((d) => `<option value="${d.name}"></option>`).join("");

$("planner-form").addEventListener("submit", (event) => {
  event.preventDefault(); // stop page reload

  const destInput = $("destination").value;
  const days      = parseInt($("days").value, 10);
  const travelers = parseInt($("travelers").value, 10);
  const budget    = parseFloat($("budget").value);
  const styleKey  = $("style").value;

  const dest = findDestination(destInput);
  const plan = buildItinerary(dest, days);
  const est  = estimateBudget(dest, days, travelers, styleKey);

  $("result-title").textContent =
    `Your ${days}-day trip to ${dest.name}` +
    (dest.isGeneric ? " (general plan – destination not in our database yet)" : "");

  renderBudget(est, budget, days, travelers, styleKey);
  renderItinerary(plan);

  $("result").classList.remove("hidden");
  $("result").scrollIntoView({ behavior: "smooth" });
});

$("print-btn").addEventListener("click", () => window.print());
