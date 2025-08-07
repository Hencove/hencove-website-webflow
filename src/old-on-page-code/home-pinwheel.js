(function (document, window) {
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
      if (this.svgInstance) {
        this.svgInstance.clear();
        this.svgInstance.remove();
        this.svgInstance = null;
      }

      // Remove style attributes
      document
        .querySelectorAll(".do-motionpath-large")
        .forEach((el) => el.removeAttribute("style"));
      document
        .querySelectorAll(".do-motionpath-small")
        .forEach((el) => el.removeAttribute("style"));

      // Kill all ScrollTriggers associated with the section
      let pageScrollTriggers = ScrollTrigger.getAll();
      pageScrollTriggers.forEach((pageScrollTrigger) => {
        if (pageScrollTrigger.vars.id == "pinwheelTrigger") {
          pageScrollTrigger.kill();
        }
      });
    },

    _initializeSVG() {
      this.svgContainer = this.section.querySelector(
        ".is-pinwheel-motionpath-svg-container",
      );

      this.svgInstance = SVG()
        .addTo(this.svgContainer)
        .size("100%", "100%")
        .addClass("is-motionpath-svg");

      const svgElement = this.svgContainer.querySelector("svg");
      this.svgWidth = svgElement.getBoundingClientRect().width;
      this.svgHeight = svgElement.getBoundingClientRect().height;
    },

    _drawEllipsePaths() {
      let cont3xl = "54rem";

      let smallDiameter = convertRemToPixels(cont3xl) * 1.3;
      let mediumDiameter = convertRemToPixels(cont3xl) * 1.6;
      let largeDiameter = convertRemToPixels(cont3xl) * 1.9;

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

      this._rotateEllipse(id, ellipse);
      MotionPathPlugin.convertToPath(`#${id}`);
    },

    _rotateEllipse(id, ellipse) {
      const rotations = {
        circlePathSmall: 0,
        circlePathMedium: 90,
        circlePathLarge: 45,
      };

      ellipse.transform({
        rotate: rotations[id],
        cx: this.svgWidth / 2,
        cy: this.svgHeight / 2,
      });
    },

    _initializeMotionPaths() {
      this._initializeMotionPath(".do-motionpath-small", "#circlePathSmall");
      this._initializeMotionPath(".do-motionpath-medium", "#circlePathMedium");
      this._initializeMotionPath(".do-motionpath-large", "#circlePathLarge");
    },

    _initializeMotionPath(selector, pathId) {
      const items = document.querySelectorAll(
        `.is-hidden-pinwheel-items-container ${selector}`,
      );

      items.forEach((element, index) => {
        const totalItems = items.length;
        const itemOffset = index / totalItems;

        gsap.to(element, {
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
          },
        });
      });
    },
  };

  // Debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const convertRemToPixels = function (rem) {
    return (
      parseFloat(rem.replace(/[^0-9]/g, "")) *
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
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

  window.addEventListener("load", handleResize);
})(document, window);
