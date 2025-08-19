import { debounce } from "../_utilities";

const equalizeCardHeights = () => {
  const container = document.querySelector(".section_about-cards");
  if (!container) return;

  const cards = container.querySelectorAll(".about-cards_card");
  if (!cards.length) return;

  // Reset min-height to get natural heights
  cards.forEach((card) => (card.style.minHeight = ""));

  // Find tallest card
  const maxHeight = Math.max(
    ...Array.from(cards).map((card) => card.offsetHeight),
  );

  // Apply min-height to all cards
  cards.forEach((card) => (card.style.minHeight = `${maxHeight}px`));
};

// Check if DOM is ready, if not wait for it
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    equalizeCardHeights();
    window.addEventListener("resize", debounce(equalizeCardHeights, 250));
  });
} else {
  equalizeCardHeights();
  window.addEventListener("resize", debounce(equalizeCardHeights, 250));
}
