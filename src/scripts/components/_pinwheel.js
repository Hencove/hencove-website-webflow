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

      if (_DEBUG_)
        console.log(
          "PinWheel: Container found, proceeding with initialization",
        );

      this.destroy();
      this._initializeSVG();
      this._drawEllipsePaths();
      this._initializeMotionPaths();

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

      this.svgInstance = SVG()
        .addTo(this.svgContainer)
        .size("100%", "100%")
        .addClass("is-motionpath-svg");

      const svgElement = this.svgContainer.querySelector("svg");
      this.svgWidth = svgElement.getBoundingClientRect().width;
      this.svgHeight = svgElement.getBoundingClientRect().height;

      if (_DEBUG_) {
        console.log(
          `PinWheel: SVG dimensions - Width: ${this.svgWidth}px, Height: ${this.svgHeight}px`,
        );
      }
    },

    _drawEllipsePaths() {
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

      this._drawEllipse("circlePathSmall", smallDiameter, "transparent");
      this._drawEllipse("circlePathMedium", mediumDiameter, "transparent");
      this._drawEllipse("circlePathLarge", largeDiameter, "transparent");

      if (_DEBUG_) console.log("PinWheel: All ellipse paths drawn");
    },

    _drawEllipse(id, diameter, strokeColor) {
      if (_DEBUG_)
        console.log(
          `PinWheel: Drawing ellipse ${id} with diameter ${diameter}px`,
        );

      let ellipse = this.svgInstance.ellipse(diameter, diameter).attr({
        id,
        cx: this.svgWidth / 2,
        cy: this.svgHeight / 2,
        stroke: strokeColor,
        "stroke-width": 2,
        fill: "none",
      });

      this._rotateEllipse(id, ellipse);

      // Convert the ellipse to a motion path
      MotionPathPlugin.convertToPath(`#${id}`);

      if (_DEBUG_)
        console.log(`PinWheel: Ellipse ${id} converted to motion path`);
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

      if (_DEBUG_)
        console.log(`PinWheel: Rotated ${id} by ${rotation} degrees`);
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
  }, 200);

  document.addEventListener("DOMContentLoaded", () => {
    if (_DEBUG_) console.log("PinWheel: DOM content loaded");
    PinWheel.init();
    window.addEventListener("resize", handleResize);
  });

  // Fire an initial resize once page has fully loaded
  window.addEventListener("load", handleResize);
})(document, window, $);
