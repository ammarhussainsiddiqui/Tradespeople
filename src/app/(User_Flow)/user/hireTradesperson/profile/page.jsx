'use client';
import React, { useEffect, useState } from 'react';
import TradespersonProfile from '../../../../../components/(User_flow)/TradepersonProfile';
import { useGlobalState } from '../../../../context/GlobalStateContext';
const Page = () => {
    const [profile, setProfile] = useState(null);
    const { profileCache, setprofileCache } = useGlobalState();

    useEffect(() => {
        const fetchProfile = async () => {
            const cachedProfile = profileCache
            if (cachedProfile) {
                setProfile(cachedProfile);
            }
        };

        fetchProfile();
    }, []);

    if (!profile) return <div className="w-8 h-8 border-4 border-t-accent border-r-accent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>;

    return (
        <div className='bg-muted md:p-4 w-screen'>
            <div className="max-w-7xl mx-auto md:px-4 bg-muted">
                {/* <span className='text-2xl font-bold mb-8'>Recommended Tradesperson</span>
                 */}
                <div className='mt-4'>
                    <TradespersonProfile profile={profile} />
                </div>
            </div>
        </div>
    );
}

export default Page;
