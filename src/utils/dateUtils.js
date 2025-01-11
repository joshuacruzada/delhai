export const isNearlyExpired = (expiryDate, daysThreshold = 30) => {
    if (!expiryDate) return false; // Early return for undefined or null expiryDate
  
    const expiryTime = new Date(expiryDate).getTime();
    const currentTime = new Date().getTime();
    const thresholdTime = daysThreshold * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  
    return expiryTime - currentTime <= thresholdTime && expiryTime - currentTime >= 0;
  };
  