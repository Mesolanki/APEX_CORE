async function testSignup() {
  try {
    const res = await fetch('http://localhost:8050/user/admin-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testadmin',
        email: 'testadmin@example.com',
        password: 'password123'
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Data:", text);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}

testSignup();
