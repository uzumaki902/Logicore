import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

def test_tc003_e2e_login_sets_cookie_and_returns_ok():
    login_url = f"{BASE_URL}/auth/e2e/login"
    me_url = f"{BASE_URL}/auth/me"
    payload = {
        "id": "e2e_user_1",
        "email": "e2e@test.local",
        "name": "E2E User"
    }
    try:
        # Step 1: POST /auth/e2e/login
        response = requests.post(login_url, json=payload, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        resp_json = response.json()
        assert resp_json.get("ok") is True, f"Expected 'ok': true, got {resp_json}"
        # Check that a HttpOnly session cookie is set
        cookies = response.cookies
        assert cookies, "No cookies set in response"
        # Check HttpOnly attribute in cookies
        # requests library does not expose HttpOnly flag, so check Set-Cookie header manually
        set_cookie_headers = response.headers.getall("Set-Cookie") if hasattr(response.headers, "getall") else response.headers.get("Set-Cookie")
        if set_cookie_headers is None:
            raise AssertionError("No Set-Cookie header present in response")
        if isinstance(set_cookie_headers, str):
            set_cookie_headers = [set_cookie_headers]
        http_only_found = any("httponly" in cookie.lower() for cookie in set_cookie_headers)
        assert http_only_found, "No HttpOnly flag found in Set-Cookie headers"
        
        # Step 2: GET /auth/me using cookie from login
        session = requests.Session()
        # copy cookies from login response to session
        for cookie in cookies:
            session.cookies.set(cookie.name, cookie.value, domain=cookie.domain, path=cookie.path)

        auth_me_resp = session.get(me_url, timeout=TIMEOUT)
        assert auth_me_resp.status_code == 200, f"Expected 200, got {auth_me_resp.status_code}"
        auth_me_json = auth_me_resp.json()
        user = auth_me_json.get("user")
        assert user is not None, f"No 'user' in response: {auth_me_json}"
        assert user.get("id") == payload["id"], f"Expected user.id {payload['id']}, got {user.get('id')}"
        assert user.get("email") == payload["email"], f"Expected user.email {payload['email']}, got {user.get('email')}"
    except requests.RequestException as e:
        raise AssertionError(f"HTTP request failed: {e}")

test_tc003_e2e_login_sets_cookie_and_returns_ok()