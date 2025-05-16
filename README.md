# 🚀 Mess Token System - MTS Student Server  

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node-dot-js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=json-web-tokens&logoColor=white)
![AWS S3](https://img.shields.io/badge/AWS_S3-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)  


A **secure and scalable Student Server** for the **Mess Token System**. This server handles **student authentication, token requests, and balance management** while ensuring **security and performance** through **JWT authentication, Redis caching, and MongoDB transactions**.The Mess Token System is built on a Shared Database Pattern, where multiple server interact with a single database while ensuring data consistency through MongoDB transactions.

## 📌 System Architecture

![System Architecture](https://drive.google.com/uc?export=view&id=15ZqTNhEHkiiZdwKPFCfmaW_rN4zaC9-J)

## 🔥 Features  

✅ **Student Authentication** –  Secure registration using email & Secure login using Username-Password.  
✅ **Token Request Management** – Allows students to generate mess tokens.  
✅ **Balance Tracking** – Manages student balances and prevents overdrawing.  
✅ **Role-Based Access Control (RBAC)** – Ensures only students can access relevant endpoints and not the Owners.  
✅ **Redis Caching and Token Blacklisting** – Improves performance for frequently accessed data.  
✅ **MongoDB Transactions** – Ensures consistency in token and balance updates.  
✅ **User Profile Storage in AWS S3** – Students upload profile pictures securely stored in **AWS S3**.  

---

## 📌 API Endpoints

### 🔹 **1. Student Authentication**
| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/sign-up` | Registers a new student and stores details securely. |
| **POST** | `/sign-up/otp-verify` | Verify OTP and new student registration. Stores details securely. |
| **POST** | `/login` | Authenticates a student and issues a JWT token. |

### 🔹 **2. Mess Token Management**
| Method | Endpoint | Description |
|--------|---------|-------------|
| **POST** | `/create-order` | Creates order accordingly to the token price using Razorpay. |
| **POST** | `/verify-payment` | Verify Payment using signature and Issue tokens to the student. |

### 🔹 **3. Balance Management**
| Method | Endpoint | Description |
|--------|---------|-------------|
| **GET** | `/student/tokens` | Fetches the current available token count of the student. |
| **GET** | `/student/token-data` | Fetches the not redeemed tokens data of student. |
| **GET** | `/student/token-history` | Fetches total issued token's history for that perticular user.|
| **GET** | `/payment-history` | Fetches payment history made by perticular user to purchase tokens.|
| **POST** | `/student/token-submission` | Submit the token by user with security code to prevent un-intensional token submission. |
| **POST** | `/student/logout` | Logout the user.. |

> 🛡 **Authentication & Authorization:** All endpoints require **JWT authentication**.

---

## 🛠️ Technology Stack  

- **Node.js & Express.js** – Backend framework  
- **MongoDB Atlas** – Cloud database (⚠️ *Required for transactions*)  
- **JSON Web Tokens (JWT)** – Secure authentication  
- **Redis** – Caching student balance and token requests  

---

## ⚙️ Setup & Configuration  
To run this Student Server, provide the following environment variables:  

```env
# MongoDB Connection URL
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority

# Redis Connection URL
REDIS_URI=redis://<your-redis-host>:<port>

# JWT Secret for authentication
JWT_SECRET=your-secret-key

# Server Port
PORT=7000
```

## 🚀 How to Clone and Run  

```sh
# Clone the repository
git clone https://github.com/RishiGaneshe/Mess-Token-System.git

# Navigate into the Student Server directory
cd Mess-Token-System

# Install dependencies
npm install

# Start the server
node student_server.js 
```

---

## 📌 Why Use This Student Server?  

✔️ **Secure & Role-Based Authentication** – Ensures only students can access relevant features.  
✔️ **Scalable & Efficient** – Uses **MongoDB transactions** and **Redis caching** for performance.  
✔️ **Token-Based System** – Students can request mess tokens with balance tracking.  
✔️ **Error Handling & Logging** – Ensures smooth operation with proper logs.  

---

