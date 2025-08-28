const EXTRACTOR_URL = import.meta.env.VITE_EXTRACTOR_URL;

// API Functions
export const extractEvents = async (formData) => {
  if (EXTRACTOR_URL) {
    try {
      const response = await fetch(`${EXTRACTOR_URL.replace(/\/$/, '')}/extract`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Extraction failed');
      const data = await response.json();
      return {
        vessel: data.vessel || 'Unknown Vessel',
        cargo: data.cargo || '',
        port: data.port || '',
        events: Array.isArray(data.events) ? data.events : [],
      };
    } catch (error) {
      throw new Error('Extraction service unavailable');
    }
  }
  throw new Error('No extraction service configured');
};



export const exportToCSV = (data, filename = 'laytime-data.csv') => {
  const csvContent = convertToCSV(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToJSON = (data, filename = 'laytime-data.json') => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};



// Helper function to convert data to CSV format
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
};
