const run = async () => {
  try {
    // First login via E2E endpoint
    const loginRes = await fetch("http://localhost:5000/auth/e2e/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "e2e_user_1",
        email: "e2e@test.local",
        name: "E2E User",
      }),
    });

    const cookieHeader = loginRes.headers.get("set-cookie");

    const res = await fetch("http://localhost:5000/api/support/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        provider: "gemini",
        text: "This is a test ticket",
      }),
    });
    const text = await res.text();
    console.log(res.status, text);
  } catch (e) {
    console.error(e);
  }
};
run();
