export default function AuthBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="
        absolute w-[800px] h-[800px]
        bg-gradient-to-r from-blue-500 to-indigo-600
        rounded-full blur-3xl opacity-20
        -top-40 -left-40 animate-pulse
      " />
      <div className="
        absolute w-[600px] h-[600px]
        bg-gradient-to-r from-purple-500 to-blue-600
        rounded-full blur-3xl opacity-20
        bottom-0 right-0 animate-pulse
      " />
    </div>
  );
}
