(function () {
  "use strict";

  // Debounce utility (inline version)
  const debounce = function (func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func.apply(this, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(this, args);
    };
  };

  // Utility functions
  function getOffsetFromAncestor(element, ancestor) {
    let offsetLeft = 0;
    let offsetTop = 0;
    let current = element;

    while (current && current !== ancestor) {
      offsetLeft += current.offsetLeft;
      offsetTop += current.offsetTop;
      current = current.offsetParent;
    }

    return { left: offsetLeft, top: offsetTop };
  }

  // Path class
  class Path {
    constructor(w, h, strokeWidth) {
      this.width = w;
      this.height = h;
      this.strokeWidth = strokeWidth;
      this.startY = 0;
      this.endY = this.startY;
      this.pathData = `M 0,${this.startY} `;
    }

    generateFlipShape(startY, endY, direction, close, closeTop) {
      let radius = this.height / 2;
      let pivot = this.width * 0.4;

      let path = `M 32,${direction ? startY : endY}\n`;
      path += `h ${pivot - radius}\n`;

      path += `a ${radius} ${radius} 90 0 ${direction ? "1" : "0"} ${radius}, ${
        direction ? radius : -radius
      } \n`;
      path += `a ${radius} ${radius} 90 0 ${direction ? "0" : "1"} ${radius}, ${
        direction ? radius : -radius
      } \n`;

      path += `H ${this.width} \n`;

      if (close) {
        if (closeTop) {
          path += `V 0 H 32 Z`;
        } else {
          path += `V ${this.height} H 32 Z`;
        }
      }
      return path;
    }

    getMaskFlipSVG() {
      const columnsInitial = [
        document.querySelector(".hencurve.flip .textContainer #el1"),
        document.querySelector(".hencurve.flip .textContainer #el2"),
      ];
      const columnsFinal = [
        document.querySelector(".hencurve.flip .textContainer #el3"),
        document.querySelector(".hencurve.flip .textContainer #el4"),
      ];

      let startY = 0;
      let endY = this.height;

      let path1 = this.generateFlipShape(startY, endY, 1, 1, 1);
      let path1Flipped = this.generateFlipShape(startY, endY, 0, 1, 1);
      let path1Stroke = this.generateFlipShape(startY, endY, 1, 0, 1);
      let path1StrokeFlipped = this.generateFlipShape(startY, endY, 0, 0, 1);

      let basePath1 = `<clipPath id="clipFlip">
						  <path class='curvePath' d="${path1}" fill="red" stroke="none" />
						</clipPath>
						<path class='curvePath' d="${path1}" stroke="none" fill="red"/>
						<path class='strokePath' id="blurStroke" d="${path1Stroke}"
							stroke="none"
							fill="none"
							stroke-width="${this.strokeWidth}"/>
						<path class='strokePath' d="${path1Stroke}"
							stroke="none"
							fill="none"
							stroke-width="${this.strokeWidth}"/>`;

      let basePath1Flipped = `<clipPath>
								  <path class='curvePath' d="${path1Flipped}" fill="none" stroke="none"/>
								</clipPath>
								<path class='curvePath' d="${path1Flipped}" stroke="none" fill="none"/>
								<path class='strokePath' d="${path1StrokeFlipped}"
									stroke="none"
									fill="none"
									stroke-width="${this.strokeWidth}"/>`;

      let path2 = this.generateFlipShape(startY, endY, 1, 1, 0);
      let path2Flipped = this.generateFlipShape(startY, endY, 0, 1, 0);

      let basePath2 = `<clipPath id="clipInverse">
						  <path class='curvePath' d="${path2}"/>
						</clipPath>
						<path class='curvePath' d="${path2}" stroke="none" fill="blue"/>`;

      let basePath2Flipped = `<clipPath>
								  <path class='curvePath' d="${path2Flipped}" fill="none"/>
								</clipPath>
								<path class='curvePath' d="${path2Flipped}" stroke="none" fill="none"/>`;

      return `<svg xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 ${this.width + this.strokeWidth} ${this.height}"
					width="${this.width + this.strokeWidth}px" height="${
            this.height + this.strokeWidth
          }px">
				  <g id="flip">
					${basePath1}
				  </g>
				  <g id="unflip">
					${basePath1Flipped}
				  </g>
				  <g id="flipInverse">
					${basePath2}
				  </g>
				  <g id="unflipInverse">
					${basePath2Flipped}
				  </g>
				</svg>`;
    }
  }

  // Main pageDraw object
  const pageDraw = {
    isMobile: false,
    containerElements: null,
    timelines: [],
    startYs: [],
    endYs: [],

    init() {
      this.setupBreakpoints();
      this.destroy();
      this.containerElements = document.querySelectorAll(".hencurve");

      if (!this.containerElements.length) return;

      this.containerElements.forEach((block) => {
        this.mobileLayout(block);

        if (this.isMobile) {
          this.mobileTimeline(block);
        } else {
          this.drawSVGs(block);
        }
      });
    },

    setupBreakpoints() {
      const mm = gsap.matchMedia();
      const breakPoint = 1024;

      mm.add(`(max-width: ${breakPoint}px)`, () => {
        this.isMobile = true;
      });

      mm.add(`(min-width: ${breakPoint + 1}px)`, () => {
        this.isMobile = false;
      });
    },

    destroy() {
      this.timelines.forEach((tl) => tl.kill());
      this.timelines = [];

      if (this.containerElements) {
        this.containerElements.forEach((block) => {
          block
            .querySelectorAll(".svgContainer")
            .forEach((svg) => svg.remove());
          block
            .querySelectorAll(".textContainer")
            .forEach((textContainer) => textContainer.removeAttribute("style"));
        });
      }

      this.startYs = [];
      this.endYs = [];
    },

    drawSVGs(block) {
      const siteMargin = 32;
      const strokeWidth = 6;

      const textContainers = block.querySelectorAll(".textContainer");
      const blockWrapper = block.closest(".hencurve-parent");

      const width = blockWrapper.offsetWidth - siteMargin;
      const height = block.offsetHeight + siteMargin;

      // Update all textContainer styles
      textContainers.forEach((textContainer) => {
        Object.assign(textContainer.style, {
          opacity: "1",
          transitionDuration: "0.5s",
          right: `${width}px`,
          bottom: `${height}px`,
          width: `${width}px`,
          height: `${height}px`,
        });
      });

      const flipPath = new Path(width, height, strokeWidth);
      const unflipPath = new Path(width, height, strokeWidth);

      const flip = document.createElement("div");
      flip.className = "svgContainer";
      flip.innerHTML = flipPath.getMaskFlipSVG();

      this.startYs.push(flipPath.startY / height, unflipPath.startY / height);
      this.endYs.push(flipPath.endY / height, unflipPath.endY / height);

      const textContainerParent = block.querySelector(
        ".hencurve-text-container",
      );
      textContainerParent.insertAdjacentElement("afterend", flip);

      // Apply stroke color
      const strokePaths = block.querySelectorAll(
        ".svgContainer svg g path.strokePath",
      );
      strokePaths.forEach((path) => {
        path.style.stroke = "var(--base-color-brand--yellow-dark)";
      });

      this.handleTimelines(block);
    },

    handleTimelines(block) {
      const svgContainers = block.querySelectorAll(".svgContainer");

      svgContainers.forEach((container) => {
        const parentBlock = container.closest(".hencurve");
        if (!parentBlock.className.includes("flip")) return;

        const tl = gsap.timeline({
          defaults: { ease: "power4.in", duration: 2 },
          delay: 1.5,
          repeat: -1,
          repeatDelay: 2,
          yoyo: true,
        });
        this.timelines.push(tl);

        const pivot = 40;
        const pivotV = 50;
        const originHGap = 1.1;
        const originVGap = 28;

        const originString = `${pivot - originHGap}% ${pivotV + originVGap}%, ${
          pivot + originHGap
        }% ${pivotV + originVGap}%`;
        const originInvString = `${pivot + originHGap}% ${
          pivotV - originVGap
        }%, ${pivot - originHGap}% ${pivotV - originVGap}%`;
        const originStrokeString = `${pivot - 1.5}% ${pivotV - 28}%, ${
          pivot + 1.5
        }% ${pivotV + 28}%`;

        const morphConfig = (shape, origin) => ({
          ease: "power4.inOut",
          morphSVG: {
            shape,
            type: "rotational",
            origin,
            map: "position",
            precision: 5,
            shapeIndex: "auto",
          },
        });

        tl.add("start", ">")
          .to(
            "#flip .strokePath",
            morphConfig("#unflip .strokePath", originStrokeString),
            "start",
          )
          .to(
            "#flip .curvePath",
            morphConfig("#unflip .curvePath", originString),
            "start",
          )
          .to(
            "#flipInverse .curvePath",
            morphConfig("#unflipInverse .curvePath", originInvString),
            "start",
          );
      });
    },

    mobileLayout(block) {
      const mobileHtml = `<div class="textContainer" id="inHouse">
									<h1 id="el1" class="font-lora">In</h1>
									<h1 id="el2" class="font-lora">House</h1>
								</div>
								<div class="svgContainer"></div>
								<div class="textContainer" id="outSourced">
									<h1 id="el3" class="font-lora">Out</h1>
									<h1 id="el4" class="font-lora">Sourced</h1>
								</div>`;

      const desktopHtml = `<div class="textContainer">
									<h1 id="el1" class="font-lora">In</h1>
								</div>
								<div class="textContainer">
									<h1 id="el2" class="font-lora">House</h1>
								</div>
								<div class="textContainer">
									<h1 id="el3" class="font-lora">Out</h1>
								</div>
								<div class="textContainer">
									<h1 id="el4" class="font-lora">Sourced</h1>
								</div>`;

      const textContainer = block.querySelector(".hencurve-text-container");
      textContainer.innerHTML = this.isMobile ? mobileHtml : desktopHtml;
    },

    mobileTimeline(block) {
      const container = block.querySelector(".svgContainer");
      const gutterMobile = 16;
      const svgWidth = block.offsetWidth - gutterMobile;
      const strokeWidth = 6;

      const pathData = `M ${gutterMobile},${strokeWidth / 2} H ${svgWidth}`;

      const svgStrokeInstance = SVG()
        .addTo(container)
        .size("100%", `${strokeWidth}px`)
        .addClass("divider-svg");

      svgStrokeInstance
        .path(pathData)
        .stroke({
          color: "var(--base-color-brand--yellow-dark)",
          width: strokeWidth,
        })
        .fill("none");

      gsap.fromTo(".divider-svg path", { drawSVG: "0%" }, { drawSVG: "100%" });
    },
  };

  // Initialize when DOM is ready
  const debouncedResizeHandler = debounce(() => {
    pageDraw.init();
  }, 32);

  function initPageDraw() {
    pageDraw.init();
    window.addEventListener("resize", debouncedResizeHandler);
  }

  // Auto-initialize when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPageDraw);
  } else {
    initPageDraw();
  }
})();
