# Backend Authentication Test Plan

## Project Type
backend

## Base URL
http://localhost:5000

## Authentication
cookie-session

## Tests

### Test 1
name: health_check
method: GET
endpoint: /status
expectedStatus: 200
expectedBody:
  ok: true


### Test 2
name: unauthorized_access
method: GET
endpoint: /auth/me
useCookie: false
expectedStatus: 401


### Test 3
name: e2e_login
method: POST
endpoint: /auth/e2e/login
body:
  id: e2e_user_1
  email: e2e@test.local
  name: E2E User
expectedStatus: 200
expectCookie: true


### Test 4
name: authenticated_session
method: GET
endpoint: /auth/me
usePreviousCookie: true
expectedStatus: 200
expectedFields:
  - user.id
  - user.email