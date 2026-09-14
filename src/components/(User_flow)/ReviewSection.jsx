"use client";
import { useState } from "react";
import { Textarea } from "../../components/ui/textarea";

export function StarsRating({ totalStars = 5, onRatingChange, rating, setRating }) {

  const handleClick = (index) => {
    const ratinglocal = index + 1; // Convert zero-based index to 1-based rating
    setRating(ratinglocal); // Update the filled stars
    if (onRatingChange) onRatingChange(ratinglocal); // Pass the rating value to the parent
  };

  return (
    <div className="flex items-center">
      {Array.from({ length: totalStars }, (_, index) => (
        <svg
          key={index}
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 cursor-pointer ${index < rating ? "text-accent" : "text-ink-muted"
            }`}
          fill="currentColor"
          viewBox="0 0 24 24"
          onClick={() => handleClick(index)} // Set the click handler
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

const ReviewSection = ({ setMessage, setRating, message, rating }) => {

  const [localMessage, setLocalMessage] = useState(""); // Local state for the message
  const [localRating, setLocalRating] = useState(rating); // Local state for rating

  // Handle rating change from StarsRating component
  const handleRatingChange = (rating) => {
    setLocalRating(rating); // Update the local rating state
    setRating(rating); // Update the parent rating state
  };

  // Handle message change in the textarea
  const handleMessageChange = (e) => {
    setLocalMessage(e.target.value); // Update the local message state
    setMessage(e.target.value); // Update the parent message state

  };
  return (
    <div className="space-y-4 h-[200px]">
      {/* Comment Textarea */}
      <div>
        <h2 className="text-sm text-muted-foreground mb-2">Write a Review</h2>
        <Textarea
          placeholder="Type your message here."
          id="message"
          className="w-full"
          value={message} // Bind local state to the textarea
          onChange={handleMessageChange} // Update message on change
        />

      </div>

      {/* Stars Rating */}
      <div>
        <h2 className="text-sm text-muted-foreground mb-2">Rate Us</h2>
        <StarsRating totalStars={5} onRatingChange={handleRatingChange} setRating={setRating} rating={rating} />
      </div>
    </div>
  );
};

export default ReviewSection;
