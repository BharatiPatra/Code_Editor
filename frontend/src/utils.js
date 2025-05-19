function debounce(func, delay) {
  let timer;
  return function (...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

function debounceAsync(func, delay) {
  let timer = null;
  let resolveList = [];

  return function (...args) {
    // Clear existing timer
    if (timer) clearTimeout(timer);

    // Return a new promise for each call
    const promise = new Promise((resolve, reject) => {
      resolveList.push({ resolve, reject });
    });

    // Start new timer
    timer = setTimeout(async () => {
      try {
        const result = await func(...args);
        resolveList.forEach(({ resolve }) => resolve(result));
      } catch (error) {
        resolveList.forEach(({ reject }) => reject(error));
      } finally {
        resolveList = [];
        timer = null;
      }
    }, delay);

    return promise;
  };
}

export { debounce, debounceAsync };
