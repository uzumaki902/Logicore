import requests

base_url = "http://localhost:5000"
timeout = 30

def test_unauthenticated_get_user_info_returns_unauthorized():
    # 1. GET /status - Expected: 200 and JSON contains { "ok": true }
    status_resp = requests.get(f"{base_url}/status", timeout=timeout)
    assert status_resp.status_code == 200, f"Expected 200 but got {status_resp.status_code}"
    status_json = status_resp.json()
    assert status_json.get("ok") is True, f"Expected {{'ok': True}} but got {status_json}"

    # 2. GET /auth/me without any cookie - Expected: 401
    auth_me_resp = requests.get(f"{base_url}/auth/me", timeout=timeout)
    assert auth_me_resp.status_code == 401, f"Expected 401 but got {auth_me_resp.status_code}"

    # 3. POST /auth/e2e/login with body {"id": "e2e_user_1", "email": "e2e@test.local", "name": "E2E User"} - Expected: 200 { "ok": true } and sets httpOnly session cookie
    login_payload = {"id": "e2e_user_1", "email": "e2e@test.local", "name": "E2E User"}
    login_resp = requests.post(f"{base_url}/auth/e2e/login", json=login_payload, timeout=timeout)
    assert login_resp.status_code == 200, f"Expected 200 but got {login_resp.status_code}"
    login_json = login_resp.json()
    assert login_json.get("ok") is True, f"Expected {{'ok': True}} but got {login_json}"
    # Check cookie set with httpOnly flag - requests does not expose httpOnly flag but cookie set presence is validated
    cookies = login_resp.cookies
    assert cookies, "Expected session cookie to be set but found none."

    # 4. GET /auth/me using the cookie from previous step - Expected: 200 and JSON contains user.id and user.email
    session_cookies = login_resp.cookies.get_dict()
    auth_me_auth = requests.get(f"{base_url}/auth/me", cookies=session_cookies, timeout=timeout)
    assert auth_me_auth.status_code == 200, f"Expected 200 but got {auth_me_auth.status_code}"
    auth_me_json = auth_me_auth.json()
    user = auth_me_json.get("user", {})
    assert user.get("id") == "e2e_user_1", f"Expected user id 'e2e_user_1' but got {user.get('id')}"
    assert user.get("email") == "e2e@test.local", f"Expected user email 'e2e@test.local' but got {user.get('email')}"

test_unauthenticated_get_user_info_returns_unauthorized()