import React, { createContext, useContext, useState, ReactNode } from 'react';
import avatar from '../assets/avatar.png';

interface UserContextType {
  avatarUrl: string;
  userName: string;
  updateAvatar: (url: string) => void;
  updateUserName: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [avatarUrl, setAvatarUrl] = useState(avatar);
  const [userName, setUserName] = useState("范米花儿");

  const updateAvatar = (url: string) => {
    setAvatarUrl(url);
  };

  const updateUserName = (name: string) => {
    setUserName(name);
  };

  return (
    <UserContext.Provider value={{ avatarUrl, userName, updateAvatar, updateUserName }}>
      {children}
    </UserContext.Provider>
  );
};