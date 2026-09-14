"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { getUserDetails } from "../../actions/auth";
import Badge from "../ui/badge";
import { useRouter } from "next/navigation";
import { timeAgo } from "../../utils/functions";
import * as Sentry from '@sentry/nextjs';
const cacheName = "lead-cache";
import Spinner from "../Spinner";
import { Mail } from "lucide-react";

const LeadDetailsMob = ({
  checkRevealstatus,
  leadData,
  openModal,
  updateLeadCount,
  componentKey,
}) => {
  const router = useRouter();
  const [lead, setLead] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [interested, setInterested] = useState(false);
  const [jobs, setJobs] = useState(leadData?.job);
  const [error, setError] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [revealLoading, setRevealLoading] = useState(false);
  const knownKeys = ["services", "serviceName", "postcode", "headline", "description"];
  const job = leadData?.job || {};

  const customQuestion = Object.entries(job).find(
    ([key]) => !knownKeys.includes(key)
  );

  const questionValue = customQuestion ? customQuestion[1] : null;



  const getUser = async (id) => {
    if (!id) return;
    const jwt = await getUserDetails();
    try {
      const response = await fetch("/api/get-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      setError("Failed to fetch user data");
    }
  };

  const viewStatus = async () => {
    const jwt = await getUserDetails();
    if (!lead.quoteId) return;
    try {
      const response = await fetch("/api/interested", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ quoteId: lead?.quoteId, isViewed: true }),
      });

      const data = await response.json();

      if (data.success) {
        setInterested(data.isInterested);
      }
    } catch (error) {
      setError("Failed to fetch status data");
    }
  };

  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No job details available</p>;
    }

    return (
      <div className="mt-6 md:mt-8 space-y-4">
        {Object.entries(job).map(([key, value], index) => (
          <>
            {key == "postcode" ||
              key == "services" ||
              key == "serviceName" ||
              key == "headline" ||
              key == "description" ? (
              ""
            ) : (
              <div key={index}>
                <h2 className="text-sm font-semibold text-foreground">{key}</h2>
                <p className="text-sm text-foreground">
                  {String(value) || "Not Provided"}
                </p>
              </div>
            )}
          </>
        ))}
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

  useEffect(() => {
    const fetchProfile = async () => {
      const cached = leadData;
      if (cached) {
        setLead(cached);
        setJobs(cached.job || null);
        getUser(cached.userId);
      }
    };

    fetchProfile();
  }, [lead, leadData, componentKey]);

  useEffect(() => {
    try {
      setLoading(true);
      getUser();
      if (lead) {
        viewStatus();
      }
      setLead(leadData);
      validate();
    } catch {
      setLoading(false);
    }
  }, [leadData, componentKey]);

  const validate = async () => {
    const userDetail = await getUserDetails();
    checkRevealstatus(false);
    try {
      const tradepersonId = userDetail?.id;
      const JobId = leadData.id;
      const viewLeadResponse = await fetch("/api/view-leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userDetail?.token}`,
        },
        body: JSON.stringify({ tradepersonId, JobId }),
      });
      const viewedLead = await viewLeadResponse.json();
      setReveal(viewedLead.success);
      checkRevealstatus(viewedLead.success);
      setLoading(false);
    } catch (error) {
      setReveal(false);
      checkRevealstatus(false);
    } finally {
      setLoading(false);
    }
  };

  const checkReveal = async () => {
    setRevealLoading(true);
    setReveal(false);
    // Fetch user detail
    checkRevealstatus(false);
    const user = await getUserDetails();
    if (!user || !user.id) {
      throw new Error("User details not found");
    }

    try {
      // Insert the viewed lead
      const tradepersonId = user.id;
      const JobId = leadData.id;

      const viewLeadResponse = await fetch("/api/view-leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ tradepersonId, JobId }),
      });
      if (viewLeadResponse.ok) {
        checkRevealstatus(true);
        setReveal(true);
      } else {
        setReveal(false);
        checkRevealstatus(false);
        throw new Error("Failed to record viewed lead");
      }

      const viewedLead = await viewLeadResponse.json();
    } catch (error) {
      Sentry.captureException("Error:", error.message);
    } finally {
      setRevealLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (

    <>

      {leadData?.jobStatus?.status === "Deleted" ? (

        <div className="overflow-y-scroll p-6 md:p-8 w-full rounded-2xl bg-surface h-full">
          <div className="flex items-center justify-center mx-auto h-full justify-center">
            <div className="w-full sm:w-auto text-destructive  text-sm sm:text-base font-semibold px-4 sm:px-6 py-2  text-center">
              This job is deleted.
            </div>
          </div>
        </div>

      ) : (



        <div
          style={{ height: "auto" }}
          className="overflow-y-scroll p-2 w-full bg-transparent"
        >
          {isLoading ? (
            <div
              style={{ margin: "auto 0" }}
              className="flex items-center h-full justify-center"
            >
              <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
            </div>
          ) : (
            <>
              <div className="flex w-full flex-col space-y-4  md:flex-row md:space-y-0 md:space-x-4">
                <div className="flex flex-col flex-1 md:justify-between">
                  <div>
                    <h1 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                      {leadData?.mainTrade?.type || "Unknown !"}
                    </h1>
                  </div>
                  <div className="flex">
                    {lead?.userDetail && (
                      <div className="text-sm text-muted-foreground mt-0">
                        By {lead?.userDetail || "No User DetailProvided"}.
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col py-4">
                    {reveal ? (
                      <p className="text-sm text-foreground font-bold">
                        {!user?.email || user?.email == undefined ? (
                          "No Email Provided"
                        ) : (
                          <i>



                            <div className="flex items-center gap-2 mb-1 group">
                              <a
                                href={`mailto:${user?.email}?subject=${lead?.serviceType}%20Assistance%20Inquiry&body=Hey%20there,%20I’ve%20just%20seen%20your%20job%20request%20that%20was%20posted%20on%20the%20TradeCore%20website.%20If%20you%20still%20need%20this%20job%20to%20complete,%20I%20can%20come%20and%20quote%20at%20a%20time%20that%20is%20convenient%20to%20you.%20I%20look%20forward%20to%20hearing%20from%20you.%0AThanks!`}

                                className="flex items-center gap-2 w-full"
                              >
                                <button className="px-1 py-1 rounded-full bg-accent text-accent-foreground rounded hover:bg-primary group-hover:text-ink-inverse">
                                  <Mail className="w-4 h-4" />
                                </button>
                                {reveal ? (
                                  <span className="text-foreground border-b border-accent transition-all duration-200 transform hover:scale-105 cursor-pointer">{user?.email}</span>
                                ) : (
                                  <span className="text-foreground">{"***" + "*****@gmail.com"}</span>
                                )}
                              </a>
                            </div>
                          </i>
                        )}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm text-foreground font-bold">
                          <i> <button className="px-1 py-1 rounded-full bg-accent text-accent-foreground rounded group-hover:text-ink-inverse">
                            <Mail className="w-4 h-4" />
                          </button> ********@gmail.com</i>
                        </p>
                        <p className="text-sm text-foreground font-bold">
                          <i><button className="px-1 py-1 rounded-full bg-accent text-accent-foreground">
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
                          </button> +*****0000****00</i>
                        </p>
                      </>
                    )}
                    {reveal && (
                      <p className="text-sm text-foreground font-bold">
                        {!user?.phone || user?.phone == undefined ? (
                          ""
                        ) : (

                          <i>
                            <div className="flex items-center gap-2 mb-1 group">

                              <a
                                href={`https://wa.me/${user?.phone}?text=Hey%20there,%20I’ve%20just%20seen%20your%20job%20request%20that%20was%20posted%20on%20the%20TradeCore%20website.%20If%20you%20still%20need%20this%20job%20to%20complete,%20I%20can%20come%20and%20quote%20at%20a%20time%20that%20is%20convenient%20to%20you.%20I%20look%20forward%20to%20hearing%20from%20you.%0AThanks!`}

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
                                {reveal ? (
                                  <span className="text-foreground border-b border-accent transition-all duration-200 transform hover:scale-105 cursor-pointer"> {user?.phone}</span>
                                ) : (
                                  <span>{user?.phone?.substring(0, 3) + "*****0000****"}</span>
                                )}
                              </a>
                            </div>


                          </i>






                        )}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 md:mt-4 flex items-center flex-wrap space-x-2 sm:space-x-3 text-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">
                        {lead?.postcode?.toUpperCase() || "No Postcode Provided"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">
                        {timeAgo(lead?.createdAt) || "No Date Provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conditionally render JobQuestions or JobDetail */}
              {lead?.job?.questions?.length ? (
                <JobQuestions questions={lead.job.questions} />
              ) : (
                <JobDetail job={jobs} />
              )}
              <div className="mt-2">
                <h2 className="text-sm font-semibold text-foreground">Description: </h2>
                <div class="text-sm  text-foreground break-words whitespace-normal max-w-full">
                  {lead?.job?.description}
                </div>
              </div>

              {/* Images Section */}
              <div className="mt-6 md:mt-8 flex gap-4">
                {lead?.job?.images?.map((img, index) => (
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



              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-4 md:flex-col md:space-x-0 md:space-y-2 items-start md:items-end">
                {leadData?.jobStatus?.status === "Closed" ? (
                  // If job is closed, show this message
                  <div className="w-full flex justify-center">
                    <div className="bg-destructive text-destructive-foreground text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 rounded-2xl border border-neutral-300 text-center">
                      This job is closed.
                    </div>
                  </div>
                ) : reveal ? (
                  // If revealed, show success message
                  <p className="text-success">
                    Great! Now you can contact this lead to discuss the project details. Wish you all the best!
                  </p>
                ) : (
                  // Otherwise, show the button
                  <div>
                    {revealLoading ? (
                      <button
                        disabled
                        className="w-full sm:w-auto bg-accent text-accent-foreground text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 rounded-md border border-neutral-300"
                      >
                        Loading...
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          checkReveal();
                        }}
                        className="w-full sm:w-auto bg-accent text-accent-foreground text-sm sm:text-base font-semibold px-4 sm:px-6 py-2 rounded-md border border-neutral-300"
                      >
                        Reveal Contact Details
                      </button>
                    )}
                  </div>
                )}
              </div>














            </>
          )}
        </div>



      )}


    </>



  );
};

export default LeadDetailsMob;
