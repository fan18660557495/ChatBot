import { checkConfig } from "./config";

const formatMarkdown = (content: string): string => {
  // 添加段落间距
  let formatted = content.replace(/\n\n/g, "\n\n\n");

  // 确保列表项之间有适当的间距
  formatted = formatted.replace(/(\n-|\n\d+\.)/g, "\n\n$1");

  // 确保标题前后有适当的间距
  formatted = formatted.replace(/(\n#{1,6}\s)/g, "\n\n$1");

  // 确保代码块前后有适当的间距
  formatted = formatted.replace(/(\n```)/g, "\n\n$1");

  // 移除多余的空行
  formatted = formatted.replace(/\n{4,}/g, "\n\n\n");

  return formatted;
};

export const testConnection = async () => {
  try {
    const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DeepSeek API key is not configured");
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Hello!" },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`API test failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("API Test Response:", data);
    return true;
  } catch (error) {
    console.error("API Test Error:", error);
    return false;
  }
};

export const sendMessage = async (message: string) => {
  try {
    console.log("Request URL:", "http://www.esunrising.net:11434/api/generate");

    const requestBody = {
      model: "deepseek-r1:latest",
      prompt: message,
      stream: false,
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      "http://www.esunrising.net:11434/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(
        `API request failed with status ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();
    console.log("Raw API Response:", data);

    // Ollama API 返回格式为 { response: string }
    if (!data.response) {
      console.error("Invalid API response format:", data);
      throw new Error("Invalid API response format");
    }

    const formattedContent = formatMarkdown(data.response);
    return formattedContent;
  } catch (error) {
    console.error("Error sending message to DeepSeek:", error);
    throw error;
  }
};

export const sendMessageOllama = async (
  message: string,
  onProgress?: (text: string) => void,
  stream: boolean = true,
  abortController?: AbortController
) => {
  try {
    console.log(
      "Request URL:",
      process.env.REACT_APP_OLLAMA_BASE_URL + "/api/generate"
    );

    const requestBody = {
      model: process.env.REACT_APP_OLLAMA_MODEL,
      prompt: message,
      options: {
        temperature: parseFloat(
          process.env.REACT_APP_OLLAMA_TEMPERATURE ?? "0.3"
        ),
      },
      stream: stream ?? true,
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      process.env.REACT_APP_OLLAMA_BASE_URL + "/api/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortController?.signal,
      }
    );

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(
        `API request failed with status ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    if (!stream) {
      const data = await response.json();
      const formattedContent = formatMarkdown(data.response);
      onProgress?.(formattedContent);
      return formattedContent;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    let fullResponse = "";

    try {
      while (true) {
        // 检查是否被中止
        if (abortController?.signal.aborted) {
          console.log('Generation aborted during streaming');
          return null;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              onProgress?.(fullResponse);
            }
          } catch (e) {
            console.warn("Failed to parse chunk:", line);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation stopped by user during streaming');
        return null;
      }
      throw error;
    }

    return formatMarkdown(fullResponse);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Generation stopped by user');
      return null;
    }
    console.error("Error sending message to DeepSeek:", error);
    throw error;
  }
};

export const sendMessage2Server = async (
  message: string,
  onProgress?: (text: string) => void,
  stream: boolean = true,
  abortController?: AbortController
) => {
  try {
    console.log(
      "Request URL:",
      process.env.REACT_APP_SERVER_BASE_URL + "/api/stream_chat"
    );

    const requestBody = { content: message };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      process.env.REACT_APP_SERVER_BASE_URL + "/api/stream_chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: abortController?.signal,
      }
    );

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(
        `API request failed with status ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    if (!stream) {
      const data = await response.json();
      const formattedContent = formatMarkdown(data.response);
      onProgress?.(formattedContent);
      return formattedContent;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to get response reader");
    }

    let fullResponse = "";

    try {
      while (true) {
        // 检查是否被中止
        if (abortController?.signal.aborted) {
          console.log('Generation aborted during streaming');
          return null;
        }

        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.response) {
              fullResponse += data.response;
              onProgress?.(fullResponse);
            }
          } catch (e) {
            console.warn("Failed to parse chunk:", line);
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation stopped by user during streaming');
        return null;
      }
      throw error;
    }

    return formatMarkdown(fullResponse);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Generation stopped by user');
      return null;
    }
    console.error("Error sending message to DeepSeek:", error);
    throw error;
  }
};

export const sendMessageRemoteDeepSeek = async (message: string) => {
  try {
    const apiKey = process.env.REACT_APP_DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DeepSeek API key is not configured");
    }

    console.log("API Key length:", apiKey.length);
    console.log("Request URL:", "https://api.deepseek.com/v1/chat/completions");

    const requestBody = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "你是一个专业的AI助手，请用清晰的段落和适当的格式来组织回答。",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false,
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", errorData);
      throw new Error(
        `API request failed with status ${response.status}: ${JSON.stringify(
          errorData
        )}`
      );
    }

    const data = await response.json();
    console.log("Raw API Response:", data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid API response format:", data);
      throw new Error("Invalid API response format");
    }

    const formattedContent = formatMarkdown(data.choices[0].message.content);
    return formattedContent;
  } catch (error) {
    console.error("Error sending message to DeepSeek:", error);
    throw error;
  }
};
