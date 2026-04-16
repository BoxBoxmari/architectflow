'use client';

import React, { memo, useMemo } from 'react';
import AppIcon from './AppIcon';
import AppImage from './AppImage';
import Image from 'next/image';

interface AppLogoProps {
  src?: string; // Image source (optional)
  iconName?: string; // Icon name when no image
  size?: number; // Size for icon/image
  className?: string; // Additional classes
  onClick?: () => void; // Click handler
  useKpmg?: boolean; // Use KPMG logo
}

const KpmgLogo = ({ size = 64 }: { size?: number }) => {
  const height = Math.round((size * 50) / 120);
  return (
    <Image
      src="/assets/04_SVG/KPMG_NoCP_Blue_RGB.svg"
      alt="KPMG"
      width={size}
      height={height}
      priority
    />
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
