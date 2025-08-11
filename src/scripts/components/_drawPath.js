import { debounce } from "../_utilities";
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

    _init: function () {
      log("🚀 _init called, isMobile:", this.isMobile);

      // Bail early if mobile
      if (this.isMobile) {
        log("❌ Bailing early - mobile detected");
        return;
      }

      this.containers = document.querySelectorAll(
        ".hencurve-anchors-container",
      );
      log("📦 Found containers:", this.containers.length);

      if (!this.containers.length) {
        log("❌ No containers found");
        return;
      }

      // FIX: Add timing for proper initial positioning
      requestAnimationFrame(() => {
        log("🎬 Starting container processing...");
        this.containers.forEach((container, index) => {
          log(`📋 Processing container ${index + 1}:`, container);
          this._drawSVG(container);
        });
      });
    },

    _drawSVG: function (container) {
      log("🎨 _drawSVG called for container:", container);

      let svgInstance = SVG()
        .addTo(container)
        .size("100%", "100%")
        .addClass("hencurve-anchors-svg");

      log("✅ SVG instance created:", svgInstance);
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

      log("📏 Container rect:", {
        left: containerRect.left,
        top: containerRect.top,
        width: containerRect.width,
        height: containerRect.height,
      });

      log("📏 First anchor rect:", {
        left: firstAnchor.left,
        top: firstAnchor.top,
        width: firstAnchor.width,
        height: firstAnchor.height,
      });

      log("📏 Second anchor rect:", {
        left: secondAnchor.left,
        top: secondAnchor.top,
        width: secondAnchor.width,
        height: secondAnchor.height,
      });

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
      log("✏️ _drawPath called with positions:", {
        first: firstAnchor,
        second: secondAnchor,
      });

      const siteMargin = 36;
      const svgHeight = $(container).height();
      const strokeWidth = 6;

      // Anchor positions
      const startX = siteMargin;
      // FIX: Use container width instead of window width for accurate positioning
      const containerWidth = $(container).width();
      const endX = containerWidth - siteMargin;

      log("📐 Drawing calculations:", {
        containerWidth,
        svgHeight,
        startX,
        endX,
        siteMargin,
        strokeWidth,
      });

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

      log("🔧 Path calculations:", {
        startY,
        endY,
        firstAnchorEndX,
        firstAnchorEndY,
        secondAnchorStartX,
        secondAnchorStartY,
        totalSpace,
        arcSpace,
      });

      if (arcSpace < 0) {
        warn("❌ Not enough space for arcs. Adjust layout or stroke width.");
        return;
      }

      const arcRadius = Math.abs(firstAnchorEndY - secondAnchorStartY) / 2;

      let pathData = `M ${startX}, ${startY} \n`;

      const arc1StartX = firstAnchorEndX + arcSpace - arcRadius;

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

      log("📝 Final path data:", pathData);

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

    animateSVG(container) {
      log("🎭 animateSVG called for container:", container);

      const reversePathDraw = false;
      gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

      if (
        $("body").hasClass("error404") ||
        $(container).hasClass("is-about-us-hero")
      ) {
        log("🎬 Using immediate animation");
        gsap.fromTo(
          ".hencurve-anchors-svg path",
          { drawSVG: "0%" }, // Start fully hidden
          {
            drawSVG: "100%", // Draw to 100%
          },
        );
      } else {
        log("🎬 Using scroll trigger animation");
        gsap.fromTo(
          ".hencurve-anchors-svg path",
          { drawSVG: reversePathDraw ? "100% 100%" : "0% 0%" }, // Start fully hidden
          {
            drawSVG: "0% 100%", // Draw to 100%
            scrollTrigger: {
              trigger: container,
              start: `top center`,
              end: `+=300`,
              scrub: 1, // Smooth scrub animation
              // markers: true, // Add markers for debugging (remove in production)
            },
          },
        );
      }
    },

    onCompleteEvent(container) {
      log("🎉 onCompleteEvent called");

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

    _destroy: function () {
      log("💥 _destroy called");

      const svgs = $(".hencurve-anchors-container svg");
      log("🗑️ Found SVGs to remove:", svgs.length);

      // Clear SVGs inside all containers
      svgs.remove();

      log("✅ SVGs removed");
    },
  };

  // FIX: Improved resize handler with debugging
  const handleResize = debounce(() => {
    log("🔄 handleResize triggered, isMobile:", HencurveAnchors.isMobile);
    log("📱 Window size:", window.innerWidth, "x", window.innerHeight);

    if (!HencurveAnchors.isMobile) {
      log("🖥️ Desktop resize - destroying and reinitializing");
      HencurveAnchors._destroy(); // Clear the SVG instance

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          log("🔄 Reinitializing after resize...");
          HencurveAnchors._init(); // Reinitialize with fresh positions
        });
      });
    } else {
      log("📱 Mobile resize - skipping");
    }
  }, 200);

  // Initialize GSAP MatchMedia
  const mm = gsap.matchMedia();
  const breakPoint = 1024;

  mm.add(`(max-width: ${breakPoint}px)`, () => {
    log("📱 MatchMedia: Mobile breakpoint triggered");
    HencurveAnchors.isMobile = true;
    HencurveAnchors._destroy(); // Destroy on mobile
  });

  mm.add(`(min-width: ${breakPoint + 1}px)`, () => {
    log("🖥️ MatchMedia: Desktop breakpoint triggered");
    HencurveAnchors.isMobile = false;
    // FIX: Add timing for proper resize positioning
    requestAnimationFrame(() => {
      HencurveAnchors._init(); // Initialize on desktop
    });
  });

  // Initialize Resizing on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    log("📄 DOMContentLoaded - adding resize listener");
    window.addEventListener("resize", handleResize); // Add resize listener
  });

  // Fire an initial resize once page has fully loaded
  window.addEventListener("load", () => {
    log("🌐 Window load event - firing initial resize");
    handleResize();
  });
})(document, window, $);
