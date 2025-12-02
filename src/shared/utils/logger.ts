/**
 * Unified logging utility for the application
 * Logs only in development mode
 */

const isDev = import.meta.env.DEV;

export const logger = {
  sync: (message: string, data?: any) => {
    if (isDev) {
      console.log(`🔄 ${message}`, data !== undefined ? data : '');
    }
  },

  light: (lightId: string, message: string, data?: any) => {
    if (isDev) {
      console.log(`💡 [${lightId}] ${message}`, data !== undefined ? data : '');
    }
  },

  media: (message: string, data?: any) => {
    if (isDev) {
      console.log(`🎵 ${message}`, data !== undefined ? data : '');
    }
  },

  climate: (message: string, data?: any) => {
    if (isDev) {
      console.log(`🌡️ ${message}`, data !== undefined ? data : '');
    }
  },

  connection: (message: string, data?: any) => {
    if (isDev) {
      console.log(`🔌 ${message}`, data !== undefined ? data : '');
    }
  },

  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error !== undefined ? error : '');
  },

  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(`⚠️ ${message}`, data !== undefined ? data : '');
    }
  },

  info: (message: string, data?: any) => {
    if (isDev) {
      console.info(`ℹ️ ${message}`, data !== undefined ? data : '');
    }
  },
};
