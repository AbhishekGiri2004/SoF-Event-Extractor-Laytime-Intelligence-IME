import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { validateExtractedData } from '../utils/dataCleanup';

const SavedEvents = () => {
  const [savedEvents, setSavedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadSavedEvents();
  }, []);

  const loadSavedEvents = () => {
    setLoading(true);
    try {
      const existingData = localStorage.getItem('saved_calculations');
      const savedCalculations = existingData ? JSON.parse(existingData) : [];
      
      // Filter out dummy or invalid data
      const validEvents = savedCalculations.filter(calc => {
        return validateExtractedData(calc);
      });
      
      setSavedEvents(validEvents);
    } catch (error) {
      console.error('Error loading saved events:', error);
      setSavedEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = savedEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.vessel.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.port.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (confirm('Delete this event?')) {
      const updatedEvents = savedEvents.filter(event => event.id !== id);
      setSavedEvents(updatedEvents);
      localStorage.setItem('saved_calculations', JSON.stringify(updatedEvents));
    }
  };

  const handleEditTitle = (event) => {
    setEditingId(event.id);
    setEditTitle(event.title);
  };

  const handleSaveTitle = (id) => {
    const updatedEvents = savedEvents.map(event => 
      event.id === id ? { ...event, title: editTitle } : event
    );
    setSavedEvents(updatedEvents);
    localStorage.setItem('saved_calculations', JSON.stringify(updatedEvents));
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading saved events...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Saved Events</h1>
          <p className="text-xl text-gray-600">Manage your extracted laytime events</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Events Display */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by extracting events from your documents.'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link to="/" className="btn-primary">
                  Extract Events
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow-md p-6">
                {editingId === event.id ? (
                  <div className="mb-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-lg font-semibold border border-gray-300 rounded px-2 py-1 mb-2"
                      onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle(event.id)}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveTitle(event.id)}
                        className="px-2 py-1 bg-green-600 text-white text-xs rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3 
                    className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleEditTitle(event)}
                    title="Click to edit"
                  >
                    {event.title}
                  </h3>
                )}
                <p className="text-sm text-gray-500 mb-4">{event.date}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Vessel:</span>
                    <span className="text-sm text-gray-900">{event.vessel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Port:</span>
                    <span className="text-sm text-gray-900">{event.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Events:</span>
                    <span className="text-sm text-gray-900">{event.totalEvents}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => exportToCSV(event)}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                  >
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleEditTitle(event)}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}


      </div>
    </div>
  );
};

export default SavedEvents;
