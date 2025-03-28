import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

const Icon = styled.i`
  font-size: 16px;
  line-height: 1;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  position: relative;
  box-shadow: 0px 4px 12px rgba(29, 33, 41, 0.08);
`;

const ModalTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1d2129;
  margin-bottom: 16px;
`;

const ModalInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e6e8;
  border-radius: 4px;
  font-size: 14px;
  color: #1d2129;
  outline: none;
  transition: border-color 0.2s ease;
  margin-bottom: 16px;

  &:focus {
    border-color: #165dff;
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ModalButton = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${props => props.variant === 'primary' ? '#165dff' : '#e5e6e8'};
  background: ${props => props.variant === 'primary' ? '#165dff' : '#ffffff'};
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#1d2129'};

  &:hover {
    background: ${props => props.variant === 'primary' ? '#0e42d2' : '#f7f8fa'};
    border-color: ${props => props.variant === 'primary' ? '#0e42d2' : '#e5e6e8'};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: transparent;
  color: #86909c;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f7f8fa;
    color: #1d2129;
  }

  i {
    font-size: 20px;
  }
`;

interface RenameModalProps {
  isOpen: boolean;
  title: string;
  value: string;
  onClose: () => void;
  onSubmit: (newValue: string) => void;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RenameModal: React.FC<RenameModalProps> = ({
  isOpen,
  title,
  value,
  onClose,
  onSubmit,
  onChange,
  placeholder = "请输入新的名称"
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    onSubmit(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <Icon className="ri-close-line" />
        </CloseButton>
        <ModalTitle>{title}</ModalTitle>
        <ModalInput
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
        />
        <ModalActions>
          <ModalButton onClick={onClose}>取消</ModalButton>
          <ModalButton variant="primary" onClick={handleSubmit}>确定</ModalButton>
        </ModalActions>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RenameModal; 