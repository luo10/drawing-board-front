// API相关配置
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL || "https://yassin-rj.xyz/drawing",
  // BASE_URL: "http://localhost:9008",
  ENDPOINTS: {
    LOGIN: "/api/auth/v1/login",
    GENERATE_EXAM: "/api/subject/v1/generate_exam",
    UPLOAD_SUBJECT: "/api/subject/v1/upload_subject",
  },
};
