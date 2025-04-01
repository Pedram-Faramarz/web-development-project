# 🛒 E-Commerce Store

## 📌 Description
An **e-commerce platform** where users can browse products, add them to a cart, and place orders. Admins can manage products and view user orders.

## Team members
 **1. Radmir 
 **2. Pedram

## 🚀 Features

### 🎨 Front-End
- 🏬 **Product Listing Page**: Browse products with filtering options (categories, price).
- 🛍️ **Product Details**: View details, add to cart, and make orders.
- 🔒 **JWT-Based Authentication**: Secure login for users and admins.
- 🌐 **Routing**: Seamless navigation for different views (product details, cart, order history).

### 🛠️ Back-End
- 📦 **Models**:
  - `Product`
  - `Order`
  - `User`
  - `Category`
- 🔗 **Relations**:
  - `Product` → `Category` (**ForeignKey**)
  - `Order` → `User` (**ForeignKey**)
- 📋 **Admin Views**:
  - Manage products & user orders.
- 🔐 **Token-Based Authentication**:
  - Secure login for users and admin panel access.

## 📂 Project Structure
```plaintext
📦 E-Commerce Store
├── 📂 frontend      # Front-end application
├── 📂 backend       # Back-end API
├── 📜 README.md     # Project documentation
└── ...
```

## 🏁 Getting Started

### 🔧 Prerequisites
- **Node.js** & **npm** installed
- **Python/Django** for backend
- **Database setup** (PostgreSQL, MySQL, or SQLite)

### 💻 Installation
#### 1️⃣ Clone the Repository & Navigate to Project
```sh
git clone https://github.com/YOUR-USERNAME/ecommerce-store.git
cd ecommerce-store
```
#### 2️⃣ Set Up the Front-End
```sh
cd frontend
npm install
npm start
```
#### 3️⃣ Set Up the Back-End
```sh
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
#### 4️⃣ Push to GitHub
```sh
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/ecommerce-store.git
git push -u origin main
```

## 🎯 Roadmap
- ✅ Product search functionality
- ✅ User profile & order history
- 🚀 Payment gateway integration
- 🚀 Admin dashboard enhancements

## 🤝 Contributing
1. **Fork** the repo
2. **Create** a new branch (`feature-branch`)
3. **Commit** changes (`git commit -m 'Add new feature'`)
4. **Push** to GitHub (`git push origin feature-branch`)
5. Open a **Pull Request** 🚀


---


