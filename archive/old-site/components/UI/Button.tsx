
import React from 'react';
import { motion as motionComponent } from 'framer-motion';

// Fix: Cast motion to any to resolve property existence type errors
const motion = motionComponent as any;

interface ButtonProps {
  children: React.ReactNode;
  // Fix: Updated onClick to support React.MouseEvent for event handling (e.g., stopPropagation)
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  type = 'button'
}) => {
  const baseStyles = "relative px-8 py-3 font-medium transition-all duration-300 ease-out rounded-squircle flex items-center justify-center gap-2 overflow-hidden group";
  
  const variants = {
    primary: "bg-moss text-white hover:bg-charcoal hover:shadow-lg hover:shadow-moss/20",
    outline: "border border-charcoal/20 text-charcoal hover:border-charcoal hover:bg-charcoal hover:text-white",
    ghost: "text-charcoal hover:bg-gray-100/50"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className="relative z-10">{children}</span>
      {/* Subtle wash effect container could go here if more complex effects needed */}
    </motion.button>
  );
};

export default Button;
