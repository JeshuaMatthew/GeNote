interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_GEMINI_API_URL : string;
    // tambahkan environment variable lain jika ada
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }