# Sctsinstitute API – Response Summary

All JSON responses use a **common envelope**. Optional fields (e.g. `accessToken`) appear when relevant.

---

## Standard response format

### Success (2xx)

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message or null",
  "errors": null,
  "test": "test success ok"
}
```

- **data** – Response payload (object, array, or `null`).
- **message** – Optional human-readable message.
- **accessToken** – Present when the handler sets `res.locals.accessToken` (e.g. after auth).

### Error (4xx / 5xx)

```json
{
  "success": false,
  "data": null,
  "message": "Error description",
  "errors": [ "Optional array of validation/field errors" ]
}
```

- **message** – Error description.
- **errors** – Used for validation (e.g. 422) as array of error messages; otherwise often `null`.

---

## HTTP status codes used

| Code | Usage |
|------|--------|
| 200 | Success (GET, PUT, PATCH, most success) |
| 201 | Created (POST signup, login, create resources, course registration) |
| 400 | Bad request (validation, missing/invalid body, slug required, file errors) |
| 401 | Unauthorized (missing/invalid/expired token, login failed) |
| 404 | Not found (resource by id/slug/key not found) |
| 409 | Conflict (e.g. email already registered, already registered for course) |
| 422 | Validation failed (body validation with `errors` array) |
| 500 | Internal server error |

---

## Response by area

### Health

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/health` | `null` | `"API is running"` |

---

### Home

| Endpoint | Success `data` |
|----------|----------------|
| GET `/home/hero-slides` | **Array** of hero slide objects: `type`, `title`, `subtitle`, `mediaUrl`, `buttonText`, `buttonLink`, `order`, `isActive`, `_id`, `createdAt`, `updatedAt` |

**Error:** 500 – e.g. "Failed to fetch hero slides"

---

### Services (public)

| Endpoint | Success `data` |
|----------|----------------|
| GET `/services` | **Array** of service objects (active only): `title`, `description`, `imageUrl`, `innerImageUrl`, `slug`, `sortOrder`, `isActive`, `_id`, timestamps |
| GET `/services/:slug` | **Object** – single service (same fields) |

**Errors:** 400 (slug required), 404 (service not found), 500

---

### Certification (public)

| Endpoint | Success `data` |
|----------|----------------|
| GET `/certification` | **Array** of certification service objects (active only) |
| GET `/certification/:slug` | **Object** – single certification service |

**Errors:** 400 (slug required), 404 (certification service not found), 500

---

### Courses (public)

| Endpoint | Success `data` |
|----------|----------------|
| GET `/courses` | **Array** of course objects (active only): `title`, `slug`, `cardBody`, `description`, `imageUrl`, `sortOrder`, `isActive`, `isAvailable`, `_id`, timestamps |
| GET `/courses/:slug` | **Object** – single course (same fields) |

**Errors:** 400 (slug required), 404 (course not found), 500

---

### Partners (public)

| Endpoint | Success `data` |
|----------|----------------|
| GET `/partners` | **Array** of partner objects: `name`, `logoUrl`, `link`, `sortOrder`, `_id`, timestamps |

**Error:** 500 – e.g. "Failed to fetch partners"

---

### Pages (public)

| Endpoint | Success `data` |
|----------|----------------|
| GET `/pages/:key` | **Object** – page content: `key`, `title`, `content`, etc. (model-dependent) |

**Errors:** 404 (page content not found), 500

---

### Contact (public)

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| POST `/contact` | Whatever the controller returns (e.g. created message or minimal result) | `"Thank you for your message. We'll get back to you soon."` |

**Error:** 500 – e.g. "Failed to submit contact message". Validation uses 422 with `errors` array.

---

### Auth

| Endpoint | Success `data` | Status |
|----------|----------------|--------|
| POST `/auth/login` | `{ "user": { "id", "firstName", "lastName", "name", "email", "phoneNumber", "role" }, "accessToken", "refreshToken" }` | 200 |
| POST `/auth/signup` | `{ "user": { same as above }, "accessToken", "refreshToken", "emailSent": boolean }` | 201 |
| POST `/auth/refresh` | `{ "accessToken", "refreshToken" }` (or similar from auth service) | 200 |
| POST `/auth/logout` | Result from logout service (e.g. acknowledged) | 200 |

**Errors:** 401 (login/refresh failed), 400 (validation), 409 (email already registered), 500

---

### Tests (public)

| Endpoint | Success `data` |
|----------|----------------|
| GET `/tests` | **Array** of test objects (active tests only) |

**Error:** 500

---

### Tests (admin)

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/tests` | **Array** of all tests | - |
| GET `/admin/tests/:id` | **Object** – single test | - |
| POST `/admin/tests` | **Object** – created test | `"Test created successfully"` (201) |
| PUT `/admin/tests/:id` | **Object** – updated test | `"Test updated successfully"` |
| DELETE `/admin/tests/:id` | **Object** – deleted test | `"Test deleted successfully"` |

**Errors:** 404 (test not found), 400 (create/update failed), 500

---

### Course registrations

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| POST `/course-registrations/register` | **Object** – created registration | `"Successfully registered for course"` (201) |
| GET `/course-registrations/my-registrations` | **Array** of current user's registrations | - |
| GET `/course-registrations/course/:courseId` | **Object** or **null** – user's registration for that course; 200 with message `"User not registered for this course"` when null | - |
| GET `/course-registrations/admin` | **Array** of all registrations | - |
| GET `/course-registrations/admin/course/:courseId` | **Array** of registrations for that course | - |
| PUT `/course-registrations/admin/:id/status` | **Object** – updated registration | `"Registration status updated successfully"` |

**Errors:** 401 (not authenticated), 400 (course id/status invalid), 404 (course/registration not found), 409 (e.g. already registered), 500

---

### Admin – Hero slides

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/hero-slides` | **Array** of hero slides | - |
| GET `/admin/hero-slides/:id` | **Object** – single slide | - |
| POST `/admin/hero-slides` | **Object** – created slide | `"Hero slide created successfully"` |
| PUT `/admin/hero-slides/:id` | **Object** – updated slide | `"Hero slide updated successfully"` |
| DELETE `/admin/hero-slides/:id` | **Object** – deleted slide | `"Hero slide deleted successfully"` |

**Errors:** 404 (slide not found), 400 (create/update), 500

---

### Admin – Services

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/services` | **Array** of services | - |
| GET `/admin/services/:id` | **Object** – single service | - |
| POST `/admin/services` | **Object** – created service | `"Service created successfully"` (201) |
| PUT `/admin/services/:id` | **Object** – updated service | `"Service updated successfully"` |
| DELETE `/admin/services/:id` | `null` | `"Service deleted successfully"` |
| PATCH `/admin/services/:id/active` | **Object** – updated service | `"Service status updated successfully"` |

**Errors:** 404 (service not found), 400 (validation, required fields, slug exists, image required), 500

---

### Admin – Courses

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/courses` | **Array** of courses | - |
| GET `/admin/courses/:id` | **Object** – single course | - |
| POST `/admin/courses` | **Object** – created course | `"Course created successfully"` (201) |
| PUT `/admin/courses/:id` | **Object** – updated course | `"Course updated successfully"` |
| DELETE `/admin/courses/:id` | `null` | `"Course deleted successfully"` |
| PATCH `/admin/courses/:id/toggle-availability` | **Object** – updated course | `"Course availability set to true|false"` |

**Errors:** 404 (course not found), 400 (validation, slug exists, required fields), 500

---

### Admin – Partners

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/partners` | **Array** of partners | - |
| GET `/admin/partners/:id` | **Object** – single partner | - |
| POST `/admin/partners` | **Object** – created partner | `"Partner created successfully"` (201) |
| PUT `/admin/partners/:id` | **Object** – updated partner | `"Partner updated successfully"` |
| DELETE `/admin/partners/:id` | `null` | `"Partner deleted successfully"` |

**Errors:** 404 (partner not found), 400 (logo/link missing, invalid URL, validation), 500

---

### Admin – Certification

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/certification` | **Array** of certification services | - |
| GET `/admin/certification/:id` | **Object** – single certification service | - |
| POST `/admin/certification` | **Object** – created certification | `"Certification service created successfully"` (201) |
| PUT `/admin/certification/:id` | **Object** – updated certification | `"Certification service updated successfully"` |
| DELETE `/admin/certification/:id` | `null` | `"Certification service deleted successfully"` |
| PATCH `/admin/certification/:id/active` | **Object** – updated certification | `"Certification service status updated successfully"` |

**Errors:** 404 (certification not found), 400 (validation, slug exists), 500

---

### Admin – Page content

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/pages` | **Array** of page content items | - |
| GET `/admin/pages/:key` | **Object** – single page by key | - |
| POST `/admin/pages` | **Object** – created page | `"Page content created successfully"` |
| PUT `/admin/pages/:key` | **Object** – updated page | `"Page content updated successfully"` |
| DELETE `/admin/pages/:key` | **Object** – deleted page | `"Page content deleted successfully"` |

**Errors:** 404 (page not found), 400 (create/update), 500

---

### Admin – Contact messages

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/contact-messages` | **Array** of contact messages | - |
| GET `/admin/contact-messages/:id` | **Object** – single message | - |
| PUT `/admin/contact-messages/:id` | **Object** – updated message | `"Contact message updated successfully"` |

**Errors:** 404 (message not found), 400 (update), 500

---

### Admin – Users

| Endpoint | Success `data` |
|----------|----------------|
| GET `/admin/users` | **Array** of user objects (no password) |

**Error:** 500

---

### Admin – Course registrations

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| GET `/admin/course-registrations` | **Array** of all registrations | - |
| PUT `/admin/course-registrations/:id/status` | **Object** – updated registration | `"Registration status updated successfully"` |

**Errors:** 400 (invalid status: pending/paid/rejected), 404 (registration not found), 500

---

### Admin – Upload

| Endpoint | Success `data` | Success `message` |
|----------|----------------|-------------------|
| POST `/admin/uploads` | `{ "url", "filename", "mimeType", "size", "kind" }` – `kind` is `"image"` or `"video"` or `"unknown"` | `"File uploaded successfully"` |

**Errors:** 400 (no file, file too large, invalid file type), 500

---

## Global error responses

- **404 Not Found** – Route not matched: `{ "success": false, "data": null, "message": "Not Found", "errors": null }`.
- **500 Internal Server Error** – Unhandled errors: `message` from error middleware (e.g. "Internal Server Error").
- **401 Unauthorized** – Auth middleware: "Authentication required", "Invalid or expired token", or "Authentication failed".
- **422 Unvalidation failed** – Validate middleware: `message: "Validation failed"`, `errors`: array of validation messages.

All of the above use the same error envelope: `success: false`, `data: null`, `message`, `errors`.
