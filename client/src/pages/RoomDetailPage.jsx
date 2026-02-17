import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCurrency } from '../context/CurrencyContext';
import ServiceMenu from '../components/ServiceMenu';
import { 
  ArrowLeft, Bed, Bath, Users, Wifi, Tv, Coffee, Wind, 
  Calendar, Star, MapPin, Clock, Shield, Check, Car, Dumbbell, Utensils
} from 'lucide-react';

// Using local images from src folder
const getRoomImage = (roomNumber) => {
  // Local room images from src folder
  const localImages = {
    '101': '/1.avif',
    '102': '/2.avif',
    '201': '/3.avif',
    '202': '/4.avif',
    '301': '/5.avif',
    '302': '/3.avif',
    '401': '/5.avif',
  };
  
  return localImages[roomNumber] || '/1.avif';
};

// Fallback gradient colors for each room
const ROOM_COLORS = {
  '101': 'from-blue-800 to-indigo-900',
  '102': 'from-purple-800 to-pink-900',
  '201': 'from-teal-800 to-cyan-900',
  '202': 'from-orange-800 to-amber-900',
  '301': 'from-emerald-800 to-green-900',
  '302': 'from-rose-800 to-red-900',
  '401': 'from-amber-800 to-yellow-900',
};

export default function RoomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState({ checkIn: '', checkOut: '' });
  const [imageError, setImageError] = useState(false);

  const roomNumber = room?.number?.toString();
  const roomImage = roomNumber ? getRoomImage(roomNumber) : null;
  const roomColors = ROOM_COLORS[roomNumber] || 'from-blue-900 to-purple-900';

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/patients');
        const rooms = data.rooms || data;
        const foundRoom = rooms.find(r => r._id === id || r.number?.toString() === id);
        setRoom(foundRoom || null);
      } catch (error) {
        console.error('Error fetching room:', error);
        setRoom(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedDates.checkIn || !selectedDates.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post('http://localhost:5000/api/booking/book-room', {
        roomNumber: room.number,
        customerName: user.name || 'Guest User',
        customerEmail: user.email || 'guest@example.com',
        checkIn: selectedDates.checkIn,
        checkOut: selectedDates.checkOut
      });
      alert('Room booked successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Booking failed');
    }
  };

  const getAmenityIcon = (amenity) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="w-4 h-4" />;
    if (lower.includes('tv')) return <Tv className="w-4 h-4" />;
    if (lower.includes('bar') || lower.includes('coffee')) return <Utensils className="w-4 h-4" />;
    if (lower.includes('air') || lower.includes('balcony')) return <Wind className="w-4 h-4" />;
    if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
    if (lower.includes('parking')) return <Car className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold mb-2">Room not found</h2>
        <button onClick={() => navigate('/rooms')} className="mt-4 px-6 py-2 bg-blue-600 rounded-lg">
          Back to Rooms
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <button onClick={() => navigate('/rooms')} className="flex items-center gap-2 text-gray-300 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Rooms
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Room Image */}
        <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden mb-6">
          {!imageError && roomImage ? (
            <img 
              src={roomImage} 
              alt={`Room ${room.number}`} 
              className="w-full h-full object-cover object-center"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${roomColors} flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-6xl mb-2">🛏️</div>
                <p className="text-xl font-bold">{room.type} Room</p>
                <p className="text-gray-300">Room {room.number}</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          
          {/* Room Title on Image */}
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm font-medium mb-2">
              {room.type}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold">Room {room.number}</h1>
            <div className="flex items-center gap-4 text-gray-300 text-sm mt-1">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Floor {Math.floor(room.number / 100)}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Up to {room.capacity} guests</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-xl font-bold mb-3">About This Room</h2>
              <p className="text-gray-300 leading-relaxed">
                {room.description || `Welcome to our beautiful ${room.type} Room ${room.number}. 
                This spacious and elegantly appointed room features modern amenities, comfortable furniture, 
                and a relaxing atmosphere. Perfect for both business and leisure travelers.`}
              </p>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <Bed className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-gray-400 text-xs">Bed Type</p>
                <p className="font-semibold">King Size</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <Bath className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-gray-400 text-xs">Bathroom</p>
                <p className="font-semibold">En-suite</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-gray-400 text-xs">View</p>
                <p className="font-semibold">City View</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-xl font-bold mb-4">Room Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(room.amenities || []).map((amenity, i) => (
                  <div key={i} className="flex items-center gap-3 text-gray-300">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                      {getAmenityIcon(amenity)}
                    </div>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div className="bg-gray-800 rounded-xl p-5">
              <h2 className="text-xl font-bold mb-4">Hotel Policies</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Check-in</p>
                    <p className="font-semibold">3:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Check-out</p>
                    <p className="font-semibold">11:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Cancellation</p>
                    <p className="font-semibold">Free</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Room Service / Food Menu */}
            <ServiceMenu roomNumber={room?.number?.toString()} />
          </div>

          {/* Right Column - Booking */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-5 sticky top-4">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <span className="text-4xl font-bold">{formatPrice(room.currentPrice || room.price)}</span>
                  <span className="text-gray-400">/night</span>
                </div>
                {room.currentPrice && room.price && room.currentPrice < room.price && (
                  <span className="text-sm bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full">
                    {Math.round((1 - room.currentPrice / room.price) * 100)}% OFF
                  </span>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Check-in</label>
                  <input
                    type="date"
                    value={selectedDates.checkIn}
                    onChange={(e) => setSelectedDates({...selectedDates, checkIn: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Check-out</label>
                  <input
                    type="date"
                    value={selectedDates.checkOut}
                    onChange={(e) => setSelectedDates({...selectedDates, checkOut: e.target.value})}
                    className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!room.isAvailable}
                className={`w-full py-4 rounded-xl font-bold mb-3 ${
                  room.isAvailable 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {room.isAvailable ? 'Book Now' : 'Not Available'}
              </button>

              <p className="text-xs text-gray-500 text-center">You won't be charged yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
