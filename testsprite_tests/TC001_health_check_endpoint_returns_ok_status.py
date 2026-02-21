import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_health_check_endpoint_returns_ok_status():
    try:
        # 1. GET /status - Expected: 200 and JSON contains { "ok": true }
        response = requests.get(f"{BASE_URL}/status", timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_data = response.json()
        assert "ok" in json_data and json_data["ok"] is True, f"Expected JSON with ok:true, got {json_data}"

        # 2. GET /auth/me without any cookie - Expected: 401
        response = requests.get(f"{BASE_URL}/auth/me", timeout=TIMEOUT)
        assert response.status_code == 401, f"Expected status 401, got {response.status_code}"

        # 3. POST /auth/e2e/login with given body - Expected: 200 { "ok": true } and sets httpOnly session cookie
        login_payload = {"id": "e2e_user_1", "email": "e2e@test.local", "name": "E2E User"}
        response = requests.post(f"{BASE_URL}/auth/e2e/login", json=login_payload, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        json_data = response.json()
        assert "ok" in json_data and json_data["ok"] is True, f"Expected JSON with ok:true, got {json_data}"
        cookies = response.cookies
        session_cookie = None
        for cookie in cookies:
            if cookie._rest.get('HttpOnly') is not None or cookie.name.lower().find("session") >= 0:
                session_cookie = cookie
                break
        assert session_cookie is not None, "Expected an HttpOnly session cookie to be set"

        # 4. GET /auth/me using the cookie from previous step - Expected: 200 and JSON contains user.id and user.email
        jar = requests.cookies.RequestsCookieJar()
        jar.set(session_cookie.name, session_cookie.value, domain=session_cookie.domain, path=session_cookie.path, secure=session_cookie.secure, rest={'HttpOnly': True})
        response = requests.get(f"{BASE_URL}/auth/me", cookies=jar, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        user_data = response.json().get("user", {})
        assert user_data.get("id") == "e2e_user_1", f"Expected user.id e2e_user_1, got {user_data.get('id')}"
        assert user_data.get("email") == "e2e@test.local", f"Expected user.email e2e@test.local, got {user_data.get('email')}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_health_check_endpoint_returns_ok_status()