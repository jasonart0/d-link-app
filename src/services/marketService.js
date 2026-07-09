import apiClient from './apiClient';

export const marketService = {
  getLatestCandle() {
    return apiClient.get('/market/latest-candle');
  },

  getLiquidityZones() {
    return apiClient.get('/market/liquidity-zones');
  },

  getMultiTimeframeAnalysis() {
    return apiClient.get('/market/multi-timeframe-analysis');
  },
};

export default marketService;
