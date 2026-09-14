"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import TradepersonsSubscription from "../../../../components/(Tradesperson)/Subscription";
import Progress from "../../../../components/(Tradesperson)/Progress";
import { Edit3, List, MapPin, Clock, Filter } from "lucide-react";
import magnifactionIcon from "../../../assets/magnificationIcon.webp";
import "../radio-tabs.css";
import Link from "next/link";
import { getUserDetails, updatedAreaSegments } from "../../../../actions/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LeadDetails from "../../../../components/(Tradesperson)/leadDetails";
import LeadDetailsMob from "../../../../components/(Tradesperson)/leadDetailsMob";
import DialogWithCheckbox from "../../../../components/(Tradesperson)/DialogWithCheckbox";
import { timeAgo } from "../../../../utils/functions";
import Badge from "../../../../components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import * as Sentry from '@sentry/nextjs';


const Page = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [areas, setAreas] = useState([]);

  const [jobDetails, setJobDetails] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobId, setJobId] = useState(false);



  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setJobId(searchParams.get("jobid"))


    const getAreas = async () => {
      const areas = await updatedAreaSegments();

      setAreas(areas);
    };
    getAreas();
  }, []);

  const [SelectedAreas, setSelectedAreas] = useState([]);

  const router = useRouter();
  const [SubscriptionType, SetSubscriptionType] = useState("");
  const [isCustomer, setIsCustomer] = useState("");
  const [remainingLeads, setRemainingLeads] = useState(0);
  const [subscriptionEndTime, setSubscriptionEndTime] = useState(null);
  const [profileStatus, setprofileStatus] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [leads, setLeads] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [noLeedStatus, setNoleedStatus] = useState(false);
  const [leadData, setLeadData] = useState({});
  const [loading, setLoading] = useState(false);
  const [userData, setUser] = useState();
  const [urgentJob, setUrgentJob] = useState([]);
  const [leadCount, setLeadCount] = useState(0);
  const [totslLead, settotelLeads] = useState(0);
  const [checkReveal, setCheckReveal] = useState(false);
  const [revealedJobs, setRevealedJobs] = useState([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totelPage, setTotelPage] = useState(1);
  const [totelJob, setTotelJob] = useState(1);


  const [selectedLeadIndex, setSelectedLeadIndex] = useState(null);
  const [selectedUrgentLeadIndex, setSelectedUrgentLeadIndex] = useState(null);

  const [isSelected, setIsSelected] = useState(false);
  const [isSelectedIndex, setIsSelectedndex] = useState(0);


  const [componentKey, setComponentKey] = useState(0);



  const leadsPerPage = 5;

  const handleSearch = (selectedOptions) => {
    setSelectedAreas(selectedOptions);
    setCurrentPage(1);
  };

  const getLeads = async () => {
    setLoading(true);

    const user = await getUserDetails();
    setUser(user);
    const effectiveUserId = user?.id;

    if (!effectiveUserId) return;

    try {
      const response = await fetch("/api/get-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ id: effectiveUserId }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.user.SubscriptionType.type == "Deactivate") {
          setIsCustomer(data?.user?.customerid);
          router.push("/tradesperson/subscription");
        }
        const activeSubscriptions = data.user.Subscription.filter(
          (sub) => sub.status === "active"
        );
        if (activeSubscriptions) {
          setSubscriptionEndTime(activeSubscriptions[0]?.expiredAt);
        }
        SetSubscriptionType(data.user.SubscriptionType.type);
        // setRemainingLeads(data?.user?.remaningLeads);
        // setLeadCount(data.user.leadUsed);
        settotelLeads(data.user.SubscriptionType.leadCount);
      }
    } catch (error) { }

    try {
      const response = await fetch(
        `/api/save-trade-service?userId=${effectiveUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {
        setServicesList(data.services);

        try {
          //const revealedJobIds = await getRevealedJobs();
          const response = await fetch(`/api/leads-postal`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            cache: "no-cache",
            body: JSON.stringify({
              user: user,
              mainData: data,
              areafilter: SelectedAreas,
              page: currentPage,
              pageSize: leadsPerPage,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch jobs");
          }
          const dataLead = await response.json();
          setCurrentPage(dataLead.pagination.page);
          setTotelJob(dataLead.pagination.totalJobs);
          setTotelPage(dataLead.pagination.totalPages);

          const revealedJobIds = await getRevealedJobs();
          const leadsData =
            dataLead?.jobs.map((lead) => ({
              ...lead,
              viewed: revealedJobIds.includes(lead.id), // Mark as viewed if in revealed jobs
            })) || [];

          setLeads(leadsData || []);
          setNoleedStatus(!leadsData?.length);
        } catch (error) {
          Sentry.captureException("Error fetching jobs:", error);
          setLeads([]);
        }
      }
    } catch (error) {
      Sentry.captureException("Error fetching user data:", error);

    }

    try {
      const response = await fetch(
        `/api/save-trade-location?userId=${effectiveUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {
        setLocationList(data.tradeLocations);
      }
    } catch (error) {
      Sentry.captureException("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }

    // Fetch data for services and locations...
  };

  const getRevealedJobs = async () => {
    try {
      const user = await getUserDetails();
      if (!user?.id) return [];

      const response = await fetch("/api/myjobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          page: 1, // Fetch all revealed jobs
          pageSize: 10000000000,
          userId: user.id,
          areafilter: [],
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch revealed jobs");

      const data = await response.json();

      if (data.success) {
        const revealedJobIds = data.jobs.map((job) => job.job.id); // Extract IDs
        setRevealedJobs(revealedJobIds); // Update state
        return revealedJobIds; // Return IDs
      }
    } catch (error) {
      Sentry.captureException("Error fetching revealed jobs:", error);
    }

    return []; // Return empty array if error occurs
  };

  const fetchNotifications = async () => {
    try {
      const user = await getUserDetails();
      if (!user?.id) return;

      const response = await fetch(`/api/get-quote-request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ tradepersonId: user?.id }),
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data?.quotes)) {
        const notAcceptedQuotes = data?.quotes?.filter(
          (quote) => quote?.quotePrice === null
        );

        const updatedQuotes = await Promise.all(
          notAcceptedQuotes?.map(async (quote) => {
            try {
              const response = await fetch(
                `/api/get-service?serviceId=${quote.job.job.services}`,
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                  },
                }
              );

              if (!response.ok)
                throw new Error("Failed to fetch service data");

              const serviceData = await response.json();

              if (serviceData.success) {
                return {
                  //  ...quote,
                  quoteId: quote?.id,
                  createdAt: quote?.job?.createdAt,
                  job: quote?.job?.job,
                  isCompleted: quote?.job?.isCompleted,
                  interestedTradepersons: quote?.job?.interestedTradepersons,
                  id: quote?.job?.id,
                  userId: quote?.user?.id,
                  isUrgent: true,
                  status: quote?.job?.jobStatus?.status,
                  mainTrade: serviceData?.service?.mainTrade,
                  postcode: quote?.job?.job?.postcode,
                  userDetail: quote?.user?.firstName,
                  userImage: quote?.user?.profileUrl,
                  email: quote?.user?.email,
                  phone: quote?.user.phone,
                  serviceType: serviceData?.service?.type,
                  isViewed: quote?.isViewed,
                };
              }
            } catch (error) {
              Sentry.captureException("Error fetching service data:", error);
            }

            return quote;
          })
        );
        setUrgentJob(updatedQuotes);
      } else {
        Sentry.captureException("Error fetching notifications:", data?.message);
      }
    } catch (error) {
      Sentry.captureException("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    getLeads();
  }, [currentPage, SelectedAreas]);

  useEffect(() => {
    fetchNotifications();
  }, []);


  const currentLeads = leads;

  const filteredCurrentLeadsVar = currentLeads.filter(
    (lead) =>
      !urgentJob.some(
        (urgent) => urgent.id === lead.id && urgent.isViewed === false
      )
  );


  const totalPages = totelPage;
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No job details available</p>;
    }

    const details = Object.entries(job)
      .filter(([key]) => key !== "postcode" && key !== "services")
      .slice(0, 4) // Limit to 4 entries
      .map(([key, value]) => String(value) || "Not Provided");

    return (
      <div className="text-xs text-muted-foreground truncate">
        {/* {details.join(' / ')} */}
        {job.description}
      </div>
    );
  };

  const JobQuestions = ({ questions }) => {
    const questionAnswers = questions
      ?.slice(0, 4)
      .map((q) => q.selectedAnswer || "No Answer Provided");

    return (
      <div className="text-xs text-muted-foreground">
        {questionAnswers?.join(" / ") || "No questions provided"}
      </div>
    );
  };

  const selectNormalLead = (lead, index) => {
    setLeadData(lead);
    setSelectedLeadIndex(selectedLeadIndex === index ? null : index);
    setIsSelectedndex(index);
  };

  const selectUrgentLead = (lead, index) => {
    setLeadData(lead);
    setSelectedUrgentLeadIndex(
      selectedUrgentLeadIndex === index ? null : index
    );
    setIsSelectedndex(index + 100);
  };

  const openSubscriptionModal = () => {
    setShowSubscriptionDialog(true);
  };
  //dynamic
  const getJobData = async () => {
    if (!jobId) return; // Exit if no jobId (page works normally)
    setJobLoading(true); // Show loader while fetching job data

    try {
      const user = await getUserDetails(); // Get authenticated user
      const response = await fetch("/api/job", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ id: jobId }), // Send jobId in request
      });

      const data = await response.json();
      if (data.success) {
        let adjFocusJob = {
          ...data.job,
          mainTrade: data.job.service.mainTrade,
          phone: data.job.user.phone,
          serviceType: data.job.service.type,
          status: data.job.jobStatus.status,
          userImage: data.job.user.profileUrl,
          userName: data.job.user.firstName,
        };
        setJobDetails(adjFocusJob);
      }
    } catch (error) {
      Sentry.captureException("Error fetching job data:", error);
    } finally {
      setJobLoading(false); // Hide loader
    }
  };

  // Function to remount the component
  const remountLeadDetails = () => {
    setComponentKey((prevKey) => prevKey + 1); // Increment the key to remount
  };

  const checkRevealstatus = (val) => {
    setCheckReveal(val);
  };


  useEffect(() => {
    if (urgentJob.length > 1) {
      if (urgentJob[0].isViewed === false) {
        setLeadData(urgentJob[0]);
        selectUrgentLead(urgentJob[0], 0);
      } else {
        if (jobDetails) {
          setLeadData(jobDetails)
        } else {
          setLeadData(leads[0]);
          selectNormalLead(leads[0], 0);
        }
      }
    } else {
      if (jobDetails) {
        setLeadData(jobDetails)
      } else {
        setLeadData(leads[0]);
        selectNormalLead(leads[0], 0);
      }
    }
  }, [urgentJob, leads]);

  //dynamic
  useEffect(() => {
    if (jobId) {
      getJobData();
    }
  }, [jobId]);
  //dynamic
  useEffect(() => {
    if (jobId && jobDetails) {
      setLeadData(jobDetails);
      setIsSelected(true);
    }
  }, [jobDetails, jobId]);
  //dynamic
  useEffect(() => {
    if (jobId && jobDetails) {
      if (revealedJobs) {
        const found = revealedJobs.find((num) => num == jobId);
        if (found) {
          let focusLeadData = {
            ...jobDetails,
            viewed: true,
          }
          setJobDetails(focusLeadData);
        }
      }
    }
  }, [revealedJobs]);

  useEffect(() => { remountLeadDetails() }, [leadData]);
  useEffect(() => { }, [checkReveal]);

  return (
    <>
      <Dialog
        open={showSubscriptionDialog}
        onOpenChange={() => setShowSubscriptionDialog(false)}
        className="fixed inset-0 z-60 flex items-center justify-center w-screen h-screen"
      >
        <DialogContent className="w-full max-w-[95%] mx-auto ">
          <DialogHeader>
            <div
              style={{ width: "101%" }}
              className="flex flex-col justify-center text-center "
            >
              <DialogTitle>Subscription Plans</DialogTitle>
              <DialogDescription className="text-xs mt-2">
                Buy our subscription plan to contact clients.
              </DialogDescription>
            </div>
          </DialogHeader>
          <TradepersonsSubscription
            subscriptionEndTime={subscriptionEndTime}
            remainingLeads={remainingLeads}
            SubscriptionType={SubscriptionType}
            isCustomer={isCustomer}
          />
        </DialogContent>
      </Dialog>
      <DialogWithCheckbox
        open={showDialog}
        onOpenChange={setShowDialog}
        areas={areas}
        onSearch={handleSearch}
      />
      <div className="bg-muted p-4 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-muted">
          <Progress />

          <div className="bg-primary text-ink-inverse p-4 rounded-2xl flex justify-between items-center mt-4">
            <div>
              <h3 className="text-lg font-semibold">
                Opportunities Await
                {/* {totelJob} Matching Leads */}

              </h3>
              <div className="flex items-center space-x-4 mt-1 text-sm">
                <div className="flex items-center space-x-1">
                  <List className="w-4 h-4 text-accent" />
                  <span>
                    {servicesList?.length + 1}{" "}
                    {Number(servicesList?.length + 1) > 1
                      ? "services"
                      : "service"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>
                    {SelectedAreas.length > 0
                      ? SelectedAreas.length
                      : locationList?.length + 1}{" "}
                    {Number(
                      SelectedAreas.length > 0
                        ? SelectedAreas.length
                        : locationList?.length + 1
                    ) > 1
                      ? "locations"
                      : "location"}
                  </span>
                </div>
              </div>
            </div>
            <Link href={"/tradesperson/profile?tab=leadsSettings"}>
              <Edit3 className="w-6 h-6 text-ink-inverse" />
            </Link>
          </div>

          {jobLoading && jobId ? (
            <div className="flex items-center justify-center my-4">
              <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
            </div>
          ) : (
            <>
              <div className="md:flex justify-between hidden md:block">
                <h2 className="md:text-2xl text-xl font-bold mb-4 mt-6">
                  Available Leads
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDialog(true)}
                    className="px-2 py-2 mb-4 mt-4 rounded-full bg-accent text-accent-foreground rounded hover:bg-primary hover:text-ink-inverse"
                  >
                    <Filter />
                  </button>
                  <div className="flex my-auto">
                    <h2 className="md:text-2xl text-lg font-bold mb-4 mt-4">
                      Leads : âˆž /
                      {/* {totslLead - leadCount}/ */}
                    </h2>
                    <h2
                      style={{ marginTop: "auto" }}
                      className="text-md font-bold text-foreground mb-4 mt-4"
                    >
                      âˆž
                      {/* {totslLead} */}
                    </h2>
                  </div>
                </div>
              </div>
              <div className="flex justify-between block md:hidden">
                <h2 className="text-lg font-bold mb-4 mt-5">Available Leads</h2>
                <button
                  onClick={() => setShowDialog(true)}
                  className="px-2 py-2 mb-4 mt-4 rounded-full bg-accent text-accent-foreground rounded hover:bg-primary hover:text-ink-inverse"
                >
                  <Filter size={18} />
                </button>
                <div className="flex my-auto">
                  <h2 className="md:text-2xl text-md font-bold mb-4 mt-4">
                    Leads : âˆž /
                    {/* {totslLead - leadCount}/ */}
                  </h2>
                  <h2
                    style={{ marginTop: "auto" }}
                    className="text-sm font-bold text-foreground mb-4 mt-4"
                  >âˆž
                    {/* {totslLead} */}
                  </h2>
                </div>
              </div>
              <div className="space-y-4">
                {noLeedStatus && !jobDetails ? (
                  <>
                    {loading ? (
                      <div className="flex items-center justify-center mb-4">
                        <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
                      </div>
                    ) : (
                      <>
                        <div className="flex pb-4 justify-center items-center mt-4">
                          <div className="bg-surface p-8 rounded-lg md:w-[60%] shadow-md justify-center items-center text-center">
                            <div className="w-full">
                              <Image
                                style={{ margin: "0 auto" }}
                                src={magnifactionIcon}
                                alt="No Leads"
                              />
                            </div>
                            <h2 className="text-xl font-semibold mb-2">
                              No matching leads right now, but more are on the way!
                            </h2>
                            <p className="text-muted-foreground mb-4">
                              Relevant {" "}
                              <Link
                                href={"/tradesperson/profile?tab=leadsSettings"}
                                className="border-b hover:border-accent hover:text-foreground"
                              >
                                leads
                              </Link>{" "}
                              will contact you directly via the directory or appear in your Notification Centre via jobs listed.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : loading ? (
                  <div className="flex items-center justify-center mb-4">
                    <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between gap-4">
                      <div className="md:w-1/2 w-full ">
                        <div
                          style={{ height: "41rem" }}
                          className="overflow-y-scroll hidden md:block"
                        >
                          {/* on desktop dynamic */}

                          {jobDetails && jobId && (
                            <div
                              onClick={() => {
                                setLeadData(jobDetails);
                                setIsSelected(true);
                              }}
                              className={`
                          cursor-pointer 
                          flex flex-col md:flex-row 
                          justify-between 
                          items-start md:items-center 
                          p-4 
                          border border-info
                          rounded-2xl 
                          bg-surface 
                          shadow-sm 
                          mb-4
                        `}
                            >
                              <div className="flex-1 mb-4 md:mb-0 w-full">
                                <div className="flex justify-between">
                                  <div className="flex">
                                    {jobDetails.userImage &&
                                      jobDetails.userImage !== "" && (
                                        <Image
                                          className="rounded-full object-cover w-16 h-16"
                                          width={60}
                                          height={60}
                                          src={jobDetails.userImage}
                                          alt="profile"
                                        />
                                      )}
                                    <div
                                      style={{ margin: "auto 0" }}
                                      className="px-2"
                                    >
                                      <div className="max-w-64">
                                        <h3 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                                          {jobDetails?.job?.headline ||
                                            "Unknown !"}
                                        </h3>
                                      </div>

                                      <p className="text-xs">
                                        {jobDetails?.userDetail && (
                                          <span className="text-foreground">
                                            By &nbsp;
                                            {jobDetails?.userDetail ||
                                              "Unknown !"}
                                            .
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-foreground text-xs">
                                        Postcode: &nbsp;{" "}
                                        {jobDetails?.postcode?.toUpperCase()}{" "}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-row-reverse  gap-2">
                                    <h3 className="text-xs text-muted-foreground py-1">
                                      {timeAgo(jobDetails?.createdAt)}
                                    </h3>
                                    <div>
                                      {jobDetails?.viewed && (
                                        <Badge type={"viewed"} />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex justify-between pl-2">
                                  <p className="text-xs font-semibold my-auto">
                                    Status:&nbsp;
                                    <span
                                      style={{
                                        color:
                                          jobDetails?.status === "Opened"
                                            ? "hsl(var(--success))" // Green
                                            : jobDetails?.status ===
                                              "Inprogress"
                                              ? "hsl(var(--accent))" // Yellow
                                              : jobDetails?.status === "Onhold"
                                                ? "hsl(var(--neutral-500))" // Gray
                                                : jobDetails?.status === "Stopped"
                                                  ? "hsl(var(--destructive))" // Red
                                                  : "hsl(var(--neutral-500))", // Gray (default for unknown)
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {jobDetails?.status || "Unknown"}
                                    </span>
                                  </p>

                                  <Link
                                    href={`userprofile/${jobDetails?.userId}`}
                                    className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <Avatar className="w-4 h-4">
                                        <AvatarImage
                                          src={jobDetails?.userImage}
                                          alt="profile"
                                        />
                                        {/* <AvatarFallback>S</AvatarFallback> */}
                                        <AvatarFallback className="text-foreground">
                                          {jobDetails.userName ? jobDetails.userName.charAt(0).toUpperCase() : "U"}
                                        </AvatarFallback>
                                      </Avatar>

                                      <div className="px-1 justify-left align-left">
                                        <p className="text-[8px] ">
                                          View User Profile
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                                <div className="mt-2 mb-2 gap-2 flex">
                                  {jobDetails?.phone && (
                                    <Badge type={"verified"} />
                                  )}
                                </div>
                                <div className="bg-secondary mt-1 py-3 px-2 rounded-xl">
                                  <h3 className="text-md font-semibold">
                                    {jobDetails?.serviceType}
                                  </h3>
                                  <div className="font-normal">
                                    {jobDetails?.job?.questions?.length ? (
                                      <JobQuestions
                                        questions={jobDetails?.job.questions}
                                      />
                                    ) : (
                                      <JobDetail job={jobDetails?.job} />
                                    )}
                                  </div>
                                </div>
                                <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden">
                                  <LeadDetailsMob
                                    checkRevealstatus={checkRevealstatus}
                                    openModal={openSubscriptionModal}
                                    leadData={jobDetails}
                                    componentKey={777}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          {urgentJob.map((lead, index) => (
                            <>
                              {lead.isViewed === false && (
                                <div
                                  key={index}
                                  onClick={() => {
                                    selectUrgentLead(lead, index);
                                    setIsSelected(!isSelected);
                                  }}

                                  className={`
                                    cursor-pointer 
                                    flex flex-col md:flex-row 
                                    justify-between 
                                    items-start md:items-center 
                                    p-4 
                                    ${lead.viewed ? " border border-success"
                                      : ""}
                                    rounded-2xl 
                                    bg-surface 
                                    shadow-sm 
                                    mb-4
                                    `}
                                >
                                  <div className="flex-1 mb-4 md:mb-0 w-full ">
                                    <div className="flex justify-between ">
                                      <div className="flex">
                                        {
                                          lead.userImage &&
                                            lead.userImage !== "" ? (
                                            <Image
                                              className="rounded-full object-cover w-16 h-16"
                                              width={60}
                                              height={60}
                                              src={lead.userImage}
                                              alt="profile"
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                        <div
                                          style={{ margin: "auto 0" }}
                                          className="px-2 flex justify-between pl-2"
                                        >
                                          <div>
                                            <div className="max-w-64">
                                              <h3 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                                                {lead?.job?.headline ||
                                                  "Unknown !"}
                                              </h3>
                                            </div>
                                            <p className="text-xs">
                                              {lead.userDetail && (
                                                <span className="text-foreground">
                                                  By &nbsp;
                                                  {lead.userDetail ||
                                                    "Unknown !"}
                                                  .
                                                </span>
                                              )}
                                            </p>
                                            <p className="text-foreground text-xs">
                                              Postcode: &nbsp;{" "}
                                              {lead.postcode?.toUpperCase()}{" "}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-row-reverse gap-2">
                                        <h3 className="text-xs text-muted-foreground py-1">
                                          {timeAgo(lead.createdAt)}
                                        </h3>
                                        <div>
                                          {lead?.viewed && (
                                            <Badge type={"viewed"} />
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex justify-between pl-2">
                                      <p className="text-xs font-semibold my-auto">
                                        Status:&nbsp;
                                        <span
                                          style={{
                                            color:
                                              lead.status === "Opened"
                                                ? "hsl(var(--success))" // Green
                                                : lead.status === "Inprogress"
                                                  ? "hsl(var(--accent))" // Yellow
                                                  : lead.status === "Onhold"
                                                    ? "hsl(var(--neutral-500))" // Gray
                                                    : lead.status === "Stopped"
                                                      ? "hsl(var(--destructive))" // Red
                                                      : "hsl(var(--neutral-500))", // Gray (default for unknown)
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {lead.status || "Unknown"}
                                        </span>
                                      </p>

                                      <Link
                                        href={`userprofile/${lead.userId}`}
                                        className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground"
                                      >
                                        <div className="flex items-center space-x-1">
                                          <Avatar className="w-4 h-4">
                                            <AvatarImage
                                              src={lead.userImage}
                                              alt="profile"
                                            />
                                            {/* <AvatarFallback>S</AvatarFallback> */}
                                            <AvatarFallback className="text-foreground">
                                              {lead.userDetail ? lead.userDetail.charAt(0).toUpperCase() : "U"}
                                            </AvatarFallback>

                                          </Avatar>

                                          <div className="px-1 justify-left align-left">
                                            <p className="text-[8px] ">
                                              View User Profile
                                            </p>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>
                                    <div className="mt-2 mb-2 gap-2 flex">
                                      {lead?.phone && (
                                        <Badge type={"verified"} />
                                      )}
                                      {lead?.isUrgent && (
                                        <Badge type={"urgent"} />
                                      )}
                                    </div>

                                    <div className="bg-secondary  mt-1 py-3 px-2 rounded-xl">
                                      <h3 className="text-md font-semibold">
                                        {lead.serviceType}
                                      </h3>

                                      <div className="font-normal">
                                        {lead?.job?.questions?.length ? (
                                          <JobQuestions
                                            questions={lead.job.questions}
                                          />
                                        ) : (
                                          <JobDetail job={lead.job} />
                                        )}
                                      </div>
                                    </div>
                                    {selectedUrgentLeadIndex === index && ( // Show this section only if the current lead is selected
                                      <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden w-full">
                                        <LeadDetailsMob
                                          checkRevealstatus={checkRevealstatus}
                                          openModal={openSubscriptionModal}
                                          leadData={lead}
                                          componentKey={selectedLeadIndex}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          ))}

                          {filteredCurrentLeadsVar.map((lead, index) => {
                            return (
                              <div
                                key={index}
                                onClick={() => {
                                  selectNormalLead(lead, index);
                                  setIsSelected(!isSelected);
                                }}
                                className={`
                                    cursor-pointer 
                                    flex flex-col md:flex-row 
                                    justify-between 
                                    items-start md:items-center 
                                    p-4 
                                    ${lead.viewed ? " border border-success"
                                    : ""}
                                    rounded-2xl 
                                    bg-surface 
                                    shadow-sm 
                                    mb-4
                                  `}
                              >
                                <div className="flex-1 mb-4 md:mb-0 w-full">
                                  <div className="flex justify-between">
                                    <div className="flex">
                                      {lead.userImage &&
                                        lead.userImage !== "" && (
                                          <Image
                                            className="rounded-full object-cover w-16 h-16"
                                            width={60}
                                            height={60}
                                            src={lead.userImage}
                                            alt="profile"
                                          />
                                        )}
                                      <div
                                        style={{ margin: "auto 0" }}
                                        className="px-2"
                                      >
                                        <div className="max-w-64">
                                          <h3 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                                            {lead?.job?.headline || "Unknown !"}
                                          </h3>
                                        </div>

                                        <p className="text-xs">
                                          {lead.userDetail && (
                                            <span className="text-foreground">
                                              By &nbsp;
                                              {lead.userDetail || "Unknown !"}.
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-foreground text-xs">
                                          Postcode: &nbsp;{" "}
                                          {lead.postcode?.toUpperCase()}{" "}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex flex-row-reverse gap-2">
                                      <h3 className="text-xs text-muted-foreground py-1">
                                        {timeAgo(lead.createdAt)}
                                      </h3>
                                      <div>
                                        {lead?.viewed && (
                                          <Badge type={"viewed"} />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex justify-between pl-2">
                                    <p className="text-xs font-semibold my-auto">
                                      Status:&nbsp;
                                      <span
                                        style={{
                                          color:
                                            lead.status === "Opened"
                                              ? "hsl(var(--success))" // Green
                                              : lead.status === "Inprogress"
                                                ? "hsl(var(--accent))" // Yellow
                                                : lead.status === "Onhold"
                                                  ? "hsl(var(--neutral-500))" // Gray
                                                  : lead.status === "Stopped"
                                                    ? "hsl(var(--destructive))" // Red
                                                    : "hsl(var(--neutral-500))", // Gray (default for unknown)
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {lead.status || "Unknown"}
                                      </span>
                                    </p>

                                    <Link
                                      href={`userprofile/${lead.userId}`}
                                      className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground"
                                    >
                                      <div className="flex items-center space-x-1">
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage
                                            src={lead.userImage}
                                            alt="profile"
                                          />
                                          {/* <AvatarFallback>S</AvatarFallback> */}
                                          <AvatarFallback className="text-foreground">
                                            {lead.userDetail ? lead.userDetail.charAt(0).toUpperCase() : "U"}
                                          </AvatarFallback>

                                        </Avatar>

                                        <div className="px-1 justify-left align-left">
                                          <p className="text-[8px] ">
                                            View User Profile
                                          </p>
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                  <div className="mt-2 mb-2 gap-2 flex">
                                    {lead?.phone && <Badge type={"verified"} />}
                                  </div>

                                  <div className="bg-secondary mt-1 py-3 px-2 rounded-xl">
                                    <h3 className="text-md font-semibold">
                                      {lead.serviceType}
                                    </h3>
                                    <div className="font-normal">
                                      {lead?.job?.questions?.length ? (
                                        <JobQuestions
                                          questions={lead.job.questions}
                                        />
                                      ) : (
                                        <JobDetail job={lead.job} />
                                      )}
                                    </div>
                                  </div>
                                  {selectedLeadIndex === index && ( // Show this section only if the current lead is selected
                                    <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden">
                                      <LeadDetailsMob
                                        checkRevealstatus={checkRevealstatus}
                                        // updateLeadCount={updateLeadCount}
                                        openModal={openSubscriptionModal}
                                        leadData={lead}
                                        componentKey={selectedLeadIndex}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div
                          style={{ height: "41rem" }}
                          className="overflow-y-scroll block md:hidden"
                        >
                          {/* set on mobile dynamic*/}
                          {jobDetails && jobId && (
                            <div
                              className={`
                                 cursor-pointer 
                                 flex flex-col md:flex-row 
                                 justify-between 
                                 items-start md:items-center 
                                 p-4 
                                 border border-info
                                 rounded-2xl 
                                 bg-surface 
                                 shadow-sm 
                                 mb-4
                               `}
                            >
                              <div className="flex-1 mb-4 md:mb-0 w-full ">
                                <div className="flex justify-between ">
                                  <div className="flex">
                                    {
                                      jobDetails.userImage &&
                                        jobDetails.userImage !== "" ? (
                                        <Image
                                          className="rounded-full object-cover w-16 h-16"
                                          width={60}
                                          height={60}
                                          src={jobDetails.userImage}
                                          alt="profile"
                                        />
                                      ) : (
                                        <></>
                                      )
                                    }
                                    <div
                                      style={{ margin: "auto 0" }}
                                      className="px-2"
                                    >
                                      <div>
                                        <div className="max-w-48">
                                          <h3 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                                            {jobDetails?.job?.headline ||
                                              "Unknown !"}
                                          </h3>
                                        </div>
                                      </div>
                                      <p className="text-xs">
                                        {jobDetails.userDetail && (
                                          <span className="text-foreground">
                                            By &nbsp;
                                            {jobDetails.userDetail || "Unknown !"}
                                            .
                                          </span>
                                        )}
                                      </p>
                                      <p className="text-foreground text-xs">
                                        Postcode: &nbsp;{" "}
                                        {jobDetails.postcode?.toUpperCase()}{" "}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-row-reverse  gap-2 ">
                                    <h3 className="text-xs text-muted-foreground py-1">
                                      {timeAgo(jobDetails.createdAt)}
                                    </h3>
                                    <div>
                                      {jobDetails?.viewed && (
                                        <Badge type={"viewed"} />
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex justify-between pl-2">
                                  <p className="text-xs font-semibold my-auto">
                                    Status:&nbsp;
                                    <span
                                      style={{
                                        color:
                                          jobDetails.status === "Opened"
                                            ? "hsl(var(--success))" // Green
                                            : jobDetails.status === "Inprogress"
                                              ? "hsl(var(--accent))" // Yellow
                                              : jobDetails.status === "Onhold"
                                                ? "hsl(var(--neutral-500))" // Gray
                                                : jobDetails.status === "Stopped"
                                                  ? "hsl(var(--destructive))" // Red
                                                  : "hsl(var(--neutral-500))", // Gray (default for unknown)
                                        fontWeight: "bold",
                                      }}
                                    >
                                      {jobDetails.status || "Unknown"}
                                    </span>
                                  </p>

                                  <Link
                                    href={`userprofile/${jobDetails.userId}`}
                                    className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground"
                                  >
                                    <div className="flex items-center space-x-1">
                                      <Avatar className="w-4 h-4">
                                        <AvatarImage
                                          src={jobDetails.userImage}
                                          alt="profile"
                                        />
                                        {/* <AvatarFallback>S</AvatarFallback> */}
                                        <AvatarFallback className="text-foreground">
                                          {jobDetails.userName ? jobDetails.userName.charAt(0).toUpperCase() : "U"}
                                        </AvatarFallback>

                                      </Avatar>

                                      <div className="px-1 justify-left align-left">
                                        <p className="text-[8px] ">
                                          View User Profile
                                        </p>
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                                {jobDetails?.phone && (
                                  <div className="mt-2 w-full justify-between flex">
                                    <Badge type={"verified"} />

                                  </div>
                                )}

                                <div className="mb-2 mt-2">
                                  {jobDetails?.isUrgent && (
                                    <Badge type={"urgent"} />
                                  )}
                                </div>
                                <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden w-full">
                                  <LeadDetailsMob
                                    checkRevealstatus={checkRevealstatus}
                                    openModal={openSubscriptionModal}
                                    leadData={jobDetails}
                                    componentKey={selectedLeadIndex}
                                  />
                                </div>

                              </div>
                            </div>
                          )}
                          {urgentJob.map((lead, index) => (
                            <>
                              {lead.isViewed === false && (
                                <div
                                  key={index}
                                  className={`
                                    cursor-pointer 
                                    flex flex-col md:flex-row 
                                    justify-between 
                                    items-start md:items-center 
                                    p-4 
                                    ${lead.viewed ? " border border-success"
                                      : ""}
                                    rounded-2xl 
                                    bg-surface 
                                    shadow-sm 
                                    mb-4
                                    `}
                                >
                                  <div className="flex-1 mb-4 md:mb-0 w-full ">
                                    <div className="flex justify-between ">
                                      <div className="flex">
                                        {
                                          lead.userImage &&
                                            lead.userImage !== "" ? (
                                            // <Image className='rounded-full max-h-16' width={60} height={60} src={lead.userImage} alt='profile' />
                                            <Image
                                              className="rounded-full object-cover w-16 h-16"
                                              width={60}
                                              height={60}
                                              src={lead.userImage}
                                              alt="profile"
                                            />
                                          ) : (
                                            <></>
                                          )
                                        }
                                        <div
                                          style={{ margin: "auto 0" }}
                                          className="px-2"
                                        >
                                          <div>
                                            <div className="max-w-48">
                                              <h3 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                                                {lead?.job?.headline ||
                                                  "Unknown !"}
                                              </h3>
                                            </div>
                                          </div>
                                          <p className="text-xs">
                                            {lead.userDetail && (
                                              <span className="text-foreground">
                                                By &nbsp;
                                                {lead.userDetail || "Unknown !"}
                                                .
                                              </span>
                                            )}
                                          </p>
                                          <p className="text-foreground text-xs">
                                            Postcode: &nbsp;{" "}
                                            {lead.postcode?.toUpperCase()}{" "}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex flex-row-reverse  gap-2">
                                        <h3 className="text-xs text-muted-foreground py-1">
                                          {timeAgo(lead.createdAt)}
                                        </h3>
                                        <div>
                                          {lead?.viewed && (
                                            <Badge type={"viewed"} />
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex justify-between pl-2">
                                      <p className="text-xs font-semibold my-auto">
                                        Status:&nbsp;
                                        <span
                                          style={{
                                            color:
                                              lead.status === "Opened"
                                                ? "hsl(var(--success))" // Green
                                                : lead.status === "Inprogress"
                                                  ? "hsl(var(--accent))" // Yellow
                                                  : lead.status === "Onhold"
                                                    ? "hsl(var(--neutral-500))" // Gray
                                                    : lead.status === "Stopped"
                                                      ? "hsl(var(--destructive))" // Red
                                                      : "hsl(var(--neutral-500))", // Gray (default for unknown)
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {lead.status || "Unknown"}
                                        </span>
                                      </p>

                                      <Link
                                        href={`userprofile/${lead.userId}`}
                                        className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground"
                                      >
                                        <div className="flex items-center space-x-1">
                                          <Avatar className="w-4 h-4">
                                            <AvatarImage
                                              src={lead.userImage}
                                              alt="profile"
                                            />
                                            {/* <AvatarFallback>S</AvatarFallback> */}
                                            <AvatarFallback className="text-foreground">
                                              {lead.userDetail ? lead.userDetail.charAt(0).toUpperCase() : "U"}
                                            </AvatarFallback>

                                          </Avatar>

                                          <div className="px-1 justify-left align-left">
                                            <p className="text-[8px] ">
                                              View User Profile
                                            </p>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>
                                    {lead?.phone ? (
                                      <div className="mt-2 w-full justify-between flex">
                                        <Badge type={"verified"} />
                                        <button
                                          className="text-right font-bold text-bleck border-b border-accent"
                                          onClick={() => {
                                            selectUrgentLead(lead, index);
                                            setIsSelected(!isSelected);
                                          }}
                                          type="button"
                                        >
                                          {selectedLeadIndex === index
                                            ? "Hide Details"
                                            : "Show Details"}
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="mt-2 w-full justify-end flex">
                                        <button
                                          className="text-right font-bold  text-bleck border-b border-accent"
                                          onClick={() => {
                                            selectUrgentLead(lead, index);
                                            setIsSelected(!isSelected);
                                          }}
                                          type="button"
                                        >
                                          {selectedLeadIndex === index
                                            ? "Hide Details"
                                            : "Show Details"}
                                        </button>
                                      </div>
                                    )}
                                    <div className="mb-2 mt-2">
                                      {lead?.isUrgent && (
                                        <Badge type={"urgent"} />
                                      )}
                                    </div>
                                    {selectedUrgentLeadIndex === index && ( // Show this section only if the current lead is selected
                                      <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden w-full">
                                        <LeadDetailsMob
                                          checkRevealstatus={checkRevealstatus}
                                          // updateLeadCount={updateLeadCount}
                                          openModal={openSubscriptionModal}
                                          leadData={lead}
                                          componentKey={selectedLeadIndex}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          ))}

                          {filteredCurrentLeadsVar.map((lead, index) => {
                            return (
                              <div
                                key={index}
                                className={`
                                    cursor-pointer 
                                    flex flex-col md:flex-row 
                                    justify-between 
                                    items-start md:items-center 
                                    p-4 
                                    ${lead.viewed ? " border border-success"
                                    : ""}
                                    rounded-2xl 
                                    bg-surface 
                                    shadow-sm 
                                    mb-4
                                    `}
                              >
                                <div className="flex-1 mb-4 md:mb-0 w-full">
                                  <div className="flex justify-between">
                                    <div className="flex">
                                      {lead.userImage &&
                                        lead.userImage !== "" ? (
                                        <Image
                                          className="rounded-full object-cover w-16 h-16"
                                          width={60}
                                          height={60}
                                          src={lead.userImage}
                                          alt="profile"
                                        />
                                      ) : (
                                        <></>
                                      )}
                                      <div
                                        style={{ margin: "auto 0" }}
                                        className="px-2"
                                      >
                                        <div className="max-w-48">
                                          <h3 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                                            {lead?.job?.headline || "Unknown !"}
                                          </h3>
                                        </div>
                                        <p className="text-xs">
                                          {lead.userDetail && (
                                            <span className="text-foreground">
                                              By &nbsp;
                                              {lead.userDetail || "Unknown !"}.
                                            </span>
                                          )}
                                        </p>
                                        <p className="text-foreground text-xs">
                                          Postcode: &nbsp;{" "}
                                          {lead.postcode?.toUpperCase()}{" "}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-row-reverse gap-2">
                                      <h3 className="text-xs text-muted-foreground py-1">
                                        {timeAgo(lead.createdAt)}
                                      </h3>
                                      <div>
                                        {lead?.viewed && (
                                          <Badge type={"viewed"} />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-between pl-2">
                                    <p className="text-xs font-semibold my-auto">
                                      Status:&nbsp;
                                      <span
                                        style={{
                                          color:
                                            lead.status === "Opened"
                                              ? "hsl(var(--success))" // Green
                                              : lead.status === "Inprogress"
                                                ? "hsl(var(--accent))" // Yellow
                                                : lead.status === "Onhold"
                                                  ? "hsl(var(--neutral-500))" // Gray
                                                  : lead.status === "Stopped"
                                                    ? "hsl(var(--destructive))" // Red
                                                    : "hsl(var(--neutral-500))", // Gray (default for unknown)
                                          fontWeight: "bold",
                                        }}
                                      >
                                        {lead.status || "Unknown"}
                                      </span>
                                    </p>

                                    <Link
                                      href={`userprofile/${lead.userId}`}
                                      className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground"
                                    >
                                      <div className="flex items-center space-x-1">
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage
                                            src={lead.userImage}
                                            alt="profile"
                                          />
                                          {/* <AvatarFallback>S</AvatarFallback> */}
                                          <AvatarFallback className="text-foreground">
                                            {lead.userDetail ? lead.userDetail.charAt(0).toUpperCase() : "U"}
                                          </AvatarFallback>
                                        </Avatar>

                                        <div className="px-1 justify-left align-left">
                                          <p className="text-[8px] ">
                                            View User Profile
                                          </p>
                                        </div>
                                      </div>
                                    </Link>
                                  </div>
                                  {lead?.phone ? (
                                    <div className="mt-2 w-full justify-between flex">
                                      <Badge type={"verified"} />
                                      <button
                                        className="text-right font-bold text-bleck border-b border-accent"
                                        onClick={() => {
                                          selectNormalLead(lead, index);
                                          setIsSelected(!isSelected);
                                        }}
                                        type="button"
                                      >
                                        {selectedLeadIndex === index
                                          ? "Hide Details"
                                          : "Show Details"}
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="mt-2 w-full justify-end flex">
                                      <button
                                        className="text-right font-bold  text-bleck border-b border-accent"
                                        onClick={() => {
                                          selectNormalLead(lead, index);
                                          setIsSelected(!isSelected);
                                        }}
                                        type="button"
                                      >
                                        {selectedLeadIndex === index
                                          ? "Hide Details"
                                          : "Show Details"}
                                      </button>
                                    </div>
                                  )}
                                  <div className="mb-2">
                                    {lead?.isUrgent && (
                                      <Badge type={"urgent"} />
                                    )}
                                  </div>
                                  {selectedLeadIndex === index && ( // Show this section only if the current lead is selected
                                    <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden">
                                      <LeadDetailsMob
                                        checkRevealstatus={checkRevealstatus}
                                        openModal={openSubscriptionModal}
                                        leadData={lead}
                                        componentKey={selectedLeadIndex}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {/* Pagination controls */}
                        <div className="flex mt-6 justify-between">
                          <div
                            className="text-sm"
                            style={{ marginTop: "auto" }}
                          >
                            Page {currentPage}/{totelPage} Leads Total{" "}
                            {totelJob}
                          </div>
                          <div className="flex items-center">
                            {/* Backward arrow, disabled if on the first page */}
                            <button
                              className="mx-1 px-3 py-1 rounded bg-neutral-200"
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              â†
                            </button>

                            {/* Page buttons (limited to 3 at a time) */}
                            {Array.from(
                              { length: Math.min(3, totalPages) },
                              (_, i) => {
                                const page =
                                  currentPage <= 2
                                    ? i + 1
                                    : currentPage - 1 + i;
                                return page <= totalPages ? (
                                  <button
                                    key={page}
                                    className={`mx-1 px-3 py-1 rounded ${currentPage === page
                                      ? "bg-accent text-accent-foreground"
                                      : "bg-neutral-200"
                                      }`}
                                    onClick={() => paginate(page)}
                                  >
                                    {page}
                                  </button>
                                ) : null;
                              }
                            )}

                            {/* Forward arrow, disabled if on the last page */}
                            <button
                              className="mx-1 px-3 py-1 rounded bg-neutral-200"
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              â†’
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* dynamic */}
                      <div
                        className={`w-1/2 hidden md:block border rounded-xl ${jobId == leadData?.id ? "border-info" : leadData?.viewed ? "border-success" : ""}`}>
                        <LeadDetails
                          checkRevealstatus={checkRevealstatus}
                          componentKey={selectedLeadIndex}
                          // updateLeadCount={updateLeadCount}
                          openModal={openSubscriptionModal}
                          leadData={leadData}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
