import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tenadam.health",
  appName: "Tenadam Health",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
