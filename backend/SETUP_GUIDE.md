# 🎉 Event Management Platform - Complete Setup Guide

## 📦 What You Have

A **complete full-stack event management system** with:

- ✅ **Backend API** (Node.js + Express + TypeScript + MySQL)
- ✅ **Frontend UI** (React + Vite + Tailwind CSS)

---

## 🚀 Quick Start Guide

### **Step 1: Start the Backend**

1. **Open a terminal in the project root:**

   ```powershell
   cd "d:\New folder\event-management-platform"
   ```

2. **Make sure MySQL is running** (it should already be running)

3. **Start the backend server:**

   ```powershell
   npm run dev
   ```

   ✅ Backend will run at: `http://localhost:5050`

---

### **Step 2: Start the Frontend**

1. **Open a NEW terminal** (keep backend running)

2. **Navigate to frontend folder:**

   ```powershell
   cd "d:\New folder\event-management-platform\frontend"
   ```

3. **Install dependencies (first time only):**

   ```powershell
   npm install
   ```

4. **Start the frontend dev server:**

   ```powershell
   npm run dev
   ```

   ✅ Frontend will run at: `http://localhost:3000`

---

## 🌐 Using the Application

### **Open in Browser:**

```
http://localhost:3000
```

### **Available Features:**

1. **Home Page** (`/`)

   - Beautiful landing page with hero section
   - Features overview
   - Call-to-action buttons

2. **Sign Up** (`/signup`)

   - Create a new account
   - Form validation
   - Redirects to login after success

3. **Login** (`/login`)

   - Sign in with email and password
   - JWT token stored in localStorage
   - Redirects to dashboard

4. **Dashboard** (`/dashboard`) 🔒 Protected

   - User welcome message
   - Quick stats cards
   - Quick action buttons

5. **Events** (`/events`)

   - Browse all available events
   - View event details
   - Book tickets (requires login)

6. **My Tickets** (`/my-tickets`) 🔒 Protected
   - View booked tickets
   - See QR codes
   - Event details

---

## 🎨 Frontend Features

### **✨ UI Components:**

- **Button** - Multiple variants (primary, secondary, danger, outline)
- **Card** - Clean card design with hover effects
- **Input** - Form input with validation
- **Loader** - Loading spinner (inline or fullscreen)
- **Navbar** - Responsive navigation with auth status
- **Footer** - Professional footer with links

### **🔐 Authentication:**

- JWT token management
- Protected routes
- Auto-redirect on logout
- Persistent login (localStorage)

### **📱 Responsive Design:**

- Mobile-first approach
- Works on all screen sizes
- Touch-friendly

### **🎯 User Experience:**

- Loading states
- Error handling
- Form validation
- Success messages

---

## 📂 Project Structure

```
event-management-platform/
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── server.ts          # Main server file
│   │   ├── config/            # Database, mailer, payment config
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   └── middlewares/       # Auth & error handling
│   ├── tickets/               # Generated QR codes
│   ├── package.json
│   └── .env                   # Backend environment variables
│
└── frontend/                   # Frontend React App
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Page components
    │   ├── services/          # API integration
    │   ├── layouts/           # Layout wrappers
    │   ├── hooks/             # Custom hooks
    │   ├── utils/             # Helper functions
    │   ├── App.jsx            # Main app
    │   ├── router.jsx         # Route config
    │   └── main.jsx           # Entry point
    ├── public/                # Static assets
    ├── package.json
    └── .env                   # Frontend environment variables
```

---

## 🔧 Configuration Files

### **Backend `.env`** (already configured)

```env
PORT=5050
JWT_SECRET=supersecretkey
DB_HOST=127.0.0.1
DB_USER=root
DB_PASS=your_password
DB_NAME=event_management
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

### **Frontend `.env`** (already configured)

```env
VITE_API_URL=http://localhost:5050/api
```

---

## 🎯 Testing the Full Flow

### **1. Register a User:**

- Go to `http://localhost:3000/signup`
- Fill in: Name, Email, Password
- Click "Create Account"

### **2. Login:**

- Go to `http://localhost:3000/login`
- Enter your email and password
- Click "Sign In"

### **3. Browse Events:**

- Navigate to "Events" in navbar
- View all available events
- Click "Book Ticket" on any event

### **4. View Tickets:**

- Go to "My Tickets" in navbar
- See your booked tickets with QR codes
- QR code also sent to your email!

---

## 🛠️ Development Commands

### **Backend:**

```powershell
npm run dev      # Development mode with auto-reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Production mode
```

### **Frontend:**

```powershell
npm run dev      # Development mode (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🎨 Customization

### **Colors:**

Edit `frontend/tailwind.config.js` to change the color scheme:

```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Change this
    600: '#0284c7',  // And this
  }
}
```

### **Logo:**

Replace the "E" logo in:

- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/Footer.jsx`

### **API URL:**

Change backend URL in `frontend/.env`:

```env
VITE_API_URL=https://your-backend.com/api
```

---

## 🚨 Troubleshooting

### **Backend won't start:**

- Check if MySQL is running: `Get-Service MySQL80`
- Verify database credentials in `.env`
- Check if port 5050 is available

### **Frontend won't start:**

- Delete `node_modules` and run `npm install` again
- Check if port 3000 is available
- Verify `.env` file exists

### **Can't login:**

- Check backend is running at `http://localhost:5050`
- Open browser DevTools → Network tab to see API errors
- Verify JWT_SECRET is set in backend `.env`

### **No events showing:**

- Create events using the `test-api.http` file
- Or use Postman to POST to `/api/events`

---

## 📚 API Endpoints

### **Authentication:**

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### **Events:**

- `GET /api/events` - Get all events (public)
- `GET /api/events/:id` - Get single event (public)
- `POST /api/events` - Create event (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)

### **Tickets:**

- `POST /api/tickets` - Book ticket (protected)
- `GET /api/tickets/my-tickets` - Get user tickets (protected)

---

## 🎉 You're All Set!

Your complete event management platform is ready to use. Enjoy building and customizing it!

**Built with ❤️ by Yashwant Reddy**
