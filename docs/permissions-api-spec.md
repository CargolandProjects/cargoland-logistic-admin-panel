# Permissions API — Backend Spec

Role-based page access for the admin panel. The frontend currently keeps this matrix
**client-side** (localStorage, per-device) as an interim; these endpoints let the backend
own it so access is consistent and enforceable. Enforce sensitive actions server-side as
you already do — this API is the source of truth for **page visibility/navigation**.

## Roles
Fixed enum (already used by `POST /admin/create`):
`SUPER_ADMIN`, `OPERATIONS_ADMIN`, `SUPPORT_ADMIN`.

## Page keys
One per top-level page the UI gates:

| key | page |
|---|---|
| `dashboard` | Dashboard |
| `shipments` | Shipments |
| `fleet` | Fleet (vehicles + drivers) |
| `payments` | Payments |
| `pricing` | Pricing |
| `users` | Users |
| `admins` | Admins (+ Manage Access) |
| `notifications` | Notifications |

## Invariants (enforce server-side)
- `SUPER_ADMIN` always has **all** pages `true` and is **immutable**.
- `dashboard` is always `true` for every role (prevents lockout).
- Only `SUPER_ADMIN` may call `PATCH /admin/permissions` (else `403`).

## Endpoints

### `GET /admin/permissions`
Any authenticated admin. Returns the full matrix.

```json
{
  "status": "success",
  "data": {
    "SUPER_ADMIN":      { "dashboard": true, "shipments": true, "fleet": true, "payments": true, "pricing": true, "users": true, "admins": true, "notifications": true },
    "OPERATIONS_ADMIN": { "dashboard": true, "shipments": true, "fleet": true, "payments": true, "pricing": true, "users": false, "admins": false, "notifications": false },
    "SUPPORT_ADMIN":    { "dashboard": true, "shipments": true, "fleet": false, "payments": false, "pricing": false, "users": true, "admins": false, "notifications": true }
  }
}
```
(The object above is also the recommended **default seed**.)

### `PATCH /admin/permissions`
`SUPER_ADMIN` only. Updates one or more page flags for a single role. Returns the full
updated matrix (same shape as `GET`).

Request:
```json
{ "role": "SUPPORT_ADMIN", "pages": { "payments": true, "fleet": false } }
```
- Reject (`400`) any attempt to set `role: "SUPER_ADMIN"` or to set `dashboard: false`.

### `GET /admin/profile`
Already returns the admin's `role`. **Optionally** also return the caller's effective
page permissions so the client can gate without a second call:
```json
{ "status": "success", "data": { "id": "…", "email": "…", "firstName": "…", "lastName": "…", "role": "SUPPORT_ADMIN",
  "permissions": { "dashboard": true, "shipments": true, "users": true, "notifications": true, "fleet": false, "payments": false, "pricing": false, "admins": false } } }
```

## Frontend swap (once live)
- `lib/api/services/permissions.ts` → point `getPermissions()` / `updateRolePermissions()`
  at these endpoints (they exist as stubs today).
- Add a `use-permissions` React Query hook and read the matrix from it; the client store
  (`stores/access-store.ts`) then keeps only the session-only `previewRole`.
