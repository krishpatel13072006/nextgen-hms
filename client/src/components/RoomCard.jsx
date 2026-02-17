import axios from 'axios';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bed, Wifi, Tv, Coffee, Wind, Users, Eye, ArrowRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function RoomCard({ room, onBooked }) {
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(room?.isAvailable ?? true);

  // Guard against undefined room
  if (!room) {
    return null;
  }

  const handleBooking = async () => {
    setLoading(true);
    try {
      // Get logged in user info
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await axios.post('http://localhost:5000/api/booking/book-room', {
        roomNumber: room.number,
        customerName: user.name || 'Guest User',
        customerEmail: user.email || 'guest@example.com'
      });
      
      alert(response.data.message);
      setIsAvailable(false);
      if (onBooked) onBooked(room.number);
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-3 h-3" />;
    if (lower.includes('tv')) return <Tv className="w-3 h-3" />;
    if (lower.includes('bar') || lower.includes('coffee')) return <Coffee className="w-3 h-3" />;
    if (lower.includes('air') || lower.includes('balcony')) return <Wind className="w-3 h-3" />;
    return <Bed className="w-3 h-3" />;
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'standard': return 'from-slate-500 to-slate-600';
      case 'deluxe': return 'from-blue-500 to-blue-600';
      case 'suite': return 'from-purple-500 to-purple-600';
      case 'presidential': return 'from-amber-500 to-amber-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="p-4 sm:p-6 md:p-8 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl shadow-lg dark:shadow-none dark:backdrop-blur-md hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-300 group"
    >
      {/* Room Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getTypeColor(room.type)}`}>
            {room.type}
          </div>
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mt-2 text-gray-900 dark:text-white">Room {room.number}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {formatPrice(room.currentPrice || room.price)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">/night</p>
          {room.currentPrice && room.currentPrice !== room.price && (
            <p className="text-xs text-gray-400 dark:text-gray-500 line-through">{formatPrice(room.price)}</p>
          )}
        </div>
      </div>

      {/* Description */}
      {room.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {room.description}
        </p>
      )}

      {/* Capacity */}
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
        <Users className="w-4 h-4" />
        <span>Capacity: {room.capacity || 2} guests</span>
      </div>

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {room.amenities.slice(0, 4).map((amenity, i) => (
            <span 
              key={i} 
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-xs text-gray-600 dark:text-gray-400"
            >
              {getAmenityIcon(amenity)}
              {amenity}
            </span>
          ))}
          {room.amenities.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-xs text-gray-500 dark:text-gray-500">
              +{room.amenities.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Book & View Details Buttons */}
      <div className="space-y-2">
        <Link
          to={`/rooms/${room._id || room.number}`}
          className="w-full py-2.5 sm:py-3 md:py-4 rounded-xl font-bold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details & Book
        </Link>
      </div>
    </motion.div>
  );
}
