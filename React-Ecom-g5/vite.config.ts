import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080", // Spring Boot Run ထားသည့် Port (8080 မဟုတ်ပါက သက်ဆိုင်ရာ Port သို့ ပြောင်းပါ)
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
