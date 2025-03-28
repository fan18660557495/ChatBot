export interface FileState {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  sizeFormatted: string;
  previewUrl?: string;
}

export interface Message {
  id: string;
  content: string;
  files?: FileState[];
  isUser: boolean;
  timestamp: string;
  userName?: string;
} 