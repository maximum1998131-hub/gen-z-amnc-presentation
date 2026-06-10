const slides = Array.from(document.querySelectorAll(".slide"));
const progressBar = document.querySelector(".progress-bar");
const deck = document.querySelector(".deck");

let currentSlide = 0;
let currentReveal = 0;

function prepareReveals(slide) {
  const reveals = getOrderedReveals(slide);

  reveals.forEach((item, index) => {
    const revealOrder = item.dataset.revealOrder ?? index;
    item.style.setProperty("--reveal-order", revealOrder);
    item.classList.remove("is-visible");
  });

  return reveals.sort((first, second) => {
    const firstOrder = Number(first.dataset.revealOrder ?? reveals.indexOf(first));
    const secondOrder = Number(second.dataset.revealOrder ?? reveals.indexOf(second));

    return firstOrder - secondOrder;
  });
}

function getOrderedReveals(slide) {
  const reveals = Array.from(slide.querySelectorAll(".reveal"));

  return reveals.sort((first, second) => {
    const firstOrder = Number(first.dataset.revealOrder ?? reveals.indexOf(first));
    const secondOrder = Number(second.dataset.revealOrder ?? reveals.indexOf(second));

    return firstOrder - secondOrder;
  });
}

function updateProgress() {
  const progress = ((currentSlide + 1) / slides.length) * 100;
  progressBar.style.width = `${progress}%`;
}

function showSlide(index, direction = 1) {
  currentSlide = Math.max(0, Math.min(index, slides.length - 1));
  currentReveal = 0;

  slides.forEach((slide, slideIndex) => {
    slide.classList.remove("is-active", "is-previous", "reveal-all");

    if (slideIndex === currentSlide) {
      slide.classList.add("is-active");
      slide.setAttribute("aria-hidden", "false");
    } else {
      slide.setAttribute("aria-hidden", "true");
    }

    if (slideIndex < currentSlide || direction < 0) {
      slide.classList.add("is-previous");
    }

    prepareReveals(slide);
  });

  updateProgress();
  window.setTimeout(() => revealNext(true), 90);
}

function revealNext(isInitial = false) {
  const activeSlide = slides[currentSlide];
  const reveals = getOrderedReveals(activeSlide).filter((item) => !item.classList.contains("is-visible"));

  if (!reveals.length) {
    return false;
  }

  if (reveals[0]) {
    reveals[0].classList.add("is-visible");
    currentReveal += 1;
    return true;
  }

  return isInitial;
}

function revealAll() {
  const activeSlide = slides[currentSlide];
  const reveals = getOrderedReveals(activeSlide);

  reveals.forEach((item) => item.classList.add("is-visible"));
  currentReveal = reveals.length;
}

function next() {
  if (revealNext()) {
    return;
  }

  if (currentSlide < slides.length - 1) {
    showSlide(currentSlide + 1, 1);
  }
}

function previous() {
  if (currentSlide > 0) {
    showSlide(currentSlide - 1, -1);
    window.setTimeout(revealAll, 120);
  }
}

function first() {
  showSlide(0, -1);
}

function last() {
  showSlide(slides.length - 1, 1);
  window.setTimeout(revealAll, 120);
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
    return;
  }

  await document.exitFullscreen();
}

document.addEventListener("keydown", (event) => {
  const handledKeys = ["ArrowRight", " ", "ArrowLeft", "Home", "End", "f", "F"];

  if (!handledKeys.includes(event.key)) {
    return;
  }

  event.preventDefault();

  switch (event.key) {
    case "ArrowRight":
    case " ":
      next();
      break;
    case "ArrowLeft":
      previous();
      break;
    case "Home":
      first();
      break;
    case "End":
      last();
      break;
    case "f":
    case "F":
      toggleFullscreen().catch(() => {});
      break;
    default:
      break;
  }
});

deck.addEventListener("click", next);
deck.addEventListener("dblclick", () => {
  toggleFullscreen().catch(() => {});
});

showSlide(0);
