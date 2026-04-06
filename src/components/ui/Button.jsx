const variants = {
  primary: 'gradient-primary text-white hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  danger: 'bg-red-50 text-red-600 hover:bg-red-100',
  outline: 'border-2 border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600',
  ghost: 'text-gray-600 hover:bg-gray-100',
  success: 'gradient-success text-white hover:shadow-lg hover:shadow-emerald-500/25',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
