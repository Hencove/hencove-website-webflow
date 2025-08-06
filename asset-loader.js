// Add this to your webflow Custom Code after replacing base url.

(function () {
  // Fast path for production

  const devMode = localStorage.getItem("webflow-dev");
  const isDev = location.search.includes("dev") || devMode === "true";

  if (location.search.includes("dev")) {
    localStorage.setItem("webflow-dev", "true");
  }

  const env = isDev ? "staging" : "prod";
  const baseUrl = "https://YOUR-BUCKET-NAME.r2.dev"; // Replace with your R2 URL

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
      const manifest = await fetch(manifestUrl).then((r) => r.json());

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

  function addDevPanel() {
    const panel = document.createElement("div");
    panel.innerHTML = `
	  <div style="position:fixed;top:10px;right:10px;z-index:9999;background:#000;color:#fff;padding:8px 12px;border-radius:4px;font-size:11px;font-family:monospace;box-shadow:0 2px 10px rgba(0,0,0,0.3);">
		<div style="margin-bottom:8px;color:#0f0;">DEV MODE</div>
		<button onclick="localStorage.removeItem('webflow-dev');location.reload()" style="background:#333;color:#fff;border:none;padding:4px 8px;margin-right:4px;border-radius:2px;cursor:pointer;">Exit</button>
		<button onclick="location.search='?dev&t='+Date.now()" style="background:#333;color:#fff;border:none;padding:4px 8px;border-radius:2px;cursor:pointer;">Refresh</button>
	  </div>
	`;
    document.body.appendChild(panel);
  }
})();
