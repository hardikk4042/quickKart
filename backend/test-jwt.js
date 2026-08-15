const jwt = require('jsonwebtoken');
const env = require('./src/config/env');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXNyNnZ2dmUwMDAxc2l1NmtyNXU0cXdhIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzg2NjEwNTAxLCJleHAiOjE3ODcyMTUzMDF9.TQKgqa-Kdr09kI7IR-xtq0fHhmRZ7VHZYVR4agu1JDA';

try {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  console.log('Decoded:', decoded);
} catch (e) {
  console.error('Error:', e);
}
