# 🚀 Quick Start Commands

## Option 1: Run Both Servers (Recommended)

### Terminal 1 - Backend:

```powershell
cd "d:\New folder\event-management-platform"
npm run dev
```

### Terminal 2 - Frontend:

```powershell
cd "d:\New folder\event-management-platform\frontend"
npm install  # Only first time
npm run dev
```

### Open Browser:

```
http://localhost:3000
```

---

## Option 2: Using PowerShell Script (Advanced)

### Create a `start-all.ps1` file:

```powershell
# Start Backend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'd:\New folder\event-management-platform'; npm run dev"

# Wait 3 seconds
Start-Sleep -Seconds 3

# Start Frontend
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'd:\New folder\event-management-platform\frontend'; npm run dev"

# Open Browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
```

### Run it:

```powershell
.\start-all.ps1
```

---

## Individual Commands

### Backend Only:

```powershell
cd "d:\New folder\event-management-platform"
npm run dev
```

Server at: `http://localhost:5050`

### Frontend Only:

```powershell
cd "d:\New folder\event-management-platform\frontend"
npm run dev
```

App at: `http://localhost:3000`

---

## First Time Setup (Frontend)

```powershell
cd "d:\New folder\event-management-platform\frontend"
npm install
```

This installs all frontend dependencies (React, Vite, Tailwind, etc.)

---

## Production Build

### Backend:

```powershell
npm run build
npm start
```

### Frontend:

```powershell
cd frontend
npm run build
npm run preview
```

---

## Stop Servers

Press `Ctrl + C` in each terminal to stop the servers.

---

## Test API Endpoints

You can use the `test-api.http` file in VS Code with the REST Client extension, or use these curl commands:

### Register User:

```powershell
curl -X POST http://localhost:5050/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Login:

```powershell
curl -X POST http://localhost:5050/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"test@example.com\",\"password\":\"password123\"}'
```

### Get Events:

```powershell
curl http://localhost:5050/api/events
```
