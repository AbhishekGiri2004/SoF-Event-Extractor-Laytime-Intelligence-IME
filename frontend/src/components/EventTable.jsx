import React, { useState } from "react";

const EventTable = ({ events, onEventUpdate, onEventDelete }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editData, setEditData] = useState({});

  const handleEdit = (index, event) => {
    setEditingIndex(index);
    setEditData({
      name: event.name || event.event,
      start_time: event.start_time,
      end_time: event.end_time
    });
  };

  const handleSave = (index) => {
    if (onEventUpdate) {
      onEventUpdate(index, editData);
    }
    setEditingIndex(null);
  };

  const isMissingTime = (event) => {
    const start = event.start_time;
    const end = event.end_time;
    return !start || !end || start === '--:--' || end === '--:--' || start === '00:00' && end === '00:00';
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-4">
      <table className="w-full table-auto border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Event</th>
            <th className="border px-4 py-2">Start Time</th>
            <th className="border px-4 py-2">End Time</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr key={i} className={isMissingTime(e) ? 'bg-yellow-50' : ''}>
              <td className="border px-4 py-2">
                {editingIndex === i ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(ev) => setEditData({...editData, name: ev.target.value})}
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  e.name || e.event
                )}
              </td>
              <td className="border px-4 py-2">
                {editingIndex === i ? (
                  <input
                    type="time"
                    value={editData.start_time === '--:--' ? '' : editData.start_time}
                    onChange={(ev) => setEditData({...editData, start_time: ev.target.value})}
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  <span className={isMissingTime(e) ? 'text-red-500' : ''}>
                    {e.start_time}
                  </span>
                )}
              </td>
              <td className="border px-4 py-2">
                {editingIndex === i ? (
                  <input
                    type="time"
                    value={editData.end_time === '--:--' ? '' : editData.end_time}
                    onChange={(ev) => setEditData({...editData, end_time: ev.target.value})}
                    className="w-full p-1 border rounded"
                  />
                ) : (
                  <span className={isMissingTime(e) ? 'text-red-500' : ''}>
                    {e.end_time}
                  </span>
                )}
              </td>
              <td className="border px-4 py-2">
                {editingIndex === i ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(i)}
                      className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(i, e)}
                      className={`px-2 py-1 rounded text-sm ${
                        isMissingTime(e) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onEventDelete && onEventDelete(i)}
                      className="bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Del
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;
