# Agent X - Multi-Business AI Sales Assistant Platform

A scalable platform that allows multiple business owners to create their own AI-powered sales assistants. Each business gets a customized AI that responds in the customer's language (English, Hindi, or Hinglish) while maintaining a human-like persona.

## 🌟 Features

### For Business Owners
- **Easy Onboarding**: Create your business profile with details, products/services, and pricing
- **Customized AI Assistant**: AI automatically adapts to your business category and offerings
- **Multi-Language Support**: AI responds in English, Hindi, or Hinglish based on customer's language
- **Lead Qualification**: AI identifies high-value leads automatically
- **Shareable Chat Link**: Share your unique chat link with customers

### For Customers
- **WhatsApp-Style Interface**: Familiar chat experience
- **Natural Conversations**: AI never reveals it's automated
- **Personalized Assistance**: Random Indian assistant names for human-like feel
- **Product Recommendations**: AI suggests products based on customer needs

## 📁 Project Structure

```
Agent_X_MVP/
├── server/                      # Backend (Node.js + Express)
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User authentication model
│   │   └── Business.js        # Business and products model
│   ├── routes/
│   │   ├── auth.js            # Login/register endpoints
│   │   └── business.js        # Business CRUD endpoints
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── utils/
│   │   └── promptBuilder.js   # Dynamic AI prompt generator
│   ├── index.js               # Main server file
│   └── .env                   # Environment variables
│
└── client/                     # Frontend (React + TypeScript + Vite)
    ├── src/
    │   ├── components/
    │   │   └── ChatInterface.tsx
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Register.tsx
    │   │   ├── BusinessOnboarding.tsx
    │   │   └── Dashboard.tsx
    │   └── App.tsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js v14+ 
- MongoDB (local or cloud instance)
- Gemini API Key

### Installation

1. **Install MongoDB** (if not already installed)
   ```bash
   # Download from https://www.mongodb.com/try/download/community
   # Or use Docker:
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   
   Update `server/.env`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/agent-x-platform
   JWT_SECRET=your-secret-key-change-in-production
   ```

4. **Frontend Setup**
   ```bash
   cd client
   npm install
   ```

5. **Start MongoDB** (if using local installation)
   ```bash
   mongod
   ```

6. **Start Backend Server**
   ```bash
   cd server
   node index.js
   ```

7. **Start Frontend**
   ```bash
   cd client
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new business owner
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user (protected)

### Business Management
- `POST /api/business` - Create business (protected)
- `GET /api/business/my-business` - Get owner's business (protected)
- `PUT /api/business/:id` - Update business (protected)
- `GET /api/business/:id/public` - Get public business info

### Chat
- `POST /api/chat/:businessId` - Chat with business AI assistant (public)

### Health Check
- `GET /api/health` - Check server and database status

## 🎯 User Flow

### Business Owner Flow
1. Register account → Login
2. Create business profile (name, category, description, products)
3. Access dashboard with:
   - Business information display
   - Shareable chat link
   - Test chat interface
4. Share chat link with customers

### Customer Flow
1. Click business chat link
2. Enter name to start conversation
3. Chat with AI sales assistant
4. AI helps with product selection and lead qualification

## 📱 WhatsApp Integration (Coming Soon)

The platform is architected to support WhatsApp Cloud API integration:

### Planned Architecture
```
WhatsApp Message → Webhook → Business Router → AI Chat → Response
```

### Webhook Endpoints (Prepared)
- `GET /api/webhook` - Verification endpoint
- `POST /api/webhook` - Receive messages

### Setup Steps (Future)
1. Create Meta Developer App
2. Configure WhatsApp Business API
3. Set webhook URL: `https://your-domain.com/api/webhook`
4. Map business phone numbers to business IDs
5. Enable message routing and session management

## 🤖 AI Prompt System

The platform uses a **dynamic prompt builder** that:

1. Automatically generates personalized prompts for each business
2. Includes business name, category, description, and products
3. Enforces strict "no-AI-mention" rules
4. Adapts to customer's language (English/Hindi/Hinglish)
5. Maintains consistent sales-focused behavior

### Key Prompt Features
- Random Indian assistant names
- Context-aware product recommendations
- Lead qualification triggers
- Natural conversation flow
- No technical jargon or AI mentions

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication (7-day expiry)
- Protected API endpoints
- Input validation with express-validator
- CORS enabled for frontend communication

## 🛠️ Technologies Used

### Backend
- **Node.js** + **Express.js** - Server framework
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Generative AI (Gemini)** - AI chat engine
- **express-validator** - Input validation

### Frontend
- **React 19** + **TypeScript** - UI framework
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📊 Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### Business Collection
```javascript
{
  owner: ObjectId (ref: User),
  businessName: String,
  category: String (enum),
  description: String,
  startYear: Number,
  logo: String (optional),
  products: [{
    name: String,
    price: Number,
    description: String
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 Business Categories

- Saloon
- Gym
- Real Estate
- Restaurants
- Education
- Healthcare
- Retail
- Technology
- Consulting
- Other

## 📝 Environment Variables

### Required
- `GEMINI_API_KEY` - Your Google Gemini API key
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing

### Optional
- `PORT` - Server port (default: 3000)

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- For cloud MongoDB, whitelist your IP address

### Gemini API Errors
- Verify API key is correct
- Check API quota limits
- Ensure network connectivity

### Frontend Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (v14+ required)

## 🚧 Future Enhancements

- [ ] WhatsApp Cloud API integration
- [ ] Business analytics dashboard
- [ ] Multi-language UI (not just chat)
- [ ] File upload for business logos
- [ ] Advanced lead management
- [ ] Email notifications
- [ ] Payment integration
- [ ] Chat history export
- [ ] Custom AI personality settings

## 📄 License

This project is proprietary and confidential.

## 👥 Support

For questions or issues, contact the development team.

---

**Built with ❤️ for modern businesses**
