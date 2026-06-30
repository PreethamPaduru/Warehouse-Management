# Warehouse Management System – QR-Based Inventory Platform

## Overview
This project is a full-stack warehouse management application built with the MERN stack. It helps employees create, manage, and track warehouse items through a secure dashboard, generate QR codes for inventory records, print labels, and view scanned item details in real time.

The system is designed for organizations that need a simple and efficient way to manage stock records, monitor expiry dates, and maintain centralized item information.

---

# Definitions

## MERN Stack
A full-stack JavaScript development stack consisting of:

- MongoDB
- Express.js
- React.js
- Node.js

## JWT Authentication
A secure authentication mechanism that uses JSON Web Tokens for login validation and protected route access.

## REST API
Backend communication using standard HTTP methods such as:

- GET
- POST
- PUT
- DELETE

## QR Code Management
A method of encoding warehouse item details into scannable QR labels for quick lookup and tracking.

## Responsive UI
A user interface designed to work smoothly across mobile, tablet, and desktop screens.

---

# Features

## 1. Authentication & Authorization
- Secure login and signup using JWT-based authentication
- Protected routes for authenticated users
- Employee profile management

## 2. Employee Profile Management
- Save and update employee details
- Associate items with the correct employee profile
- Personalized dashboard experience

## 3. Warehouse Item Management
- Create warehouse items with detailed product information
- Store item code, batch number, quantity, supplier, and storage location
- View and manage all item records from the dashboard

## 4. QR Code Generation
- Generate QR codes for warehouse items
- Scan and view item details from a dedicated scan page
- Store QR-related records in the system

## 5. Label Printing
- Print labels for cartons, packages, and stock bins
- Generate professional labels with QR codes and item metadata

## 6. Dashboard & Search
- Overview metrics such as stock quantity, labels generated, and items near expiry
- Search items by description, code, batch, location, or creator
- Filter warehouse records by creator

## 7. Notifications
- Receive system notifications for item creation and deletion actions
- Mark notifications as read or clear them

---

# Features Used

- JWT Authentication
- REST API Integration
- QR Code Generation
- Inventory Item Tracking
- Label Printing
- Responsive Dashboard UI
- Search and Filter Functionality

---

# Technologies Used

## Frontend
- React.js
- Vite
- React Router DOM
- React Toastify
- QRCode React
- Lucide Icons

## Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Joi

## Services & Deployment
- MongoDB Atlas
- Vercel
- Render

---

# Project Modules

## Backend
- User authentication APIs and middleware
- Employee profile management APIs
- Warehouse item CRUD operations
- QR-related item generation and public item lookup
- Notification APIs
- MongoDB database connectivity

## Frontend
- Login and signup pages
- Dashboard with inventory metrics
- Item creation and QR generation screen
- Warehouse management and filtering interface
- Label printing page
- Scan result page for item lookup

## Testing & Deployment
- API integration and route validation
- Frontend-backend connectivity checks
- Deployment preparation for production hosting

---

# Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

# How to Run

## 1. Clone the Repository
```bash
git clone https://github.com/PreethamPaduru/Warehouse-Management.git
cd Warehouse-Management
```

## 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Then start the backend server:

```bash
npm start
```

## 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

The frontend will run on the Vite development server, usually at:

```bash
http://localhost:5173
```

---

# Project Structure

```text
backend/
  Controllers/
  Middlewares/
  Models/
  Routes/
  index.js
  package.json

frontend/
  src/
    pages/
    App.jsx
    main.jsx
  package.json
```

---

# Notes

This application is ideal for Warehouse teams that need a lightweight but effective inventory and QR management system. It combines authentication, data entry, QR generation, scanning, label printing, and dashboard monitoring in one place.
