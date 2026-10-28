import React from 'react';
import { ViewKey } from './AppSidebar';
import { FloatingBottomNav } from './FloatingBottomNav';

interface MobileBottomNavProps {
  currentView: ViewKey;
  onChangeView: (view: ViewKey) => void;
  onOpenMenu?: () => void;
  activeScreenNumber?: number;
  activeSurveyProgress?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = (props) => {
  return <FloatingBottomNav {...props} />;
};

export { FloatingBottomNav };
