import apiClient from './apiClient';

export const trainingService = {
  getStatus() {
    return apiClient.get('/training/status');
  },

  startTraining(payload) {
    return apiClient.post('/training/start', payload);
  },
};

export default trainingService;
