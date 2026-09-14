'use client';
import React, { useEffect, useState } from 'react';
import TradespersonProfile from '../../../../../components/(User_flow)/TradepersonProfile';
import { getUserDetails } from '../../../../../actions/auth';
import { useGlobalState } from '../../../../context/GlobalStateContext';
const Page = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('profile');
    const { jobId, setJobId, profileId, setprofileId } = useGlobalState();

    useEffect(() => {
        const fetchProfile = async () => {
            const Profile_id = profileId;
            const Job_id = jobId;
            const jwtuser = await getUserDetails();

            try {
                const response = await fetch('/api/get-user', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtuser?.token}`,
                    },
                    body: JSON.stringify({ id: Profile_id }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const data = await response.json();
                if (data.success) {
                    setProfile(data.user)
                    setLoading(false)
                }
            } catch (error) {
                window.history.back();
            }
        };

        fetchProfile();
    }, []);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const query = new URLSearchParams(window.location.search);
            const Tab = query.get('tab');
            if (Tab) {
                setActiveTab(Tab);
            }
        }
    }, []);

    if (!profile) return <div className="w-8 h-8 border-4 border-t-accent border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>;

    return (
        <div className='bg-muted md:p-4 w-screen'>
            <div className="max-w-7xl mx-auto md:px-4 bg-muted">
                <div className='mt-4'>
                    {loading ?
                        <>
                            <div className='flex items-center justify-center'>
                                <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
                            </div>
                        </> :
                        <TradespersonProfile profile={profile} activeTab={activeTab} />
                    }
                </div>
            </div>
        </div>
    );
}

export default Page;
