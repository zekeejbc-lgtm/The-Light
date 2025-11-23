import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseClasses = "bg-gray-200 animate-pulse-fast";
  const variantClasses = {
    text: "h-4 rounded",
    rect: "rounded-md",
    circle: "rounded-full",
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}></div>
  );
};

export default Skeleton;