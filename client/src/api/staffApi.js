import axiosClient from './axiosClient';

export const staffApi = {
  // Auth
  login: (credentials) => axiosClient.post('/login', credentials),
  getMe: () => axiosClient.get('/me'),

  // Dashboard Metrics
  getDashboard: () => axiosClient.get('/dashboard'),

  // Filter dynamic dropdown options (Hostel -> Block -> Room)
  getFilters: () => axiosClient.get('/filters'),

  // Orders
  getOrders: (params = {}) => axiosClient.get('/orders', { params }),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),

  // Step 5: Record collected clothing quantity
  recordCollection: (id, payload) =>
    axiosClient.put(`/orders/${id}/collection`, payload),

  // Step 6: Advance order status
  updateOrderStatus: (id, payload) =>
    axiosClient.put(`/orders/${id}/status`, payload),

  // Step 7: Manage payment
  recordPayment: (id, payload) =>
    axiosClient.put(`/orders/${id}/payment`, payload),

  // Step 8: Complaints
  getComplaints: (params = {}) => axiosClient.get('/complaints', { params }),
  getComplaintById: (id) => axiosClient.get(`/complaints/${id}`),
  respondToComplaint: (id, payload) =>
    axiosClient.put(`/complaints/${id}/respond`, payload),
};

export default staffApi;
