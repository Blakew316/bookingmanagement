export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-xl
          focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
          focus:outline-none transition-all
          ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-gray-200'}
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 text-sm bg-gray-50 border rounded-xl
          focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
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
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl
          focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
          focus:outline-none transition-all resize-none
          ${error ? 'border-red-300' : 'border-gray-200'}
        `}
        rows={3}
        {...props}
      />
    </div>
  );
}
