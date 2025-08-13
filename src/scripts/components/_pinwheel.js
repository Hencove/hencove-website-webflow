import { debounce } from "../_utilities";
import { convertRemToPixels } from "../_utilities";
import { SVG } from "@svgdotjs/svg.js";
import $ from "jquery";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

// Global debug flag - set to false for production
const _DEBUG_ = false;

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

      if (_DEBUG_) {
        const containerRect = this.section.getBoundingClientRect();
        console.log(
          "PinWheel: Container found, proceeding with initialization",
        );
        console.log(
          `PinWheel: Container dimensions - Width: ${containerRect.width}px, Height: ${containerRect.height}px`,
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
      let killedCount = 0;
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.id === "pinwheelTrigger") {
          trigger.kill();
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

      if (_DEBUG_) {
        const containerRect = this.svgContainer.getBoundingClientRect();
        console.log(
          `PinWheel: SVG container dimensions - Width: ${containerRect.width}px, Height: ${containerRect.height}px`,
        );
      }

      this.svgInstance = SVG()
        .addTo(this.svgContainer)
        .size("100%", "100%")
        .addClass("is-motionpath-svg");

      // Wait for SVG to be properly rendered
      requestAnimationFrame(() => {
        const svgElement = this.svgContainer.querySelector("svg");
        this.svgWidth = svgElement.getBoundingClientRect().width;
        this.svgHeight = svgElement.getBoundingClientRect().height;

        if (_DEBUG_) {
          console.log(
            `PinWheel: SVG dimensions - Width: ${this.svgWidth}px, Height: ${this.svgHeight}px`,
          );

          // Add visual debug indicator at SVG center
          this.svgInstance.circle(10).attr({
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

        this._drawEllipsePaths();
        this._initializeMotionPaths();
      });
    },

    _drawEllipsePaths() {
      if (_DEBUG_) console.log("PinWheel: Drawing ellipse paths...");

      // const cont3xl = "54rem";
      const pwInnerWidth = document.querySelector(
        ".home-pinwheel_container",
      ).offsetWidth;
      const smallDiameter = pwInnerWidth * 1.3;
      const mediumDiameter = pwInnerWidth * 1.6;
      const largeDiameter = pwInnerWidth * 1.9;

      // Set section height to be just bigger than the large diameter circle
      document.querySelector(
        ".is-pinwheel-motionpath-container",
      ).style.minHeight = `${pwInnerWidth * 2.2}px`;

      if (_DEBUG_) {
        console.log(
          `PinWheel: Ellipse diameters - Small: ${smallDiameter}px, Medium: ${mediumDiameter}px, Large: ${largeDiameter}px`,
        );
        console.log(
          `PinWheel: SVG center point: (${this.svgWidth / 2}, ${this.svgHeight / 2})`,
        );
      }

      this._drawEllipse("circlePathSmall", smallDiameter);
      this._drawEllipse("circlePathMedium", mediumDiameter);
      this._drawEllipse("circlePathLarge", largeDiameter);

      if (_DEBUG_) console.log("PinWheel: All ellipse paths drawn");
    },

    _drawEllipse(id, diameter) {
      if (_DEBUG_) {
        console.log(
          `PinWheel: Drawing ellipse ${id} with diameter ${diameter}px`,
        );
        console.log(
          `PinWheel: Ellipse center will be at (${this.svgWidth / 2}, ${this.svgHeight / 2})`,
        );
      }

      const ellipse = this.svgInstance.ellipse(diameter, diameter).attr({
        id,
        cx: this.svgWidth / 2,
        cy: this.svgHeight / 2,
        stroke: _DEBUG_ ? "rgba(255, 0, 0, 0.3)" : "transparent",
        "stroke-width": _DEBUG_ ? 2 : 0,
        fill: "none",
      });

      this._rotateEllipse(id, ellipse);
      MotionPathPlugin.convertToPath(`#${id}`);

      if (_DEBUG_) {
        console.log(`PinWheel: Ellipse ${id} converted to motion path`);
        // Log the actual path data
        setTimeout(() => {
          const pathElement = document.getElementById(id);
          if (pathElement && pathElement.tagName === "path") {
            console.log(
              `PinWheel: Path ${id} d attribute: ${pathElement.getAttribute("d")}`,
            );
          }
        }, 0);
      }
    },

    _rotateEllipse(id, ellipse) {
      let rotation = 0;

      if (id === "circlePathMedium") {
        rotation = 90;
      } else if (id === "circlePathLarge") {
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
