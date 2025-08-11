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
  return (
    parseFloat(rem.replace(/[^0-9]/g, "")) *
    parseFloat(getComputedStyle(document.documentElement).fontSize)
  );
};

export { debounce, throttle, convertRemToPixels };
