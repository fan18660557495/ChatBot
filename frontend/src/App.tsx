import React, { useState } from "react";
import styled from "styled-components";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ChatArea from "./components/ChatArea";
import Profile from "./components/Profile";
import FinancialChat from "./components/FinancialChat";
import DataQueryChat from "./components/DataQueryChat";
import { UserProvider } from "./contexts/UserContext";
import { ChatProvider } from "./contexts/ChatContext";

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(90deg, #f1f6fb 0%, #e5eefa 100%);
`;

const MainContent = styled.div`
  flex: 1;
  overflow: hidden;
`;

function App() {
  const [conversationTitle, setConversationTitle] = useState("AI 助手对话");

  return (
    <UserProvider>
      <ChatProvider>
        <AppContainer>
          <Sidebar conversationTitle={conversationTitle} />
          <MainContent>
            <Routes>
              <Route 
                path="/" 
                element={
                  <ChatArea
                    conversationTitle={conversationTitle}
                    setConversationTitle={setConversationTitle}
                  />
                } 
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="/financial" element={<FinancialChat />} />
              <Route path="/data-query" element={<DataQueryChat />} />
            </Routes>
          </MainContent>
        </AppContainer>
      </ChatProvider>
    </UserProvider>
  );
}

export default App;
