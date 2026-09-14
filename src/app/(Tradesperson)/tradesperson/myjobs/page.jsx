"use client";
import React, { useState, useEffect } from "react";
import Progress from "../../../../components/(Tradesperson)/Progress";
import magnifactionIcon from "../../../assets/magnificationIcon.webp";
import "../radio-tabs.css";
import Link from "next/link";
import { getUserDetails, updatedAreaSegments } from "../../../../actions/auth";
import Image from "next/image";
import LeadDetails from "../../../../components/(Tradesperson)/MyJobsComp/leadDetails";
import LeadDetailsMob from "../../../../components/(Tradesperson)/MyJobsComp/leadDetailsMob";
import { timeAgo } from "../../../../utils/functions";
import Badge from "../../../../components/ui/badge";
import DialogWithCheckbox from "../../../../components/(Tradesperson)/DialogWithCheckbox";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";


import { Filter } from "lucide-react";
const Page = () => {
  const [showDialog, setShowDialog] = useState(false);

  const [areas, setAreas] = useState([]);
  useEffect(() => {
    const getAreas = async () => {
      const areas = await updatedAreaSegments();

      setAreas(areas);
    };
    getAreas();
  }, []);

  const [SelectedAreas, setSelectedAreas] = useState([]);

  const [leads, setLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totelPage, setTotelPage] = useState(1);
  const [totelJob, setTotelJob] = useState(1);
  const [noLeedStatus, setNoleedStatus] = useState(false);
  const [leadData, setLeadData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSearch = (selectedOptions) => {
    setSelectedAreas(selectedOptions)
    setCurrentPage(1)
  };

  const getFilteredLeads = async () => {
    setLoading(true);
    const user = await getUserDetails();
    const effectiveUserId = user?.id;
    if (!effectiveUserId) return;
    try {
      const response = await fetch("/api/myjobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          pageSize: 5,
          page: currentPage,
          areafilter: SelectedAreas,
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (data.jobs.length < 1) {
          setNoleedStatus(true);
        } else {
          setLeads(data.jobs);
          setTotelPage(data.pagination.totalPages);
          setTotelJob(data.pagination.totalJobs);
          selectNormalLead(data.jobs[0], 0);
          setNoleedStatus(false);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const getLeads = async () => {
    setLoading(true);
    const user = await getUserDetails();
    const effectiveUserId = user?.id;
    if (!effectiveUserId) return;
    try {
      const response = await fetch("/api/myjobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          pageSize: 5,
          page: currentPage,
          areafilter: [],
        }),
      });
      const data = await response.json();
      if (data.success) {

        if (data.jobs.length < 1) {
          setNoleedStatus(true);
        } else {
          setLeads(data.jobs);
          setTotelPage(data.pagination.totalPages);
          setTotelJob(data.pagination.totalJobs);
          selectNormalLead(data.jobs[0], 0);
          setNoleedStatus(false);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  // Pagination states
  useEffect(() => {
    if (SelectedAreas.length > 0) {
      getFilteredLeads();
    } else {
      getLeads();
    }
  }, [currentPage, SelectedAreas]);

  const totalPages = totelPage;
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const [selectedLeadIndex, setSelectedLeadIndex] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  const selectNormalLead = (lead, index) => {
    setLeadData(lead);
    setSelectedLeadIndex(selectedLeadIndex === index ? null : index);
  };

  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No job details available</p>;
    }

    const details = Object.entries(job)
      .filter(([key]) => key !== "postcode" && key !== "services")
      .slice(0, 4)
      .map(([key, value]) => String(value) || "Not Provided");
    return (
      <div className="text-xs text-muted-foreground truncate">{job.description}</div>
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

  return (
    <>
      <div className="bg-muted p-4 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-muted">
          <Progress />


          <div className='flex justify-between'>
            <h2 className="md:text-2xl text-md font-bold mb-4 mt-5">My Jobs</h2>
            <div className='flex'>

              <button
                onClick={() => setShowDialog(true)}
                className="px-2 py-2 mb-4 mt-4 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse hidden md:block"
              >
                <Filter />
              </button>
              <button
                onClick={() => setShowDialog(true)}
                className="px-2 py-2 mb-4 mt-4 rounded-full bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse block md:hidden"
              >
                <Filter size={18} />
              </button>

              <DialogWithCheckbox
                open={showDialog}
                onOpenChange={setShowDialog}
                areas={areas}
                onSearch={handleSearch}
              />

              {/* <h2 className="md:text-2xl text-lg font-bold mb-4 mt-4">Area Filter</h2> */}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {noLeedStatus ? (
            <>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
                </div>
              ) : (
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
                      Jobs not found
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      You can apply filter and search jobs on different areas.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : loading ? (
            <div className="flex items-center justify-center">
              <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex justify-between gap-4">
              <div className="md:w-1/2 w-full ">
                <div
                  style={{ height: "41rem" }}
                  className="overflow-y-scroll hidden md:block"
                >
                  {leads.map((lead, index) => {
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
                          rounded-2xl 
                          bg-surface 
                          shadow-sm 
                          mb-4
                        `}
                      >
                        <div className="flex-1 mb-4 md:mb-0 w-full">
                          <div className="flex justify-between">
                            <div className="flex">
                              {lead.job.user.profileUrl &&
                                lead.job.user.profileUrl !== "" && (
                                  <Image
                                    className="rounded-full object-cover w-16 h-16"
                                    width={60}
                                    height={60}
                                    src={lead.job.user.profileUrl}
                                    alt="profile"
                                  />
                                )}
                              <div
                                style={{ margin: "auto 0" }}
                                className="px-2"
                              >
                                <div className="max-w-64">
                                  <h3 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">
                                    {lead?.job?.job.headline || "Unknown !"}
                                  </h3>
                                </div>

                                <p className="text-xs">
                                  {lead.userDetail && (
                                    <span className="text-foreground">
                                      By &nbsp;
                                      {lead.job.user.firstName || "Unknown !"}
                                      .
                                    </span>
                                  )}
                                </p>
                                <p className="text-foreground text-xs">
                                  Postcode: &nbsp;{" "}
                                  {lead.job.postcode?.toUpperCase()}{" "}
                                </p>


                              </div>
                            </div>
                            <h3 className="text-xs text-muted-foreground">
                              {timeAgo(lead.createdAt)}
                            </h3>
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

                            <Link href={`userprofile/${lead.job.user.id}`} className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground">

                              <div className="flex items-center space-x-1">
                                {/* Avatar */}
                                <Avatar className="w-4 h-4">
                                  <AvatarImage src={lead.job.user.profileUrl} alt="profile" />
                                  {/* <AvatarFallback>S</AvatarFallback> */}
                                  <AvatarFallback className="text-foreground">
                                    {lead.job.user.firstName ? lead.job.user.firstName.charAt(0).toUpperCase() : "U"}
                                  </AvatarFallback>

                                </Avatar>



                                {/* Text Content */}
                                <div className="px-1 justify-left align-left">
                                  <p className="text-[8px] ">View User Profile</p>
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
                                  questions={lead.job.job.questions}
                                />
                              ) : (
                                <JobDetail job={lead.job.job} />
                              )}
                            </div>
                          </div>
                          {selectedLeadIndex === index && ( // Show this section only if the current lead is selected
                            <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden">
                              <LeadDetailsMob
                                leadData={leadData.job}
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
                  {leads.map((lead, index) => {
                    return (
                      <div
                        key={index}
                        className={`
                          cursor-pointer 
                          flex flex-col md:flex-row 
                          justify-between 
                          items-start md:items-center 
                          p-4 
                          rounded-2xl 
                          bg-surface 
                          shadow-sm 
                          mb-4
                        `}
                      >
                        <div className="flex-1 mb-4 md:mb-0 w-full">
                          <div className="flex justify-between">
                            <div className="flex">
                              {lead.job.user.profileUrl &&
                                lead.job.user.profileUrl !== "" ? (
                                <Image
                                  className="rounded-full object-cover w-16 h-16"
                                  width={60}
                                  height={60}
                                  src={lead.job.user.profileUrl}
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
                                    {lead?.job?.job.headline || "Unknown !"}
                                  </h3>
                                </div>
                                <p className="text-xs">
                                  {lead.userDetail && (
                                    <span className="text-foreground">
                                      By &nbsp;
                                      {lead.job.user.firstName || "Unknown !"}
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
                            <h3 className="text-xs text-muted-foreground">
                              {timeAgo(lead.createdAt)}
                            </h3>
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

                            <Link href={`userprofile/${lead.job.user.id}`} className="hover:bg-accent/90 py-1 px-2 rounded-full bg-primary  text-ink-inverse hover:text-accent-foreground">

                              <div className="flex items-center space-x-1">
                                {/* Avatar */}
                                <Avatar className="w-4 h-4">
                                  <AvatarImage src={lead.job.user.profileUrl} alt="profile" />
                                  {/* <AvatarFallback>S</AvatarFallback> */}
                                  <AvatarFallback className="text-foreground">
                                    {lead.job.user.firstName ? lead.job.user.firstName.charAt(0).toUpperCase() : "U"}
                                  </AvatarFallback>
                                </Avatar>



                                {/* Text Content */}
                                <div className="px-1 justify-left align-left">
                                  <p className="text-[8px] ">View User Profile</p>
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

                          {selectedLeadIndex === index && ( // Show this section only if the current lead is selected
                            <div className="bg-surface border-t border-neutral-300 mt-3 py-3 px-2 block md:hidden">
                              <LeadDetailsMob
                                leadData={leadData.job}
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
                  <div className="text-sm" style={{ marginTop: "auto" }}>
                    Page {currentPage}/{totelPage} Leads Total {totelJob}
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
                    {Array.from(
                      { length: Math.min(3, totalPages) },
                      (_, i) => {
                        const page =
                          currentPage <= 2 ? i + 1 : currentPage - 1 + i;
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
              <div className="w-1/2 hidden md:block">
                <LeadDetails
                  componentKey={selectedLeadIndex}
                  leadData={leadData.job}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
