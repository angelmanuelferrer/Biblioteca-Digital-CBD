interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, size = 'md' }: StarRatingProps) {
  const px = size === 'sm' ? 14 : 18;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - (star - 1)));
        const pct = Math.round(fill * 100);
        return (
          <svg key={star} width={px} height={px} viewBox="0 0 20 20" fill="none">
            <defs>
              <linearGradient id={`star-${star}-${rating}`}>
                <stop offset={`${pct}%`} stopColor="#f59e0b" />
                <stop offset={`${pct}%`} stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path
              d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78L10 1z"
              fill={`url(#star-${star}-${rating})`}
            />
          </svg>
        );
      })}
      <span className={`ml-1 text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}
