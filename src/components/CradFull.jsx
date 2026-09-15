'use client';
import React, { useEffect, useState } from 'react';
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useRouter } from 'next/navigation';
import userImage from '../app/assets/userImage.webp'
import Image from 'next/image';
import { getUserDetails } from '../actions/auth'
import ContactMe from '../components/(Tradesperson)/ContactMe'
import { useGlobalState } from '../app/context/GlobalStateContext';

// One card per tradesperson. Its own component so each card's state hooks
// run at the top level instead of inside profiles.map().
const ProfileCard = ({ profile, job, saveToCache, setprofileCache }) => {
    const [status, SetStatus] = useState(profile?.quote?.requested)
    const [isViewed, setIsViewed] = useState(profile?.quote?.isViewed)
    const [isLoading, SetisLoading] = useState(false)
    const reqeust = async (data) => {
        SetisLoading(true)
        const jwtuser = await getUserDetails();
        try {
            const Response = await fetch('/api/quote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtuser?.token}`,
                },
                cache: "no-cache",
                body: JSON.stringify({ userId: data?.userId, tradepersonId: data?.tradepersonId, jobId: data?.jobId }),
            });

            const Result = await Response.json();
            await profile.quote.requested == status;
            setprofileCache(profile)
            SetStatus(Result?.quote?.requested)
            SetisLoading(false)
        } catch (error) {
            SetisLoading(false)
        }
    }

    return (
        <Card className="bg-surface flex flex-col md:flex-row p-4 gap-2">
            <div className="">
                <Image
                    src={profile?.profileUrl || userImage}
                    alt={profile?.name || '!'}
                    height={100}
                    width={100}
                    className="rounded-2xl md:w-36 md:h-24 w-full h-32 object-cover"
                />
            </div>
            <div className="flex flex-col w-full ">

                <div className="flex flex-row justify-between items-start md:items-center">

                    <div className="flex flex-col flex-row justify-between w-full">
                        <div className='flex w-full justify-between'>
                            <div className='max-w-48'>
                                <h2 className="text-xl font-semibold  text-foreground break-words whitespace-normal  md:max-w-64">{profile?.firstName} {profile?.lastName}</h2>
                            </div>
                            <div className='px-2 md:hidden my-auto'>
                                <p className=''>Area: &nbsp;{profile?.postcode.toUpperCase()}</p>
                            </div>
                        </div>
                        <div>
                        </div>
                        <p className="text-sm text-muted-foreground  hidden md:block line-clamp-2 h-11  pr-2 leading-5 w-full max-w-2xl ">
                            {profile?.introduction}...
                        </p>
                        {profile.phone ?
                            <>
                                <p className='text-xs mt-2 md:text-sm'>By clicking on Contact Me button, {profile?.firstName}&nbsp;will be notified and call you asap to discuss your job details.</p>
                            </> : ""}
                    </div>

                    <div className="hidden md:block md:flex flex-col gap-2 mt-2 md:mt-0 w-[20%]">
                        <ContactMe tradeid={profile?.id} jobId={job?.id} />
                        <Button onClick={() => saveToCache(profile, status, job?.id)} variant="outline">View Profile</Button>
                    </div>
                </div>

                <div className="block md:hidden flex flex-row gap-2 mt-2 md:mt-0">
                    <ContactMe tradeid={profile?.id} jobId={job?.id} />
                    <Button className='w-1/2' onClick={() => saveToCache(profile)} variant="outline">View Profile</Button>
                </div>
            </div>
        </Card>
    )
}

const CardFull = ({ profiles, job }) => {
    const router = useRouter();
    const { profileCache, setprofileCache, profileId, setprofileId, jobId, setJobId } = useGlobalState();
    const saveToCache = async (profile) => {
        setprofileId(profile.id)
        setJobId(job.id)
        router.push(`/user/myjobs/profile`);
    };

    return (
        <div className="grid gap-4">
            {profiles.map(profile => (
                <ProfileCard
                    key={profile?.id}
                    profile={profile}
                    job={job}
                    saveToCache={saveToCache}
                    setprofileCache={setprofileCache}
                />
            ))}
        </div>
    );
};

export default CardFull;
