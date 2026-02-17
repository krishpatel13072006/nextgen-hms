// API Configuration - Auto-detects production vs development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const API_ENDPOINTS = {
  // Auth
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  profile: `${API_BASE_URL}/auth/profile`,
  changePassword: `${API_BASE_URL}/auth/change-password`,
  
  // Rooms/Patients
  rooms: `${API_BASE_URL}/patients`,
  patients: `${API_BASE_URL}/patients`,
  
  // Appointments/Bookings
  appointments: `${API_BASE_URL}/appointments`,
  bookings: `${API_BASE_URL}/appointments/my-bookings`,
  bookRoom: `${API_BASE_URL}/booking/book-room`,
  
  // Analytics
  analytics: `${API_BASE_URL}/analytics/stats`,
  
  // Requests
  requests: `${API_BASE_URL}/requests`,
  allRequests: `${API_BASE_URL}/requests/all`,
  requestStats: `${API_BASE_URL}/requests/stats`,
  bulkStatus: `${API_BASE_URL}/requests/bulk/status`,
  
  // AI
  aiChat: `${API_BASE_URL}/ai/chat`,
  
  // Upload
  uploadMultiple: `${API_BASE_URL}/upload/multiple`,
  uploadSingle: `${API_BASE_URL}/upload/single`,
  deleteUpload: `${API_BASE_URL}/upload`,
  
  // Reviews
  reviews: `${API_BASE_URL}/reviews`,
};

export default API_BASE_URL;
