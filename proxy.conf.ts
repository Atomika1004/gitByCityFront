const route = '/api/base';

const config = {
  target: 'http://localhost:8081',
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
}

const PROXY_CONFIG = {
  [route]: config,
}

module.exports = PROXY_CONFIG;
