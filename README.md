# Bodybuilder Fitness Platform

Welcome to the **Bodybuilder Fitness Platform** – a full‑stack web application that provides:

- **User authentication** with JWT
- **Subscription & payment** integration (Razorpay)
- **Dynamic public pages** (Home, About, Services, Pricing, Blog, etc.)
- **Admin dashboard** for managing users, content, and payments
- **Responsive UI** built with React + Vite, styled with modern glass‑morphism and micro‑animations

## Project Structure
```
Bodybuilder_web/
├─ backend/                # Flask API
│   ├─ app/                # extensions, models, routes
│   └─ run.py              # entry point
├─ frontend/               # Vite + React
│   ├─ src/pages/public/   # public pages (HomePage.jsx, AboutPage.jsx, …)
│   └─ src/pages/admin/    # admin dashboard pages
├─ .gitignore              # ignores node_modules, .env, uploads, etc.
└─ README.md               # <-- this file
```

## Getting Started
1. **Clone the repo**
   ```bash
   git clone https://github.com/GNANESWARKOKKIRALA/Bodybuilder_Website.git
   cd Bodybuilder_Website
   ```
2. **Backend**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   cp .env.example .env      # fill in your secrets
   flask run                 # or: python run.py
   ```
3. **Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev               # starts Vite dev server at http://localhost:5173
   ```

## Deployment
- **PythonAnywhere (Free tier)** – see our deployment guide in `README_DEPLOYMENT.md`.
- **Docker** – a `Dockerfile` and `docker-compose.yml` are provided for containerised deployment.

## Contributing
Feel free to open issues or submit pull requests. Follow the contribution guidelines in `CONTRIBUTING.md`.

---
*Built with ❤️ by Gnaneswar*
