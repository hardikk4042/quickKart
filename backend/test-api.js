const axios = require('axios');
async function test() {
  try {
    const login = await axios.post('http://localhost:3000/api/auth/login', { email: 'store@quickkart.com', password: 'store123' });
    const token = login.data.data.token;
    console.log('Login OK');
    const stores = await axios.get('http://localhost:3000/api/stores', { headers: { Authorization: `Bearer ${token}` } });
    const storeId = stores.data.data.stores[0].id;
    console.log('Stores OK', storeId);
    
    const inventory = await axios.get(`http://localhost:3000/api/inventory/store/${storeId}?page=1&limit=20&q=`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Inventory OK, count:', inventory.data.data.inventory.length);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
