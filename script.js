// NOMOR WHATSAPP PER BRAND — format internasional tanpa +, spasi, atau tanda hubung.
const WHATSAPP_NUMBERS = {
  studio: "6285800007878",   // Semesta Home Studio: 085800007878
  pictures: "6282324714989", // Semesta Pictures: 082324714989
  bawana: "6285973272829"    // Bawana Project: 085973272829
};

// Tentukan brand dari halaman aktif terlebih dahulu.
function getBrandFromPage() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("home-studio")) return "studio";
  if (path.includes("semesta-pictures") || path.includes("pictures")) return "pictures";
  if (path.includes("bawana-project") || path.includes("bawana")) return "bawana";
  return null;
}

// Jika formulir berada di halaman utama, pilih brand berdasarkan layanan.
function getBrandFromService(service) {
  const value = String(service || "").toLowerCase();
  if (/live streaming|pengajian|zoom|rapat online|liputan event|dokumentasi acara|event|wayang/.test(value)) return "bawana";
  if (/wedding|prewedding|engagement|akad|resepsi|videography|fotografi pernikahan/.test(value)) return "pictures";
  if (/wisuda|studio|keluarga|personal|maternity|birthday|produk/.test(value)) return "studio";
  if (/photo \+ video/.test(value)) return "pictures";
  return null;
}

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
    menuButton.textContent = isOpen ? "✕" : "☰";
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Buka menu");
      menuButton.textContent = "☰";
    });
  });
}

document.querySelectorAll("[data-package]").forEach(button => {
  button.addEventListener("click", () => {
    const serviceSelect = document.querySelector('select[name="layanan"]');
    if (!serviceSelect) return;

    const packageName = button.dataset.package;
    const matchingOption = [...serviceSelect.options].find(option => option.text.includes(packageName));
    if (matchingOption) serviceSelect.value = matchingOption.value;
    else if (packageName === "Personal") serviceSelect.value = "Wisuda";
    else serviceSelect.value = "Photo + Video";
  });
});

const bookingForm = document.getElementById("booking-form");
if (bookingForm) {
  bookingForm.addEventListener("submit", event => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const service = form.get("layanan") || "";
    const brand = getBrandFromPage() || getBrandFromService(service) || form.get("brand");
    const number = WHATSAPP_NUMBERS[brand];

    if (!number) {
      alert("Layanan belum dapat ditentukan brand-nya. Silakan pilih layanan yang sesuai atau hubungi admin Semesta Group.");
      return;
    }

    const brandNames = {
      studio: "Semesta Home Studio",
      pictures: "Semesta Pictures",
      bawana: "Bawana Project"
    };

    const message = [
      "Halo " + brandNames[brand] + ", saya ingin bertanya tentang booking.",
      "",
      "Nama: " + (form.get("nama") || "-"),
      "Brand: " + brandNames[brand],
      "Layanan: " + (service || "-"),
      "Tanggal acara: " + (form.get("tanggal") || "-"),
      "Lokasi / catatan: " + (form.get("catatan") || "-")
    ].join("\n");

    window.open("https://wa.me/" + number + "?text=" + encodeURIComponent(message), "_blank", "noopener");
  });
}

const yearElement = document.getElementById("year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

// Slider ulasan: bergerak otomatis ke kiri, dengan tombol manual.
(() => {
  const slider = document.querySelector(".review-slider");
  const track = document.querySelector(".review-track");
  const cards = [...document.querySelectorAll(".review-card")];
  const dots = [...document.querySelectorAll(".review-dot")];
  const prev = document.querySelector(".review-prev");
  const next = document.querySelector(".review-next");

  if (!slider || !track || cards.length < 2) return;

  let current = 0;
  let timer;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function visibleCards() {
    if (window.matchMedia("(max-width: 560px)").matches) return 1;
    if (window.matchMedia("(max-width: 850px)").matches) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, cards.length - visibleCards());
  }

  function updateSlider() {
    current = Math.min(current, maxIndex());
    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;

    dots.forEach((dot, index) => {
      const active = index === current;
      dot.classList.toggle("is-active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  function goNext() {
    current = current >= maxIndex() ? 0 : current + 1;
    updateSlider();
  }

  function goPrev() {
    current = current <= 0 ? maxIndex() : current - 1;
    updateSlider();
  }

  function startAuto() {
    clearInterval(timer);
    if (!reducedMotion && maxIndex() > 0) timer = setInterval(goNext, 4500);
  }

  next?.addEventListener("click", () => { goNext(); startAuto(); });
  prev?.addEventListener("click", () => { goPrev(); startAuto(); });
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      current = Math.min(index, maxIndex());
      updateSlider();
      startAuto();
    });
  });

  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("mouseleave", startAuto);
  slider.addEventListener("focusin", () => clearInterval(timer));
  slider.addEventListener("focusout", startAuto);
  window.addEventListener("resize", updateSlider);

  updateSlider();
  startAuto();
})();
