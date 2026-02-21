import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_authenticated_get_user_info_returns_user_details():
    # Step 1: GET /status - Expected 200 and JSON { "ok": true }
    resp_status = requests.get(f"{BASE_URL}/status", timeout=TIMEOUT)
    assert resp_status.status_code == 200, f"/status returned {resp_status.status_code}, expected 200"
    json_status = resp_status.json()
    assert json_status.get("ok") is True, f"/status response body missing or incorrect: {json_status}"

    # Step 2: GET /auth/me without cookie - Expected 401
    resp_no_auth = requests.get(f"{BASE_URL}/auth/me", timeout=TIMEOUT)
    assert resp_no_auth.status_code == 401, f"/auth/me without auth returned {resp_no_auth.status_code}, expected 401"

    # Step 3: POST /auth/e2e/login with user body - Expected 200 { "ok": true } and httpOnly session cookie
    login_payload = {"id": "e2e_user_1", "email": "e2e@test.local", "name": "E2E User"}
    resp_login = requests.post(f"{BASE_URL}/auth/e2e/login", json=login_payload, timeout=TIMEOUT)
    assert resp_login.status_code == 200, f"/auth/e2e/login returned {resp_login.status_code}, expected 200"
    json_login = resp_login.json()
    assert json_login.get("ok") is True, f"/auth/e2e/login response body missing or incorrect: {json_login}"
    cookies = resp_login.cookies
    # Check if at least one cookie named 'session' or similar is set (httpOnly cannot be checked via requests)
    assert len(cookies) > 0, "No cookies set by /auth/e2e/login"

    # Step 4: GET /auth/me with cookie from login - Expected 200 and JSON contains user.id and user.email
    resp_auth = requests.get(f"{BASE_URL}/auth/me", cookies=cookies, timeout=TIMEOUT)
    assert resp_auth.status_code == 200, f"/auth/me with auth returned {resp_auth.status_code}, expected 200"
    json_auth = resp_auth.json()
    user = json_auth.get("user")
    assert user is not None, f"/auth/me response missing 'user': {json_auth}"
    assert user.get("id") == "e2e_user_1", f"User id mismatch: expected 'e2e_user_1', got '{user.get('id')}'"
    assert user.get("email") == "e2e@test.local", f"User email mismatch: expected 'e2e@test.local', got '{user.get('email')}'"

test_authenticated_get_user_info_returns_user_details()