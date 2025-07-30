
const Loader = () => {
  return (
    // Full-screen overlay with a semi-transparent, blurred background
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--gradient-bg-to)]/30 backdrop-blur-lg">
    
      <div className="
          relative w-[60px] h-[60px] rounded-full 
          bg-[conic-gradient(from_180deg_at_50%_50%,var(--primary-to)_0%,var(--primary-from)_100%)]
          animate-[spin_1.2s_linear_infinite]"
      >

        <div 
          className="
            absolute top-1/2 left-1/2 
            -translate-x-1/2 -translate-y-1/2 
            w-[48px] h-[48px] 
            bg-[var(--card)] 
            rounded-full"
        >
        </div>
      </div>

      <p className="mt-4 text-lg font-medium text-[var(--card-foreground)] tracking-wider">
        Loading...
      </p>

    </div>
  );
};

export default Loader;