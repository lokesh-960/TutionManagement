# TuitionPro - Multi-Branch Tuition Management System

TuitionPro is a comprehensive, full-stack web application designed to help tuition centers and educational institutes manage multiple branches, students, fee collections, and communication seamlessly.

## 🚀 Features

### Core Modules
* **Multi-Branch Architecture**: Manage different branches/locations from a single application. Role-based login ensures administrators only access their specific branch's data.
* **Student Management**: Add, update, and track student profiles, including their class/standard, joining date, and parent contact details.
* **Fee Management**: 
  * Track monthly fee payments and dues.
  * Interactive payment history for every student.
  * Real-time dashboard analytics displaying collection rates, expected revenue, and overdue amounts.
* **Smart Notifications**:
  * **Fee Due Reminders**: Automatically detect and send reminders to parents for overdue payments.
  * **Circulars**: Broadcast announcements and circulars. Filter target audiences by specific classes (e.g., sending an alert only to "Class 10th" parents).
* **System History & Activity Logging**: A dedicated audit trail tracking all actions (student additions, fee updates, notifications sent).

### Technical Highlights
* **Authentication**: Secure JWT (JSON Web Token) based authentication with strict route protection.
* **Responsive UI**: A modern, glassmorphism-inspired UI built with React and Tailwind CSS, featuring light and dark mode toggles.
* **Intuitive Navigation**: Seamless Single Page Application (SPA) routing using React Router.

---

## 🛠️ Technology Stack

**Frontend:**
* React.js (Vite)
* React Router DOM (Navigation)
* Axios (API Client)
* Tailwind CSS (Styling & Design System)
* Context API (State Management for Auth & Theme)

**Backend:**
* Python (Django & Django REST Framework)
* JWT Authentication (Simple JWT)
* PostgreSQL (or SQLite for development)
* Django CORS Headers

---

## ⚙️ Local Development Setup

### Prerequisites
* Python 3.9+
* Node.js v16+
* npm or yarn

### 1. Backend Setup (Django)

1. Open a terminal and navigate to the project directory:
   ```bash
   cd TutionManagement
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python backend/manage.py migrate
   ```
5. Seed the database with demo data (optional):
   ```bash
   python backend/seed.py
   ```
6. Start the backend development server:
   ```bash
   python backend/manage.py runserver
   ```
   *The backend will be running at `http://127.0.0.1:8000/`*

### 2. Frontend Setup (React/Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd TutionManagement/frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at `http://localhost:5177/`*

---

## 🔒 Default Credentials (Demo)

If you have run the `seed.py` script, you can log into the demo branch using:
* **Mobile Number**: `demo`
* **Password**: `demo1234`

---

## 📂 Project Structure

```text
TutionManagement/
├── backend/                  # Django Python Backend
│   ├── config/               # Main Django settings
│   ├── accounts/             # Auth, Users, & Branch models
│   ├── students/             # Student & Fees models/API
│   └── notifications/        # Circulars & Activity Logs/API
├── frontend/                 # React UI
│   ├── src/
│   │   ├── api.js            # Axios client setup & JWT interceptors
│   │   ├── components/       # Reusable layout UI
│   │   ├── context/          # React contexts (Theme, Auth)
│   │   └── pages/            # View components (Dashboard, Login, Profiles)
│   └── package.json
└── README.md
```

## ✨ Development Commands

* **Run Backend**: `python backend/manage.py runserver`
* **Run Frontend**: `cd frontend && npm run dev`
* **Create Superuser (Admin)**: `python backend/manage.py createsuperuser`
