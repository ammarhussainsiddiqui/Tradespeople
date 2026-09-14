import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import React, { useState } from "react";
import { NotebookPen, X } from "lucide-react";
import Spinner from "../../Spinner"
import { toast } from "react-toastify";

export function StarsRating({
  totalStars = 5,
  onRatingChange,
  rating,
  setRating,
}) {
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




const ReviewDialog = ({ requestId, setDialogUpdated }) => {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setMessage("");
    setRating(0);
    setIsDialogOpen(false);
  };

  const postReview = async () => {

    if (message == "") {
      toast.error("Please provide a message.", { position: "top-center" });
      return;
    }
    if (message.length > 250) {
      toast.error("Maximum word limit is 250", { position: "top-center" });
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/post-tradeperson-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, message, rating }),
      });

      const data = await response.json();
    } catch (error) {
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
      });
    } finally {
      setMessage("");
      setRating(0);
      setLoading(false);
      setIsDialogOpen(false);
      setDialogUpdated(true);
      toast.success("Review Submitted sucessfully.", { position: "top-center" });

    }
  };

  // Handle rating change from StarsRating component
  const handleRatingChange = (rating) => {
    setRating(rating); // Update the parent rating state
  };

  // Handle message change in the textarea
  const handleMessageChange = (e) => {
    setMessage(e.target.value); // Update the parent message state
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          className="text-sm font-bold px-2 py-2 mb-4 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse"
          disabled={loading}
        >
          {<NotebookPen size={18} />}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Post Job Review</DialogTitle>

          <Button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70"
            variant="ghost"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h2 className="text-sm text-muted-foreground mb-2">
              Write a Review
            </h2>
            <Textarea
              placeholder="Type your message here."
              id="message"
              className="w-full"
              value={message} // Bind local state to the textarea
              onChange={handleMessageChange} // Update message on change
            />
          </div>
        </div>
        <div className=" flex justify-between items-end">
          <div>
            <h2 className="text-sm text-muted-foreground mb-2">Rate Us</h2>
            <StarsRating
              totalStars={5}
              onRatingChange={handleRatingChange}
              setRating={setRating}
              rating={rating}
            />
          </div>
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground text-sm font-bold py-2 px-4 rounded-lg"
            onClick={postReview}
            type="submit"
          >
            {
              loading ? <Spinner /> : "Post Review"
            }

          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewDialog;
