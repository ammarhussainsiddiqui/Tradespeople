import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import Badge from "../../ui/badge";
import { timeAgo } from "../../../utils/functions";
import { getUserDetails } from "../../../actions/auth";
import React, { useState } from "react";
import Spinner from "../../../components/Spinner";
import { toast } from "react-toastify";
import ReviewDialog from "./ReviewDialog"
import StarsRating from "../../(User_flow)/StarsRating";
import { useEffect } from "react";
import * as Sentry from '@sentry/nextjs';
import { Mail } from "lucide-react";
const LeadDetails = ({ leadData, componentKey }) => {
  const [loading, setLoading] = useState(false);
  const [revloading, setrevLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviews, setReviews] = useState([]);
  const [requestId, setRequestId] = useState()
  const [hasTradepersonReview, setHasTradepersonReview] = useState(false);
  const [dialogUpdated, setDialogUpdated] = useState(false);
  const knownKeys = ["services", "serviceName", "postcode", "headline", "description"];
  const job = leadData?.job || {};

  const customQuestionEntry = Object.entries(job).find(
    ([key]) => !knownKeys.includes(key)
  );
  const questionValue = customQuestionEntry ? customQuestionEntry[1] : null;

  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No job details available</p>;
    }


    return (
      <div className="mt-6 md:mt-8 space-y-4">
        {Object.entries(job).map(([key, value], index) =>
          [
            "postcode",
            "services",
            "serviceName",
            "headline",
            "description",
          ].includes(key) ? null : (
            <div key={index}>
              <h2 className="text-sm font-semibold text-foreground">{key}</h2>
              <p className="text-sm text-foreground">{value || "Not Provided"}</p>
            </div>
          )
        )}
      </div>
    );
  };

  const JobQuestions = ({ questions }) => (
    <div className="mt-6 md:mt-8 space-y-4">
      {questions?.length ? (
        questions.map((q, index) => (
          <div key={index}>
            <h2 className="text-sm font-semibold text-foreground">{q.question}</h2>
            <p className="text-sm text-accent">
              {q.selectedAnswer || "No Answer Provided"}
            </p>
          </div>
        ))
      ) : (
        <p className="text-sm text-muted-foreground">No questions provided</p>
      )}
    </div>
  );

  const AskReview = async () => {
    setLoading(true);
    setErrorMessage("");

    const tradeperson = await getUserDetails();
    try {
      const response = await fetch("/api/ask-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tradeperson.token}`,
        },
        body: JSON.stringify({
          userId: leadData.userId,
          tradepersonId: tradeperson.id,
          jobId: leadData.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      if (data.success) {
        toast.success(data.message, {
          position: "top-center",
        });
      }
    } catch (error) {
      Sentry.captureException("Error in AskReview:", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setrevLoading(true); // Set loading to true
    const tradeperson = await getUserDetails(); // Fetch tradeperson details

    try {
      let tpId = tradeperson?.id;
      const response = await fetch("/api/get-reviewss", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tradeperson.token}`,
        },
        body: JSON.stringify({
          userId: leadData?.userId, // User ID
          tradepersonId: tpId, // Tradeperson ID
          jobId: leadData?.id, // Job ID
        }),
      });

      const data = await response.json();

      setRequestId(data.requestId)

      setReviews(data.reviews || []);
      const hasTradeperson = data.reviews?.some(review => review.reviewType === 'tradeperson');
      setHasTradepersonReview(hasTradeperson);
    } catch (error) {
      Sentry.captureException("Error fetching reviews:", error.message || error);
      throw error;
    } finally {
      setrevLoading(false);
    }
  };

  useEffect(() => {
    if (leadData) {
      fetchReviews();
    }
  }, [leadData, dialogUpdated]);

  return (
    <div>
      {!leadData?.job ? (
        <></>
      ) : (
        <div
          key={componentKey}
          style={{ height: "45rem" }}
          className="overflow-y-scroll p-6 md:p-8 w-full rounded-2xl bg-surface"
        >
          <>
            <div className="flex w-full flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="flex flex-col flex-1 md:justify-between">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold w-full text-foreground">
                  {leadData?.service?.type || "No Service Type Provided"}
                </h1>
                <div className="flex">
                  {leadData?.user && (
                    <div className="text-sm text-muted-foreground mt-0">
                      By{" "}
                      {leadData?.user?.firstName || "No User Detail Provided"}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 md:flex-col md:space-x-0 md:space-y-2 items-start md:items-end"></div>
            </div>

            <div className="w-full mt-4">
              <div className="w-full gap-2 mt-2 flex">
                {leadData?.user?.phone && (
                  <div>
                    <Badge type="verified" />
                  </div>
                )}
              </div>

              <div className="flex flex-col py-4">
                <p className="text-sm text-foreground font-bold">
                  {!leadData?.user?.email ? (
                    "No Email Provided"
                  ) : (
                    //<i>Email: {leadData?.user?.email}</i>
                    <i>



                      <div className="flex items-center gap-2 mb-1 group">
                        <a

                          href={`mailto:${leadData?.user?.email}?subject=${leadData?.service?.type}%20Assistance%20Inquiry&body=Hey%20there,%20I’ve%20just%20seen%20your%20job%20request%20that%20was%20posted%20on%20the%20TradePeople%20website.%20If%20you%20still%20need%20this%20job%20to%20complete,%20I%20can%20come%20and%20quote%20at%20a%20time%20that%20is%20convenient%20to%20you.%20I%20look%20forward%20to%20hearing%20from%20you.%0AThanks!`}

                          className="flex items-center gap-2 w-full"
                        >
                          <button className="px-1 py-1 rounded-full bg-accent text-accent-foreground rounded hover:bg-primary group-hover:text-ink-inverse">
                            <Mail className="w-4 h-4" />
                          </button>
                          <div className="text-foreground border-b border-accent transition-all duration-200 transform hover:scale-105 cursor-pointer"> {leadData?.user?.email} </div>
                        </a>
                      </div>

                    </i>
                  )}
                </p>

                <p className="text-sm text-foreground font-bold">
                  {!leadData?.user?.phone ? null : (
                    <i>


                      <div className="flex items-center gap-2 mb-1 group">

                        <a
                          href={`https://wa.me/${leadData?.user?.phone}?text=Hey%20there,%20I’ve%20just%20seen%20your%20job%20request%20that%20was%20posted%20on%20the%20TradePeople%20website.%20If%20you%20still%20need%20this%20job%20to%20complete,%20I%20can%20come%20and%20quote%20at%20a%20time%20that%20is%20convenient%20to%20you.%20I%20look%20forward%20to%20hearing%20from%20you.%0AThanks!`}

                          className="text-foreground flex items-center gap-2 w-full"
                        >
                          <button className="px-1 py-1 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              x="0px"
                              y="0px"
                              width={15}   // Adjusted for smaller size
                              height={15}  // Adjusted for smaller size
                              viewBox="0 0 50 50"
                              className="group-hover:fill-ink-inverse"
                            >
                              <path d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 29.079097 3.1186875 32.88588 4.984375 36.208984 L 2.0371094 46.730469 A 1.0001 1.0001 0 0 0 3.2402344 47.970703 L 14.210938 45.251953 C 17.434629 46.972929 21.092591 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 21.278025 46 17.792121 45.029635 14.761719 43.333984 A 1.0001 1.0001 0 0 0 14.033203 43.236328 L 4.4257812 45.617188 L 7.0019531 36.425781 A 1.0001 1.0001 0 0 0 6.9023438 35.646484 C 5.0606869 32.523592 4 28.890107 4 25 C 4 13.390466 13.390466 4 25 4 z M 16.642578 13 C 16.001539 13 15.086045 13.23849 14.333984 14.048828 C 13.882268 14.535548 12 16.369511 12 19.59375 C 12 22.955271 14.331391 25.855848 14.613281 26.228516 L 14.615234 26.228516 L 14.615234 26.230469 C 14.588494 26.195329 14.973031 26.752191 15.486328 27.419922 C 15.999626 28.087653 16.717405 28.96464 17.619141 29.914062 C 19.422612 31.812909 21.958282 34.007419 25.105469 35.349609 C 26.554789 35.966779 27.698179 36.339417 28.564453 36.611328 C 30.169845 37.115426 31.632073 37.038799 32.730469 36.876953 C 33.55263 36.755876 34.456878 36.361114 35.351562 35.794922 C 36.246248 35.22873 37.12309 34.524722 37.509766 33.455078 C 37.786772 32.688244 37.927591 31.979598 37.978516 31.396484 C 38.003976 31.104927 38.007211 30.847602 37.988281 30.609375 C 37.969311 30.371148 37.989581 30.188664 37.767578 29.824219 C 37.302009 29.059804 36.774753 29.039853 36.224609 28.767578 C 35.918939 28.616297 35.048661 28.191329 34.175781 27.775391 C 33.303883 27.35992 32.54892 26.991953 32.083984 26.826172 C 31.790239 26.720488 31.431556 26.568352 30.914062 26.626953 C 30.396569 26.685553 29.88546 27.058933 29.587891 27.5 C 29.305837 27.918069 28.170387 29.258349 27.824219 29.652344 C 27.819619 29.649544 27.849659 29.663383 27.712891 29.595703 C 27.284761 29.383815 26.761157 29.203652 25.986328 28.794922 C 25.2115 28.386192 24.242255 27.782635 23.181641 26.847656 L 23.181641 26.845703 C 21.603029 25.455949 20.497272 23.711106 20.148438 23.125 C 20.171937 23.09704 20.145643 23.130901 20.195312 23.082031 L 20.197266 23.080078 C 20.553781 22.728924 20.869739 22.309521 21.136719 22.001953 C 21.515257 21.565866 21.68231 21.181437 21.863281 20.822266 C 22.223954 20.10644 22.02313 19.318742 21.814453 18.904297 L 21.814453 18.902344 C 21.828863 18.931014 21.701572 18.650157 21.564453 18.326172 C 21.426943 18.001263 21.251663 17.580039 21.064453 17.130859 C 20.690033 16.232501 20.272027 15.224912 20.023438 14.634766 L 20.023438 14.632812 C 19.730591 13.937684 19.334395 13.436908 18.816406 13.195312 C 18.298417 12.953717 17.840778 13.022402 17.822266 13.021484 L 17.820312 13.021484 C 17.450668 13.004432 17.045038 13 16.642578 13 z" />
                            </svg>
                          </button>
                          <div className="text-foreground border-b border-accent transition-all duration-200 transform hover:scale-105 cursor-pointer">{leadData?.user?.phone}</div>
                        </a>
                      </div>


                    </i>
                  )}
                </p>
              </div>

              <div className="mt-3 flex items-center space-x-1 w-full text-foreground">
                <div className="flex items-center space-x-1 w-full">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">
                    {leadData?.postcode?.toUpperCase() ||
                      "No Postcode Provided"}
                  </span>
                </div>
                <div className="flex items-center space-x-1 w-full">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm">
                    {timeAgo(leadData?.createdAt) || "No Date Provided"}
                  </span>
                </div>
              </div>
            </div>

            {leadData?.job?.questions?.length ? (
              <JobQuestions questions={leadData?.job?.questions} />
            ) : (
              <JobDetail job={leadData?.job} />
            )}

            <div className="mt-2">
              <h2 className="text-sm font-semibold text-foreground">
                Description:{" "}
              </h2>
              <div className="text-sm text-foreground break-words whitespace-normal max-w-full">
                {leadData?.job?.description}
              </div>
            </div>

            <div>
              <div className="mt-6 md:mt-8 flex gap-4">
                {leadData?.job?.images?.map((img, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 sm:h-32 md:h-40 sm:w-32 md:w-40 bg-neutral-200"
                  >
                    {img ? (
                      <Image
                        src={img}
                        className="rounded-xl"
                        alt={`Image ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-neutral-300 rounded-xl">
                        No Image
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Reviews Section and Ask for Closure Button */}
              <div>
                {revloading || loading ? (
                  <div className="flex justify-center items-center">
                    <Spinner />
                  </div>
                ) : (
                  <div>
                    {/* Check for Reviews */}
                    {reviews.length > 0 ? (
                      <div className="overflow-y-auto max-h-64">
                        <>
                          <div className="flex justify-between pb-2">
                            <h2 className="md:text-2xl text-md font-bold mb-2">Reviews</h2>
                            {!hasTradepersonReview && <ReviewDialog requestId={requestId} setDialogUpdated={setDialogUpdated} />}
                          </div>
                          {reviews.map((review) => (
                            <div key={review.id} className="w-full">
                              <div
                                className={`flex items-start w-5/6 p-4 rounded-md shadow-md border mb-4 bg-muted ${review.reviewType === 'user' ? 'border-neutral-400 shadow-neutral-100 mr-auto' : ' border-accent shadow-accent ml-auto '
                                  }`}
                              >
                                <div className="w-full ">
                                  <p className="text-sm text-muted-foreground text-right">
                                    From {review.reviewType == 'user' ? 'Homeowner' : 'Tradeperson'}
                                  </p>
                                  <div className="md:flex justify-between items-center mt-2 ">
                                    <p className="text-sm text-ink-soft break-words overflow-hidden text-ellipsis">
                                      {review.message}
                                    </p>

                                  </div>
                                  <div className="md:flex justify-between items-center mt-2">
                                    <StarsRating filledStars={review.rating} />
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleDateString()}{" "}
                                      /{" "}
                                      {new Date(
                                        review.createdAt
                                      ).toLocaleTimeString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      </div>
                    ) : // If no reviews but ID exists, show text message
                      leadData?.id ? (
                        <div className="flex pb-4 justify-center items-center mt-4">
                          <div className="bg-surface p-8 rounded-lg md:w-[60%] text-center">
                            <h2 className="text-xl font-semibold mb-2">
                              No reviews available
                            </h2>

                            <>
                              {reviews.length === 0 && leadData?.id && (
                                <>
                                  {errorMessage ? (
                                    <span className="text-xs mt-4 text-center text-destructive">
                                      {errorMessage}
                                    </span>
                                  ) :
                                    <div className="mt-4">
                                      <p className="text-sm  text-muted-foreground">
                                        Click on ask for closure to get reviews on this job.
                                      </p>
                                      <button
                                        className="bg-accent mt-4 hover:bg-primary hover:text-ink-inverse text-accent-foreground text-sm font-bold py-2 px-4 rounded-lg"
                                        onClick={AskReview}
                                        disabled={loading}
                                      >
                                        {loading ? <Spinner /> : "Ask for Closure"}
                                      </button>
                                    </div>
                                  }
                                </>
                              )}
                            </>
                          </div>
                        </div>
                      ) : null}

                    {/* Ask for Closure Button */}
                  </div>
                )}
              </div>
            </div>


          </>
        </div>
      )}
    </div>
  );
};

export default LeadDetails;
