export function debounce(func, delay) {
    let timeout;
  
    return function (...args) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }
  