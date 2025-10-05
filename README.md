# 🛣️ RouteMate – Real-Time Ride Matching Platform

> 🚗 *Find people traveling your route. Connect, co-ride, and cut commute costs.*

---

### 📚 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [API Endpoints](#api-endpoints)
- [Future Enhancements](#future-enhancements)
- [Screenshots](#screenshots)
- [Contributors](#contributors)
- [License](#license)

---

## 🚀 Overview

**RouteMate** is a MERN-based ride-sharing connector that helps users find others traveling along similar routes.  
Unlike Uber or Ola, **RouteMate doesn’t provide rides** — it connects users heading in the same direction so they can share rides, costs, and reduce traffic impact.

It features:
- Real-time ride matching based on source-destination proximity.
- Secure login and profile management.
- Smart contact-sharing after mutual match.
- RESTful backend with JWT authentication.
- Responsive, modern React interface.

---

## ✨ Features

✅ **JWT-based Authentication (Signup/Login)**  
✅ **Dynamic Ride Matching** (using location proximity logic)  
✅ **User Profiles & Ride History**  
✅ **Contact Sharing after Match Confirmation**  
✅ **Search & Filter Rides in Real-Time**  
✅ **Responsive React UI (mobile-first design)**  
✅ **Scalable Node.js + MongoDB backend**  

---

## 🧩 System Architecture

        ┌────────────────────────┐
        │        React UI        │
        │   (Frontend Client)    │
        └──────────┬─────────────┘
                   │ REST API Calls (JSON)
        ┌──────────▼─────────────┐
        │   Express + Node.js    │
        │   (Backend Server)     │
        └──────────┬─────────────┘
                   │ Mongoose ODM
        ┌──────────▼─────────────┐
        │       MongoDB          │
        │  (Database Storage)    │
        └────────────────────────┘


---

## 🛠️ Tech Stack

**Frontend**
- React.js (Vite / CRA)
- Axios for API requests
- TailwindCSS / Material UI
- React Router for routing

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JSON Web Token (JWT) for authentication
- bcrypt for password hashing
- dotenv for environment config

**Dev Tools**
- Git & GitHub for version control  
- Postman for API testing  
- Nodemon for auto-restart  
- Render / Vercel / Railway for deployment  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repo
```bash
git clone https://github.com/arpitrai22/RouteMate.git
cd RouteMate


