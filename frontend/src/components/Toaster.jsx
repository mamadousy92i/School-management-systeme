import { useToastsState } from '../context/ToastContext';

export default function Toaster() {
  const toasts = useToastsState();
  return (
    <div className="fixed top-4 right-4 z-[1000] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            `min-w-[260px] max-w-sm px-4 py-3 rounded shadow-lg text-sm ` +
            (t.type === 'success' ? 'bg-green-600 text-white' : '') +
            (t.type === 'error' ? 'bg-red-600 text-white' : '') +
            (t.type === 'info' ? 'bg-gray-900 text-white' : '')
          }
          role="status"
          aria-live="polite"
        >
          {Array.isArray(t.message) ? (
            <ul className="list-disc list-inside space-y-1">
              {t.message.map((m, i) => <li key={i}>{String(m)}</li>)}
            </ul>
          ) : (
            <span>{String(t.message)}</span>
          )}
        </div>
      ))}
    </div>
  );
}
