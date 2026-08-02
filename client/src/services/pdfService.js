import API from './api';

const pdfService = {
  uploadPdf: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('pdf', file);

    const response = await API.post('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },

  listPdfs: async () => {
    const response = await API.get('/pdf/list');
    return response.data;
  },

  deletePdf: async (id) => {
    const response = await API.delete(`/pdf/${id}`);
    return response.data;
  }
};

export default pdfService;
