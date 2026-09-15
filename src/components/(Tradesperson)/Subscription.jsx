'use client';
import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { getUserDetails } from '../../actions/auth';
import { toast } from "react-toastify";
import { deleteSubscription } from '../../utils/functions';

const TradepersonsSubscription = ({ subscriptionEndTime, remainingLeads, SubscriptionType, isCustomer }) => {
    const [planType, setPlanType] = useState('monthly');
    const [PremiumLoading, setPremiumLoading] = useState(false);
    const [PremiumPlusLoading, setPremiumPlusLoading] = useState(false);
    const [GoldLoading, setGoldLoading] = useState(false);
    const [GoldPlusLoading, setGoldPlusLoading] = useState(false);
    const [OneTimeLoading, setOneTimeLoading] = useState(false);
    const [isLoading, SetISLoading] = useState(false);


    const currentTime = Math.floor(Date.now() / 1000);

    const getStanderdSubs = async () => {
        setStanderdLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE, token: cacheUser.token }),
            });

            if (!response.ok) {
                toast.warning('Sesson Expired Login again', {
                    position: "top-center",
                });
                throw new Error('Sesson Expired');
            }

            const applySubs = await response.json();
            window.location = applySubs.result.url;
        } catch (error) {
        } finally {
            setStanderdLoading(false)
        }
    }
    const getPremiumSubs = async () => {
        setPremiumLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE, token: cacheUser.token }),
            });

            if (!response.ok) {
                toast.warning('Sesson Expired Login again', {
                    position: "top-center",
                });
                throw new Error('Sesson Expired');
            }

            const applySubs = await response.json();
            window.location = applySubs.result.url;
        } catch (error) {
        } finally {
            setPremiumLoading(false)
        }
    }
    const getPremiumPlusSubs = async () => {
        setPremiumPlusLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLUS_PRICE, token: cacheUser.token }),
            });

            if (!response.ok) {
                toast.warning('Sesson Expired Login again', {
                    position: "top-center",
                });
                throw new Error('Sesson Expired');
            }

            const applySubs = await response.json();
            window.location = applySubs.result.url;
        } catch (error) {
        } finally {
            setPremiumPlusLoading(false)
        }
    }
    const getGoldSubs = async () => {
        setGoldLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE, token: cacheUser.token }),
            });

            if (!response.ok) {
                toast.warning('Sesson Expired Login again', {
                    position: "top-center",
                });
                throw new Error('Sesson Expired');
            }

            const applySubs = await response.json();
            window.location = applySubs.result.url;
        } catch (error) {
        } finally {
            setGoldLoading(false)
        }
    }
    const getGoldPlusSubs = async () => {
        setGoldPlusLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_GOLD_PLUS_PRICE, token: cacheUser.token }),
            });

            if (!response.ok) {
                toast.warning('Sesson Expired Login again', {
                    position: "top-center",
                });
                throw new Error('Sesson Expired');
            }

            const applySubs = await response.json();
            window.location = applySubs.result.url;
        } catch (error) {
        } finally {
            setGoldPlusLoading(false)
        }
    }
    const getOneTimeSubs = async () => {
        setOneTimeLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_ONETIME_PRICE, token: cacheUser.token }),
            });

            if (!response.ok) {
                toast.warning('Sesson Expired Login again', {
                    position: "top-center",
                });
                throw new Error('Sesson Expired');
            }

            const applySubs = await response.json();
            window.location = applySubs.result.url;
        } catch (error) {
        } finally {
            setOneTimeLoading(false)
        }
    }
    //SILVER SUBS
    const updateGoldSubs = async () => {
        setGoldLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/getSubs-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ userId: `${cacheUser.id}` }),
            });

            const getSubs = await response.json();

            if (getSubs?.success) {
                let customerid = getSubs.subscription.customerid
                let subsID = getSubs.subscription.subsid
                const response = await fetch('/api/create-customer-portal-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cacheUser?.token}`,
                    },
                    body: JSON.stringify({ customerId: `${customerid}` }),
                });
                let res = await response.json();
                if (res.url) {
                    const updateUrl = `${res.url}/subscriptions/${subsID}/preview/${process.env.NEXT_PUBLIC_STRIPE_GOLD_PRICE}?quantity=1`;
                    window.location = updateUrl;
                }
            }

        } catch (error) {
        } finally {
        }
    }
    //SILVER PLUS SUBS
    const updateGoldPlusSubs = async () => {
        setGoldPlusLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/getSubs-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ userId: `${cacheUser.id}` }),
            });

            const getSubs = await response.json();

            if (getSubs?.success) {
                let customerid = getSubs.subscription.customerid
                let subsID = getSubs.subscription.subsid
                const response = await fetch('/api/create-customer-portal-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cacheUser?.token}`,
                    },
                    body: JSON.stringify({ customerId: `${customerid}` }),
                });
                let res = await response.json();
                if (res.url) {
                    const updateUrl = `${res.url}/subscriptions/${subsID}/preview/${process.env.NEXT_PUBLIC_STRIPE_GOLD_PLUS_PRICE}?quantity=1`;
                    window.location = updateUrl;
                }
            }

        } catch (error) {
        } finally {
        }
    }

    //GOLD SUBS
    const updatePremiumSubs = async () => {
        setPremiumLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/getSubs-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ userId: `${cacheUser.id}` }),
            });

            const getSubs = await response.json();

            if (getSubs?.success) {
                let customerid = getSubs.subscription.customerid
                let subsID = getSubs.subscription.subsid
                const response = await fetch('/api/create-customer-portal-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cacheUser?.token}`,
                    },
                    body: JSON.stringify({ customerId: `${customerid}` }),
                });
                let res = await response.json();
                if (res.url) {
                    const updateUrl = `${res.url}/subscriptions/${subsID}/preview/${process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE}?quantity=1`;
                    window.location = updateUrl;
                }
            }

        } catch (error) {
        } finally {
        }
    }

    //GOLD PLUS SUBS
    const updatePremiumPlusSubs = async () => {
        setPremiumPlusLoading(true)
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/getSubs-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ userId: `${cacheUser.id}` }),
            });

            const getSubs = await response.json();

            if (getSubs?.success) {
                let customerid = getSubs.subscription.customerid
                let subsID = getSubs.subscription.subsid
                const response = await fetch('/api/create-customer-portal-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cacheUser?.token}`,
                    },
                    body: JSON.stringify({ customerId: `${customerid}` }),
                });
                let res = await response.json();
                if (res.url) {
                    const updateUrl = `${res.url}/subscriptions/${subsID}/preview/${process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PLUS_PRICE}?quantity=1`;
                    window.location = updateUrl;
                }
            }

        } catch (error) {
        } finally {
        }
    }

    const cancelSubscription = async (subsType) => {
        if (subsType === 1) {
            setStanderdLoading(true);
        }
        else if (subsType === 2) {
            setGoldLoading(true);
        }
        else if (subsType === 3) {
            setPremiumLoading(true);
        }
        let cacheUser = await getUserDetails();
        try {
            const response = await fetch('/api/getSubs-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cacheUser?.token}`,
                },
                body: JSON.stringify({ userId: `${cacheUser.id}` }),
            });

            const getSubs = await response.json();

            if (getSubs?.success) {
                let subsID = getSubs.subscription.subsid
                const deleteSubscriptionResult = await deleteSubscription(subsID);
                if (deleteSubscriptionResult?.status === "canceled") {
                    if (subsType === 1) {
                        getStanderdSubs();
                    }
                    else if (subsType === 2) {
                        getGoldSubs();
                    }
                    else if (subsType === 3) {
                        getPremiumSubs();
                    }

                }
            }

        } catch (error) {
        } finally {
        }
    }
    return (
        <div className="w-full">
            {/* Switch Toggle */}
            <div className="flex justify-center mb-8">
                <div className="bg-surface rounded-xl p-1 shadow-md inline-flex">
                    <label className="relative cursor-pointer">
                        <input
                            type="radio"
                            name="planType"
                            value="monthly"
                            checked={planType === 'monthly'}
                            onChange={(e) => setPlanType(e.target.value)}
                            className="sr-only"
                        />
                        <span
                            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 inline-block ${planType === 'monthly'
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-transparent text-neutral-600 hover:text-foreground'
                                }`}
                        >
                            Monthly Subscriptions
                        </span>
                    </label>
                    <label className="relative cursor-pointer">
                        <input
                            type="radio"
                            name="planType"
                            value="onetime"
                            checked={planType === 'onetime'}
                            onChange={(e) => setPlanType(e.target.value)}
                            className="sr-only"
                        />
                        <span
                            className={`px-8 py-3 rounded-lg text-sm font-semibold transition-all duration-200 inline-block ${planType === 'onetime'
                                ? 'bg-accent text-accent-foreground'
                                : 'bg-transparent text-neutral-600 hover:text-foreground'
                                }`}
                        >
                            Lifetime Subscription
                        </span>
                    </label>
                </div>
            </div>

            {/* Conditional Rendering */}
            {planType === 'monthly' ? (
                <div className={SubscriptionType == "Deactivate" ? 'grid grid-cols-1 xl:grid-cols-4 sm:grid-cols-2 gap-2' : 'grid grid-cols-1 xl:grid-cols-4 sm:grid-cols-2 gap-2'}>



                    <div className="max-w-sm mx-auto bg-surface p-6 rounded-2xl mt-4 shadow-lg border border-neutral-200 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex space-x-2 mb-4">
                                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-sm font-semibold">Silver</span>
                            </div>
                            <div className='flex '>
                                <div className="text-3xl text-foreground font-bold mb-4">£ 9.99 </div>
                                <span className='text-sm mt-2 text-[hsl(var(--neutral-400))]'>/month</span>
                            </div>
                            <div className="space-y-5">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-base font-bold">One trade on your profile.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Exposure to thousands of homeowners.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Unlimited leads via jobs posted.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠New job alerts.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Choice of multiple communication channels.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Customer support 7 days a week.</p>
                                </div>
                            </div>
                        </div>
                        {SubscriptionType == 'Silver' ? '' :
                            <>
                                {GoldLoading ?
                                    <button type='button' disabled className="w-full py-2 px-4 bg-neutral-300 text-foreground  font-semibold rounded-lg  hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" > Loading... </button>
                                    :
                                    <>
                                        {SubscriptionType !== "Deactivate" && isCustomer !== null
                                            ?
                                            <button type='button' onClick={isCustomer === "" ? getGoldSubs : updateGoldSubs} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >{GoldLoading ? 'Loading...' : 'Get Plan'} </button>
                                            :
                                            <button type='button' onClick={() => getGoldSubs()} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" > {GoldLoading ? 'Loading...' : 'Get Plan'} </button>
                                        }
                                    </>
                                }
                            </>
                        }
                        {SubscriptionType == "Silver" && (
                            remainingLeads === 0 && currentTime < subscriptionEndTime ?
                                <>
                                    {GoldLoading ?
                                        <button disabled type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >loading...</button>
                                        :
                                        <button onClick={() => { cancelSubscription(2) }} type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Renew</button>
                                    }

                                </> :
                                <button type='button' disabled className="w-full py-2 px-4 bg-success text-success-foreground  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Active Plan</button>
                        )}
                    </div>


                    <div className="max-w-sm mx-auto bg-primary p-6 rounded-2xl mt-4 shadow-lg border border-neutral-200 flex flex-col jusitfy-between h-full">
                        <div>

                            <div className="flex space-x-2 mb-4">
                                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-sm font-semibold">Silver <b className='text-[20px]'>+</b></span>
                                <span className="bg-[hsl(var(--neutral-700))] text-success px-3 py-1 rounded-md text-sm font-semibold">TOP SELLER</span>
                            </div>
                            <div className='flex '>

                                <div className="text-3xl text-ink-inverse font-bold mb-4">£ 24.99 </div>

                                <span className='text-sm mt-2 text-[hsl(var(--neutral-400))]'>/month</span>
                            </div>
                            <div className="space-y-5">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-accent text-base font-bold ">⁠Be featured at the top of your directory page.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-[hsl(var(--neutral-400))] text-sm">⁠One trade on your profile.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-[hsl(var(--neutral-400))] text-sm">⁠Exposure to thousands of homeowners.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-[hsl(var(--neutral-400))] text-sm">⁠Unlimited leads via jobs posted.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-[hsl(var(--neutral-400))] text-sm">⁠New job alerts.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-[hsl(var(--neutral-400))] text-sm">⁠Choice of multiple communication channels.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-[hsl(var(--neutral-400))] text-sm">⁠Customer support 7 days a week.</p>
                                </div>
                            </div>
                        </div>
                        {SubscriptionType == 'Silver Plus' ? '' :
                            <>
                                {GoldPlusLoading ?
                                    <button type='button' disabled className="w-full py-2 px-4 bg-neutral-300 text-foreground  font-semibold rounded-lg  hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" > Loading... </button>
                                    :
                                    <>
                                        {SubscriptionType !== "Deactivate" && isCustomer !== null
                                            ?
                                            <button type='button' onClick={isCustomer === "" ? getGoldPlusSubs : updateGoldPlusSubs} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >{GoldPlusLoading ? 'Loading...' : 'Get Plan'} </button>
                                            :
                                            <button type='button' onClick={() => getGoldPlusSubs()} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-surface hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" > {GoldPlusLoading ? 'Loading...' : 'Get Plan'} </button>
                                        }
                                    </>
                                }

                            </>
                        }
                        {SubscriptionType == "Silver" && (
                            remainingLeads === 0 && currentTime < subscriptionEndTime ?
                                <>
                                    {GoldLoading ?
                                        <button disabled type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >loading...</button>
                                        :
                                        <button onClick={() => { cancelSubscription(2) }} type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Renew</button>
                                    }
                                </>
                                :
                                <button type='button' disabled className="w-full py-2 px-4 bg-success text-success-foreground  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Active Plan</button>

                        )}
                    </div>


                    <div className="max-w-sm mx-auto bg-surface p-6 rounded-2xl mt-4 shadow-lg border border-neutral-200 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex space-x-2 mb-4">
                                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-sm font-semibold">Gold</span>
                            </div>
                            <div className='flex '>

                                <div className="text-3xl text-foreground font-bold mb-4">£ 19.99 </div>

                                <span className='text-sm mt-2 text-ink-muted'>/month</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-base font-bold">Up to five trades on your profile.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Exposure to thousands of homeowners.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Unlimited leads via jobs posted.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠New job alerts.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Choice of multiple communication channels.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Customer support 7 days a week.</p>
                                </div>
                            </div>
                        </div>
                        {SubscriptionType == 'Gold' ? '' :
                            <>
                                {PremiumLoading ?
                                    <button type='button' disabled className="w-full py-2 px-4 bg-neutral-300 text-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" > Loading... </button>
                                    :
                                    <>
                                        {SubscriptionType !== "Deactivate" && isCustomer !== null
                                            ?
                                            <button type='button' onClick={isCustomer === "" ? getPremiumSubs : updatePremiumSubs} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >{PremiumLoading ? 'Loading...' : 'Get Plan'} </button>
                                            :
                                            <button type='button' onClick={getPremiumSubs} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >{PremiumLoading ? 'Loading...' : 'Get Plan'} </button>
                                        }
                                    </>
                                }
                            </>}
                        {SubscriptionType == "Gold" && (
                            remainingLeads === 0 && currentTime < subscriptionEndTime ?
                                <>
                                    {PremiumLoading ?
                                        <button disabled type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >loading...</button>
                                        :
                                        <button onClick={() => { cancelSubscription(3) }} type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Renew</button>
                                    }
                                </>
                                :
                                <button type='button' disabled className="w-full py-2 px-4 bg-success text-success-foreground  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Active Plan</button>
                        )}
                    </div>

                    <div className="max-w-sm mx-auto bg-surface p-6 rounded-2xl mt-4 shadow-lg border border-neutral-200 flex flex-col justify-between h-full">
                        <div>
                            <div className="flex space-x-2 mb-4">
                                <span className="bg-accent text-accent-foreground px-3 py-1 rounded-md text-sm font-semibold">Gold <b className='text-[20px]'>+</b></span>
                            </div>
                            <div className='flex '>
                                <div className="text-3xl text-foreground font-bold mb-4">£ 34.99 </div>
                                <span className='text-sm mt-2 text-ink-muted'>/month</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-base font-bold">⁠Be featured at the top of your directory pages.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Up to five trades on your profile.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Exposure to thousands of homeowners.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Unlimited leads via jobs posted.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠New job alerts.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Choice of multiple communication channels.</p>
                                </div>
                                <div className="flex items-start">
                                    <CheckCircle className="w-5 h-5 text-accent mr-2 mt-1" />
                                    <p className="text-muted-foreground text-sm">⁠Customer support 7 days a week.</p>
                                </div>
                            </div>
                        </div>
                        {SubscriptionType == 'Gold Plus' ? '' :
                            <>
                                {PremiumPlusLoading ?
                                    <button type='button' disabled className="w-full py-2 px-4 bg-neutral-300 text-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" > Loading... </button>
                                    :
                                    <>
                                        {SubscriptionType !== "Deactivate" && isCustomer !== null
                                            ?
                                            <button type='button' onClick={isCustomer === "" ? getPremiumPlusSubs : updatePremiumPlusSubs} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >{PremiumPlusLoading ? 'Loading...' : 'Get Plan'} </button>
                                            :
                                            <button type='button' onClick={getPremiumPlusSubs} className="w-full py-2 px-4 bg-accent text-accent-foreground  font-semibold rounded-lg  hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >{PremiumPlusLoading ? 'Loading...' : 'Get Plan'} </button>
                                        }
                                    </>
                                }
                            </>}
                        {SubscriptionType == "Gold Plus" && (
                            remainingLeads === 0 && currentTime < subscriptionEndTime ?
                                <>
                                    {PremiumPlusLoading ?
                                        <button disabled type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >loading...</button>
                                        :
                                        <button onClick={() => { cancelSubscription(3) }} type='button' className="w-full py-2 px-4 bg-success text-success-foreground cursor-pointer  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Renew</button>
                                    }
                                </>
                                :
                                <button type='button' disabled className="w-full py-2 px-4 bg-success text-success-foreground  font-semibold rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75 mt-5" >Active Plan</button>
                        )}
                    </div>
                </div>
            ) : (
                <div className=" grid-cols-1 xl:grid-cols-4 sm:grid-cols-2 gap-2">
                    <div className="max-w-lg mx-auto bg-surface p-6 rounded-2xl mt-4 shadow-lg border border-neutral-200 flex flex-col justify-between h-full">

                        <div className="text-center mb-6">
                            <div className="flex space-x-2 mb-4">
                                <span className="bg-accent text-accent-foreground px-4 py-2 rounded-md text-sm font-semibold">Lifetime Subscription</span>
                            </div>
                            <div className='flex '>

                                <div className="text-3xl text-foreground font-bold ">£ 99.99 </div>
                            </div>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                                <p className="text-ink-soft text-base font-bold">One-time payment for a lifelong profile on the directory</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">No other fees or payments</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">Be found by thousands of homeowners</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">Appear on more Google and AI searches</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">Showcase your social media</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">L⁠ink reviews</p>
                            </div>
                            <div className="flex items-start">
                                <CheckCircle className="w-5 h-5 text-accent mr-3 mt-1 flex-shrink-0" />
                                <p className="text-neutral-600 text-sm">Unlimited leads from homeowners who post jobs on the site</p>
                            </div>
                        </div>
                        <button
                            type='button'
                            onClick={getOneTimeSubs}
                            className="w-full py-3 px-4 bg-accent text-accent-foreground font-bold rounded-lg hover:bg-primary hover:text-ink-inverse transition-colors text-lg"
                        >
                            Get Lifetime Access
                        </button>
                    </div>
                </div>
            )
            }

        </div>

    )
};
export default TradepersonsSubscription;
