# 📰 HeraldVault - Advanced Role-Based Blogging Platform

[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/) [![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)](https://nodejs.org/) [![MongoDB](https://img.shields.io/badge/MongoDB-8-yellow?style=for-the-badge&logo=mongodb)](https://mongodb.com/) [![Vite](https://img.shields.io/badge/Vite-5-orange?style=for-the-badge&logo=vite)](https://vitejs.dev/)

**BlogHub** is a modern, full-stack blogging platform with role-based authentication. Public users can read posts, writers create/manage their content, and admins oversee everything—including user management and full post moderation. Features rich text editing, image uploads, protected dashboards, and responsive UI.

![Demo Screenshot](Blog/public/hero1.webp) <!-- Replace with actual screenshot if available -->

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB Atlas (or local MongoDB)
- `.env` in `backend/` with `MONGO_URL`, `JWT_SECRET`, `PORT=5014`

### Backend Setup
```bash
cd backend
npm install
npm run start:dev  # Runs on http://localhost:5014
```

### Frontend Setup
```bash
cd Blog
npm install
npm run dev  # Runs on http://localhost:5173
```

Register as user → Login → Create posts → Admins manage all!

## 📋 Features
- **Public Access**: Browse and read all posts
- **User Roles**: Writers (own posts), Admins (all posts/users)
- **Rich Editor**: React Quill for formatted content + image uploads
- **Dashboards**: Writer dashboard (my posts), Admin dashboard (manage users/posts)
- **Protected Routes**: JWT auth with role checks
- **CRUD Operations**: Create/Edit/Delete posts (role-aware)
- **Responsive UI**: Tailwind CSS, GSAP animations
- **API-First**: RESTful endpoints with pagination/search

## 🛠 Tech Stack
| Frontend | Backend | Database/Auth | Tools |
|----------|---------|---------------|-------|
| React 19 | Express | MongoDB/Mongoose | Vite/Tailwind |
| React Router | Passport JWT/Local | Multer (uploads) | Axios/Nodemon |
| React Quill | CORS/Session | bcrypt | ESLint |

## 📁 Project Structure
```
Blog/                 # React Frontend
├── src/components/   # Dashboards, Forms, AuthContext
├── public/           # Assets, images
└── package.json      # Vite/Tailwind deps

backend/              # Node/Express API
├── controllers/      # Auth/Post/User logic
├── models/           # Mongoose schemas
├── routes/           # /api/auth & /api/posts
├── src/uploads/      # User images
└── package.json      # Express/Mongo deps
```

## 🌐 API Endpoints
| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create account |
| POST | `/api/auth/login` | Public | JWT login |
| GET | `/api/posts` | Public | Paginated posts |
| GET | `/api/posts/my-posts` | Writer | Own posts |
| POST | `/api/posts` | Writer/Admin | Create post w/ image |
| PUT | `/api/posts/:id` | Owner/Admin | Update post |
| DELETE | `/api/posts/:id` | Owner/Admin | Delete post |
| POST | `/api/upload-image` | Auth | Upload image |
| GET | `/api/protected` | Auth | Test auth |

## 👥 Roles & Permissions
- **Public**: Read posts only
- **Writer**: CRUD own posts, writer dashboard
- **Admin**: CRUD all posts/users, admin dashboard

## 🚀 Deployment
- **Backend**: Render/Heroku + MongoDB Atlas. Set env vars.
- **Frontend**: Vercel/Netlify (build: `npm run build`).
- Update API URL in frontend `Api.jsx` for prod: `http://yourapi.com`.

## 🤝 Contributing
1. Fork & clone
2. Create feature branch `git checkout -b feature/post-search`
3. Commit: `git commit -m 'Add post search'`
4. Push & PR

Issues? [Open one](https://github.com/yourusername/HeraldVault/issues/new)

## 📄 License
MIT - Built with ❤️ for modern blogging!

