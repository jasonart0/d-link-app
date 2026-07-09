import apiClient from './apiClient';

export const riskService = {
  getAnalysis() {
    return apiClient.get('/risk/analysis');
  },
};

export default riskService;
