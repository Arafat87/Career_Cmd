interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "number" | "date" | "select" | "textarea";
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  options,
  placeholder,
  required,
  min,
  max,
  step,
}: FormFieldProps) {
  const baseClasses =
    "w-full bg-[#0a0a12] border border-[rgba(0,245,255,0.15)] rounded-lg px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted focus:border-neon-cyan/50 transition-colors";

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-xs font-mono text-muted uppercase tracking-wider">
        {label}
        {required && <span className="text-neon-red ml-1">*</span>}
      </label>
      {type === "select" && options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={baseClasses}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          className={baseClasses}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          step={step}
          className={baseClasses}
        />
      )}
    </div>
  );
}
