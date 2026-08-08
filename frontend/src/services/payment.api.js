// src/services/payment.api.js
const delay = (ms = 800) => new Promise(r => setTimeout(r, ms));

export const paymentAPI = {
  // POST /api/payments/create
  createPayment: async ({ orderId, method, amount }) => {
    await delay(1000);
    // Simulate payment gateway response
    return {
      paymentId: 'PAY_' + Date.now(),
      orderId,
      method,
      amount,
      status: 'success',
      transactionId: 'TXN' + Math.floor(Math.random() * 1e9),
    };
  },

  // POST /api/payments/verify
  verifyPayment: async ({ paymentId }) => {
    await delay(500);
    return { verified: true, paymentId, status: 'captured' };
  },
};
