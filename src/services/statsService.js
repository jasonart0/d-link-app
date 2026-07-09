import apiClient from './apiClient';

export const statsService = {
  getModelStats() {
    return apiClient.get('/model/stats');
  },
};

export default statsService;
