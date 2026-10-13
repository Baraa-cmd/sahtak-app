import React from 'react';
import { AppUpdateInfo } from '../types';

interface UpdateModalProps {
  updateInfo?: AppUpdateInfo;
  currentVersion?: string;
  isAdmin?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = () => {
  // Update modal is permanently disabled per user request
  return null;
};
