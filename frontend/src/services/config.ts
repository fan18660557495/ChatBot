export const checkConfig = () => {
  const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
  const OLLAMA_BASE_URL = process.env.REACT_APP_OLLAMA_BASE_URL;
  console.log("Environment check:", {
    hasApiKey: !!apiKey,
    apiKey:apiKey,
    apiKeyLength: apiKey?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    OLLAMA_BASE_URL: OLLAMA_BASE_URL,
  });
  return !!apiKey;
};
