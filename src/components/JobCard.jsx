"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getUserDetails } from "../actions/auth";
import { Trash2, Pencil } from "lucide-react";
import EditDialog from './(User_flow)/EditDialog'
import { useRouter, usePathname } from "next/navigation";
import { Button } from "./ui/button";
import Spinner from "./Spinner";
import { toast } from "react-toastify";
import { jobStatus } from "../actions/auth";
import { fetchOpenedStatusId } from "../actions/auth";
import { fetchClosedStatusId } from "../actions/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import Select from "react-select";
import * as Sentry from '@sentry/nextjs';
import { useGlobalState } from '../app/context/GlobalStateContext';
const cacheName = "detail-cache";

const JobCard = ({ job, isCompleted, currentUserID, updateCounts }) => {
  const [STATUS_OPTIONS, setSTATUS_OPTIONS] = useState([]);
  const [serviceTitle, setService] = useState({});
  const [serviceData, setServiceData] = useState({});
  const [data, setData] = useState();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [closedState, setClosedState] = useState(0);
  const [status, setStatus] = useState(null); // State to handle selected status
  const [currentJobStatus, setCurrentJobStatus] = useState(null); // Holds the current job status
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false); // State to handle update loading
  const { detailCache, setdetailCache } = useGlobalState();
  const router = useRouter();
  const pathname = usePathname();


  const handleJobUpdate = (updatedJob) => {
    setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
    setIsDialogOpen(false)
  }
  const openEditDialog = (job) => {
    setSelectedJob(job)
    setIsDialogOpen(true)
  }
  const saveToCache = async (data) => {
    setdetailCache(data)
  };
  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No job details available</p>;
    }

    return (
      <div className="mt-0 w-full md:mt-1 space-y-1 mb-2">
        {Object.entries(job).map(([key, value], index) => (
          <>
            {key == "postcode" ||
              key == "services" ||
              key == "serviceName" ||
              key == "headline" ||
              key == "description" ? (
              ""
            ) : (
              <div className="flex gap-2" key={index}>
                <p className="text-sm font-medium text-ink-strong truncate">
                  {key}
                </p>
                <p className="text-sm font-medium  truncate text-muted-foreground ">
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
    <div className="mt-0   md:mt-1 space-y-1">
      {questions?.length ? (
        questions.map((q, index) => (
          <div className="flex gap-2" key={index}>
            <h2 className="text-sm font-medium text-ink-strong truncate">
              {q.question}
            </h2>
            <p className="text-sm font-medium truncatetext-accent">
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
    const getService = async () => {
      const user = await getUserDetails();
      const jobResponse = await fetch(
        `/api/get-service?serviceId=${job.job.services}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`,
          },
          cache: "no-cache",
        }
      );

      const jobResult = await jobResponse.json();
      setServiceData(jobResult.service);
      setService(jobResult.service);
      setData(jobResult);
    };
    if (job) {
      getService();
    }
  }, [job]);
  const utcDate = new Date(job?.createdAt);
  const localDateStr = utcDate.toLocaleDateString();

  const details = async () => {
    const updatedData = {
      ...data,
      job: job,
      jobData: job.job,
      jobId: job.id,
      isCompleted: isCompleted,
    };
    saveToCache(updatedData);
  };

  useEffect(() => {
    const fetchCurrentJobStatus = async () => {
      try {
        const jwt = await getUserDetails();
        const response = await fetch("/api/jobstatus", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt?.token}`,
          },
          body: JSON.stringify({ jobId: job?.id }), // Pass jobId to API
        });

        const result = await response.json();
        if (result.success) {
          setCurrentJobStatus(result.data.statusId); // Update current status
        } else {
          toast.error(result.message || "Error fetching job status.", {
            position: "top-center",
          });
        }
      } catch (error) {
        Sentry.captureException("Error fetching job status:", error);
        toast.error("Internal server error.", { position: "top-center" });
      }
    };

    if (job?.id) {
      fetchCurrentJobStatus();
    }
  }, [job?.id]);

  useEffect(() => {
    // Fetch status options and initialize the current status
    const fetchStatusOptions = async () => {
      const statusOptions = await jobStatus(); // Fetch all status options dynamically
      setSTATUS_OPTIONS(statusOptions);

      // Fetch the current status ID from the job object
      const currentStatusId = job?.statusId; // Ensure this comes from the database
      if (currentStatusId) {
        const matchedOption = statusOptions.find(
          (option) => Number(option.value) === Number(currentStatusId)
        );
        if (matchedOption) {
          setStatus(matchedOption); // Set the dropdown's current value
          setCurrentJobStatus(Number(currentStatusId)); // Update the current job status for comparison
        }
      }
    };

    fetchStatusOptions();
  }, [job]);

  const handleStatusChange = async (selectedOption) => {
    // Check if the selected status is different from the current job status
    if (Number(selectedOption.value) === currentJobStatus) {
      toast.info("The status is already up-to-date.", {
        position: "top-center",
      });
      return;
    }

    setStatus(selectedOption);
    setUpdateLoading(true);
    const statusValue = Number(selectedOption.value);
    const jwt = await getUserDetails();
    try {
      const response = await fetch("/api/jobstatus", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({
          jobId: job?.id,
          statusId: statusValue,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Job status updated successfully.", {
          position: "top-center",
        });
        setCurrentJobStatus(statusValue); // Update the current stored status
        updateCounts();
      } else {
        toast.error(result.message || "Error updating job status.", {
          position: "top-center",
        });

      }
    } catch (error) {
      Sentry.captureException("Error updating job status:", error);
      toast.error("Internal server error.", { position: "top-center" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteJob = async (job) => {
    setShowFinalPopup(false);
    setDeleteLoading(true);

    const jwt = await getUserDetails();
    try {
      const jobResponse = await fetch("/api/job", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ id: job?.id }),
      });
      const jobResult = await jobResponse.json();
      if (jobResult.success || jobResult.ok) {
        toast.success("Job deleted.", {
          position: "top-center",
        });
        window.location.reload();
      } else {
        toast.error("Error Deleting Job.", {
          position: "top-center",
        });
      }
    } catch (error) {
      toast.error("Error Deleting Job.", {
        position: "top-center",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  //Reopen job functionality
  const handleReopenJob = async () => {
    setUpdateLoading(true);

    const jwt = await getUserDetails();
    const OPENED_STATUS_ID = await fetchOpenedStatusId(); // Assume status ID for "Opened" is available in `STATUS_IDS`

    try {
      const response = await fetch("/api/jobstatus", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({
          jobId: job?.id,
          statusId: OPENED_STATUS_ID,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Job successfully reopened.", {
          position: "top-center",
        });
        setCurrentJobStatus(OPENED_STATUS_ID); // Update current status
        updateCounts();
        const openedOption = STATUS_OPTIONS.find(
          (option) => Number(option.value) === OPENED_STATUS_ID
        );
        if (openedOption) {
          setStatus(openedOption); // Update the dropdown to show "Opened"
        }
      } else {
        toast.error(result.message || "Error reopening job.", {
          position: "top-center",
        });
      }
    } catch (error) {
      Sentry.captureException("Error reopening job:", error);
      toast.error("Internal server error.", { position: "top-center" });
    } finally {
      setUpdateLoading(false);
    }
  };

  const switchTradeList = async () => {
    details();
    router.push(`/user/myjobs/${job.id}`);
  };
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const showFinalPopupModal = (job) => {
    if (showFinalPopup) {
      setShowFinalPopup(false);
    } else {
      setShowFinalPopup(true);
    }
  };

  const renderStatusControls = () => {
    if (currentJobStatus === closedState) {
      // Status is Closed
      return (
        <button
          onClick={handleReopenJob}
          className="bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse px-10 py-2 w-full rounded-md"
          disabled={updateLoading}
        >
          {updateLoading ? <Spinner /> : "Reopen Job"}
        </button>
      );
    }

    // Show dropdown for statuses other than Closed
    return (
      <Select
        options={STATUS_OPTIONS}
        value={status}
        onChange={handleStatusChange}
        placeholder="Update Status"
        className="w-full md:w-[10.5rem]"
        isDisabled={updateLoading}
        styles={{
          control: (provided) => ({
            ...provided,
            // width: "", // w-64 equivalent
            backgroundColor: "hsl(var(--success))",
            color: "hsl(var(--ink-strong))",
            border: "none",
            boxShadow: "none",
          }),
          dropdownIndicator: (provided) => ({
            ...provided,
            color: "hsl(var(--ink-strong))", // Change color of the dropdown indicator (e.g., down arrow)
          }),
          indicatorSeparator: () => ({
            display: "none", // Remove the separator line
          }),
          menu: (provided) => ({
            ...provided,
            backgroundColor: "hsl(var(--ink-strong))",
            color: "hsl(var(--ink-inverse))",
          }),
          option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isFocused ? "hsl(var(--success))" : "hsl(var(--ink-strong))",
            color: state.isFocused ? "hsl(var(--ink-strong))" : "hsl(var(--ink-inverse))",
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "hsl(var(--ink-strong))",
          }),
        }}
      />
    );
  };

  useEffect(() => {
    const getclosedStatus = async () => {
      const closed = await fetchClosedStatusId();
      setClosedState(closed)
    }
    getclosedStatus();
  }, [])

  return (
    <>
      <Dialog
        open={showFinalPopup}
        onOpenChange={showFinalPopupModal}
        className="relative z-60"
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col text-center">
              <DialogTitle className="text-3xl">Delete Job!</DialogTitle>
              <DialogDescription className="text-sm">
                Are you sure you want to delete this job?
              </DialogDescription>
              <div className="mt-4 space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    handleDeleteJob(job);
                  }}
                  className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                >
                  Delete anyway
                </button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="w-full mx-auto p-6 my-5 bg-surface hover:border border-accent  rounded-lg shadow-md">
        <>
          <div className="md:flex justify-between">
            <div className="flex justify-between">
              <div className="max-w-64 md:max-w-96 flex md:justify-start justify-between items-center">
                <h2 className=" text-2xl font-semibold text-neutral-800 break-words whitespace-normal max-w-full">
                  {job?.job?.headline || "Unknown !"}
                </h2>
              </div>
              <div className="flex items-start ml-4 mb-auto gap-1 md:my-auto ">
                {deleteLoading ? (
                  <Spinner />
                ) : (
                  <span className="cursor-pointer  text-accent-foreground hover:text-accent bg-accent hover:bg-primary h-8 w-8 rounded-full flex justify-center items-center"
                    onClick={() => {
                      showFinalPopupModal(job);
                    }}
                  >
                    <Trash2 size={15} />
                  </span>
                )}
                <span className="cursor-pointer  text-accent-foreground hover:text-accent bg-accent hover:bg-primary h-8 w-8 rounded-full flex justify-center items-center"
                  onClick={() => {
                    openEditDialog(job)

                  }}
                >
                  <Pencil size={15} />
                </span>
                {/* )} */}

              </div>
            </div>
            {isCompleted ? (
              <h6 className="text-success text-xs">
                <i>Completed</i>
              </h6>
            ) : (
              <div className="hidden md:block ">
                {pathname === "/user/hireTradesperson" ? (
                  ""
                ) : pathname === "/user/quotes" ||
                  pathname === "/user/myjobs" ? (
                  <Button
                    onClick={() => switchTradeList()}
                    className="bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse"
                  >
                    View Tradespersons
                  </Button>
                ) : (
                  ""
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between">
            <div className="md:flex justify-between text-sm w-96 mb-2">
              <p className="flex">
                <b> Postal Code: &nbsp;</b>{" "}
                <span className="text-muted-foreground">
                  {" "}
                  {job?.job?.postcode?.toUpperCase()}
                </span>
              </p>
              <p className="flex">
                <b>Date: &nbsp;</b>{" "}
                <span className="text-muted-foreground">{localDateStr}</span>{" "}
              </p>
            </div>

            {/* Dropdown for status update */}
            {!isCompleted && (
              <div className="flex items-center mt-4 hidden md:block max-w-full">
                {renderStatusControls()}
              </div>
            )}
          </div>

          {isCompleted ? (
            ""
          ) : (
            <div className="mt-1 hidden md:block ">
              {pathname == "/user/myjobs"
                ? ""
                : ""}
            </div>
          )}

          <div className="block md:hidden w-full mt-1">
            {pathname === "/user/hireTradesperson" ? (
              ""
            ) : pathname === "/user/quotes" || pathname === "/user/myjobs" ? (
              <>
              </>
            ) : (
              ""
            )}
          </div>
          {isCompleted ? (
            ""
          ) : (
            <div className="mt-1 block md:hidden w-full">
              {pathname == "/user/myjobs"
                ? ""
                : ""}
            </div>
          )}

          {
            job?.interestedTradepersons.length > 0 ? (
              <>
              </>
            ) : (
              <>
                <div className="flex gap-2">
                  <h2 className="text-sm font-medium text-ink-strong truncate">
                    What trade do you require?
                  </h2>
                  <p className="text-sm font-medium  truncate text-muted-foreground ]">
                    {serviceTitle?.type}
                  </p>
                </div>
                {job?.job?.questions?.length ? (
                  <JobQuestions questions={job.job.questions} />
                ) : (
                  <JobDetail job={job?.job} />
                )}

                <h4 className="flex text-sm">
                  <b>Description: </b>
                  <p className="text-muted-foreground  truncate">
                    &nbsp;{job?.job?.description}
                  </p>
                </h4>

                <Button
                  onClick={() => switchTradeList()}
                  className="bg-accent w-full mt-4 md:hidden block text-accent-foreground hover:text-ink-inverse hover:bg-primary"
                >
                  View Tradespersons
                </Button>
                {/* Dropdown for status update */}
              </>
            )
          }
        </>
        {/* </Link> */}
        {!isCompleted && (
          <div className="flex items-center max-w-full mt-4 md:hidden block">
            {renderStatusControls()}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <h2 className="text-2xl font-bold text-neutral-800">Edit Job</h2>
              <p className="text-sm text-muted-foreground mt-2">Update the details of your job listing below.</p>

            </DialogHeader>
            {selectedJob &&
              <EditDialog job={selectedJob} onUpdate={handleJobUpdate} />
            }
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default JobCard;
