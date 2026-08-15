async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@quickkart.com', password: 'admin123' })
    });
    const data = await res.json();
    console.log('Login:', data);

    if (!data.data.token) return;

    const res2 = await fetch('http://localhost:3000/api/stores', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`
      },
      body: JSON.stringify({
        name: 'New Test Store',
        addressLine: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456',
        isActive: true,
        latitude: 10.0,
        longitude: 20.0,
        managerId: null
      })
    });
    const data2 = await res2.json();
    console.log('Create Store Status:', res2.status);
    console.log('Create Store Response:', JSON.stringify(data2, null, 2));

  } catch (err) {
    console.error(err);
  }
}
run();
