import { debounce } from "../_utilities";
import { convertRemToPixels } from "../_utilities";
import { SVG } from "@svgdotjs/svg.js";
import $ from "jquery";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

(function (document, window, $) {
  // Debug flag - set to true to enable console logs
  const DEBUG = true;

  const log = (...args) => {
    if (DEBUG) console.log(...args);
  };

  const warn = (...args) => {
    if (DEBUG) console.warn(...args);
  };

  let HencurveAnchors = {
    containers: undefined,
    isMobile: false, // Track media query state
    isResizing: false, // FIX: Add resize protection flag
    animatedContainers: new Set(), // FIX: Track which containers have been animated

    _init: function () {
      // Bail early if mobile
      if (this.isMobile) {
        return;
      }

      this.containers = document.querySelectorAll(
        ".hencurve-anchors-container",
      );

      if (!this.containers.length) {
        return;
      }

      // FIX: Add timing for proper initial positioning
      requestAnimationFrame(() => {
        this.containers.forEach((container, index) => {
          log(`📋 Processing container ${index + 1}:`, container);
          this._drawSVG(container);
        });
      });
    },

    _drawSVG: function (container) {
      log("🎨 _drawSVG called for container:", container);

      // FIX: Add random class to see if SVG is being recreated
      const randomClass = `svg-${Math.floor(Math.random() * 1000)}`;

      let svgInstance = SVG()
        .addTo(container)
        .size("100%", "100%")
        .addClass("hencurve-anchors-svg")
        .addClass(randomClass); // Add random class for debugging

      log("✅ SVG instance created with class:", randomClass, svgInstance);
      this._findAnchors(container, svgInstance);
    },

    _findAnchors: function (container, svgInstance) {
      log("🔍 _findAnchors called");

      // Find anchors inside the container
      const anchors = container.querySelectorAll(".hencurve-anchor");
      log("⚓ Found anchors:", anchors.length);

      // Bail early if less than two anchors
      if (anchors.length < 2) {
        warn("❌ Not enough anchors in container:", container);
        return;
      }

      // FIX: Force layout recalculation for accurate positioning
      container.offsetHeight;
      window.getComputedStyle(container).height;

      // Get positions of anchors relative to the container
      const firstAnchor = anchors[0].getBoundingClientRect();
      const secondAnchor = anchors[1].getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const firstAnchorPos = {
        x: firstAnchor.left - containerRect.left,
        y: firstAnchor.top - containerRect.top + firstAnchor.height,
        width: firstAnchor.width,
      };

      const secondAnchorPos = {
        x: secondAnchor.left - containerRect.left,
        y: secondAnchor.top - containerRect.top,
        width: secondAnchor.width,
      };

      log("📍 Calculated positions:", {
        first: firstAnchorPos,
        second: secondAnchorPos,
      });

      // Get tailwind color from first Anchor
      const curveColor = $(anchors[0]).css("color");
      log("🎨 Curve color:", curveColor);

      // Pass positions to the path drawing method
      this._drawPath(
        container,
        svgInstance,
        firstAnchorPos,
        secondAnchorPos,
        curveColor,
      );
    },

    _drawPath: function (
      container,
      svgInstance,
      firstAnchor,
      secondAnchor,
      curveColor,
    ) {
      let siteMargin = convertRemToPixels("2.25rem");
      const svgHeight = $(container).height();
      let strokeWidth = convertRemToPixels("0.5rem");

      // Anchor positions
      const startX = siteMargin;
      // FIX: Use container width instead of window width for accurate positioning
      const containerWidth = $(container).width();
      const endX = containerWidth - siteMargin;

      const startY =
        firstAnchor.y > secondAnchor.y ? svgHeight - strokeWidth : strokeWidth;
      const endY = firstAnchor.y > secondAnchor.y ? 0 : svgHeight;

      const firstAnchorEndX = firstAnchor.x + firstAnchor.width;
      const firstAnchorEndY = firstAnchor.y;

      const secondAnchorStartX = secondAnchor.x;
      let secondAnchorStartY = secondAnchor.y;

      secondAnchorStartY =
        firstAnchor.y > secondAnchor.y
          ? endY + strokeWidth
          : endY - strokeWidth;

      const totalSpace = secondAnchorStartX - firstAnchorEndX;
      const arcSpace = totalSpace / 2;

      if (arcSpace < 0) {
        warn("❌ Not enough space for arcs. Adjust layout or stroke width.");
        return;
      }

      const arcRadius = Math.abs(firstAnchorEndY - secondAnchorStartY) / 2;
      const arc1StartX = firstAnchorEndX + arcSpace - arcRadius;

      // FIX: Add detailed logging for each path component

      let pathData = `M ${startX}, ${startY} \n`;
      pathData += `H ${arc1StartX} \n`;

      const arc1Direction = firstAnchorEndY < secondAnchorStartY ? 1 : 0;
      pathData += `a ${arcRadius},${arcRadius} 90 0 ${arc1Direction} ${arcRadius},${
        arc1Direction ? arcRadius : -arcRadius
      } \n`;

      const arc2Direction = arc1Direction ? 0 : 1;
      pathData += `a ${arcRadius},${arcRadius} 90 0 ${arc2Direction} ${arcRadius},${
        arc2Direction ? -arcRadius : arcRadius
      } \n`;

      pathData += `H ${endX} \n`;

      const pathElement = svgInstance
        .path(pathData)
        .stroke({
          color: curveColor,
          width: strokeWidth,
        })
        .fill("none");

      log("✅ Path element created:", pathElement);

      this.onCompleteEvent(container);
    },

    // FIX: Updated animateSVG with conflict resolution
    animateSVG(container) {
      log("🎭 animateSVG called for container:", container);

      const reversePathDraw = false;

      // FIX: Get the specific path in this container
      const pathElement = container.querySelector(".hencurve-anchors-svg path");

      if (!pathElement) {
        log("❌ No path element found in container");
        return;
      }

      // FIX: Use unique ID for your ScrollTriggers to avoid conflicts
      const uniqueId = `hencurve-${container.id || Date.now()}`;
      log("🏷️ Using unique ScrollTrigger ID:", uniqueId);

      if ($(container).hasClass("is-animate-no-scroll")) {
        log("🎬 Using immediate animation for is-animate-no-scroll");

        // FIX: Mark as animated after initial load is complete
        if (!isInitialLoad) {
          this.animatedContainers.add(container);
        }

        gsap.fromTo(
          pathElement,
          { drawSVG: "0%" },
          {
            drawSVG: "100%",
            duration: 1.5,
            ease: "power2.out",
            onComplete: () => {
              log("✅ Immediate animation completed for container:", container);
            },
          },
        );
      } else {
        log("🎬 Using scroll trigger animation");

        // FIX: Mark as animated after initial load is complete
        if (!isInitialLoad) {
          this.animatedContainers.add(container);
        }

        gsap.fromTo(
          pathElement,
          { drawSVG: reversePathDraw ? "100% 100%" : "0% 0%" },
          {
            drawSVG: "0% 100%",
            scrollTrigger: {
              id: uniqueId, // FIX: Unique ID prevents conflicts with other scripts
              trigger: container,
              start: `top center`,
              end: `+=300`,
              scrub: 1,
            },
          },
        );
      }
    },

    onCompleteEvent(container) {
      log("🎉 onCompleteEvent called");

      // FIX: Only prevent duplicates after initial load is complete
      if (!isInitialLoad && this.animatedContainers.has(container)) {
        log(
          "⚠️ Container already animated after initial load, skipping:",
          container,
        );
        return;
      }

      // Emit a custom event when the paths are ready
      const event = new CustomEvent("hencurvesPathReady", {
        detail: {
          block: container, // Reference to the block
          blockId: container.id, // Example: block ID
        },
      });

      this.animateSVG(container);

      // Dispatch the custom event
      document.dispatchEvent(event);
    },

    // FIX: Updated destroy with targeted cleanup
    _destroy: function () {
      log("💥 _destroy called");

      // FIX: Clear animated containers tracking
      this.animatedContainers.clear();

      // FIX: Only kill YOUR ScrollTriggers, not all of them
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id && trigger.vars.id.startsWith("hencurve-")) {
          log("🔫 Killing hencurve ScrollTrigger:", trigger.vars.id);
          trigger.kill();
        }
      });

      // Kill only your path animations
      gsap.killTweensOf(".hencurve-anchors-svg path");
      log("🔫 Killed hencurve path animations");

      const svgs = $(".hencurve-anchors-container svg");
      log("🗑️ Found SVGs to remove:", svgs.length);

      // Clear SVGs inside all containers
      svgs.remove();

      log("✅ Destroy complete");
    },
  };

  // FIX: Simplified initialization tracking
  let hasInitialized = false;
  let isInitialLoad = true;

  // Fire an initial resize once page has fully loaded
  window.addEventListener("load", () => {
    log("🌐 Window load event - firing initial resize");
    if (!hasInitialized) {
      handleResize();
    }
  });

  // FIX: Improved resize handler with better event distinction
  const handleResize = debounce(() => {
    log(
      "🔄 handleResize triggered (DEBOUNCED), isMobile:",
      HencurveAnchors.isMobile,
      "isInitialLoad:",
      isInitialLoad,
    );
    log("📱 Window size:", window.innerWidth, "x", window.innerHeight);

    if (!HencurveAnchors.isMobile && !HencurveAnchors.isResizing) {
      HencurveAnchors.isResizing = true;

      setTimeout(() => {
        log("🖥️ Desktop resize - destroying and reinitializing");
        HencurveAnchors._destroy();

        requestAnimationFrame(() => {
          log("🔄 Reinitializing after resize...");
          HencurveAnchors._init();
          HencurveAnchors.isResizing = false;
          hasInitialized = true;
          isInitialLoad = false; // Mark that initial load is complete
        });
      }, 100);
    } else {
      log("📱 Mobile resize - skipping");
    }
  }, 350);

  // Initialize GSAP MatchMedia
  const mm = gsap.matchMedia();
  const breakPoint = 1024;

  mm.add(`(max-width: ${breakPoint}px)`, () => {
    log("📱 MatchMedia: Mobile breakpoint triggered");
    HencurveAnchors.isMobile = true;
    HencurveAnchors._destroy(); // Destroy on mobile
    hasInitialized = false; // Reset initialization state
    isInitialLoad = true; // Reset to initial load state
  });

  mm.add(`(min-width: ${breakPoint + 1}px)`, () => {
    log("🖥️ MatchMedia: Desktop breakpoint triggered");
    HencurveAnchors.isMobile = false;
    // FIX: Initialize on desktop breakpoint
    requestAnimationFrame(() => {
      HencurveAnchors._init(); // Initialize on desktop
      hasInitialized = true;
      // Don't reset isInitialLoad here - let the resize handler manage it
    });
  });

  // FIX: Updated event listener setup to handle DOM ready state
  const addEventListeners = () => {
    window.addEventListener("resize", handleResize);
  };

  // Add listeners immediately if DOM is ready, otherwise wait for DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addEventListeners);
  } else {
    addEventListeners();
  }
})(document, window, $);
