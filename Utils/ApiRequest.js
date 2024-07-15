import axios from "axios";
import { Config } from "../config.js";

async function MaelynAPIs(endpoint, params, method = 'GET') {
  try {
    if (!params) {
      params = {};
    }

    if (!params.apikey) {
      params.apikey = Config.maelyn_apikey;
    }

    const config = {
      method: method.toUpperCase(),
      url: `https://api.maelyn.tech${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (method.toUpperCase() === 'GET') {
      config.params = params;
    } else if (method.toUpperCase() === 'POST') {
      config.data = params;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error("API Call Error:", error);
    throw error;
  }
}

const MaelynAPI = {
  get: async function(endpoint, params) {
    return await MaelynAPIs(endpoint, params, 'GET');
  },
  post: async function(endpoint, params) {
    return await MaelynAPIs(endpoint, params, 'POST');
  }
};

export { MaelynAPI };
