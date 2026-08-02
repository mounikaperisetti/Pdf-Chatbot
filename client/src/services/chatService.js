import API from './api';

const chatService = {
  chat: async (pdfIdOrIds, question) => {
    const pdfIds = Array.isArray(pdfIdOrIds)
      ? pdfIdOrIds
      : (pdfIdOrIds && pdfIdOrIds !== 'general' ? [pdfIdOrIds] : []);
    const response = await API.post('/chat', { pdfIds, question });
    return response.data;
  },

  getHistory: async (pdfId = null) => {
    const url = pdfId ? `/chat/history?pdfId=${pdfId}` : '/chat/history';
    const response = await API.get(url);
    return response.data;
  },

  deleteHistory: async (pdfId = null) => {
    const url = pdfId ? `/chat/history?pdfId=${pdfId}` : '/chat/history';
    const response = await API.delete(url);
    return response.data;
  }
};

export default chatService;
