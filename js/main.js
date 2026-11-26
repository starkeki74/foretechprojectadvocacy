// HATID interactions: mobile navigation, illustrative commute simulator,
// user-entered fare calculator, and clickable commuter-friendly stop hotspots.

const menuBtn = document.getElementById("menuBtn");
const navlinks = document.getElementById("navlinks");

if (menuBtn && navlinks) {
  menuBtn.addEventListener("click", () => {
    const isOpen = navlinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(isOpen));
    menuBtn.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  navlinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navlinks.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
      menuBtn.setAttribute("aria-label", "Open navigation");
    });
  });
}

// Illustrative scenario only. It does not predict real schedules or vehicle availability.
const scenarios = {
  student: {
    16: ["A typical afternoon commute.", "In this fictional example, several common options may still be running. Waiting time and transfers can still vary by route.", "LOWER", "ROUTE CHECK"],
    18: ["The evening commute begins.", "Classes have ended, and the student may need to consider the wait for the next ride, the last-trip schedule, and the cost of alternatives.", "MODERATE", "WAIT + ROUTE"],
    19: ["Fewer choices may remain.", "In this fictional scenario, some routes may have reduced service. Planning ahead and checking local schedules becomes more important.", "MODERATE", "LAST TRIP"],
    20: ["Getting home may take more planning.", "The student may face a longer wait or need another safe, affordable option. Actual service depends on the location and operator.", "HIGHER", "BACKUP PLAN"],
    21: ["The trip needs a backup plan.", "This scenario highlights why communities should understand late-evening travel needs and provide safe, reliable options.", "HIGHER", "SAFE WAIT + BACKUP"]
  },
  worker: {
    16: ["The shift is ending before the evening peak.", "The worker may have several route choices, depending on the workplace and service area.", "LOWER", "ROUTE CHECK"],
    18: ["The shift ends around 6 PM.", "The worker may experience queues, traffic, and uncertain waiting times while trying to get home.", "MODERATE", "WAIT + ROUTE"],
    19: ["A later shift can mean fewer options.", "This fictional example asks whether the worker's route still has service and whether transfers are available.", "MODERATE", "LAST TRIP"],
    20: ["The commute may become less predictable.", "A worker may need to plan a safe waiting place and confirm the last trips for each part of the journey.", "HIGHER", "BACKUP PLAN"],
    21: ["A dependable way home matters.", "This scenario highlights the need to consider workers whose schedules extend beyond typical commuting hours.", "HIGHER", "SAFE WAIT + BACKUP"]
  },
  provincial: {
    16: ["Some options may still be operating.", "The commuter's choices depend on local routes, distance between settlements, and service frequency.", "LOWER", "ROUTE CHECK"],
    18: ["The 6 PM gap becomes visible.", "In a smaller community, fewer routes or vehicles may mean longer waits. This is an illustrative scenario, not a claim about every province.", "MODERATE", "WAIT + ROUTE"],
    19: ["The next ride may be uncertain.", "The commuter may need to check local operating hours or arrange a safe alternative in advance.", "MODERATE", "LAST TRIP"],
    20: ["Distance can make alternatives difficult.", "When routes are limited, the absence of a vehicle can have a greater effect on the whole journey.", "HIGHER", "BACKUP PLAN"],
    21: ["Access after dark deserves attention.", "Local transport planning should consider evening travel needs, safe waiting areas, and realistic service coverage.", "HIGHER", "SAFE WAIT + BACKUP"]
  }
};

function updateScenario() {
  const time = document.getElementById("commuteTime")?.value;
  const type = document.getElementById("commuterType")?.value;
  const result = document.getElementById("simResult");
  const planningLevel = document.getElementById("planningLevel");
  const planningFocus = document.getElementById("planningFocus");
  if (!time || !type || !result || !scenarios[type]?.[time]) return;

  const [title, description, level, focus] = scenarios[type][time];
  result.replaceChildren();

  const heading = document.createElement("strong");
  heading.textContent = title;
  const detail = document.createElement("span");
  detail.textContent = description;
  result.append(heading, detail);

  if (planningLevel) planningLevel.textContent = level;
  if (planningFocus) planningFocus.textContent = focus;
}

document.getElementById("commuteTime")?.addEventListener("change", updateScenario);
document.getElementById("commuterType")?.addEventListener("change", updateScenario);

// Fare calculator: only uses the fare and travel routine entered by the visitor.
const fareInput = document.getElementById("fare");
const ridesInput = document.getElementById("rides");
const daysInput = document.getElementById("days");
const dailyOutput = document.getElementById("dailyTotal");
const weeklyOutput = document.getElementById("weeklyTotal");
const monthlyOutput = document.getElementById("monthlyTotal");
const calcMessage = document.getElementById("calcMessage");

function peso(amount) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function updateCalc() {
  if (!fareInput || !ridesInput || !daysInput || !dailyOutput || !weeklyOutput || !monthlyOutput) return;

  const fareText = fareInput.value.trim();
  const fare = Number(fareText);
  const rides = Number(ridesInput.value);
  const days = Number(daysInput.value);

  fareInput.setAttribute("aria-invalid", "false");
  ridesInput.setAttribute("aria-invalid", "false");
  daysInput.setAttribute("aria-invalid", "false");

  if (fareText === "" || !Number.isFinite(fare) || fare < 0) {
    dailyOutput.textContent = "—";
    weeklyOutput.textContent = "—";
    monthlyOutput.textContent = "—";
    fareInput.setAttribute("aria-invalid", "true");
    if (calcMessage) {
      calcMessage.textContent = "Enter a valid one-way fare of zero or more pesos.";
      calcMessage.classList.add("calc-error");
    }
    return;
  }

  if (!Number.isInteger(rides) || rides < 1 || !Number.isInteger(days) || days < 1 || days > 7) {
    if (!Number.isInteger(rides) || rides < 1) ridesInput.setAttribute("aria-invalid", "true");
    if (!Number.isInteger(days) || days < 1 || days > 7) daysInput.setAttribute("aria-invalid", "true");
    if (calcMessage) {
      calcMessage.textContent = "Choose at least one paid ride per day and between 1 and 7 commuting days per week.";
      calcMessage.classList.add("calc-error");
    }
    return;
  }

  const daily = fare * rides;
  const weekly = daily * days;
  const monthly = weekly * (52 / 12);

  dailyOutput.textContent = peso(daily);
  weeklyOutput.textContent = peso(weekly);
  monthlyOutput.textContent = peso(monthly);

  if (calcMessage) {
    calcMessage.textContent = `Estimate based only on your inputs: ${peso(fare)} × ${rides} paid rides/day × ${days} days/week. Actual spending may vary.`;
    calcMessage.classList.remove("calc-error");
  }
}

["input", "change"].forEach(eventName => {
  fareInput?.addEventListener(eventName, updateCalc);
  ridesInput?.addEventListener(eventName, updateCalc);
  daysInput?.addEventListener(eventName, updateCalc);
});

const clearCalc = document.getElementById("clearCalc");
if (clearCalc) {
  clearCalc.addEventListener("click", () => {
    if (fareInput) fareInput.value = "";
    if (ridesInput) ridesInput.value = "2";
    if (daysInput) daysInput.value = "5";
    updateCalc();
    fareInput?.focus();
  });
}

// Interactive hotspot descriptions for the sample commuter-friendly street scene.
const spotInfo = {
  lighting: ["Poor lighting", "A dark waiting area can make commuters feel unsafe and make it harder for drivers to see people waiting. Better streetlights and visible stops can improve the waiting environment."],
  information: ["Unclear route information", "Without visible route names, destinations, fare details, or operating hours, commuters may struggle to know which vehicle to take or whether a service is still running."],
  access: ["Inaccessible paths", "Broken sidewalks, high curbs, blocked walkways, and missing ramps can create barriers for wheelchair users, older adults, and people with limited mobility."],
  shelter: ["No proper waiting shelter", "Without shade, seating, or protection from rain, commuters may have to wait in uncomfortable or exposed areas. A well-designed stop should serve different users."]
};

document.querySelectorAll(".hotspot").forEach(button => {
  button.addEventListener("click", () => {
    const info = spotInfo[button.dataset.spot];
    const panel = document.getElementById("hotspotInfo");
    if (!info || !panel) return;

    panel.replaceChildren();
    const eyebrow = document.createElement("div");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "COMMUTER BARRIER";
    const heading = document.createElement("h3");
    heading.textContent = info[0];
    const paragraph = document.createElement("p");
    paragraph.textContent = info[1];
    panel.append(eyebrow, heading, paragraph);

    document.querySelectorAll(".hotspot").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
  });
});

// Highlight the current page in the shared navigation.
(() => {
  const current = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".navlinks a").forEach(link => {
    const target = (link.getAttribute("href") || "").split("/").pop().toLowerCase();
    if (target === current) link.classList.add("active");
  });
})();
