# BlueWave Blog

BlueWave Blog is a full-stack blog platform where users can create, edit and delete their own posts, upload images, like posts and comments, and reply to comments.  
The project is built with **React + Vite + Tailwind CSS** on the frontend, **Node.js + Express** on the backend and uses **Supabase** for authentication, database and storage.

URL Site: https://blog-code-leap.vercel.app/


## Features

- 🔐 **Authentication**
  - Sign up with email & password.
  - Login / logout with Supabase auth.
  - Password strength indicator with live feedback.

- 🧑‍💻 **User profile**
  - Avatar upload with image stored in Supabase Storage.
  - Display of username and email.
  - List of posts created by the logged-in user.

- 📝 **Posts**
  - Create, edit and delete posts.
  - Each post has:
    - Title
    - Description
    - One or more images
    - Owner (user)
    - Likes
    - Comments (with replies)
    - Tags extracted from `#hashtags` in text.
  - When creating/editing a post:
    - Images are uploaded to Supabase Storage using the structure:  
      `usuarios/username_userId/postId/image.png`.
    - Removing images on edit also removes them from Storage.

- 💬 **Comments & replies**
  - Comments on posts.
  - Replies to comments (nested comments).
  - Likes on comments and replies.
  - “View replies” / “Hide replies” toggle per main comment.

- ❤️ **Likes**
  - Like / unlike posts.
  - Like / unlike comments.
  - One like per user per post/comment.

- 🔎 **Home feed**
  - Search bar to filter posts by title, description and author.
  - Filter drawer (side panel):
    - Filter by date range (`from` / `to`).
    - Sort by title (A–Z / Z–A).
    - Sort by date (newest first / oldest first).
  - Floating action button (FAB) to create a new post (opens a modal).
  - Responsive layout for mobile, tablet and desktop.
  - Animated UI with **Framer Motion**.

- 🖼 **UI / UX**
  - Dark, modern interface with blue color palette.
  - Global splash/loading overlay between critical actions (login, posting, etc.).
  - Toast notifications for success and error states.

---

## Tech Stack

### Frontend

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Router DOM](https://reactrouter.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [React Select](https://react-select.com/)
- [react-hot-toast](https://react-hot-toast.com/)
- [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/start)

### Backend

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Multer](https://github.com/expressjs/multer) (multipart/form-data file uploads)
- [@supabase/supabase-js](https://supabase.com/docs/reference/javascript/start)
- CORS, dotenv

### Infrastructure

- **Supabase**:
  - Authentication (`auth.users`)
  - Database (PostgreSQL)
  - Storage bucket `usuarios` for user avatars and post images.
- **Git + GitHub**
- (Optional) **Vercel** / other provider for deployment.

---

## Project Structure

```text
blog-app/
  backend/
    src/
      config/          # Supabase client
      controllers/     # Express controllers (posts, comments, users)
      routes/          # API routes
      middleware/      # Auth + error handling
      services/        # Business logic (posts, comments, likes, storage, user)
      utils/           # Helpers (tags, mentions)
    server.js
    package.json
    .env               # Backend environment variables (not committed)

  frontend/
    public/
      logo_clara.png   # App logo
    src/
      components/      # Header, Avatar, Modal, PostCard, SplashOverlay, etc.
      context/         # AuthContext, UiContext
      lib/             # API (axios instance), Supabase client, storage helper
      pages/           # Register, Login, Home, PostDetail, Profile
      App.jsx
      main.jsx
    package.json
    .env               # Frontend environment variables (not committed)

  .gitignore
  README.md
