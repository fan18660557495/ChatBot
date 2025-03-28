export const sendMessageOllama = async (
  message: string,
  onUpdate: (text: string) => void,
  useStream: boolean,
  abortController: AbortController
): Promise<void> => {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama2',
      messages: [{ role: 'user', content: message }],
      stream: useStream,
    }),
    signal: abortController.signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (useStream) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = '';

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.trim() === '') continue;

        try {
          const json = JSON.parse(line);
          if (json.message?.content) {
            accumulatedText += json.message.content;
            onUpdate(accumulatedText);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  } else {
    const data = await response.json();
    onUpdate(data.message?.content || '');
  }
}; 