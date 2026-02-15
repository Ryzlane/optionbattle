import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Button = forwardRef(({ className, variant = 'default', size = 'default', disabled, children, ...props }, ref) => {
  const variants = {
    default: 'bg-battle-primary text-white hover:bg-battle-primary/90',
    secondary: 'bg-battle-secondary text-white hover:bg-battle-secondary/90',
    outline: 'border-2 border-battle-primary text-battle-primary hover:bg-battle-primary/10',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-battle-danger text-white hover:bg-battle-danger/90',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
