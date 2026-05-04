# 🍔 Restaurant Menu & Admin Dashboard

A complete full-stack web application for a restaurant. Includes a customer-facing menu with a shopping cart and checkout system, plus a secure admin dashboard to manage products and incoming orders.

## ✨ Features

### For Customers
*   **Interactive Menu**: Browse restaurant items categorized by type.
*   **Shopping Cart**: Add items, adjust quantities, and view the total price.
*   **Checkout System**: Place orders using Cash on Delivery or credit card (UI mock).
*   **Responsive Design**: A mobile-first, beautifully styled interface using Tailwind CSS.

### For Administrators
*   **Secure Dashboard**: Protected by a password.
*   **Product Management**: Full CRUD (Create, Read, Update, Delete) operations for menu items.
*   **Image Uploads**: Upload product images directly from your computer (saved locally to `/public/uploads/`).
*   **Order Management**: View incoming customer orders, detailed customer info, and manage order statuses (`Pending`, `Processing`, `Delivered`, `Cancelled`).

## 🛠️ Tech Stack

*   **Frontend**: React 19, React Router, Tailwind CSS, Vite, Lucide Icons.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (via Mongoose) with a smart in-memory fallback for easy local testing.
*   **File Uploads**: Multer.

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or newer recommended).
*   *(Optional)* A MongoDB connection URI if you want persistent data.

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and optionally add your MongoDB connection string. If you don't add one, the app will automatically use a temporary in-memory database so you can start testing immediately.
   ```env
   # .env
   MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.mongodb.net/restaurant?retryWrites=true&w=majority"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser:
   Navigate to `http://localhost:3000`.

## 🔐 Admin Access

To access the admin dashboard, click the "Admin" link in the navigation bar or access `/admin` directly.

**Default Admin Password**: `admin123`

## 📝 Notes on Production Deployment

*   **Database**: If no `MONGODB_URI` provides, the app will fall back to an in-memory database that gets wiped on every server restart. Always configure a MongoDB database for production.
*   **Payments**: The current checkout payment form simulates a transaction for demonstration purposes. For real payments, integrate a secure payment processor like Stripe or square.
*   **Images**: Uploaded images are stored directly on the local filesystem (`/public/uploads/`). For ephemeral deployment environments (like Vercel, Render, or Cloud Run), you should upgrade the image logic to store uploads in a cloud bucket (e.g., AWS S3, Firebase Storage, or Cloudinary).
