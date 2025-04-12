module.exports = {
  retry: async (fn, maxAttempts = 3) => {
    let attempt = 0;
    while(attempt < maxAttempts) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        attempt++;
        console.warn(`Attempt ${attempt} failed:`, error);
        if (attempt < maxAttempts) {
          await new Promise(res => setTimeout(res, 1000 * attempt));
        }
      }
    }
    throw new Error(`Failed after ${maxAttempts} attempts`);
  },

  fallback: async (primaryFn, backupFn) => {
    try {
      return await primaryFn();
    } catch (error) {
      console.warn('Falling back to secondary model:', error);
      return await backupFn();
    }
  }
};
