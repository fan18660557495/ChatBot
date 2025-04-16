import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const ProfileContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 24px;
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #F2F3F5;
`;

const AvatarContainer = styled.div`
  position: relative;
  width: 96px;
  height: 96px;
  cursor: pointer;

  &:hover .overlay {
    opacity: 1;
  }
`;

const Avatar = styled.img`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  font-size: 14px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Name = styled.h1`
  font-size: 24px;
  color: #1D2129;
  margin: 0;
`;

const Role = styled.span`
  font-size: 14px;
  color: #86909C;
`;

const ProfileContent = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  color: #1D2129;
  margin: 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 14px;
  color: #86909C;
`;

const Value = styled.span`
  font-size: 16px;
  color: #1D2129;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusTag = styled.span<{ isBound: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  background-color: ${props => props.isBound ? '#E8F5E9' : '#F5F5F5'};
  color: ${props => props.isBound ? '#4CAF50' : '#9E9E9E'};
`;

const BindButton = styled.button`
  border: none;
  background: none;
  color: #165DFF;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background-color: #F2F3F5;
  color: #86909C;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #E5E6EB;
  }
`;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { avatarUrl, userName, updateAvatar } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    // TODO: 在这里处理登出逻辑，比如清除token等
    navigate('/login');
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 验证文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    // 预览图片
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateAvatar(result);
    };
    reader.readAsDataURL(file);

    // TODO: 上传图片到服务器
    try {
      setIsUploading(true);
      // const formData = new FormData();
      // formData.append('avatar', file);
      // const response = await fetch('/api/upload-avatar', {
      //   method: 'POST',
      //   body: formData
      // });
      // if (!response.ok) throw new Error('上传失败');
      // const data = await response.json();
      // setAvatarSrc(data.avatarUrl);
    } catch (error) {
      console.error('上传头像失败:', error);
      alert('上传头像失败，请重试');
      updateAvatar(avatarUrl); // 使用当前头像URL恢复
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer onClick={handleAvatarClick}>
          <Avatar src={avatarUrl} alt="User avatar" />
          <AvatarOverlay className="overlay">
            {isUploading ? '上传中...' : '更换头像'}
          </AvatarOverlay>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </AvatarContainer>
        <HeaderInfo>
          <Name>{userName}</Name>
          <Role>+86 138****5678</Role>
        </HeaderInfo>
      </ProfileHeader>

      <ProfileContent>
        <Section>
          <SectionTitle>基本信息</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <Label>用户名</Label>
              <Value>{userName}</Value>
            </InfoItem>
            <InfoItem>
              <Label>邮箱</Label>
              <Value>example@email.com</Value>
            </InfoItem>
            <InfoItem>
              <Label>手机号</Label>
              <Value>+86 138****5678</Value>
            </InfoItem>
            <InfoItem>
              <Label>注册时间</Label>
              <Value>2024-03-28</Value>
            </InfoItem>
          </InfoGrid>
        </Section>

        <Section>
          <SectionTitle>绑定信息</SectionTitle>
          <InfoGrid>
            <InfoItem>
              <Label>微信</Label>
              <Value>
                {userName}
                <StatusTag isBound={true}>已绑定</StatusTag>
              </Value>
            </InfoItem>
          </InfoGrid>
        </Section>

        <LogoutButton onClick={handleLogout}>
          退出登录
        </LogoutButton>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default Profile;