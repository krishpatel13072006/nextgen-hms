# 🏨 NextGen HMS - AI-Powered Hospital/Hotel Management System

A modern, full-stack management system featuring a stunning 3D frontend with glassmorphism UI, real-time analytics, dynamic pricing, and AI-powered concierge services.

![NextGen HMS](https://img.shields.io/badge/NextGen-HMS-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Local-47A248?style=flat-square&logo=mongodb)
![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=flat-square&logo=three.js)

## ✨ Features

### Frontend
- 🎨 **Glassmorphism UI** - Modern, translucent design with blur effects
- 🌐 **3D Hero Section** - Interactive Three.js animated sphere
- 🤖 **AI Concierge Widget** - Floating chatbot with Gemini AI integration
- 📊 **Admin Analytics Dashboard** - Real-time occupancy and revenue tracking
- 🔐 **Smart Check-In** - Digital identity verification with scanning animation
- 💳 **Room Booking Cards** - Live availability with dynamic pricing

### Backend
- 🔐 **JWT Authentication** - Secure user registration and login
- 🏠 **Room Management** - CRUD operations for 4 room types
- 💰 **Dynamic Pricing Engine** - Prices adjust based on occupancy and weekends
- 📈 **Analytics API** - Revenue, occupancy, and booking statistics
- 🤖 **AI Integration** - Google Gemini-powered concierge service

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- MongoDB Compass (recommended for local development)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/nextgen-hms.git
cd nextgen-hms
```

2. **Setup Backend**
```bash
cd server
npm install
```

3. **Configure Environment Variables**

Create a `.env` file in the `server` folder:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/luxe_hms
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

4. **Setup Frontend**
```bash
cd ../client
npm install
```

### Running the Application

1. **Start MongoDB** (ensure MongoDB is running on port 27017)

2. **Test Database Connection**
```bash
cd server
npm run test-db
```

3. **Seed Database** (populate with sample data)
```bash
npm run seed
```

4. **Start Backend Server**
```bash
npm run dev
# Server runs on http://localhost:5000
```

5. **Start Frontend** (in a new terminal)
```bash
cd client
npm run dev
# Frontend runs on http://localhost:5173
```

## 📁 Project Structure

```
nextgen-hms/
├── client/                    # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero3D.jsx        # 3D animated sphere
│   │   │   ├── AIConcierge.jsx   # Floating chatbot
│   │   │   ├── SmartCheckIn.jsx  # ID scanner
│   │   │   └── RoomCard.jsx      # Booking card
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Room management
│   │   │   └── AdminAnalytics.jsx # Analytics dashboard
│   │   ├── App.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                    # Backend (Node + Express)
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Room.js              # Room schema
│   │   └── Booking.js           # Booking schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── patients.js          # Room CRUD
│   │   ├── booking.js           # Booking operations
│   │   ├── analytics.js         # Statistics
│   │   └── ai.js                # AI concierge
│   ├── services/
│   │   ├── aiService.js         # Gemini AI integration
│   │   └── pricingEngine.js     # Dynamic pricing
│   ├── db.js                    # Database connection
│   ├── seed.js                  # Database seeding
│   ├── test-db.js               # Connection testing
│   └── index.js                 # Server entry point
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Rooms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | Get all rooms with dynamic pricing |
| GET | `/api/patients/:id` | Get single room |
| POST | `/api/patients` | Create room (admin) |
| PUT | `/api/patients/:id` | Update room |
| DELETE | `/api/patients/:id` | Delete room |
| PATCH | `/api/patients/:id/availability` | Toggle availability |

### Booking
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/booking/book-room` | Book a room |
| POST | `/api/booking/reserve` | Quick reserve |
| POST | `/api/booking/cancel` | Cancel booking |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/stats` | Get hotel statistics |
| GET | `/api/analytics/revenue` | Get revenue over time |

### AI Concierge
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI concierge |
| POST | `/api/ai/medical` | Medical assistant chat |
| GET | `/api/ai/suggestions` | Get quick suggestions |

## 🏠 Room Types

| Type | Base Price | Features |
|------|------------|----------|
| Standard | $120/night | WiFi, Smart TV, Work Desk |
| Deluxe | $250/night | Ocean View, King Bed, Mini-bar |
| Suite | $550/night | Private Pool, Butler, Kitchenette |
| Presidential | $850/night | Panoramic View, Full Kitchen, Living Room |

## 💰 Dynamic Pricing

The system automatically adjusts room prices based on:

- **Occupancy Rate**: +20% when >70% occupied, +10% when >50%
- **Weekend Surge**: +15% on Friday, Saturday, Sunday
- **Holiday Season**: +10% during peak months

## 🔐 Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nextgenhms.com | admin123 |
| User | john@example.com | password123 |

## 🛠️ Tech Stack

### Frontend
- **Vite** - Fast build tool
- **React 18** - UI library
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Useful helpers for R3F
- **Framer Motion** - Animations
- **Tailwind CSS** - Utility-first CSS
- **Axios** - HTTP client
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Gemini AI** - AI concierge

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://127.0.0.1:27017/luxe_hms |
| JWT_SECRET | JWT signing secret | (required) |
| JWT_EXPIRE | Token expiration | 7d |
| GEMINI_API_KEY | Google Gemini API key | (required for AI) |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |

## 🐛 Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running locally
2. Use `127.0.0.1` instead of `localhost` (Node.js 18+ compatibility)
3. Check if port 27017 is available
4. Verify connection in MongoDB Compass

### Common Errors
- **ECONNREFUSED**: MongoDB not running
- **Authentication failed**: Check JWT_SECRET
- **CORS errors**: Verify CLIENT_URL in .env

## 📄 License

MIT License - feel free to use this project for learning or production.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using React, Node.js, and MongoDB
