const Logo = ({ size = 'md' }) => {
  const sizes = {
    sm: { container: 'gap-1.5', icon: 'w-7 h-7 text-sm', text: 'text-lg' },
    md: { container: 'gap-2', icon: 'w-9 h-9 text-base', text: 'text-xl' },
    lg: { container: 'gap-3', icon: 'w-14 h-14 text-2xl', text: 'text-4xl' },
    xl: { container: 'gap-3', icon: 'w-20 h-20 text-4xl', text: 'text-5xl' },
  };

  const s = sizes[size];

  return (
    <div className={`flex items-center ${s.container}`}>
      {/* Icon */}
      <div className={`${s.icon} bg-[#58CC02] rounded-xl flex items-center justify-center border-b-4 border-[#46A302] flex-shrink-0 shadow-md`}>
        <span className={s.icon.includes('w-7') ? 'text-sm' : s.icon.includes('w-9') ? 'text-base' : s.icon.includes('w-14') ? 'text-2xl' : 'text-3xl'}>
          🚗
        </span>
      </div>
      {/* Text */}
      <div>
        <span className={`${s.text} font-extrabold text-[#1F2937] tracking-tight`}>
          Route
        </span>
        <span className={`${s.text} font-extrabold text-[#58CC02] tracking-tight`}>
          Mate
        </span>
      </div>
    </div>
  );
};

export default Logo;