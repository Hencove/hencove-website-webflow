const debounce = function (func, delay) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
};

//
const throttle = (func, limit) => {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
//
const convertRemToPixels = function (rem) {
  // Handle numeric input directly
  if (typeof rem === "number") {
    return (
      rem * parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  }

  // Handle string input
  if (typeof rem === "string") {
    // Extract numeric value (including decimals and negatives)
    const numericValue = parseFloat(rem.replace(/[^\d.-]/g, ""));

    // Validate the extracted value
    if (isNaN(numericValue)) {
      throw new Error("Invalid REM value provided");
    }

    return (
      numericValue *
      parseFloat(getComputedStyle(document.documentElement).fontSize)
    );
  }

  throw new Error("REM value must be a number or string");
};

export { debounce, throttle, convertRemToPixels };
