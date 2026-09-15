"use client";
import React, { useEffect, useState } from "react";
import JobCard from "../../../../components/JobCard";
import { getUserDetails } from "../../../../actions/auth";
import { Button } from "../../../../components/ui/button";
import magnificationIcon from "../../../assets/magnificationIcon.webp";
import Link from "next/link";
import Image from "next/image";
import {
  fetchClosedStatusId,
  fetchOpenedStatusId,
  fetchInprogressStatusId,
  fetchOnholdStatusId,
  fetchStoppedStatusId,
} from "../../../../actions/auth";
import * as Sentry from '@sentry/nextjs';


import { useGlobalState } from '../../../context/GlobalStateContext';
const Page = () => {
  const [jobs, setJobs] = useState([]);
  const { userId, setUserId } = useGlobalState();;
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [user, setUser] = useState(false);
  const [jobCounts, setJobCounts] = useState({});
  const [statusLabels, setStatusLabels] = useState({});

  const totalJobs = Object.values(jobCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const initializeStatusLabels = async () => {
    const closedId = await fetchClosedStatusId();
    const openedId = await fetchOpenedStatusId();
    const inProgressId = await fetchInprogressStatusId();
    const onHoldId = await fetchOnholdStatusId();
    const stoppedId = await fetchStoppedStatusId();

    setStatusLabels({
      [closedId]: "Closed",
      [openedId]: "Opened",
      [inProgressId]: "In progress",
      [onHoldId]: "On hold",
      [stoppedId]: "Stopped",
    });
  };

  const fetchJobCounts = async () => {
    const jwt = await getUserDetails();
    try {
      const response = await fetch("/api/get-job-counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ userId: jwt.id }),
      });
      const result = await response.json();
      if (result.success) {
        setJobCounts(result.data);
      }
    } catch (error) {
      Sentry.captureException("Error fetching job counts:", error);
    }
  };

  const getUserUsingId = async () => {
    const jwt = await getUserDetails();
    try {
      const response = await fetch("/api/get-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ id: jwt.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user.phone ? false : true);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    setLoading(true);

    if (typeof window !== "undefined") {
      const storedUserId = userId;
      if (storedUserId) {
        setUserId(storedUserId);
      }
    }

    setTimeout(() => {
      setLoading(false);
    }, 4000);
  }, []);

  useEffect(() => {
    getUserUsingId();

    const getJobs = async () => {
      setLoading(true);

      await initializeStatusLabels();

      try {
        const user = await getUserDetails();
        const effectiveUserId = user?.id;
        const jwt = user?.token;
        if (!effectiveUserId) {
          setJobs([]);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/job?userId=${effectiveUserId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          cache: "no-cache",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const data = await response.json();

        setJobs(data.jobs.reverse() || []);
        await fetchJobCounts(jwt.id); // Fetch job counts after fetching jobs
      } catch (error) {
        Sentry.captureException("Error fetching jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
        setHasFetched(true); // Mark as fetched
      }
    };

    getJobs();
  }, [userId]);

  return (
    <div className="bg-muted mt-2 w-full">
      {/* <PopupSpinner isVisible={loading} /> */}
      <div className="max-w-7xl mx-auto px-4 bg-muted">
        <div className="flex justify-between w-full mb-6 mt-2">
          <div className="my-auto">
            <h1 className="md:text-2xl text-2xl font-bold my-auto">My Jobs</h1>
          </div>
          <Link className="my-auto" href={"/user/addjob"}>
            <Button className="bg-accent px-6 hover:bg-primary hover:text-ink-inverse text-accent-foreground">
              Post a new job
            </Button>
          </Link>
        </div>
        {user && (
          <>
            <p className="md:text-sm text-[14px]">
              Verify your profile with your contact number so tradesperson could
              directly call you and discuss about your posted job.&nbsp;
              <Link className="text-success" href={"/user/profile"}>
                Verify Now
              </Link>
              .
            </p>
            <p className="md:text-sm text-[14px]">
              At this point you are not able to edit the existing posted job.
              However, you can delete them and post another Job for
              <strong>FREE</strong>.
            </p>
          </>
        )}

        <div className="mt-5">
          {loading ? (
            <div className="w-8 h-8 border-4 border-t-accent border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
          ) : hasFetched && jobs.length > 0 ? (
            <>
              {/* Total Job Count and Status Counts UI */}

              <div className="flex justify-between md:flex-row flex-col-reverse">
                <div className="flex md:justify-between justify-center items-center my-4 gap-4 flex-wrap md:w-auto w-full text-center">
                  {Object.entries(statusLabels).map(([statusId, label]) => {
                    const count = jobCounts[statusId] || 0;
                    if (count === 0) return null; // Skip rendering if the count is 0
                    return (
                      <div
                        key={statusId}
                        className="flex items-center justify-center gap-2 px-3 py-1.5 w-[45%] md:w-fit rounded-full border"
                        style={{
                          backgroundColor:
                            label === "Opened"
                              ? "hsl(var(--success))"
                              : label === "In progress"
                                ? "hsl(var(--success))"
                                : label === "On hold"
                                  ? "hsl(var(--neutral-500))"
                                  : label === "Stopped"
                                    ? "hsl(var(--destructive))"
                                    : label === "Closed"
                                      ? "hsl(var(--ink-strong))" // Blue
                                      : "hsl(var(--neutral-500))",
                          color: "hsl(var(--ink-inverse))",
                        }}
                      >
                        <p className="text-md">{count}</p>
                        <p className="text-md">{label}</p>
                      </div>
                    );
                  })}
                </div>
                <h1 className="md:text-2xl text-2xl font-bold my-auto text-right">
                  {totalJobs} {totalJobs === 1 ? "Job" : "Jobs"}
                </h1>
              </div>

              {/* Job Cards */}
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  isCompleted={job.isCompleted}
                  job={job}
                  updateCounts={fetchJobCounts}
                />
              ))}
            </>
          ) : hasFetched ? (
            <div className="flex pb-4 justify-center items-center w-full">
              <div className="bg-surface p-8 rounded-lg md:w-[60%] shadow-md text-center">
                <div className="flex justify-center items-center mb-4">
                  <div className="bg-accent text-accent-foreground rounded-full p-2">
                    <Image src={magnificationIcon} alt="Magnification Icon" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  No jobs yet. Post a new job to get started.
                </h2>
                <p className="text-muted-foreground mb-4">
                  You haven’t posted any jobs.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Page;
