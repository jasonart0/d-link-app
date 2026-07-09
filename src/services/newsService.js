import apiClient from './apiClient';

export const newsService = {
  getLatest(params) {
    return apiClient.get('/news/latest', { params });
  },

  getSentiment() {
    return apiClient.get('/news/sentiment');
  },
};

export default newsService;
