import { debounce } from "../_utilities";
import { convertRemToPixels } from "../_utilities";
import { SVG } from "@svgdotjs/svg.js";
import $ from "jquery";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

(function (document, window, $) {
  const PinWheel = {
    section: null,
    svgInstance: null,
    svgContainer: null,
    svgHeight: 0,
    svgWidth: 0,

    init() {
      this.section = document.querySelector(
        ".is-pinwheel-motionpath-container",
      );
      if (!this.section) return;

      this.destroy();
      this._initializeSVG();
      this._drawEllipsePaths();
      this._initializeMotionPaths();
    },

    destroy() {
      // console.log("destroy is running");
      if (this.svgInstance) {
        this.svgInstance.clear();
        this.svgInstance.remove();
        this.svgInstance = null;
      }

      $(".do-motionpath-large").removeAttr("style");
      $(".do-motionpath-medium").removeAttr("style");
      $(".do-motionpath-small").removeAttr("style");

      // Kill all ScrollTriggers associated with the section
      //console.log(ScrollTrigger.getAll());
      let pageScrollTriggers = ScrollTrigger.getAll();
      pageScrollTriggers.forEach((pageScrollTrigger) => {
        if (pageScrollTrigger.vars.id == "pinwheelTrigger") {
          pageScrollTrigger.kill();
        }
      });

      //ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    },

    _initializeSVG() {
      this.svgContainer = this.section.querySelector(
        ".is-pinwheel-motionpath-svg-container",
      );

      this.svgInstance = SVG()
        .addTo(this.svgContainer)
        .size("100%", "100%")
        .addClass("absolute top-0 left-0 w-full h-full");
      const svgElement = this.svgContainer.querySelector("svg");
      this.svgWidth = svgElement.getBoundingClientRect().width;
      this.svgHeight = svgElement.getBoundingClientRect().height;
    },

    _drawEllipsePaths() {
      let cont3xl = "54rem";

      let smallDiameter = convertRemToPixels(cont3xl) * 1.3;
      let mediumDiameter = convertRemToPixels(cont3xl) * 1.6;
      let largeDiameter = convertRemToPixels(cont3xl) * 1.9;

      // if ($(window).width() <= 1024) {
      //     smallDiameter = this.svgHeight * 1.3;
      //     mediumDiameter = this.svgHeight * 1.3;
      //     largeDiameter = this.svgHeight * 1.3;
      // }

      this._drawEllipse("circlePathSmall", smallDiameter, "transparent");
      this._drawEllipse("circlePathMedium", mediumDiameter, "transparent");
      this._drawEllipse("circlePathLarge", largeDiameter, "transparent");
    },

    _drawEllipse(id, diameter, strokeColor) {
      let ellipse = this.svgInstance.ellipse(diameter, diameter).attr({
        id,
        cx: this.svgWidth / 2,
        cy: this.svgHeight / 2,
        stroke: strokeColor,
        "stroke-width": 2,
        fill: "none",
      });

      // ?
      // ? 	maybe rotate each circle so items start at different points on it
      // ?
      this._rotateEllipse(id, ellipse);

      // Convert the ellipse to a motion path
      MotionPathPlugin.convertToPath(`#${id}`);
    },

    // ?
    // ? 	maybe rotate each circle so items start at different points on it
    // ?
    _rotateEllipse(id, ellipse) {
      if (id == "circlePathSmall") {
        // Apply a rotation to offset the start position
        ellipse.transform({
          rotate: 0, // Rotation angle in degrees
          cx: this.svgWidth / 2, // Rotation center X
          cy: this.svgHeight / 2, // Rotation center Y
        });
      }

      if (id == "circlePathMedium") {
        // Apply a rotation to offset the start position
        ellipse.transform({
          rotate: 90, // Rotation angle in degrees
          cx: this.svgWidth / 2, // Rotation center X
          cy: this.svgHeight / 2, // Rotation center Y
        });
      }

      if (id == "circlePathLarge") {
        // Apply a rotation to offset the start position
        ellipse.transform({
          rotate: 45, // Rotation angle in degrees
          cx: this.svgWidth / 2, // Rotation center X
          cy: this.svgHeight / 2, // Rotation center Y
        });
      }
    },

    _initializeMotionPaths() {
      this._initializeMotionPath(".do-motionpath-small", "#circlePathSmall");
      this._initializeMotionPath(".do-motionpath-medium", "#circlePathMedium");
      this._initializeMotionPath(".do-motionpath-large", "#circlePathLarge");
    },

    _initializeMotionPath(selector, pathId) {
      const items = $(`.is-hidden-pinwheel-items-container ${selector}`);

      items.each(function (index) {
        const totalItems = items.length;
        const itemOffset = index / totalItems;
        // let shiftBy = 80;

        // if (index % 2 == 0) {
        // 	shiftBy = 0;
        // }

        gsap.to(this, {
          motionPath: {
            path: pathId,
            align: pathId,
            alignOrigin: [0.5, 0.5],
            start: itemOffset, // Staggered start
            end: itemOffset + 0.25, // Reduced range for slower progress
            autoRotate: false,
          },
          scrollTrigger: {
            id: "pinwheelTrigger",
            trigger: ".is-pinwheel-motionpath-container",
            scrub: 5, // Smooth, scroll-based animation
            start: "top 80%", // Start earlier
            end: "bottom top", // End later
            // markers: true, // Uncomment for debugging
          },
        });
      });
    },
  };

  // Handle window resize with debounce
  const handleResize = debounce(() => {
    PinWheel.destroy();
    PinWheel.init();
  }, 200);

  document.addEventListener("DOMContentLoaded", () => {
    PinWheel.init();
    window.addEventListener("resize", handleResize);
  });

  // Fire an initial resize once page has fully loaded
  window.addEventListener("load", handleResize);
})(document, window, $);
