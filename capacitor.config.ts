
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.deepread.app',
  appName: 'DeepRead',
  webDir: 'www',
  server: {
    url: 'https://deepread-blue.vercel.app',
    cleartext: false
  }
};

export default config;
