export default function AuthCard({
  children,
  title,
  subtitle,
}: any) {
  return (
    <div className="
      w-full max-w-md
      bg-white/70 dark:bg-slate-900/80
      backdrop-blur-xl
      border border-white/30 dark:border-slate-800
      shadow-2xl
      rounded-2xl
      p-8
    ">
      <div className="text-center mb-8">
        <div className="
          w-14 h-14
          bg-primary
          rounded-xl
          flex items-center justify-center
          text-white
          mx-auto mb-4
        ">
          🧭
        </div>

        <h1 className="text-2xl font-bold dark:text-white">
          {title}
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {subtitle}
        </p>
      </div>

      {children}
    </div>
  );
}
