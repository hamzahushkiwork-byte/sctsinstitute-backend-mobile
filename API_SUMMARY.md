# Sctsinstitute API – Summary

All APIs are under the **v1** base path (e.g. `{{baseUrl}}/api/v1`).  
Admin and course-registration endpoints expect a valid **Bearer token** unless noted.

---

## 1. Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check – API is running |

---

## 2. Home

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/home/hero-slides` | No | Get hero slides for the homepage |

---

## 3. Services (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/services` | No | Get all active services |
| GET | `/services/:slug` | No | Get one service by slug |

---

## 4. Certification (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/certification` | No | Get all active certification services |
| GET | `/certification/:slug` | No | Get one certification service by slug |

---

## 5. Courses (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/courses` | No | Get all active courses |
| GET | `/courses/:slug` | No | Get one course by slug |

---

## 6. Partners (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/partners` | No | Get all partners |

---

## 7. Pages (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/pages/:key` | No | Get page content by key |

---

## 8. Contact (Public)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/contact` | No | Submit contact form (validated) |

---

## 9. Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Register (rate-limited) |
| POST | `/auth/login` | No | Login |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | No | Logout |

---

## 10. Tests (Public + Admin)

**Public**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/tests` | No | Get active tests |

**Admin** (all below require auth)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/tests` | Yes | Get all tests |
| GET | `/admin/tests/:id` | Yes | Get test by ID |
| POST | `/admin/tests` | Yes | Create test |
| PUT | `/admin/tests/:id` | Yes | Update test |
| DELETE | `/admin/tests/:id` | Yes | Delete test |

---

## 11. Course Registrations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/course-registrations/register` | Yes | Register for a course |
| GET | `/course-registrations/my-registrations` | Yes | Current user’s registrations |
| GET | `/course-registrations/course/:courseId` | Yes | User’s registration for a course |
| GET | `/course-registrations/admin` | Yes | All registrations (admin) |
| GET | `/course-registrations/admin/course/:courseId` | Yes | Registrations for a course (admin) |
| PUT | `/course-registrations/admin/:id/status` | Yes | Update registration status (admin) |

---

## 12. Admin – Hero Slides (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/hero-slides` | Yes | List hero slides |
| GET | `/admin/hero-slides/:id` | Yes | Get hero slide by ID |
| POST | `/admin/hero-slides` | Yes | Create hero slide |
| PUT | `/admin/hero-slides/:id` | Yes | Update hero slide |
| DELETE | `/admin/hero-slides/:id` | Yes | Delete hero slide |

---

## 13. Admin – Services (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/services` | Yes | List services |
| GET | `/admin/services/:id` | Yes | Get service by ID |
| POST | `/admin/services` | Yes | Create service (with image) |
| PUT | `/admin/services/:id` | Yes | Update service (with image) |
| DELETE | `/admin/services/:id` | Yes | Delete service |
| PATCH | `/admin/services/:id/active` | Yes | Toggle service active |

---

## 14. Admin – Courses (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/courses` | Yes | List courses |
| GET | `/admin/courses/:id` | Yes | Get course by ID |
| POST | `/admin/courses` | Yes | Create course (with image) |
| PUT | `/admin/courses/:id` | Yes | Update course (with image) |
| DELETE | `/admin/courses/:id` | Yes | Delete course |
| PATCH | `/admin/courses/:id/toggle-availability` | Yes | Toggle course availability |

---

## 15. Admin – Partners (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/partners` | Yes | List partners |
| GET | `/admin/partners/:id` | Yes | Get partner by ID |
| POST | `/admin/partners` | Yes | Create partner (with logo) |
| PUT | `/admin/partners/:id` | Yes | Update partner (with logo) |
| DELETE | `/admin/partners/:id` | Yes | Delete partner |

---

## 16. Admin – Certification (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/certification` | Yes | List certification services |
| GET | `/admin/certification/:id` | Yes | Get certification by ID |
| POST | `/admin/certification` | Yes | Create certification (with image) |
| PUT | `/admin/certification/:id` | Yes | Update certification (with image) |
| DELETE | `/admin/certification/:id` | Yes | Delete certification |
| PATCH | `/admin/certification/:id/active` | Yes | Toggle certification active |

---

## 17. Admin – Page Content (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/pages` | Yes | List all page content |
| GET | `/admin/pages/:key` | Yes | Get page content by key |
| POST | `/admin/pages` | Yes | Create page content |
| PUT | `/admin/pages/:key` | Yes | Update page content |
| DELETE | `/admin/pages/:key` | Yes | Delete page content |

---

## 18. Admin – Contact Messages (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/contact-messages` | Yes | List contact messages |
| GET | `/admin/contact-messages/:id` | Yes | Get contact message by ID |
| PUT | `/admin/contact-messages/:id` | Yes | Update contact message |

---

## 19. Admin – Users (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/users` | Yes | List users |

---

## 20. Admin – Course Registrations (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/admin/course-registrations` | Yes | List all course registrations |
| PUT | `/admin/course-registrations/:id/status` | Yes | Update registration status |

---

## 21. Admin – Upload (Protected)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/admin/uploads` | Yes | Upload file (image/video; multipart) |

---

## Quick count

- **Public (no auth):** Health, Home (hero slides), Services, Certification, Courses, Partners, Pages, Contact, Auth (signup/login/refresh/logout), Tests (list active).
- **Protected (Bearer):** All `/admin/*` and course-registration endpoints above.

Base URL example: `http://localhost:3000/api/v1` (or your configured host/port).
