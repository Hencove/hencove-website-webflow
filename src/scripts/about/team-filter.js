// Deselect all radio buttons if the currently checked button is clicked again

function deselectFilterRadio() {
  const filterGrid = document.querySelector(".about-team_filter-grid");
  if (!filterGrid) return;

  const radioButtons = filterGrid.querySelectorAll(".button.is-team-filter");
  let currentlySelected = null;

  radioButtons.forEach((radio) => {
    radio.addEventListener("click", function (e) {
      // If this radio is already the selected one, deselect all
      if (currentlySelected === this) {
        radioButtons.forEach((r) => {
          if (r.type === "radio") {
            r.checked = false;
          }
        });
        currentlySelected = null;
      } else {
        currentlySelected = this;
      }
    });
  });
}

// Initialize when DOM is ready or immediately if already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", deselectFilterRadio);
} else {
  deselectFilterRadio();
}
