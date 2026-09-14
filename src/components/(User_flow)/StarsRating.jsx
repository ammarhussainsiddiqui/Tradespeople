"use client";

export default function StarsRating({ filledStars = 0, totalStars = 5 }) {
  const starsArray = Array.from({ length: totalStars }, (_, i) => i < filledStars);
  return (

    <div className="flex items-center">
      {starsArray.map((isFilled, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 ${isFilled ? 'text-accent' : 'text-ink-muted'}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}
