export default function FormInput({ label, error, ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="label">{label}</label>}
      {props.tag === 'select' ? (
        <select className="input" {...props}>
          {props.children}
        </select>
      ) : props.tag === 'textarea' ? (
        <textarea className="input" rows={3} {...props} />
      ) : (
        <input className="input" {...props} />
      )}
      {error && <p className="text-xs text-danger-500 mt-0.5">{error}</p>}
    </div>
  );
}
