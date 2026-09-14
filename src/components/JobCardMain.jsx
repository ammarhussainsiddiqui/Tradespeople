'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { getUserDetails } from '../actions/auth';
import EditDialog from './(User_flow)/EditDialog'
import { Pencil, Trash2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from './ui/button';
import Spinner from './Spinner';

import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useGlobalState } from '../app/context/GlobalStateContext';

const cacheName = 'detail-cache';

const JobCardMain = ({ job, isCompleted }) => {

  const [serviceTitle, setService] = useState({});
  const [serviceData, setServiceData] = useState({});
  const [data, setData] = useState();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { detailCache, setdetailCache } = useGlobalState();
  const router = useRouter();
  const pathname = usePathname();
  const saveToCache = async (data) => {
    setdetailCache(data)
  };
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("/api/jobs")
        if (!response.ok) throw new Error("Failed to fetch jobs")
        const data = await response.json()
        setJobs(data)
      } catch (error) {
      }
    }

    fetchJobs()
  }, [])

  const handleJobUpdate = (updatedJob) => {
    setJobs(jobs.map((job) => (job.id === updatedJob.id ? updatedJob : job)))
    setIsDialogOpen(false)
  }
  const openEditDialog = (job) => {
    setSelectedJob(job)
    setIsDialogOpen(true)
  }
  function waitFiveSeconds() {
    return new Promise(resolve => setTimeout(resolve, 3000)); // 5000 ms = 5 seconds
  }
  const handleDeleteJob = async (job) => {
    setShowFinalPopup(false)
    setDeleteLoading(true);
    const jwt = await getUserDetails();
    try {
      const jobResponse = await fetch('/api/job', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt?.token}`,
        },
        cache: "no-cache",
        body: JSON.stringify({ id: job?.id }),
      });
      const jobResult = await jobResponse.json();
      if (jobResult.success || jobResult.ok) {
        toast.success('Job deleted.', {
          position: "top-center",
        });
        await waitFiveSeconds();
        window.location.replace('/user/myjobs');
      } else {
        toast.error('Error Deleting Job.', {
          position: "top-center",
        });
      }
    } catch (error) {
    } finally {
      setDeleteLoading(false);
    }

  };
  const JobDetail = ({ job }) => {
    if (!job) {
      return <p className="text-sm text-muted-foreground">No job details available</p>;
    }

    return (
      <div className="mt-0  md:mt-1 space-y-1 mb-2">
        {Object.entries(job).map(([key, value], index) => (
          <>
            {key == 'postcode' || key == 'services' || key == 'serviceName' || key == 'headline' || key == 'description' ? '' :
              <div className='flex gap-2' key={index}>
                <div class="text-muted-foreground text-sm font-medium break-words whitespace-normal max-w-full">
                  <b className='text-sm font-medium text-ink-strong'>{key}&nbsp;&nbsp;</b>{String(value) || 'Not Provided'}
                </div>
              </div>}
          </>
        ))}
      </div>
    );
  };
  const JobQuestions = ({ questions }) => (
    <div className="mt-0   md:mt-1 space-y-1">
      {questions?.length ? (
        questions.map((q, index) => (
          <div className='flex gap-2' key={index}>
            <div class="text-muted-foreground text-sm font-medium break-words whitespace-normal max-w-full">
              <b className='text-sm font-medium text-ink-strong'>{q.question}&nbsp;&nbsp;</b>{q.selectedAnswer || 'No Answer Provided'}
            </div>
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
      const jobResponse = await fetch(`/api/get-service?serviceId=${job.job.services}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        cache: "no-cache",
      });

      const jobResult = await jobResponse.json();
      setServiceData(jobResult.service)
      setService(jobResult.service)
      setData(jobResult)
    }
    if (job) {
      getService();
    }
  }, [job])
  const utcDate = new Date(job?.createdAt);
  const localDateStr = utcDate.toLocaleDateString();



  const details = async () => {
    const updatedData = {
      ...data,
      job: job,
      jobData: job.job,
      jobId: job.id,
      isCompleted: isCompleted
    };
    saveToCache(updatedData)
  }

  const switchToEdit = async () => {
    details()
    router.push(`/user/myjobs/edit`);
  }

  const switchTradeList = async () => {
    details()
    router.push(`/user/myjobs/${job.id}`);
  }
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const showFinalPopupModal = (job) => {
    if (showFinalPopup) {
      setShowFinalPopup(false)
    }
    else {
      setShowFinalPopup(true)
    }
  };

  return (
    <>
      <Dialog open={showFinalPopup} onOpenChange={showFinalPopupModal} className="relative z-60">
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col text-center">
              <DialogTitle className="text-3xl">
                Delete Job!
              </DialogTitle>
              <DialogDescription className="text-sm">
                Are you sure you want to delete this job?
              </DialogDescription>
              <div className="mt-4 space-y-4">

                <button
                  type="button"
                  onClick={() => { handleDeleteJob(job) }}
                  className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                >
                  Delete anyway
                </button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="w-full mx-auto p-5 my-5 bg-surface hover:border border-accent  rounded-lg shadow-md">


        <>

          <div className='md:flex justify-between'>

          </div>
          <div className='flex justify-between'>
            <div className='max-w-64 md:max-w-96 flex md:justify-start justify-between items-center'>
              <h2 className=" text-2xl font-semibold text-neutral-800 break-words whitespace-normal max-w-full">{job?.job?.headline || 'Unknown !'}</h2>
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
          <div className='flex justify-between mb-2'>
            <div className='md:flex justify-between text-sm w-96 mb-2'>
              <p className="flex"><b> Postal Code: &nbsp;</b> <span className='text-muted-foreground'> {job?.job?.postcode?.toUpperCase()}</span></p>
              <p className="flex"><b>Date: &nbsp;</b> <span className='text-muted-foreground'>{localDateStr}</span> </p>
            </div>
            {isCompleted ? (
              ''
            ) : (
              <div className='mt-1 hidden md:block '>
                {pathname == '/user/myjobs' ? (
                  ''
                ) : (
                  ''
                )}

              </div>
            )}



          </div>
          <div className='block md:hidden w-full mt-1'>
            {pathname === '/user/hireTradesperson' ? (

              ''
            ) : pathname === '/user/quotes' || pathname === '/user/myjobs' ? (

              <Button onClick={() => switchTradeList()} className="bg-accent text-accent-foreground w-full hover:bg-accent/90">

                View Tradespersons
              </Button>
            ) : (
              ''
            )}

          </div>
          {isCompleted ? (
            ''
          ) : (
            <div className='mt-1 block md:hidden w-full'>
              {pathname == '/user/myjobs' ? (

                ''
              ) : (
                ''
              )}

            </div>
          )}

          {job?.interestedTradepersons?.length > 0 ?

            <>

            </>
            :
            <>
              <div className='flex gap-2' >
                <div class="text-muted-foreground text-sm font-medium break-words whitespace-normal max-w-full">
                  <b className='text-sm font-medium text-ink-strong'>What trade do you require?&nbsp;&nbsp;</b>{serviceTitle?.type}
                </div>
              </div>
              {job?.job?.questions?.length ? (
                <JobQuestions questions={job.job.questions} />
              ) : (
                <JobDetail job={job?.job} />
              )}
              <h4 className='flex text-sm'>
                <div class="text-muted-foreground break-words whitespace-normal max-w-full">
                  <b className='text-foreground'>Description:&nbsp;</b>{job?.job?.description}
                </div>
              </h4>

            </>

          }
        </>

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

export default JobCardMain;
