// Add this to your webflow Custom Code after replacing base url and GitHub repo.

(function () {
  // Fast path for production
  let manifestLastModified = null; // Store manifest last modified date
  let availableBranches = []; // Store fetched branches
  let currentBranch = "main"; // Default branch

  const devMode = localStorage.getItem("webflow-dev");
  const isDev = location.search.includes("dev") || devMode === "true";

  if (location.search.includes("dev")) {
    localStorage.setItem("webflow-dev", "true");
  }

  // Configuration - Replace these with your values
  const baseUrl = "https://pub-aa058d2f7a144fc9b37b2046ac64d64a.r2.dev"; // Replace with your R2 URL
  const githubRepo = "Hencove/hencove-website-webflow"; // Replace with your GitHub repo (e.g., "username/repo-name")

  // Get saved branch from localStorage or use default
  if (isDev) {
    const savedBranch = localStorage.getItem("webflow-dev-branch");
    if (savedBranch) {
      currentBranch = savedBranch;
    }
  }

  const env = isDev ? "dev" : "main";

  // Load assets using manifest
  loadAssetsWithManifest(env);

  if (isDev) {
    console.log("🔧 Development mode active");
    fetchGitHubBranches();
    document.addEventListener("DOMContentLoaded", addDevPanel);
  }

  async function fetchGitHubBranches() {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${githubRepo}/branches`,
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const branches = await response.json();
      availableBranches = branches.map((branch) => branch.name).sort();

      console.log("📋 Available branches:", availableBranches);

      // Update branch selector if panel already exists
      updateBranchSelector();
    } catch (error) {
      console.warn("⚠️ Could not fetch GitHub branches:", error.message);
      availableBranches = [currentBranch]; // Fallback to current branch
      updateBranchSelector();
    }
  }

  async function loadAssetsWithManifest(environment) {
    try {
      // Use branch in URL for dev mode, otherwise use environment
      const urlPath = isDev ? currentBranch : environment;

      // Fetch manifest
      const manifestUrl = `${baseUrl}/${urlPath}/manifest.json`;
      const response = await fetch(manifestUrl);

      const manifest = await response.json();

      // Get main entry
      const mainEntry = manifest["main.js"];
      if (!mainEntry) {
        throw new Error("Main entry not found in manifest");
      }

      // Load CSS files (from manifest)
      if (mainEntry.css && mainEntry.css.length > 0) {
        mainEntry.css.forEach((cssFile) => {
          loadAsset("css", `${baseUrl}/${urlPath}/${cssFile}`);
        });
      }

      // Load JS file
      loadAsset("js", `${baseUrl}/${urlPath}/${mainEntry.file}`);

      if (isDev) {
        console.log("📦 Assets loaded via manifest:", {
          branch: currentBranch,
          js: mainEntry.file,
          css: mainEntry.css,
        });

        // Capture last modified date from response headers
        const lastModified = response.headers.get("last-modified");
        if (lastModified) {
          manifestLastModified = new Date(lastModified);
        }

        // Update dev panel with manifest info if it exists
        updateDevPanelManifestInfo();
      }
    } catch (error) {
      console.error("Failed to load manifest, falling back:", error);

      // Fallback to fixed names
      const suffix = isDev ? "" : ".min";
      const version = isDev ? `?v=${Date.now()}` : "";
      const urlPath = isDev ? currentBranch : environment;

      loadAsset("css", `${baseUrl}/${urlPath}/styles${suffix}.css${version}`);
      loadAsset("js", `${baseUrl}/${urlPath}/bundle${suffix}.js${version}`);
    }
  }

  function loadAsset(type, url) {
    if (type === "css") {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    } else {
      const script = document.createElement("script");
      script.src = url;
      script.async = true;
      document.head.appendChild(script);
    }
  }

  function updateDevPanelManifestInfo() {
    const manifestInfo = document.getElementById("manifest-info");
    if (manifestInfo && manifestLastModified) {
      const timeAgo = getTimeAgo(manifestLastModified);
      manifestInfo.innerHTML = `Manifest: ${manifestLastModified.toLocaleTimeString()} (${timeAgo})`;
    }
  }

  function updateBranchSelector() {
    const branchSelect = document.getElementById("branch-select");
    if (branchSelect && availableBranches.length > 0) {
      // Clear existing options
      branchSelect.innerHTML = "";

      // Add branch options
      availableBranches.forEach((branch) => {
        const option = document.createElement("option");
        option.value = branch;
        option.textContent = branch;
        option.selected = branch === currentBranch;
        branchSelect.appendChild(option);
      });

      branchSelect.disabled = false;
    }
  }

  function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${diffHours}h ago`;
  }

  function addDevPanel() {
    const existingPanel = document.getElementById("webflow-dev-panel");
    if (existingPanel) {
      existingPanel.remove();
    }

    const panel = document.createElement("div");
    panel.id = "webflow-dev-panel";
    panel.innerHTML = `
      <div style="position:fixed;top:10px;right:10px;z-index:9999;background:#000;color:#fff;padding:8px 12px;border-radius:4px;font-size:11px;font-family:monospace;box-shadow:0 2px 10px rgba(0,0,0,0.3);min-width:180px;">
        <div style="margin-bottom:8px;color:#0f0;">DEV MODE</div>
        <div style="margin-bottom:8px;">
          <label style="display:block;margin-bottom:4px;color:#ccc;font-size:10px;">Branch:</label>
          <select id="branch-select" style="background:#333;color:#fff;border:1px solid #555;padding:2px 4px;border-radius:2px;width:100%;font-size:10px;" disabled>
            <option>Loading branches...</option>
          </select>
        </div>
        <div id="manifest-info" style="margin-bottom:8px;color:#ccc;font-size:10px;">Loading manifest...</div>
        <div style="display:flex;gap:4px;">
          <button id="dev-exit-btn" style="background:#333;color:#fff;border:none;padding:4px 8px;border-radius:2px;cursor:pointer;flex:1;font-size:10px;">Exit</button>
          <button id="dev-refresh-btn" style="background:#333;color:#fff;border:none;padding:4px 8px;border-radius:2px;cursor:pointer;flex:1;font-size:10px;">Refresh</button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Update branch selector and manifest info if already loaded
    updateBranchSelector();
    updateDevPanelManifestInfo();

    // Branch selector change handler
    document
      .getElementById("branch-select")
      .addEventListener("change", function (e) {
        const selectedBranch = e.target.value;
        if (selectedBranch !== currentBranch) {
          currentBranch = selectedBranch;
          localStorage.setItem("webflow-dev-branch", selectedBranch);
          console.log(`🌿 Switching to branch: ${selectedBranch}`);

          // Reload page to load assets from new branch
          const currentUrl = new URL(window.location);
          currentUrl.searchParams.set("dev", "");
          currentUrl.searchParams.set("t", Date.now());
          window.location.href = currentUrl.toString();
        }
      });

    // Fixed exit button - removes ?dev from URL
    document
      .getElementById("dev-exit-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Exit button clicked");

        try {
          localStorage.removeItem("webflow-dev");
          localStorage.removeItem("webflow-dev-branch");
          console.log("localStorage cleared");

          // Remove ?dev from URL and reload
          const url = new URL(window.location);
          url.searchParams.delete("dev");
          url.searchParams.delete("t");

          window.location.href = url.toString();
        } catch (error) {
          console.error("Error in exit function:", error);
          const cleanUrl = window.location.href
            .replace(/[?&]dev[^&]*/, "")
            .replace(/[?&]t=[^&]*/, "")
            .replace(/[?&]$/, "");
          window.location.href = cleanUrl;
        }
      });

    // Refresh button with cache busting
    document
      .getElementById("dev-refresh-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Refresh button clicked");
        const currentUrl = new URL(window.location);
        currentUrl.searchParams.set("dev", "");
        currentUrl.searchParams.set("t", Date.now());
        window.location.href = currentUrl.toString();
      });
  }
})();
