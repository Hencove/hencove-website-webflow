// 1. Define the map of trigger IDs to container IDs.
const our_work_map = [
  {
    linkTriggerID: "our-work-b2b-trigger",
    containerID: "our-work-b2b",
    displayName: "B2B",
  },
  {
    linkTriggerID: "our-work-branding-trigger",
    containerID: "our-work-branding",
    displayName: "Branding",
  },
  {
    linkTriggerID: "our-work-healthcare-trigger",
    containerID: "our-work-healthcare",
    displayName: "Healthcare",
  },
  {
    linkTriggerID: "our-work-web-trigger",
    containerID: "our-work-web",
    displayName: "Web",
  },
  {
    linkTriggerID: "our-work-finance-trigger",
    containerID: "our-work-finance",
    displayName: "Finance",
  },
  {
    linkTriggerID: "our-work-creative-trigger",
    containerID: "our-work-creative",
    displayName: "Creative",
  },
  {
    linkTriggerID: "our-work-technology-trigger",
    containerID: "our-work-technology",
    displayName: "Technology",
  },
  {
    linkTriggerID: "our-work-content-trigger",
    containerID: "our-work-content",
    displayName: "Content",
  },
  {
    linkTriggerID: "our-work-strategy-trigger",
    containerID: "our-work-strategy",
    displayName: "Strategy",
  },
  {
    linkTriggerID: "our-work-campaign-trigger",
    containerID: "our-work-campaign",
    displayName: "Campaign",
  },
];

// Main initialization function
function _initOurWorkCategoryFilter() {
  console.log("Category filter script loaded");

  const ourWorkFilterContainer = document.getElementById(
    "our-work-filter-list",
  );
  const filterTrigger = document.getElementById("our-work-category-link");

  // If this page doesn't include the filter UI, safely exit.
  if (!ourWorkFilterContainer || !filterTrigger) {
    return;
  }

  filterTrigger.addEventListener("click", function (event) {
    console.log("Filter trigger clicked");
    event.preventDefault();
    ourWorkFilterContainer.classList.toggle("is-visible");
  });

  // 2. Add click event listeners to each link trigger element.
  our_work_map.forEach((item) => {
    const triggerElement = document.getElementById(item.linkTriggerID);

    if (triggerElement) {
      triggerElement.addEventListener("click", function (event) {
        event.preventDefault(); // Stop the link from navigating
        handleTabClick(item.linkTriggerID, filterTrigger);
        ourWorkFilterContainer.classList.toggle("is-visible");
      });
    }
  });

  // 3. Set the initial state on page load (shows the first item).
  if (our_work_map.length > 0) {
    handleTabClick(our_work_map[0].linkTriggerID, filterTrigger);
  }
}

// Function to update the active tab and content
function handleTabClick(clickedTriggerID, filterTrigger) {
  our_work_map.forEach((item) => {
    const triggerEl = document.getElementById(item.linkTriggerID);
    const containerEl = document.getElementById(item.containerID);

    // Skip if any element is not found
    if (!triggerEl || !containerEl) {
      console.warn(
        `Element not found for: ${item.linkTriggerID} or ${item.containerID}`,
      );
      return;
    }

    // Show the target content and activate the link if it's the one clicked
    if (item.linkTriggerID === clickedTriggerID) {
      containerEl.style.display = "block";
      triggerEl.classList.add("active");
      filterTrigger.innerText = item.displayName;
    }
    // Otherwise, hide the content and deactivate the link
    else {
      containerEl.style.display = "none";
      triggerEl.classList.remove("active");
    }
  });
}

// Check if DOM is ready, if not wait for it
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    _initOurWorkCategoryFilter();
  });
} else {
  _initOurWorkCategoryFilter();
}
