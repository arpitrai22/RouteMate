const Logo = ({ size = "md", white = false }) => {
  const sizes = {
    sm: { text: "text-lg" },
    md: { text: "text-xl" },
    lg: { text: "text-4xl" },
    xl: { text: "text-5xl" },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center">
      <span
        className={`${s.text} font-extrabold tracking-tight text-[#1F2937]`}
      >
        Route
      </span>
      <span
        className={`${s.text} font-extrabold tracking-tight text-[#1F2937]`}
      >
        Mate
      </span>
    </div>
  );
};

export default Logo;
