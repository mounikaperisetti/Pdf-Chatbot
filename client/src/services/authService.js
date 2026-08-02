import API from './api';

const authService = {
  register: async (fullName, email, password) => {
    const response = await API.post('/auth/register', { fullName, email, password });
    return response.data;
  },

  login: async (email, password) => {
    const response = await API.post('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await API.get('/auth/profile');
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await API.put('/auth/change-password', { oldPassword, newPassword });
    return response.data;
  }
};

export default authService;

