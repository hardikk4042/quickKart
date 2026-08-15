const http = require('http');

const data = JSON.stringify({
  email: 'admin@quickkart.com',
  password: 'admin123'
});

const req = http.request('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const { token } = JSON.parse(body);
    
    // Test creating a store
    const storeData = JSON.stringify({
      name: 'New Test Store',
      addressLine: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      isActive: true,
      latitude: 10.0,
      longitude: 20.0,
      managerId: null
    });

    const req2 = http.request('http://localhost:3000/api/stores', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, (res2) => {
      let body2 = '';
      res2.on('data', chunk => body2 += chunk);
      res2.on('end', () => {
        console.log('Status:', res2.statusCode);
        console.log('Response:', body2);
      });
    });
    
    req2.write(storeData);
    req2.end();
  });
});

req.write(data);
req.end();
