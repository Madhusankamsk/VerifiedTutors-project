// Utility function to convert teachingModes to rates format for backward compatibility
export const getRatesFromTeachingModes = (teachingModes: any[]) => {
  const rates = {
    online: 0,
    individual: 0
  };
  
  teachingModes?.forEach(mode => {
    if (mode.type === 'online') {
      rates.online = mode.rate;
    } else if (mode.type === 'home-visit') {
      rates.individual = mode.rate;
    }
  });
  
  return rates;
}; 