import { debounce } from "../_utilities";
import { convertRemToPixels } from "../_utilities";
import { SVG } from "@svgdotjs/svg.js";
import $ from "jquery";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Global debug flag - set to false for production
const _DEBUG_ = true;

(function (document, window, $) {
  const PinWheel = {
    section: null,
    svgInstance: null,
    svgContainer: null,
    svgHeight: 0,
    svgWidth: 0,

    init() {
      if (_DEBUG_) console.log("PinWheel: Initializing...");

      this.section = document.querySelector(
        ".is-pinwheel-motionpath-container",
      );

      if (!this.section) {
        if (_DEBUG_) console.warn("PinWheel: Container element not found");
        return;
      }

      // Enhanced debugging for container
      if (_DEBUG_) {
        const containerRect = this.section.getBoundingClientRect();
        console.log(
          "PinWheel: Container found, proceeding with initialization",
        );
        console.log(
          `PinWheel: Container dimensions - Width: ${containerRect.width}px, Height: ${containerRect.height}px`,
        );
        console.log(
          `PinWheel: Container position - Left: ${containerRect.left}px, Top: ${containerRect.top}px`,
        );
      }

      this.destroy();
      this._initializeSVG();

      if (_DEBUG_) console.log("PinWheel: Initialization complete");
    },

    destroy() {
      if (_DEBUG_) console.log("PinWheel: Destroying existing instances...");

      if (this.svgInstance) {
        if (_DEBUG_) console.log("PinWheel: Clearing SVG instance");
        this.svgInstance.clear();
        this.svgInstance.remove();
        this.svgInstance = null;
      }

      $(".do-motionpath-large").removeAttr("style");
      $(".do-motionpath-medium").removeAttr("style");
      $(".do-motionpath-small").removeAttr("style");

      // Kill all ScrollTriggers associated with the section
      let pageScrollTriggers = ScrollTrigger.getAll();
      let killedCount = 0;
      pageScrollTriggers.forEach((pageScrollTrigger) => {
        if (pageScrollTrigger.vars.id == "pinwheelTrigger") {
          pageScrollTrigger.kill();
          killedCount++;
        }
      });

      if (_DEBUG_)
        console.log(`PinWheel: Destroyed ${killedCount} ScrollTriggers`);
    },

    _initializeSVG() {
      if (_DEBUG_) console.log("PinWheel: Initializing SVG...");

      this.svgContainer = this.section.querySelector(
        ".is-pinwheel-motionpath-svg-container",
      );

      if (!this.svgContainer) {
        if (_DEBUG_) console.error("PinWheel: SVG container not found");
        return;
      }

      // Enhanced debugging for SVG container
      if (_DEBUG_) {
        const containerRect = this.svgContainer.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(this.svgContainer);
        console.log(
          `PinWheel: SVG container dimensions - Width: ${containerRect.width}px, Height: ${containerRect.height}px`,
        );
        console.log(
          `PinWheel: SVG container position - Left: ${containerRect.left}px, Top: ${containerRect.top}px`,
        );
        console.log(
          `PinWheel: SVG container CSS position: ${computedStyle.position}`,
        );
        console.log(
          `PinWheel: SVG container CSS transform: ${computedStyle.transform}`,
        );
      }

      this.svgInstance = SVG()
        .addTo(this.svgContainer)
        .size("100%", "100%")
        .addClass("is-motionpath-svg");

      // Wait for next frame to ensure proper rendering
      requestAnimationFrame(async () => {
        const svgElement = this.svgContainer.querySelector("svg");
        this.svgWidth = svgElement.getBoundingClientRect().width;
        this.svgHeight = svgElement.getBoundingClientRect().height;

        if (_DEBUG_) {
          console.log(
            `PinWheel: SVG dimensions - Width: ${this.svgWidth}px, Height: ${this.svgHeight}px`,
          );
          const svgRect = svgElement.getBoundingClientRect();
          console.log(
            `PinWheel: SVG position - Left: ${svgRect.left}px, Top: ${svgRect.top}px`,
          );

          // Add visual debug indicator at SVG center
          const debugCenter = this.svgInstance.circle(10).attr({
            cx: this.svgWidth / 2,
            cy: this.svgHeight / 2,
            fill: "red",
            "fill-opacity": 0.7,
            id: "debug-center",
          });
          console.log(
            `PinWheel: Debug center circle added at (${this.svgWidth / 2}, ${this.svgHeight / 2})`,
          );
        }

        // Wait for path drawing and conversion to complete
        await this._drawEllipsePaths();

        // Now initialize motion paths with fully converted paths
        this._initializeMotionPaths();
      });
    },

    async _drawEllipsePaths() {
      if (_DEBUG_) console.log("PinWheel: Drawing ellipse paths...");

      let cont3xl = "54rem";
      let smallDiameter = convertRemToPixels(cont3xl) * 1.3;
      let mediumDiameter = convertRemToPixels(cont3xl) * 1.6;
      let largeDiameter = convertRemToPixels(cont3xl) * 1.9;

      if (_DEBUG_) {
        console.log(
          `PinWheel: Ellipse diameters - Small: ${smallDiameter}px, Medium: ${mediumDiameter}px, Large: ${largeDiameter}px`,
        );
      }

      // Draw all ellipses first
      this._drawEllipse("circlePathSmall", smallDiameter, "transparent");
      this._drawEllipse("circlePathMedium", mediumDiameter, "transparent");
      this._drawEllipse("circlePathLarge", largeDiameter, "transparent");

      // Wait for next frame to ensure all convertToPath operations complete
      await new Promise((resolve) => requestAnimationFrame(resolve));

      if (_DEBUG_)
        console.log("PinWheel: All ellipse paths drawn and converted");
    },

    _drawEllipse(id, diameter, strokeColor) {
      if (_DEBUG_) {
        console.log(
          `PinWheel: Drawing ellipse ${id} with diameter ${diameter}px`,
        );
        console.log(
          `PinWheel: Ellipse center will be at (${this.svgWidth / 2}, ${this.svgHeight / 2})`,
        );
      }

      let ellipse = this.svgInstance.ellipse(diameter, diameter).attr({
        id,
        cx: this.svgWidth / 2,
        cy: this.svgHeight / 2,
        stroke: _DEBUG_ ? "rgba(255, 0, 0, 0.3)" : strokeColor, // Make visible in debug mode
        "stroke-width": _DEBUG_ ? 2 : 0,
        fill: "none",
      });

      if (_DEBUG_) {
        const ellipseElement = document.getElementById(id);
        if (ellipseElement) {
          const bbox = ellipseElement.getBBox();
          console.log(
            `PinWheel: Ellipse ${id} bounding box - x: ${bbox.x}, y: ${bbox.y}, width: ${bbox.width}, height: ${bbox.height}`,
          );
        }
      }

      this._rotateEllipse(id, ellipse);
      MotionPathPlugin.convertToPath(`#${id}`);

      if (_DEBUG_) {
        console.log(`PinWheel: Ellipse ${id} converted to motion path`);
        // Log the actual path data
        const pathElement = document.getElementById(id);
        if (pathElement && pathElement.tagName === "path") {
          console.log(
            `PinWheel: Path ${id} d attribute: ${pathElement.getAttribute("d")}`,
          );
        }
      }
    },

    _rotateEllipse(id, ellipse) {
      let rotation = 0;

      if (id == "circlePathSmall") {
        rotation = 0;
      } else if (id == "circlePathMedium") {
        rotation = 90;
      } else if (id == "circlePathLarge") {
        rotation = 45;
      }

      ellipse.transform({
        rotate: rotation,
        cx: this.svgWidth / 2,
        cy: this.svgHeight / 2,
      });

      if (_DEBUG_) {
        console.log(
          `PinWheel: Rotated ${id} by ${rotation} degrees around center (${this.svgWidth / 2}, ${this.svgHeight / 2})`,
        );
      }
    },

    _initializeMotionPaths() {
      if (_DEBUG_) console.log("PinWheel: Initializing motion paths...");

      this._initializeMotionPath(".do-motionpath-small", "#circlePathSmall");
      this._initializeMotionPath(".do-motionpath-medium", "#circlePathMedium");
      this._initializeMotionPath(".do-motionpath-large", "#circlePathLarge");

      if (_DEBUG_) console.log("PinWheel: All motion paths initialized");
    },

    _initializeMotionPath(selector, pathId) {
      const items = $(`.is-hidden-pinwheel-items-container ${selector}`);

      if (_DEBUG_) {
        console.log(
          `PinWheel: Initializing motion path for ${selector} with ${items.length} items on path ${pathId}`,
        );

        // Log initial positions of items
        items.each(function (index) {
          const rect = this.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(this);
          console.log(
            `PinWheel: Item ${index + 1} initial position - Left: ${rect.left}px, Top: ${rect.top}px`,
          );
          console.log(
            `PinWheel: Item ${index + 1} CSS transform: ${computedStyle.transform}`,
          );
        });
      }

      items.each(function (index) {
        const totalItems = items.length;
        const itemOffset = index / totalItems;

        if (_DEBUG_) {
          console.log(
            `PinWheel: Setting up item ${index + 1}/${totalItems} with offset ${itemOffset.toFixed(3)}`,
          );
        }

        gsap.to(this, {
          motionPath: {
            path: pathId,
            align: pathId,
            alignOrigin: [0.5, 0.5],
            start: itemOffset,
            end: itemOffset + 0.25,
            autoRotate: false,
          },
          scrollTrigger: {
            id: "pinwheelTrigger",
            trigger: ".is-pinwheel-motionpath-container",
            scrub: 5,
            start: "top 80%",
            end: "bottom top",
            onToggle: _DEBUG_
              ? (self) => {
                  console.log(
                    `PinWheel: ScrollTrigger toggled - isActive: ${self.isActive}, progress: ${self.progress.toFixed(3)}`,
                  );
                }
              : undefined,
            onUpdate: _DEBUG_
              ? (self) => {
                  if (index === 0) {
                    // Only log for first item to avoid spam
                    console.log(
                      `PinWheel: ScrollTrigger progress: ${self.progress.toFixed(3)}`,
                    );
                  }
                }
              : undefined,
          },
          onComplete: _DEBUG_
            ? () => {
                const rect = this.getBoundingClientRect();
                console.log(
                  `PinWheel: Item ${index + 1} final position - Left: ${rect.left}px, Top: ${rect.top}px`,
                );
              }
            : undefined,
        });
      });
    },
  };

  // Handle window resize with debounce
  const handleResize = debounce(() => {
    if (_DEBUG_) console.log("PinWheel: Window resized, reinitializing...");
    PinWheel.destroy();
    PinWheel.init();
  }, 250);

  window.addEventListener("resize", handleResize);

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => PinWheel.init());
  } else {
    PinWheel.init();
  }
})(document, window, jQuery);
