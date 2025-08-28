export const validateExtractedData = (data) => {
  return data && data.vessel && data.events && data.events.length > 0;
};

export const sanitizeDataBeforeSave = (data) => {
  if (!data) return null;
  return {
    ...data,
    events: data.events?.filter(event => event && event.name) || []
  };
};
