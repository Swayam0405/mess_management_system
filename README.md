# CampusMess — College Mess Management System

> **A Full-Stack Hostel Dining, Meal Attendance & Mess Fee Management System**  
> Designed and built for Academic & B.Tech Semester Project Evaluation.

---

## 1. System Overview

**CampusMess** is a centralized, role-protected web portal engineered to streamline the end-to-end dining operations of engineering college hostels. It addresses manual token issues, paper menus, unrecorded meal consumption, delayed fee tracking, and unaccounted student feedback by offering automated digital dashboards for both **Hostel Administrators (Chief Wardens)** and **Hostel Resident Students**.

---

## 2. Strict Technology Stack

The project strictly complies with the requested lightweight, high-performance technology stack:

- **Frontend:**
  - **HTML5 & CSS3** (Custom responsive design system, SaaS cards, modern modals, toasts)
  - **Vanilla JavaScript (ES6+)** (No React, Angular, or TypeScript)
  - **Fetch API** for RESTful asynchronous communication
  - **Font Awesome 6 (CDN)** for icons
  - **Chart.js (CDN)** for analytics charts
- **Backend:**
  - **Node.js** (Runtime environment)
  - **Express.js** (MVC architecture & RESTful API endpoints)
  - **JWT (JSON Web Tokens)** for stateless authentication
  - **bcrypt.js** for secure salted password hashing
  - **CORS** & centralized error handling middleware
- **Database:**
  - **MongoDB**
  - **Mongoose ODM** (Strict schemas, timestamps, indexes, and references)

---

## 3. Demo Credentials for Evaluation

The system is pre-seeded with realistic academic accounts. Use these credentials to test role separation:

| Role | Name | Email | Password | Access Details |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Dr. Rajesh Sharma | `admin@college.edu` | `AdminPassword@123` | Full admin rights, student CRUD, menu editor, payment ledger, notice broadcast |
| **Student** | Rahul Verma | `rahul.verma@college.edu` | `Student@123` | Roll: `22CS101`, CSE 3rd Yr, Veg diet, Block A |
| **Student** | Ananya Iyer | `ananya.iyer@college.edu` | `Student@123` | Roll: `22EC204`, ECE 3rd Yr, Special Jain diet, Block C |
| **Student** | Vikramaditya R. | `vikram.rathore@college.edu` | `Student@123` | Roll: `21ME305`, Mech 4th Yr, Non-Veg diet, Block B |
| **Student** | Sneha Kulkarni | `sneha.k@college.edu` | `Student@123` | Roll: `23IT118`, IT 2nd Yr, Veg diet, Block C |

> **Evaluator Tip:** The login page also features **one-click credential filling buttons** for testing.

---

## 4. Key Functional Modules

### A. Role-Based Authentication
- Secure user registration for students with roll number, department, hostel block, room number, and dietary preference (`Veg`, `Non-Veg`, `Special Jain`).
- Administrator registration protected by secret key (`ADMIN_MESS_KEY_2026`).
- Salted password hashing with bcrypt (10 rounds).
- JWT generation (30 days validity) stored safely in browser `localStorage`.
- Protected frontend routes and backend middleware (`protect`, `authorize('admin')`).

### B. Student Dashboard
- Resident profile card with room and academic details.
- Active monthly subscription plan card (₹4,200/mo) with payment settlement badge.
- **Today's Dining Schedule:** Highlights Breakfast, Lunch, Snacks, and Dinner for the current day.
- **One-Click Meal Attendance:** Students check in for their meals in real time.
- Official Notice Board ticker with urgency priorities.
- Instant simulated Fee Payment modal with automatic transaction ID generation.
- 5-Star Feedback and Rating submission form.

### C. Administrator Dashboard
- **Live Metric Cards:** Total Students, Active Subscriptions, Monthly Revenue, Pending Fee Dues.
- **Interactive Chart.js Visualizations:**
  - Meal headcount bar chart (Breakfast, Lunch, Snacks, Dinner counts).
  - Fee payment settlement doughnut chart (Paid vs. Pending).
- **Student Directory Management:** Search by name/roll, filter by diet/status, modal to Add/Edit student details, and delete with confirmation dialog.
- **Official Broadcast Center:** Publish notices with priority badges (`urgent`, `high`, `medium`, `low`).

### D. 7-Day Menu Management (`/pages/menu.html`)
- Interactive day tabs from Monday through Sunday with current day highlighted.
- Complete 28 meal sessions breakdown with timings, calories, and chef notes.
- In-place modal editor for Administrators to modify items, timings, or diet notes.

### E. Financial & Payment Ledger (`/pages/payments.html`)
- Complete historical ledger of student subscription payments.
- Filter by status (`Paid`, `Pending`, `Failed`) and search by transaction ID.
- Admin ability to record manual cash counter payments.
- One-click **Printable Digital Receipt** modal with transaction timestamp and verification note.

### F. Quality & Feedback Hub (`/pages/feedback.html`)
- Average campus rating indicator (out of 5.0).
- Filter reviews by category (`Food Quality`, `Cleanliness & Hygiene`, `Staff Behaviour`, `Timing`, `Variety`).
- Official Warden Response tool with status progression (`Pending` → `Reviewed` → `Resolved`).

---

## 5. REST API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student or admin |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Private | Get profile of logged-in user |
| `GET` | `/api/student/dashboard` | Student | Full summary (profile, fee, today's menu, notices) |
| `POST` | `/api/student/pay` | Student | Process demo monthly fee payment |
| `POST` | `/api/student/attendance`| Student | Check in for meal consumption |
| `POST` | `/api/student/feedback` | Student | Submit rating and comment |
| `GET` | `/api/admin/stats` | Admin | Get metrics and Chart.js datasets |
| `GET` | `/api/admin/students` | Admin | Search and filter student directory |
| `POST` | `/api/admin/students` | Admin | Enroll a new resident student |
| `PUT` | `/api/admin/students/:id` | Admin | Update student information |
| `DELETE`| `/api/admin/students/:id` | Admin | Cascade delete student & records |
| `GET` | `/api/menu` | Public | Get 7-day weekly menu grouped by day |
| `POST` | `/api/menu` | Admin | Upsert/edit menu slot |
| `GET` | `/api/payments` | Admin | View transaction ledger |
| `POST` | `/api/payments` | Admin | Record manual counter payment |
| `PUT` | `/api/payments/:id` | Admin | Update payment status (mark Paid) |
| `GET` | `/api/announcements` | Public | Get active announcements |
| `POST` | `/api/announcements` | Admin | Broadcast new official notice |
| `GET` | `/api/feedback` | Admin | View all student reviews & avg rating |
| `PUT` | `/api/feedback/:id/respond`| Admin | Respond to feedback & update status |

---

## 6. Project Directory Structure

```text
mess-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Login, register, profile
│   │   ├── studentController.js  # Dashboard, pay, attendance, feedback
│   │   ├── adminController.js    # Stats, student CRUD, subscriptions
│   │   ├── menuController.js     # Weekly 7-day menu CRUD
│   │   ├── paymentController.js  # Transactions & receipts
│   │   ├── feedbackController.js # Feedback review & reply
│   │   └── announcementController.js # Notices broadcast
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   └── errorMiddleware.js    # Centralized 404 & error handler
│   ├── models/
│   │   ├── User.js               # User accounts (Admin/Student)
│   │   ├── Subscription.js       # Monthly mess plans
│   │   ├── Menu.js               # 28 weekly meal slots
│   │   ├── Payment.js            # Transaction records
│   │   ├── Feedback.js           # Student ratings & responses
│   │   ├── Announcement.js       # Official notices
│   │   └── MealAttendance.js     # Daily check-ins
│   ├── routes/                   # Express route definitions
│   ├── seed.js                   # Database seed script
│   ├── server.js                 # Express server & static hosting
│   ├── package.json              # Backend dependencies & scripts
│   ├── .env.example              # Environment variables template
│   └── .env                      # Local environment configuration
├── frontend/
│   ├── css/
│   │   ├── style.css             # Design system, forms, buttons, toasts
│   │   └── dashboard.css         # Sidebar layout, charts, stat cards
│   ├── js/
│   │   ├── api.js                # Fetch API client, toasts, modals
│   │   ├── auth.js               # Auth guards, login, register, logout
│   │   ├── admin.js              # Admin stats, Chart.js, student CRUD
│   │   ├── student.js            # Student profile, today meals check-in
│   │   ├── menu.js               # Weekly 7-day tabs & meal cards
│   │   └── payments.js           # Transactions ledger & receipt modal
│   ├── pages/
│   │   ├── login.html            # Sign In with demo account pills
│   │   ├── register.html         # Resident student signup
│   │   ├── admin-dashboard.html  # Full administrative workspace
│   │   ├── student-dashboard.html# Resident student portal
│   │   ├── menu.html             # 7-day weekly menu management
│   │   ├── payments.html         # Fee payment records & receipts
│   │   └── feedback.html         # Dining ratings & warden replies
│   └── index.html                # Project landing page & demo credentials
├── .gitignore
└── README.md
```

---

## 7. Installation & Running Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` **OR** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cloud connection string.

### Step 1: Open the Project
Open a terminal in the project directory:
```bash
cd mess-management-system/backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Verify or edit `backend/.env` (pre-configured with safe defaults):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/mess_management
JWT_SECRET=mess_management_super_secret_jwt_key_2026
JWT_EXPIRES_IN=30d
ADMIN_REGISTRATION_SECRET=ADMIN_MESS_KEY_2026
```
*(If using MongoDB Atlas, replace `MONGODB_URI` with your connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/mess_management`)*

### Step 4: Seed Sample Data
Populate the database with the demo admin, 12 students, 28 menu slots, payment records, announcements, and feedbacks:
```bash
npm run seed
```

### Step 5: Start the Server
```bash
npm start
```
*(Or use `npm run dev` for auto-reloading during development)*

### Step 6: Launch in Browser
Open your browser and navigate to:
```text
http://localhost:5000
```
- Click **"Launch Dashboard"** or sign in using any demo account listed above.

---

## 8. GitHub Repository Upload Instructions

To push this project to your GitHub account:

```bash
cd mess-management-system

# Initialize Git
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Complete College Mess Management System"

# Rename branch to main
git branch -M main

# Link your GitHub repository (replace with your repository URL)
git remote add origin https://github.com/<your-username>/college-mess-management-system.git

# Push to GitHub
git push -u origin main
```

---

## 9. Evaluation Checklist

- [x] Strict Tech Stack: Vanilla JS, CSS3, HTML5, Node.js, Express, MongoDB (No React, Tailwind, Firebase).
- [x] Role-Based Access Control (Admin vs. Student).
- [x] bcrypt password hashing and JWT authorization header.
- [x] Responsive SaaS dashboard with clean dark navy & teal theme.
- [x] Student: Profile, subscription fee status, today's meal check-in, notices, payment history, feedback.
- [x] Admin: Stats cards, Chart.js visual charts, student CRUD with search/filter, menu management, payment ledger, notice broadcast.
- [x] 7-Day 28-meal weekly food menu.
- [x] Automated seed script with 1 Admin and 12 realistic Indian college students.
- [x] Toast alerts, confirmation dialogs, printable receipt generator.
