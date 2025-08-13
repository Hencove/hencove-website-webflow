// Add this to your webflow Custom Code after replacing base url.

(function () {
  // Fast path for production
  let manifestLastModified = null; // Store manifest last modified date

  const devMode = localStorage.getItem("webflow-dev");
  const isDev = location.search.includes("dev") || devMode === "true";

  if (location.search.includes("dev")) {
    localStorage.setItem("webflow-dev", "true");
  }

  const env = isDev ? "staging" : "prod";
  const baseUrl = "https://pub-aa058d2f7a144fc9b37b2046ac64d64a.r2.dev"; // Replace with your R2 URL

  // Load assets using manifest
  loadAssetsWithManifest(env);

  if (isDev) {
    console.log("🔧 Development mode active");
    document.addEventListener("DOMContentLoaded", addDevPanel);
  }

  async function loadAssetsWithManifest(environment) {
    try {
      // Fetch manifest
      const manifestUrl = `${baseUrl}/${environment}/manifest.json`;
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
          loadAsset("css", `${baseUrl}/${environment}/${cssFile}`);
        });
      }

      // Load JS file
      loadAsset("js", `${baseUrl}/${environment}/${mainEntry.file}`);

      if (isDev) {
        console.log("📦 Assets loaded via manifest:", {
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

      loadAsset(
        "css",
        `${baseUrl}/${environment}/styles${suffix}.css${version}`,
      );
      loadAsset("js", `${baseUrl}/${environment}/bundle${suffix}.js${version}`);
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
      <div style="position:fixed;top:10px;right:10px;z-index:9999;background:#000;color:#fff;padding:8px 12px;border-radius:4px;font-size:11px;font-family:monospace;box-shadow:0 2px 10px rgba(0,0,0,0.3);">
        <div style="margin-bottom:8px;color:#0f0;">DEV MODE</div>
        <div id="manifest-info" style="margin-bottom:8px;color:#ccc;font-size:10px;">Loading manifest...</div>
        <button id="dev-exit-btn" style="background:#333;color:#fff;border:none;padding:4px 8px;margin-right:4px;border-radius:2px;cursor:pointer;">Exit</button>
        <button id="dev-refresh-btn" style="background:#333;color:#fff;border:none;padding:4px 8px;border-radius:2px;cursor:pointer;">Refresh</button>
      </div>
    `;

    document.body.appendChild(panel);

    // Update manifest info if already loaded
    updateDevPanelManifestInfo();

    // Fixed exit button - removes ?dev from URL
    document
      .getElementById("dev-exit-btn")
      .addEventListener("click", function (e) {
        e.preventDefault();
        console.log("Exit button clicked");

        try {
          localStorage.removeItem("webflow-dev");
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
