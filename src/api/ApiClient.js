const axios = require("axios");
const Utils = require("../core/Utils");

class ApiClient {
  constructor(baseURL, options = {}) {
    this.client = axios.create({
      baseURL,
      timeout: options.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleApiError(error)
    );
  }

  handleApiError(error) {
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    };

    Utils.logger("error", `API Error: ${JSON.stringify(errorInfo)}`);
    return Promise.reject(errorInfo);
  }

  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.client.post(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.client.put(endpoint, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await this.client.delete(endpoint, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ApiClient;
