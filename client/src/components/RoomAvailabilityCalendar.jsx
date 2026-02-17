import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Bed, CheckCircle, XCircle } from 'lucide-react';

export default function RoomAvailabilityCalendar({ rooms = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('https://nextgen-hms-backend.onrender.com/api/appointments');
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isRoomBooked = (roomNumber, date) => {
    if (!date) return false;
    
    return bookings.some(booking => {
      if (!booking.room || booking.room.number !== roomNumber) return false;
      
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      // Check if date is between check-in and check-out (inclusive of check-in, exclusive of check-out)
      return date >= checkIn && date < checkOut;
    });
  };

  const getBookingForCell = (roomNumber, date) => {
    if (!date) return null;
    
    return bookings.find(booking => {
      if (!booking.room || booking.room.number !== roomNumber) return false;
      
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      
      return date >= checkIn && date < checkOut;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Bed className="w-5 h-5" />
          Room Availability Calendar
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No rooms available
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day headers */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Room</div>
              {dayNames.map(day => (
                <div key={day} className="text-xs text-gray-500 dark:text-gray-400 font-medium text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {rooms.slice(0, 6).map(room => (
              <div key={room._id} className="grid grid-cols-8 gap-1 mb-1">
                <div className="text-xs text-gray-700 dark:text-gray-300 font-medium flex items-center">
                  Room {room.number}
                </div>
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-8" />;
                  }
                  
                  const booked = isRoomBooked(room.number, date);
                  const booking = getBookingForCell(room.number, date);
                  const isToday = new Date().toDateString() === date.toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`h-8 flex items-center justify-center text-xs rounded ${
                        booked 
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                      title={booking ? `Booked by: ${booking.guestName || 'Guest'}` : 'Available'}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/30 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 rounded" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white dark:bg-slate-700 rounded ring-2 ring-blue-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Today</span>
        </div>
      </div>
    </div>
  );
}
