- **Team Leader Name**: Jay Dolar
- **Team Name**: Dev Conquer (Team 2073)
- **Email**: [dolarjay3457@gmail.com](mailto:dolarjay3457@gmail.com)
- **Phone**: 7622095910
- **Video Demo Link**: [Project Demo](https://drive.google.com/drive/folders/1GHpGb3xBaGjGJVrqT3aUhQZJYpHmLENV?usp=sharing)
- **Problem statement - 2**: StackIt – A Minimal Q&A Forum Platform

---

#Problem statement - 2: 🧠 StackIt – Minimal Q\&A Forum Platform

**StackIt** is a minimal StackOverflow-style Q\&A platform designed for community-driven knowledge sharing. Built during an 8-hour hackathon, it enables users to ask and answer questions, vote on content, receive notifications, and moderate discussions based on their roles.

---

## 🚀 Features

### 👥 User Roles

* **Guest**: View questions and answers
* **User**: Register, log in, post questions/answers, and vote
* **Admin**: Moderate content, delete posts, ban users

### 📝 Core Functionality

* Ask questions with a rich text editor and tag support
* Answer questions using the same editor
* Upvote/downvote answers
* Mark one answer as "accepted"
* Tag filtering and management
* In-app notification system
* Admin dashboard for user/content moderation

---

## 🧑‍💻 Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Frontend       | Next.js, React-Quill, Tailwind CSS       |
| Backend        | Node.js, Express, MongoDB, Mongoose      |
| Authentication | JWT, Cookies, Passport.js (Google OAuth) |
| Editor         | React-Quill (Rich Text)                  |
| Notifications  | In-app (event-triggered)                 |
| Deployment     | Vercel (Frontend), Render (Backend)      |

---

## 📸 Screenshots

> Include images of the following:
>
> * Landing Page
> * Ask Question Form
> * Answer Page
> * Admin Dashboard
> * Notifications Dropdown

---

## 🛠 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Bhavya-Sonigra/StackIt/
cd stackit
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory with the following:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
```

Start the server:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🔐 Authentication

* JWT-based access and refresh tokens
* HttpOnly cookies for refresh tokens
* Google OAuth login via Passport.js

---

## ✅ Testing Checklist

| Feature               | Status |
| --------------------- | ------ |
| Register/Login/Logout | ✅      |
| Ask/Answer Questions  | ✅      |
| Upvote/Downvote       | ✅      |
| Accept Answer         | ✅      |
| Tag Filtering         | ✅      |
| Notifications         | ✅      |
| Admin Moderation      | ✅      |
| Responsive UI         | ✅      |

---

## 📦 Folder Structure

```bash
stackit/
├── client/                  # Next.js frontend
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── ...
├── server/                  # Node/Express backend
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── ...
```

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

## 🤝 Contributing

Pull requests and feedback are welcome! If you’re interested in extending the project or adding features, feel free to fork and contribute.

---

## 🙌 Acknowledgments

* StackOverflow — for design and functionality inspiration
* ReactQuill — for the rich text editing experience
* Passport.js — for seamless OAuth integration

---

**Made with ❤ during a hackathon by Jay Dolar & Team Dev Conquer (2073)**

---
