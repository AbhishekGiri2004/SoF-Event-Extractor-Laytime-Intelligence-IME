import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import SupportModal from '../components/SupportModal';
import EventTable from '../components/EventTable';
import { extractEvents } from '../services/api';
import { validateExtractedData, sanitizeDataBeforeSave } from '../utils/dataCleanup';

const LayspanDashboard = () => {
  const [csvFile, setCsvFile] = useState(null);
  const [docxFile, setDocxFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleEventUpdate = (index, updatedEvent) => {
    if (extractedData && extractedData.events) {
      const updatedEvents = [...extractedData.events];
      updatedEvents[index] = {
        ...updatedEvents[index],
        name: updatedEvent.name,
        start: updatedEvent.start_time,
        end: updatedEvent.end_time,
        start_time: updatedEvent.start_time,
        end_time: updatedEvent.end_time
      };
      setExtractedData({
        ...extractedData,
        events: updatedEvents
      });
    }
  };

  const handleEventDelete = (index) => {
    if (extractedData && extractedData.events) {
      const updatedEvents = extractedData.events.filter((_, i) => i !== index);
      setExtractedData({
        ...extractedData,
        events: updatedEvents
      });
    }
  };



  const onCsvDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setCsvFile(acceptedFiles[0]);
      processCsvFile(acceptedFiles[0]);
    }
  }, []);

  const onDocxDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setDocxFile(acceptedFiles[0]);
      processDocxFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps: getCsvRootProps, getInputProps: getCsvInputProps, isDragActive: isCsvDragActive } = useDropzone({
    onDrop: onCsvDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: true
  });

  const { getRootProps: getDocxRootProps, getInputProps: getDocxInputProps, isDragActive: isDocxDragActive } = useDropzone({
    onDrop: onDocxDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: true
  });

  const processCsvFile = async (file) => {
    setProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(header => header.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      const vesselData = extractVesselDataFromCsv(data);
      if (!vesselData) {
        alert('Could not extract vessel data from CSV.');
        return;
      }
      setExtractedData(vesselData);
    } catch (error) {
      alert('Error processing CSV file.');
    } finally {
      setProcessing(false);
    }
  };

  const processDocxFile = async (file) => {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const extracted = await extractEvents(formData);
      setExtractedData(extracted);
    } catch (error) {
      alert('Error processing document.');
    } finally {
      setProcessing(false);
    }
  };



  const extractVesselDataFromCsv = (csvData) => {
    if (!csvData || csvData.length === 0) {
      return null;
    }

    // Try to find vessel information in the first few rows
    let vesselRow = null;
    for (let i = 0; i < Math.min(5, csvData.length); i++) {
      const row = csvData[i];
      if (row.Vessel || row.vessel || row.VESSEL || row['Vessel Name'] || row['vessel_name']) {
        vesselRow = row;
        break;
      }
    }

    // If no vessel row found, use the first row
    if (!vesselRow && csvData.length > 0) {
      vesselRow = csvData[0];
    }

    if (vesselRow) {
      return {
        vessel: vesselRow.Vessel || vesselRow.vessel || vesselRow.VESSEL || vesselRow['Vessel Name'] || vesselRow['vessel_name'] || 'Unknown Vessel',
        voyageFrom: vesselRow['Voyage From'] || vesselRow['voyage_from'] || vesselRow['From'] || 'Unknown',
        voyageTo: vesselRow['Voyage To'] || vesselRow['voyage_to'] || vesselRow['To'] || 'Unknown',
        cargo: vesselRow.Cargo || vesselRow.cargo || vesselRow['Cargo Type'] || 'Unknown Cargo',
        port: vesselRow.Port || vesselRow.port || vesselRow['Port Name'] || 'Unknown Port',
        operation: vesselRow.Operation || vesselRow.operation || 'Discharge',
        demurragePerDay: parseFloat(vesselRow.Demurrage) || parseFloat(vesselRow['Demurrage Rate']) || 5000,
        dispatchPerDay: parseFloat(vesselRow.Dispatch) || parseFloat(vesselRow['Dispatch Rate']) || 2500,
        loadRatePerDay: parseFloat(vesselRow['Load Rate']) || parseFloat(vesselRow['Loading Rate']) || 10000,
        cargoQtyMt: parseFloat(vesselRow['Cargo Qty']) || parseFloat(vesselRow['Quantity']) || 47000,
        events: csvData.filter(row => row.Event || row.event || row['Event Name']).map(row => ({
          name: row.Event || row.event || row['Event Name'] || 'Unknown Event',
          start: row['Start Time'] || row['start_time'] || row['Start'] || '00:00',
          end: row['End Time'] || row['end_time'] || row['End'] || '00:00'
        })),
        sourceFile: 'CSV Upload'
      };
    }
    return null;
  };

  const removeFile = (type) => {
    if (type === 'csv') {
      setCsvFile(null);
    } else {
      setDocxFile(null);
    }
    setExtractedData(null);
  };

  // Export functions
  const exportToCSV = (data) => {
    if (!data || !data.events) return;
    
    // Create CSV content
    const headers = ['Event Name', 'Start Time', 'End Time'];
    const csvContent = [
      headers.join(','),
      ...data.events.map(event => [
        `"${event.name}"`,
        event.start,
        event.end
      ].join(','))
    ].join('\n');
    
    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laytime-events-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToJSON = (data) => {
    if (!data) return;
    
    // Download JSON file
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `laytime-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const saveToLaytime = (data) => {
    if (!data) {
      alert('No data to save. Please extract data from a document first.');
      return;
    }
    
    // Validate data before saving using utility function
    if (!validateExtractedData(data)) {
      alert('Invalid or incomplete data. Cannot save. Please ensure all required fields are present.');
      return;
    }
    
    try {
      // Sanitize data before saving
      const sanitizedData = sanitizeDataBeforeSave(data);
      
      // Get existing saved data from localStorage
      const existingData = localStorage.getItem('saved_calculations');
      const savedCalculations = existingData ? JSON.parse(existingData) : [];
      
      // Create new saved item with actual extracted data
      const newItem = {
        id: Date.now(), // Use timestamp as unique ID
        title: `${sanitizedData.vessel} - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        vessel: sanitizedData.vessel,
        voyageFrom: sanitizedData.voyageFrom || '',
        voyageTo: sanitizedData.voyageTo || '',
        cargo: sanitizedData.cargo || '',
        port: sanitizedData.port,
        operation: sanitizedData.operation || 'Discharge',
        demurragePerDay: sanitizedData.demurragePerDay || 0,
        dispatchPerDay: sanitizedData.dispatchPerDay || 0,
        loadRatePerDay: sanitizedData.loadRatePerDay || 0,
        cargoQtyMt: sanitizedData.cargoQtyMt || 0,
        totalEvents: sanitizedData.events ? sanitizedData.events.length : 0,
        status: 'saved',
        // Store the complete extracted data for detailed view
        extractedData: sanitizedData,
        // Store events array for CSV export
        events: sanitizedData.events || [],
        // Add timestamp for tracking
        createdAt: new Date().toISOString(),
        // Add file information
        sourceFile: sanitizedData.sourceFile || 'Unknown'
      };
      
      // Add to saved calculations
      savedCalculations.unshift(newItem); // Add to beginning of array
      
      // Save back to localStorage
      localStorage.setItem('saved_calculations', JSON.stringify(savedCalculations));
      
      alert('Data saved successfully! You can view it in the Saved Events section.');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Error saving data. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-0 md:p-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-3 lg:col-span-2 bg-white md:rounded-lg md:shadow-lg md:sticky md:top-6 h-full md:h-auto p-0">
          <div className="p-4 border-b font-semibold text-gray-900">Menu</div>
          <nav className="p-3 space-y-1">
            <Link to="/" className="block px-3 py-2 rounded hover:bg-blue-50">Dashboard</Link>
            <Link to="/saved-events" className="block px-3 py-2 rounded hover:bg-blue-50">Saved Events</Link>
            <Link to="/profile" className="block px-3 py-2 rounded hover:bg-blue-50">Profile</Link>
            <button
              onClick={() => setShowSupportModal(true)}
              className="block w-full text-left px-3 py-2 rounded hover:bg-blue-50"
            >Support</button>
          </nav>
          

        </aside>

        {/* Main Content */}
        <div className="md:col-span-9 lg:col-span-10 p-6">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="https://www.creativefabrica.com/wp-content/uploads/2022/12/05/AG-GA-initial-logo-brand-letter-design-v-Graphics-50456674-1-1-580x386.jpg" 
              alt="Company Logo" 
              className="mx-auto h-24 w-auto object-contain"
            />
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Document Processing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Upload documents to extract maritime events and data
            </p>
          </div>


              {/* File Upload Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* CSV File Upload */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div 
                    {...getCsvRootProps()} 
                    className={`text-center p-8 cursor-pointer transition-colors border-2 border-dashed rounded-lg ${
                      isCsvDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getCsvInputProps()} />
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Spreadsheet Files</h3>
                    <p className="text-sm text-gray-500 mb-4">CSV, Excel formats</p>
                    {csvFile ? (
                      <div className="text-sm text-green-600 font-medium">{csvFile.name}</div>
                    ) : (
                      <div className="text-sm text-gray-500">Drag & drop files or click to select</div>
                    )}
                  </div>
                  {csvFile && (
                    <button
                      onClick={() => removeFile('csv')}
                      className="w-full mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      Remove File
                    </button>
                  )}
                </div>

                {/* PDF/DOCX File Upload */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div 
                    {...getDocxRootProps()} 
                    className={`text-center p-8 cursor-pointer transition-colors border-2 border-dashed rounded-lg ${
                      isDocxDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input {...getDocxInputProps()} />
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Document Files</h3>
                    <p className="text-sm text-gray-500 mb-4">PDF, Word formats</p>
                    {docxFile ? (
                      <div className="text-sm text-blue-600 font-medium">{docxFile.name}</div>
                    ) : (
                      <div className="text-sm text-gray-500">Drag & drop files or click to select</div>
                    )}
                  </div>
                  {docxFile && (
                    <button
                      onClick={() => removeFile('docx')}
                      className="w-full mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                    >
                      Remove File
                    </button>
                  )}
                </div>
              </div>
          {/* Processing Status */}
          {processing && (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing...</p>
            </div>
          )}

          {/* Results */}
          {extractedData && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Extracted Events</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => exportToCSV(extractedData)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => exportToJSON(extractedData)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded font-medium"
                  >
                    Export JSON
                  </button>
                  <button
                    onClick={() => saveToLaytime(extractedData)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
              <EventTable 
                events={extractedData.events || []} 
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
              />
            </div>
          )}



          {/* Quick Actions - Original Workflow Boxes */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">CSV Processing</h3>
                  <p className="text-sm text-gray-500">Upload CSV files</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Upload CSV files to automatically extract vessel and event data.
              </p>
              <div className="text-sm text-gray-500">
                Supported: CSV, XLS, XLSX
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Document Processing</h3>
                  <p className="text-sm text-gray-500">PDF & Word files</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Process PDF and Word documents to extract laytime information.
              </p>
              <div className="text-sm text-gray-500">
                Supported: PDF, DOC, DOCX
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Export & Integration</h3>
                  <p className="text-sm text-gray-500">Multiple formats</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Export results in JSON/CSV format for seamless integration.
              </p>
              <div className="text-sm text-gray-500">
                Formats: JSON, CSV
              </div>
            </div>
          </div>

          {/* Support Modal */}
          {showSupportModal && (
            <SupportModal isOpen={showSupportModal} onClose={() => setShowSupportModal(false)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LayspanDashboard;
