'use client';

import React, { memo, useMemo } from 'react';
import AppIcon from './AppIcon';
import AppImage from './AppImage';

interface AppLogoProps {
  src?: string; // Image source (optional)
  iconName?: string; // Icon name when no image
  size?: number; // Size for icon/image
  className?: string; // Additional classes
  onClick?: () => void; // Click handler
  useKpmg?: boolean; // Use KPMG logo
}

const KpmgLogo = ({ size = 64 }: { size?: number }) => {
  const height = Math.round(size * 0.5);
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 120 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="KPMG"
    >
      {/* K */}
      <path d="M4 6H10V22L20 6H27L16 23L28 44H21L12 27L10 30V44H4V6Z" fill="#00338D"/>
      {/* P */}
      <path d="M31 6H43C49 6 53 10 53 16C53 22 49 26 43 26H37V44H31V6ZM37 21H42C45 21 47 19 47 16C47 13 45 11 42 11H37V21Z" fill="#00338D"/>
      {/* M */}
      <path d="M57 6H63L72 28L81 6H87V44H81V18L73 38H71L63 18V44H57V6Z" fill="#00338D"/>
      {/* G */}
      <path d="M116 25H106V30H110V36C109 37 107 38 105 38C100 38 97 34 97 25C97 16 100 12 105 12C108 12 110 14 111 17H117C115 11 111 7 105 7C97 7 91 14 91 25C91 36 97 43 105 43C109 43 113 41 116 38V25Z" fill="#00338D"/>
    </svg>
  );
};

const AppLogo = memo(function AppLogo({
  src = '/assets/images/app_logo.png',
  iconName = 'SparklesIcon',
  size = 64,
  className = '',
  onClick,
  useKpmg = true,
}: AppLogoProps) {
  // Memoize className calculation
  const containerClassName = useMemo(() => {
    const classes = ['flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  return (
    <div className={containerClassName} onClick={onClick}>
      {useKpmg ? (
        <KpmgLogo size={size * 2} />
      ) : src ? (
        <AppImage
          src={src}
          alt="Logo" 
          width={size}
          height={size}
          className="flex-shrink-0"
          priority={true}
          unoptimized={src.endsWith('.svg')}
        />
      ) : (
        <AppIcon name={iconName} size={size} className="flex-shrink-0" />
      )}
    </div>
  );
});

export default AppLogo;
