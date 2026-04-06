export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-3 py-2 text-sm bg-white border rounded-lg
          focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
          focus:outline-none transition-all placeholder:text-gray-400
          ${error ? 'border-red-300 focus:ring-red-500/10 focus:border-red-300' : 'border-gray-200'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-3 py-2 text-sm bg-white border rounded-lg
          focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
          focus:outline-none transition-all appearance-none
          ${error ? 'border-red-300' : 'border-gray-200'}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg
          focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300
          focus:outline-none transition-all resize-none placeholder:text-gray-400
          ${error ? 'border-red-300' : 'border-gray-200'}
        `}
        rows={3}
        {...props}
      />
    </div>
  );
}
