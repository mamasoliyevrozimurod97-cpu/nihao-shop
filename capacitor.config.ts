import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.nihao.shop',
  appName: 'Nihao Shop',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    backgroundColor: '#f8f9ff',
  },
  plugins: {
    // Disable bounce effect on scroll - main fix for scroll issues
    CapacitorHttp: {
      enabled: false,
    },
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#f8f9ff',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
