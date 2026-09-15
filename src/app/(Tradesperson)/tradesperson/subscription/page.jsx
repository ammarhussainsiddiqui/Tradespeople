'use client'
import React, { useEffect, useState } from 'react'
import TradepersonsSubscription from '../../../../components/(Tradesperson)/Subscription'
import { getUserDetails } from '../../../../actions/auth'

const SubscriptionPage = () => {
  const [SubscriptionType, SetSubscriptionType] = useState("");
  const [remainingLeads, setRemainingLeads] = useState(0)
  const [subscriptionEndTime, setSubscriptionEndTime] = useState(null)
  const [isCustomer, setIsCustomer] = useState("");
  const [userId, SetUserId] = useState();
  const [isLoading, SetISLoading] = useState(false);
  const getuserFromDb = async () => {
    let cacheUser = await getUserDetails();
    try {
      const response = await fetch('/api/get-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cacheUser.token}`,
        },
        body: JSON.stringify({ id: cacheUser.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const dbUser = await response.json();
      const activeSubscriptions = dbUser.user.Subscription.filter(sub => sub.status === 'active');
      if (activeSubscriptions) {
        setSubscriptionEndTime(activeSubscriptions[0]?.expiredAt)
      }
      SetUserId(dbUser.user.id)
      setRemainingLeads(dbUser?.user?.remaningLeads)
      SetSubscriptionType(dbUser.user.SubscriptionType.type);
      setIsCustomer(dbUser?.user?.customerid);
    } catch (error) {
      toast.warning('Incorrect credentials', {
        position: "top-center",
      });
    }
  }
  const manageSubs = async () => {
    const user = await getUserDetails();
    SetISLoading(true)
    try {
      const response = await fetch('/api/getSubs-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ userId: `${userId}` }),
      });

      const getSubs = await response.json();

      if (getSubs?.success) {
        let customerid = getSubs.subscription.customerid
        const response = await fetch('/api/create-customer-portal-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ customerId: `${customerid}` }),
        });
        let res = await response.json();
        if (res.url) {
          window.location.replace(res.url);
        }
      }

    } catch (error) {
    } finally {
    }
  }

  useEffect(() => {
    getuserFromDb();
  }, [])
  return (
    <div className="content bg-muted flex-col ">
      <div>
        <div className="text-3xl font-semibold mb-4 mt-4">
          {SubscriptionType == "" ? "" : SubscriptionType == "Deactivate" ? "Available Plans" : "Available Plans"}
        </div>
      </div>
      <div className=" md:max-w-7xl md:mx-auto md:px-4  bg-muted">

        <div className='flex justify-between w-full'>

          <div>
          </div>
        </div>

        <div className='mb-6'>
          {SubscriptionType == "" ?
            <div style={{ margin: 'auto 0' }} className='flex items-center h-96 justify-center'>
              <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-t-accent"></div>
            </div>
            :
            <TradepersonsSubscription subscriptionEndTime={subscriptionEndTime} remainingLeads={remainingLeads} SubscriptionType={SubscriptionType} isCustomer={isCustomer} />
          }
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage