"use client";
import StarsRating from '../(User_flow)/StarsRating';
import Spinner from '../../components/Spinner';
import { useEffect, useState } from "react";
import { getUserDetails } from "../../actions/auth";
import Image from 'next/image';
import magnifactionIcon from "../../app/assets/magnificationIcon.webp";
import * as Sentry from '@sentry/nextjs';

const PreviewSection = ({ requestId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch reviews for the given requestId
  useEffect(() => {

    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch JWT
        const jwt = await getUserDetails();
        if (!jwt?.token) {
          throw new Error("JWT is missing or invalid.");
        }
        const response = await fetch("/api/get-reviews", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt?.token}`,
          },
          body: JSON.stringify({ requestId }),
        });

        const data = await response.json();
        if (response.ok) {
          setReviews(data.reviews);
        } else {
          Sentry.captureException("Error from server:", data.error || "Unknown error");
          setError(data.error || "Failed to fetch reviews.");
        }
      } catch (err) {
        Sentry.captureException("Network or unexpected error:", err);
        setError("An error occurred while fetching reviews.");
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchReviews();
    }
  }, [requestId]);

  // Handle loading and error states
  if (loading) {
    return (
      <div className="flex items-center justify-center mb-4">
        <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
      </div>
    );
  }
  return (
    <div>
      {reviews.length > 0 ? (
        <div className="overflow-y-auto h-[200px]"> {/* Adjust max height here */}
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex items-start bg-muted p-4 rounded-md shadow-md mb-4"
            >
              <div className="w-full">
                <p className="text-sm text-ink-soft">{review.message}</p>
                <div className="md:flex justify-between items-center mt-2">
                  <StarsRating filledStars={review.rating} />
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()} /{" "}
                    {new Date(review.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex pb-4 justify-center items-center mt-4">
          <div className="bg-surface p-8 rounded-lg md:w-[60%]  justify-center items-center text-center">
            <div className="w-full">
              <Image
                style={{ margin: "0 auto" }}
                src={magnifactionIcon}
                alt="No Leads"
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              No reviews available
            </h2>
            <p className="text-muted-foreground mb-4">
              You have not made any reviews yet. Atleast one review is required to close the job.
            </p>
          </div>
        </div>
      )}
    </div>
  );



};

export default PreviewSection;
