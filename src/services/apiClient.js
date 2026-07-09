export const API_UNAVAILABLE_MESSAGE =
  'API is unavailable. Check that the backend is running and your mobile device can reach the computer IP address.';

const DEFAULT_API_BASE_URL = 'http://192.168.1.10:8000/api';
const DEFAULT_TIMEOUT_MS = 15000;
let authToken;

const getApiBaseUrl = () => {
  const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  return (configuredUrl || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
};

const normalizeEndpoint = (endpoint) => {
  if (!endpoint) {
    return '';
  }

  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

const buildQueryString = (params) => {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const buildUrl = (endpoint, params) =>
  `${getApiBaseUrl()}${normalizeEndpoint(endpoint)}${buildQueryString(params)}`;

const parseResponseBody = async (response) => {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const cleanResponse = (payload) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return payload;
  }

  const keys = Object.keys(payload);
  const looksLikeEnvelope =
    Object.prototype.hasOwnProperty.call(payload, 'data') &&
    keys.some((key) => ['success', 'status', 'message', 'error'].includes(key));

  return looksLikeEnvelope ? payload.data : payload;
};

const getErrorMessage = (payload, fallback) => {
  if (!payload) {
    return fallback;
  }

  if (typeof payload === 'string') {
    return payload;
  }

  return payload.message || payload.error || payload.detail || fallback;
};

export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.data = options.data;
    this.isTimeout = Boolean(options.isTimeout);
    this.isNetworkError = Boolean(options.isNetworkError);
  }
}

export const apiClient = {
  get baseUrl() {
    return getApiBaseUrl();
  },

  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body,
      headers = {},
      params,
      timeoutMs = DEFAULT_TIMEOUT_MS,
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(buildUrl(endpoint, params), {
        method,
        headers: {
          Accept: 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      const payload = await parseResponseBody(response);

      if (!response.ok) {
        throw new ApiError(
          getErrorMessage(payload, `Request failed with status ${response.status}.`),
          {
            status: response.status,
            data: payload,
          },
        );
      }

      return cleanResponse(payload);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error?.name === 'AbortError') {
        throw new ApiError('Request timed out. Please try again.', {
          isTimeout: true,
        });
      }

      throw new ApiError(API_UNAVAILABLE_MESSAGE, {
        data: error,
        isNetworkError: true,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  },

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  },

  setAuthToken(token) {
    authToken = token;
  },

  clearAuthToken() {
    authToken = undefined;
  },
};

export default apiClient;
