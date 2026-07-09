import apiClient from './apiClient';

export const predictionService = {
  getLatest() {
    return apiClient.get('/predictions/latest');
  },

  getHistory(params) {
    return apiClient.get('/predictions/history', { params });
  },

  runPrediction(payload) {
    return apiClient.post('/prediction/run', payload);
  },
};

export default predictionService;
