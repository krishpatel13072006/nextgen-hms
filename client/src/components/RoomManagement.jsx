import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit2, Trash2, X, Bed, DollarSign, 
  Image as ImageIcon, CheckCircle, XCircle, Save
} from 'lucide-react';

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    type: 'standard',
    price: '',
    description: '',
    amenities: [],
    images: [],
    panoramicImage: '',
    maxGuests: 2,
    isAvailable: true
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/patients');
      setRooms(data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (room = null) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        number: room.number || '',
        type: room.type || 'standard',
        price: room.price || '',
        description: room.description || '',
        amenities: room.amenities || [],
        images: room.images || [],
        panoramicImage: room.panoramicImage || '',
        maxGuests: room.maxGuests || 2,
        isAvailable: room.isAvailable !== false
      });
    } else {
      setEditingRoom(null);
      setFormData({
        number: '',
        type: 'standard',
        price: '',
        description: '',
        amenities: [],
        images: [],
        panoramicImage: '',
        maxGuests: 2,
        isAvailable: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRoom(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity)
    });
  };

  const handleImageUrlAdd = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      setFormData({
        ...formData,
        images: [...formData.images, url]
      });
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const roomData = {
        ...formData,
        price: Number(formData.price),
        maxGuests: Number(formData.maxGuests)
      };

      if (editingRoom) {
        await axios.put(`http://localhost:5000/api/patients/${editingRoom._id}`, roomData);
      } else {
        await axios.post('http://localhost:5000/api/patients', roomData);
      }
      
      fetchRooms();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving room:', error);
      alert(error.response?.data?.message || 'Error saving room');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await axios.delete(`http://localhost:5000/api/patients/${roomId}`);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Error deleting room');
    }
  };

  const handleToggleAvailability = async (roomId) => {
    try {
      await axios.patch(`http://localhost:5000/api/patients/${roomId}/availability`);
      fetchRooms();
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  return (
    <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Bed className="w-5 h-5" />
          Room Management
        </h3>
        <button
          onClick={() => handleOpenModal()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm text-white transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Room
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-2 text-gray-400">Room</th>
                <th className="text-left py-3 px-2 text-gray-400">Type</th>
                <th className="text-left py-3 px-2 text-gray-400">Price</th>
                <th className="text-left py-3 px-2 text-gray-400">Guests</th>
                <th className="text-left py-3 px-2 text-gray-400">Status</th>
                <th className="text-left py-3 px-2 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 px-2 text-white font-medium">
                    Room {room.number}
                  </td>
                  <td className="py-3 px-2 text-gray-300 capitalize">
                    {room.type}
                  </td>
                  <td className="py-3 px-2 text-gray-300">
                    ${room.price}/night
                  </td>
                  <td className="py-3 px-2 text-gray-300">
                    {room.maxGuests}
                  </td>
                  <td className="py-3 px-2">
                    <button
                      onClick={() => handleToggleAvailability(room._id)}
                      className={`flex items-center gap-1 text-xs ${
                        room.isAvailable ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {room.isAvailable ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" />
                          Unavailable
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(room)}
                        className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room._id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No rooms found. Add your first room!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {editingRoom ? 'Edit Room' : 'Add New Room'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Room Number */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Room Number</label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="e.g., 101"
                />
              </div>

              {/* Room Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Room Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="presidential">Presidential</option>
                </select>
              </div>

              {/* Price and Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Price per Night ($)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Guests</label>
                  <input
                    type="number"
                    name="maxGuests"
                    value={formData.maxGuests}
                    onChange={handleChange}
                    required
                    min="1"
                    max="10"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="Room description..."
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Amenities</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={amenityInput}
                    onChange={(e) => setAmenityInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="Add amenity"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs flex items-center gap-1"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(amenity)}
                        className="hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Image URLs</label>
                <button
                  type="button"
                  onClick={handleImageUrlAdd}
                  className="w-full py-2 border border-dashed border-slate-600 rounded-lg text-gray-400 hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2"
                >
                  <ImageIcon className="w-4 h-4" />
                  Add Image URL
                </button>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 360° Panoramic Image for 3D Tour */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">360° Panoramic Image URL (Optional)</label>
                <input
                  type="url"
                  name="panoramicImage"
                  value={formData.panoramicImage}
                  onChange={handleChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                  placeholder="https://example.com/panorama.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter a 360° panoramic image URL for the virtual tour feature.
                  Leave empty to use default images.
                </p>
                {formData.panoramicImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.panoramicImage} 
                      alt="Panorama preview" 
                      className="w-32 h-20 object-cover rounded"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                  className="rounded bg-slate-700 border-slate-600 text-blue-500"
                />
                <label className="text-sm text-gray-300">Available for booking</label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingRoom ? 'Update Room' : 'Create Room'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
