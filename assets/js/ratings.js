// Ratings & Reviews widget
// - Non-destructive: uses window.appProducts if available
// - Works offline with local temp data; if Firebase is ready, writes to 'reviews' collection

import { db } from "./firebase-init.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const hasFirestore = !!db;

// DOM refs
const elAvgNum   = document.getElementById("rwAvgNum");
const elAvgStars = document.getElementById("rwAvgStars");
const elTotal    = document.getElementById("rwTotal");
const elBars     = document.getElementById("rwBars");
const elList     = document.getElementById("rwList");
const elLoadMore = document.getElementById("rwLoadMore");

const elFilterStars   = document.getElementById("rwFilterStars");
const elFilterProduct = document.getElementById("rwFilterProduct");
const elSort          = document.getElementById("rwSort");

const elForm      = document.getElementById("rwForm");
const elName      = document.getElementById("rwName");
const elProduct   = document.getElementById("rwProduct");
const elStarInput = document.getElementById("rwStarInput");
const elStarFeedback = document.getElementById("rwStarFeedback");
const elText      = document.getElementById("rwText");

// Products source (from order-modal.js) or fallback
const products = (window.appProducts && Array.isArray(window.appProducts) && window.appProducts.length)
  ? window.appProducts
  : [
      { id: "flavomix-1", name: "Flavo Mix (1 box)" },
      { id: "flavomix-3plus1", name: "Flavo Mix (3 boxes + 1 Free)" },
      { id: "flavomix-5plus1", name: "Flavo Mix (5 boxes + 1 Free)" },
    ];

// Seed dropdowns
function seedProducts() {
  // Filter dropdown
  products.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    elFilterProduct.appendChild(opt);
  });
  // Form dropdown
  products.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name;
    elProduct.appendChild(opt);
  });
}
seedProducts();

// Local in-memory store (also used when Firestore unavailable)
let REVIEWS = []; // {id,name,productId,productName,stars,text,createdAt}

// Optional: initial few samples so UI doesn't look empty (remove if you want zero)
REVIEWS = [
  { id:"r1", name:"Maria S.", productId:"flavomix-1", productName:"Flavo Mix (1 box)", stars:5, text:"Solid energy boost!", createdAt:new Date(Date.now()-86400000*1) },
  { id:"r2", name:"Juan D.", productId:"flavomix-3plus1", productName:"Flavo Mix (3 boxes + 1 Free)", stars:4, text:"Mas tipid pag bundle.", createdAt:new Date(Date.now()-86400000*3) },
  { id:"r3", name:"Karen V.", productId:"flavomix-5plus1", productName:"Flavo Mix (5 boxes + 1 Free)", stars:5, text:"Nag-improve ang stamina ko.", createdAt:new Date(Date.now()-86400000*10) },
];

// If you want to read from Firestore on load (optional, light read)
async function tryFetchFromFirestore() {
  if (!hasFirestore) return;
  try {
    const q = query(collection(db, "reviews"), orderBy("timestamp", "desc"), limit(30));
    const snap = await getDocs(q);
    const fetched = [];
    snap.forEach(doc => {
      const d = doc.data();
      fetched.push({
        id: doc.id,
        name: d.name || "Anonymous",
        productId: d.productId,
        productName: (products.find(p=>p.id===d.productId)?.name) || d.productId || "Product",
        stars: Number(d.stars) || 0,
        text: d.text || "",
        createdAt: d.timestamp?.toDate?.() || new Date()
      });
    });
    // Merge at the front (Firestore newest first)
    REVIEWS = [...fetched, ...REVIEWS];
  } catch(e) {
    console.warn("Reviews read skipped:", e.message);
  }
}
tryFetchFromFirestore().then(renderAll);

// Helpers
function starsToHtml(n) {
  const filled = "★".repeat(n);
  const empty  = "☆".repeat(5-n);
  return `<span>${filled}${empty}</span>`;
}

function computeSummary(list) {
  const total = list.length;
  const counts = {5:0,4:0,3:0,2:0,1:0};
  let sum = 0;
  list.forEach(r => { sum += r.stars; counts[r.stars] = (counts[r.stars]||0)+1; });
  const avg = total ? (sum/total) : 0;
  return { total, avg, counts };
}

// Renderers
function renderSummary(list) {
  const { total, avg, counts } = computeSummary(list);
  elTotal.textContent = total;
  elAvgNum.textContent = avg.toFixed(1);
  elAvgStars.innerHTML = starsToHtml(Math.round(avg));

  const order = [5,4,3,2,1];
  elBars.innerHTML = "";
  order.forEach(star => {
    const bar = document.createElement("div");
    bar.className = "rw-bar";
    const pct = total ? Math.round((counts[star] / total) * 100) : 0;
    bar.innerHTML = `
      <div class="label">${star} ★</div>
      <div class="track"><div class="fill" style="width:${pct}%;"></div></div>
      <div class="count">${counts[star] || 0}</div>
    `;
    elBars.appendChild(bar);
  });
}

function renderList(list, append=false) {
  if (!append) elList.innerHTML = "";
  const frag = document.createDocumentFragment();
  list.forEach(r => {
    const col = document.createElement("div");
    col.className = "col-12";
    col.innerHTML = `
      <div class="rw-item">
        <div class="rw-item-header">
          <div class="rw-item-stars">${starsToHtml(r.stars)}</div>
          <div class="rw-item-name">${escapeHtml(r.name || "Anonymous")}</div>
          <div class="rw-item-product"><i class="bi bi-box-seam"></i> ${escapeHtml(r.productName || "")}</div>
        </div>
        <div class="rw-item-text">${escapeHtml(r.text)}</div>
      </div>
    `;
    frag.appendChild(col);
  });
  elList.appendChild(frag);
}

// Simple pagination in-memory
let PAGE = 1;
const PER_PAGE = 6;

function getFilteredSorted() {
  const byStars = elFilterStars.value;
  const byProd  = elFilterProduct.value;
  const sortVal = elSort.value;

  let arr = [...REVIEWS];

  // filter stars
  if (byStars !== "all") {
    const n = Number(byStars);
    arr = arr.filter(r => r.stars >= n);
  }
  // filter product
  if (byProd !== "all") {
    arr = arr.filter(r => r.productId === byProd);
  }
  // sort
  arr.sort((a,b) => {
    if (sortVal === "highest") return b.stars - a.stars || b.createdAt - a.createdAt;
    if (sortVal === "lowest")  return a.stars - b.stars || b.createdAt - a.createdAt;
    // newest
    return b.createdAt - a.createdAt;
  });

  return arr;
}

function renderAll() {
  const all = getFilteredSorted();
  renderSummary(all);

  PAGE = 1;
  const slice = all.slice(0, PER_PAGE);
  renderList(slice, false);

  elLoadMore.classList.toggle("d-none", all.length <= PER_PAGE);
}

// Events (filters/sort)
[elFilterStars, elFilterProduct, elSort].forEach(el => {
  el.addEventListener("change", renderAll);
});

elLoadMore.addEventListener("click", () => {
  const all = getFilteredSorted();
  PAGE += 1;
  const upto = PER_PAGE * PAGE;
  const slice = all.slice(0, upto);
  renderList(slice, false); // re-render whole slice for simplicity
  if (slice.length >= all.length) elLoadMore.classList.add("d-none");
});

// Star input
let starValue = 0;
elStarInput.querySelectorAll(".star").forEach(btn => {
  btn.addEventListener("click", () => {
    starValue = Number(btn.dataset.star);
    elStarInput.dataset.value = String(starValue);
    highlightStars(starValue);
    elStarFeedback.style.display = "none";
  });
});

function highlightStars(n){
  elStarInput.querySelectorAll(".star").forEach(btn => {
    const v = Number(btn.dataset.star);
    btn.classList.toggle("active", v <= n);
  });
}

// Form submit
elForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // basic validation
  if (!elProduct.value) {
    elProduct.classList.add("is-invalid");
    return;
  } else {
    elProduct.classList.remove("is-invalid");
  }
  if (!starValue || starValue < 1 || starValue > 5) {
    elStarFeedback.style.display = "block";
    return;
  }
  if (!elText.value.trim()) {
    elText.classList.add("is-invalid");
    return;
  } else {
    elText.classList.remove("is-invalid");
  }

  const productId = elProduct.value;
  const productName = (products.find(p => p.id === productId)?.name) || productId;
  const review = {
    id: "local-" + Date.now(),
    name: sanitizeName(elName.value || "Anonymous"),
    productId,
    productName,
    stars: starValue,
    text: sanitizeReview(elText.value.trim()),
    createdAt: new Date()
  };

  // Optimistic add (UI agad)
  REVIEWS.unshift(review);
  renderAll();

  // Try Firestore write
  if (hasFirestore) {
    try {
      await addDoc(collection(db, "reviews"), {
        name: review.name,
        productId: review.productId,
        stars: review.stars,
        text: review.text,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.warn("Failed to write review to Firestore:", err?.message || err);
    }
  }

  // Reset form
  elForm.reset();
  starValue = 0;
  highlightStars(0);
});

// Utils
function escapeHtml(s="") {
  return s.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function sanitizeName(s="") {
  return s.replace(/[^a-zA-Z0-9 .'-]/g, "").slice(0, 40);
}
function sanitizeReview(s="") {
  return s.replace(/\s+/g, " ").trim().slice(0, 1200);
}
