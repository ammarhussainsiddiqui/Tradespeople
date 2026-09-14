"use client";
import { useEffect, useState } from "react";
import { StarIcon, MapPinIcon, BriefcaseIcon, MapPin } from "lucide-react";
import userImage from "../../app/assets/userImage.webp";
import { Button } from "../ui/button";
import { getUserDetails } from "../../actions/auth";
import ContactMe from "../(Tradesperson)/ContactMe";
import { ChevronLeft } from "lucide-react";
import StarsRating from "./StarsRating";
import Spinner from "../../components/Spinner";
import * as Sentry from '@sentry/nextjs';
import { useGlobalState } from '../../app/context/GlobalStateContext';
import Image from "next/image";
export const ReviewsList = ({ data }) => {
  const reviewsWithDetails = data.flatMap((item) => {
    const serviceType = item.job.service.type;
    const userName =
      item.user.firstName || item.user.lastName
        ? `${item.user.firstName || ""} ${item.user.lastName || ""}`.trim()
        : "Anonymous";

    return item.reviews.map((review) => ({
      serviceType,
      userName,
      message: review.message,
      rating: review.rating,
      reviewDate: new Date(review.createdAt).toLocaleDateString(),
    }));
  });

  return (
    <div>
      <ul>
        {reviewsWithDetails.length ? (
          reviewsWithDetails.map((review, index) => (
            <li key={index} className="bg-neutral-100 rounded-lg p-4 mb-4 mt-4">
              <div className="border-b pb-2 mb-2">
                <div className="flex justify-between w-full">
                  <p className="text-sm text-muted-foreground">By {review.userName}.</p>
                  <p className="text-sm text-muted-foreground my-auto">
                    {review.serviceType}
                  </p>
                </div>
                <p className="text-ink-soft break-words overflow-hidden text-ellipsis">
                  <strong>Message: </strong>
                  {review.message}
                </p>
              </div>
              <div className="flex justify-between ">
                <StarsRating filledStars={review.rating} />
                <p className="text-sm text-muted-foreground text-right">
                  <strong>Review Date:</strong> {review.reviewDate}
                </p>
              </div>
            </li>
          ))
        ) : (
          <div className="flex justify-center items-center h-64">
            <p className="text-ink-soft text-lg">No Reviews Found</p>{" "}
          </div>
        )}

        { }
      </ul>
    </div>
  );
};

const TradespersonProfile = ({ profile, activeTab }) => {
  const [selectedTab, setSelectedTab] = useState(activeTab);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  if (!profile) {
    return <div>Loading...</div>; // Add a loading state or message if profile is not yet available
  }

  const [status, SetStatus] = useState(profile?.quote?.requested);
  const [isViewed, setIsViewed] = useState(profile?.quote?.isViewed);
  const [isLoading, SetisLoading] = useState(false);
  const { jobId, setJobId } = useGlobalState();;
  const reqeust = async (data) => {
    SetisLoading(true);
    const jwtuser = await getUserDetails();
    try {
      const Response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtuser?.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({
          userId: data?.userId,
          tradepersonId: data?.tradepersonId,
          jobId: data?.jobId,
        }),
      });

      const Result = await Response.json();

      SetStatus(Result?.quote?.requested);
      SetisLoading(false);
    } catch (error) {
      SetisLoading(false);
    }
  };
  useEffect(() => {
    let jobIdlocal = jobId;
    if (jobIdlocal !== null || jobIdlocal !== undefined || jobIdlocal !== "") {
      setJobId(jobIdlocal);
    }
  });

  useEffect(() => {
    if (selectedTab === "reviews") {
      fetchReviews();
    }
  }, [selectedTab]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    const jwt = await getUserDetails();
    try {
      const response = await fetch("/api/get-tradeperson-reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ id: profile?.id, reviewType: "user" }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }

      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      Sentry.captureException("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <>
      <div className="tradesperson-profile flex bg-surface p-4 rounded-lg w-full justify-between shadow-lg">
        <div className="md:w-7/10 w-full ">
          <div className="flex items-center justify-between ">
            <div className="md:flex w-full justify-between">
              <Button
                variant="default"
                className="bg-neutral-200 md:hidden block text-foreground hover:bg-neutral-200  mb-2"
                onClick={() => {
                  window.history.back();
                }}
              >
                <ChevronLeft />
              </Button>
              <div
                className={` flex items-center  p-1 cursor-pointer hover:bg-neutral-100 rounded-lg`}
              >
                <div className="person-image mr-3">
                  <Image
                    src={
                      profile?.tradepersonDetails[0]?.info.companyLogoUrl ||
                      profile?.profileUrl ||
                      userImage
                    }
                    alt="Profile Picture"
                    className="rounded-full h-20 w-20 border-2 border-accent object-cover"
                    width={50}
                    height={50}
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold">
                    {profile?.tradepersonDetails[0]?.info.companyName ||
                      profile?.firstName}{" "}
                    {profile?.tradepersonDetails[0]?.info.companyName
                      ? ""
                      : profile?.lastName}
                  </h2>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2 px-2 mt-3 md:text-sm text-xs w-full">
            <div className="flex items-center text-foreground mt-1">
              <MapPinIcon className="mr-1 w-4 h-4 text-accent" />
              <span>
                {profile?.postcode.toUpperCase() || "Location not provided"}
              </span>
            </div>
          </div>
          <div className="md:hidden block mt-4">
            <ContactMe tradeid={profile?.id} jobId={jobId} />
          </div>
        </div>
        <div className="w-3/10 flex flex-col gap-1 my-auto">
          <div className="md:block hidden ">
            <ContactMe tradeid={profile?.id} jobId={jobId} />
          </div>
          <Button
            variant="default"
            className="bg-neutral-200 md:block hidden text-foreground hover:bg-neutral-200 px-12"
            onClick={() => {
              window.history.back();
            }}
          >
            Back
          </Button>
        </div>
      </div>
      <div className="tradesperson-profile  bg-surface  rounded-lg shadow-lg md:mt-2 mt-4 md:mb-[10px] mb-[20px]">
        <div className="">
          <div className="flex gap-4 w-1/3">
            <button
              onClick={() => setSelectedTab("profile")}
              className={`flex-1 py-2 text-center ${selectedTab === "profile"
                ? "border-accent border-b-4 text-foreground"
                : "text-neutral-600"
                }`}
            >
              Profile
            </button>
            <button
              onClick={() => setSelectedTab("reviews")}
              className={`flex-1 py-2 text-center ${selectedTab === "reviews"
                ? "border-accent border-b-4 text-foreground"
                : "text-neutral-600"
                }`}
            >
              Reviews
            </button>
          </div>

          {/* Profile Tab Content */}
          {selectedTab === "profile" && (
            <div className="mt-6">
              <span className="text-2xl font-semibold mb-2">About</span>
              <div className="p-4 bg-neutral-100 border border-neutral-200 rounded-md mt-1 mb-1 w-full text-neutral-800">
                <p
                  style={{ overflow: "hidden" }}
                  className="whitespace-pre-line text-ink-soft leading-relaxed"
                >
                  {profile?.tradepersonDetails[0]?.info.companyDescription ||
                    profile?.introduction ||
                    "No description provided"}
                </p>
              </div>

              <div className="mt-6">
                <h4 className="text-2xl font-semibold mb-2">Services</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile?.trade && (
                    <span className="bg-neutral-100 text-ink-soft border border-neutral-200 px-3 py-1 rounded-md">
                      {profile?.trade}
                    </span>
                  )}
                  {profile?.tradeService?.map((service, index) => (
                    <span
                      key={index}
                      className="bg-neutral-100 text-ink-soft border border-neutral-200 px-3 py-1 rounded-md"
                    >
                      {service?.Service?.type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <h4 className="text-2xl font-semibold mb-2">
                  Service Locations
                </h4>
                <div className="w-full">
                  {profile?.tradepersonDetails[0]?.info.companyLocation && (
                    <>
                      <div className="mt-2 flex justify-left bg-neutral-100 border border-neutral-200 text-ink-soft px-3 py-2 rounded-md">
                        <div style={{ margin: "auto 0" }} className="pr-2">
                          <MapPin />
                        </div>
                        <div className="text-sm ">
                          {profile?.tradepersonDetails[0]?.info.companyLocation}{" "}
                          <p className="text-xs"> Company Location</p>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="mt-2 flex justify-left bg-neutral-100 border border-neutral-200 text-ink-soft px-3 py-2 rounded-md">
                    <div style={{ margin: "auto 0" }} className="pr-2">
                      <MapPin />
                    </div>
                    <div className="text-sm my-auto">
                      {profile?.postcode?.toUpperCase()}
                    </div>
                  </div>
                  {profile?.tradeLocation?.map((location, index) => (
                    <div
                      key={index}
                      className="mt-2 flex justify-left border border-neutral-200 bg-neutral-100 text-ink-soft px-3 py-2 rounded-md"
                    >
                      <div style={{ margin: "auto 0" }} className="pr-2">
                        <MapPin />
                      </div>
                      <div className="text-sm my-auto">
                        {location?.postcode?.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {profile?.email && (
                <>
                  <div>
                  </div>
                </>
              )}

              {profile?.tradepersonDetails[0]?.info.companyLocation && (
                <div className="mt-6">
                  <span className="text-2xl font-semibold mb-6">
                    About Company
                  </span>
                  <div className="mt-2 flex justify-left bg-neutral-100 border border-neutral-200 text-ink-soft px-3 py-2 rounded-md">
                    <div className="text-sm ">
                      Company Size{" "}
                      <p className="text-xs">
                        {" "}
                        {profile?.tradepersonDetails[0]?.info.companySize ||
                          "No size provided"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-left bg-neutral-100 border border-neutral-200 text-ink-soft px-3 py-2 rounded-md">
                    <div className="text-sm ">
                      Year Established{" "}
                      <p className="text-xs">
                        {profile?.tradepersonDetails[0]?.info.businessYears ||
                          "No ear established proyvided"}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {profile?.tradepersonDetails[0]?.info.portfolioUrls.length !==
                0 && (
                  <div className="mt-6">
                    <span className="text-2xl font-semibold mb-2">Portfolio</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2 ">
                      {profile?.tradepersonDetails[0]?.info.portfolioUrls?.map(
                        (image, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden"
                            style={{
                              gridRowEnd: `span 2`,
                              gridRowStart: `span 1`,
                            }}
                          >
                            <Image
                              src={image}
                              alt={`Portfolio ${index}`}
                              width={400}                 // match your card width
                              height={300}                // match your card height
                              className="object-cover rounded-lg"
                              sizes="(max-width: 768px) 100vw, 400px"
                            />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Reviews Tab Content */}
          {selectedTab === "reviews" && (
            <div className="mt-6 overflow-y-scroll h-96">
              <span className="text-xl font-semibold">Reviews</span>
              {loadingReviews ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner className="w-8 h-8" />
                </div>
              ) : (
                <ReviewsList data={reviews} />
              )}{" "}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TradespersonProfile;
