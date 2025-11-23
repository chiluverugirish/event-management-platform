# Event Management Frontend

A modern, responsive React frontend for the Event Management Platform built with Vite and Tailwind CSS.

## 🚀 Features

- **User Authentication** - Login and signup with JWT tokens
- **Event Discovery** - Browse and search for events
- **Ticket Booking** - Book tickets with QR code generation
- **Dashboard** - User dashboard with stats and quick actions
- **Responsive Design** - Mobile-first design with Tailwind CSS
- **Protected Routes** - Secure routes for authenticated users
- **Error Handling** - Global error handling and user feedback

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API running on `http://localhost:5050`

## 🛠️ Installation

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - The `.env` file is already created with:
     ```
     VITE_API_URL=http://localhost:5050/api
     ```
   - Update if your backend runs on a different port

## 🎯 Running the Application

### Development Mode (with hot-reload):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production:

```bash
npm run build
```

### Preview Production Build:

```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Loader.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/            # Page components
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Events.jsx
│   │   ├── MyTickets.jsx
│   │   └── NotFound.jsx
│   ├── services/         # API service layer
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── eventService.js
│   │   └── ticketService.js
│   ├── layouts/          # Layout components
│   │   ├── MainLayout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.js
│   ├── utils/            # Utility functions
│   │   └── helpers.js
│   ├── App.jsx           # Main app component
│   ├── router.jsx        # Route configuration
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── .env                  # Environment variables
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── package.json          # Dependencies
```

## 🎨 Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

## 🔐 Authentication Flow

1. User signs up or logs in
2. JWT token is stored in localStorage
3. Token is attached to all API requests via axios interceptor
4. Protected routes check for token before rendering
5. Logout clears token and redirects to login

## 📱 Pages

- **/** - Landing page with hero section and features
- **/events** - Browse all available events
- **/login** - User login
- **/signup** - User registration
- **/dashboard** - User dashboard (protected)
- **/my-tickets** - View booked tickets with QR codes (protected)
- **/404** - Not found page

## 🎯 API Integration

All API calls are centralized in the `services/` directory:

- **authService.js** - Login, register, logout
- **eventService.js** - Get events, create, update, delete
- **ticketService.js** - Book tickets, get user tickets

## 🚀 Deployment

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your hosting service (Vercel, Netlify, etc.)

3. Update the `VITE_API_URL` environment variable to point to your production backend

## 👨‍💻 Author

Built by Yashwant Reddy

## 📄 License

ISC

```

This frontend provides a complete, production-ready interface for your Event Management Platform! 🎉
```
