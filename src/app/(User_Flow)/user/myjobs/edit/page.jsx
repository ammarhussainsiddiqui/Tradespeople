'use client';
import React, { useEffect, useState } from 'react';
import ServiceDetails from '../../../../../components/(User_flow)/ServiceDetails'
import { useGlobalState } from '../../../../context/GlobalStateContext';
const Page = () => {

    const [cached, setCached] = useState(null);
    const { detailCache, setdetailCache } = useGlobalState();

    useEffect(() => {
        const fetchProfile = async () => {
            const cached = detailCache
            if (cached) {
                setCached(cached);
            }
        };

        fetchProfile();
    }, []);


    return (
        <div className='bg-muted md:p-4 w-screen'>
            {/* <PopupSpinner isVisible={loading} /> */}
            <div className="max-w-7xl mx-auto md:px-4 bg-muted">
                {/* <h1 className='text-2xl font-bold mb-10'>Job Details</h1> */}
                <div className='mt-5'>
                    <ServiceDetails data={cached} />
                </div>
            </div>
        </div>
    );
};

export default Page;
