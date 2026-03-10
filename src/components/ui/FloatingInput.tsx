"use client";

interface Props {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function FloatingInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: Props) {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        required={required}
        className="
          peer w-full h-12 px-4 pt-4
          bg-background-light dark:bg-slate-800
          rounded-xl border border-slate-200 dark:border-slate-700
          focus:ring-2 focus:ring-primary outline-none
          dark:text-white
        "
      />

      <label
        className="
          absolute left-4 top-2 text-xs
          text-slate-500 dark:text-slate-400
          peer-placeholder-shown:top-3.5
          peer-placeholder-shown:text-sm
          peer-placeholder-shown:text-slate-400
          transition-all
        "
      >
        {label}
      </label>
    </div>
  );
}

