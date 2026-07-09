import apiClient from './apiClient';

const DEFAULT_SYMBOLS = ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD'];

const settle = async (request, fallback) => {
  try {
    return await request();
  } catch (error) {
    return {
      ...fallback,
      error: error?.message || 'Unable to load MT5 data.',
    };
  }
};

export const mt5Service = {
  getStatus() {
    return apiClient.get('/mt5/status');
  },

  getAccount() {
    return apiClient.get('/mt5/account');
  },

  getQuotes(symbols = DEFAULT_SYMBOLS) {
    return apiClient.get('/mt5/quotes', { params: { symbols } });
  },

  getPositions() {
    return apiClient.get('/mt5/positions');
  },

  getOrders() {
    return apiClient.get('/mt5/orders');
  },

  getHistory(params) {
    return apiClient.get('/mt5/history', { params });
  },

  placeOrder(payload) {
    return apiClient.post('/mt5/orders', payload);
  },

  closePosition(ticket) {
    return apiClient.post(`/mt5/positions/${ticket}/close`);
  },

  async getOverview(symbols = DEFAULT_SYMBOLS) {
    const [status, account, quotes, positions, orders] = await Promise.all([
      settle(() => this.getStatus(), { connected: false }),
      settle(() => this.getAccount(), null),
      settle(() => this.getQuotes(symbols), []),
      settle(() => this.getPositions(), []),
      settle(() => this.getOrders(), []),
    ]);

    return {
      status,
      account,
      quotes,
      positions,
      orders,
    };
  },
};

export default mt5Service;
