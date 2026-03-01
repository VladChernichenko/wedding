# Wedding invitation – React frontend

- **Stack:** Vite, React 18, React Router 7.
- **Context path:** App is served at `/wedding` (see `server.servlet.context-path`).
- **i18n:** Messages from `/wedding/api/i18n` (EN / RU / KA).
- **Auth:** Form login via `/wedding/login`, logout via `/wedding/logout`, user from `/wedding/api/me`. Unauthenticated users are redirected to `/wedding/login`.

## Development

With the backend running on port 8080:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173/wedding/. Vite proxies `/wedding` to the backend.

## Production build

From the project root:

```bash
./gradlew build
```

This runs `npm run build` and copies `frontend/dist` into the Spring Boot static resources. The app is available at **http://localhost:8080/wedding** (login at http://localhost:8080/wedding/login).
