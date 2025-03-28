import React, { useState } from "react";
import styled from "styled-components";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(90deg, #f1f6fb 0%, #e5eefa 100%);
`;

function App() {
  const [conversationTitle, setConversationTitle] = useState("AI 助手对话");

  return (
    <AppContainer>
      <Sidebar conversationTitle={conversationTitle} />
      <ChatArea
        conversationTitle={conversationTitle}
        setConversationTitle={setConversationTitle}
      />
    </AppContainer>
  );
}

export default App;
