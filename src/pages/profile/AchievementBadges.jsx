const SvgBadgeWrapper = ({ isUnlocked, children, title, description }) => (
    <div className="relative group flex flex-col items-center justify-center text-center">
        <div className={`transition-all duration-300 transform group-hover:scale-110 ${!isUnlocked ? 'grayscale opacity-60' : ''}`}>
            {children}
        </div>
        <p className={`mt-2 text-xs font-semibold transition-colors ${isUnlocked ? 'text-foreground group-hover:text-white' : 'text-muted-foreground'}`}>
            {title}
        </p>
        <div className="absolute bottom-full mb-2 w-52 p-3 text-xs text-center rounded-md bg-zinc-800 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg z-10">
            {description}
            {!isUnlocked && <div className="mt-1 text-yellow-400/80 font-bold">[LOCKED]</div>}
        </div>
    </div>
);

export const StyledInfoBadge = ({ isUnlocked, title, description, mainText, subText, accentColor }) => {
    const [colorFrom, colorTo] = accentColor;
    const gradientId = `accent-grad-${mainText}-${subText}`;
    const glowFilterId = `glow-filter-${mainText}-${subText}`;

    return (
        <SvgBadgeWrapper isUnlocked={isUnlocked} title={title} description={description}>
            <svg width="70" height="80" viewBox="0 0 72 82" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="silver-sheen" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="#D1D5DB" /><stop offset="100%" stopColor="#9CA3AF" /></linearGradient>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor={colorFrom} /><stop offset="100%" stopColor={colorTo} /></linearGradient>

                    {/* NEW: SVG filter to create the glow effect */}
                    {/* <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={colorFrom} floodOpacity="0.7" />
                    </filter> */}
                </defs>
                
                {/* The main badge group, which will have the filter applied */}
                <g filter={isUnlocked ? `url(#${glowFilterId})` : 'none'}>
                    <path d="M36 2L69.3 21.5V60.5L36 80L2.7 60.5V21.5L36 2Z" fill="url(#silver-sheen)" stroke="#374151" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M36 5L66.3 23V59L36 77L5.7 59V23L36 5Z" fill="#000000" />
                    <g transform="translate(12, 22)">
                        <rect x="0" y="0" width="48" height="38" rx="4" fill="#374151" fillOpacity="0.7" />
                        <rect x="0" y="34" width="48" height="4" rx="2" fill={`url(#${gradientId})`} />
                        <text x="24" y="17" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-white">{mainText}</text>
                        <text x="24" y="30" textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-semibold tracking-wider fill-white" opacity="0.8">{subText}</text>
                    </g>
                </g>
            </svg>
        </SvgBadgeWrapper>
    );
};