# CarePulse - Smart Hospital Management System

A modern, responsive, and aesthetically premium frontend web application built for healthcare professionals and patients. This system provides distinct experiences for doctors and patients, allowing them to manage appointments, access medical records, and coordinate care seamlessly.

---

## 🚀 Features

### **Patient Dashboard**
- **Appointments**: Book or manage upcoming hospital visits dynamically.
- **Medical Records**: Securely view past visit histories, test results, and diagnoses.
- **Prescription Management**: Request medication refills and view active prescriptions.
- **AI Symptom Checker**: A smart module designed to analyze symptoms instantly.

### **Doctor Dashboard**
- **Accept Appointment**: Review and approve incoming requests.
- **Total Patients**: Manage the roster of patients under the doctor's care.
- **Schedule Appointment**: Book follow-up appointments manually.

### **Authentication & Profiles**
- **Firebase OAuth 2.0**: Integrated credential forms and Google OAuth with a prompt to support selecting between multiple accounts (`prompt: 'select_account'`).
- **Dashboard Profile Cards**: Displays active user profiles (avatar initials or photo, full name, and registered email) inside a dedicated navigation bar.

---

## 📂 Codebase Explanation & File Structure

### Project Directory Tree
```
├── .env                  # Local Firebase API credentials
├── .env.example          # Template environment variable configurations
├── package.json          # Dependency packages and build configurations
├── vercel.json           # Client routing configuration for Vercel redirects
├── src/
│   ├── main.jsx          # Entry point mounting root elements
│   ├── App.jsx           # App navigation routes (React Router HashRouter)
│   ├── firebase.js       # Firebase initialization & Google OAuth Provider config
│   ├── Login.jsx         # Sign in flow with credentials + Google popups
│   ├── DoctorDashboard.jsx   # Doctor dashboard layout with profile headers
│   ├── PatientDashboard.jsx  # Patient dashboard layout with profile headers
│   ├── RequestAccess.jsx     # Request new credentials modal
│   ├── App.css           # Styling rules, layouts, and glassmorphism themes
│   ├── components/       # Common shared components (ModuleCard, PageLayout)
│   └── pages/            # Feature directories (AcceptAppointment, Prescriptions, AIChecker, etc.)
```

### Core Architecture & Logic:
1. **HashRouter Navigation**: Configured in `App.jsx` to prevent client-side routing breakdown or 404 errors during direct routing on static hosts like Vercel.
2. **Session Persistence**: Authentication details (name, email, avatar photo) are stored in `localStorage` upon success and cleared immediately upon clicking Logout.
3. **Responsive Header Layout**: Dashboard header components are structured as clean, relative flex rows at the top of the dashboards to align nicely with the Logout action and prevent overlapping titles on mobile.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router DOM (HashRouter)
- **Styling**: Vanilla CSS (CSS Variables, Flexbox, CSS Grid)
- **Icons**: Lucide React
- **Typography**: Google Fonts (Outfit & Inter)

---

## 💻 Running Locally

To run this project on your local machine, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deekshitha5e1/smart.git
   cd smart
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 🌐 Deployment

This project is fully configured for deployment on **Vercel** and **GitHub Pages**.

- The `vite.config.js` and `vercel.json` files are properly configured to support client-side routing on Vercel without returning 404 errors. 
- A `gh-pages` deployment script is also available via `npm run deploy`.

*Developed with focus on beautiful UI and robust component architecture.*
