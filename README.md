# CarePulse - Smart Hospital Management System

A modern, responsive, and aesthetically premium frontend web application built for healthcare professionals and patients. This system provides distinct experiences for doctors and patients, allowing them to manage appointments, access medical records, and coordinate care seamlessly.

## 🚀 Features

### **Patient Dashboard**
- **Appointments**: Book or manage upcoming hospital visits dynamically.
- **Medical Records**: Securely view past visit histories, test results, and diagnoses.
- **Prescription Management**: Request medication refills and view active prescriptions.
- **AI Symptom Checker**: A smart module designed to analyze symptoms instantly.

### **Doctor Dashboard**
- **Accept Appointment**: Review and approve incoming consultation requests.
- **Total Patients**: Manage the roster of patients under the doctor's care.
- **Schedule Appointment**: Book follow-up appointments manually.

### **General Features**
- **Modular Architecture**: Built utilizing clean, reusable React components (`<PageLayout />`, `<ModuleCard />`).
- **Dynamic Routing**: Full Single Page Application (SPA) experience powered by `react-router-dom` (utilizing `HashRouter` for flawless Vercel/GitHub Pages compatibility).
- **Glassmorphism UI**: High-end styling using Vanilla CSS featuring blurs, gradients, and subtle micro-animations.

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

