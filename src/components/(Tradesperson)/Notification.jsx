'use client';
import { useState, useEffect, useRef } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { getUserDetails } from '../../actions/auth';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import Link from "next/link";
const Notification = () => {
  const router = useRouter();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ringOff, setRingOff] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const notificationRef = useRef(null);

  // Fetch the last 10 notAccepted quotes for the tradesperson
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);

      try {
        const user = await getUserDetails();
        if (!user?.id) return;

        const response = await fetch(`/api/get-quote-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          cache: "no-cache",
          body: JSON.stringify({ tradepersonId: user?.id }),
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data?.quotes)) {
          const notAcceptedQuotes = data?.quotes?.filter((quote) => quote?.isViewed === false);

          const updatedQuotes = await Promise.all(
            notAcceptedQuotes?.map(async (quote) => {
              try {
                const response = await fetch(`/api/get-service?serviceId=${quote.job.job.services}`, {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`,
                  },
                });

                if (!response.ok) throw new Error('Failed to fetch service data');

                const serviceData = await response.json();
                if (serviceData.success) {
                  return { ...quote, servicedata: serviceData?.service?.type };
                }
              } catch (error) {
                Sentry.captureException('Error fetching service data:', error);
              }

              return quote;
            })
          );

          setNotifications(updatedQuotes);
        } else {
          Sentry.captureException('Error fetching notifications:', data?.message);
        }
      } catch (error) {
        Sentry.captureException('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);



  useEffect(() => {
    const fetchAnnouncements = async () => {
      const user = await getUserDetails();

      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/get-announcements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ roleId: user.roleId }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const data = await response.json();
        setAnnouncements(data.announcements); // Assuming the response has an 'announcements' key
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []); // Empty dependency array means this runs once when the component mounts


  // Close notifications when clicking outside the notification box
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);

      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return (
    <div className="relative z-20" ref={notificationRef}>
      <button
        className="rounded-full bg-surface text-gold-500 p-2 border border-neutral-300 focus:outline-none"
        onClick={() => { setShowNotifications(!showNotifications), setRingOff(false); }}
      >
        {/* Bell icon rings if either notifications or announcements are present */}
        {notifications.length > 0 || announcements.length > 0 ? (
          <>
            {ringOff ? (
              <BellRing
                color="hsl(var(--success))"
                className={`h-5 w-5 ${notifications.length > 0 || announcements.length > 0 ? 'animate-ring' : ''}`} // Add animation class
              />
            ) : (
              <Bell color="hsl(var(--ink-strong))" className="h-5 w-5" />
            )}
          </>
        ) : (
          <Bell color="hsl(var(--ink-strong))" className="h-5 w-5" />
        )}
      </button>

      {showNotifications && (
        <>
          {/* Notification Box */}
          <div className="absolute hidden md:block right-0 mt-2 w-80 max-w-full bg-surface border border-gold-500 rounded-lg shadow-lg sm:max-w-xs">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gold-500">Notifications</h3>
              {loading ? (
                <div className="flex justify-center items-center">
                  <svg
                    className={`animate-spin h-5 w-5 `}
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.414 1.414C8.204 18.047 10.042 18 12 18v-4c-1.506 0-2.933.432-4.14 1.172L6 17.291z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <ul className="max-h-[300px] overflow-y-auto mt-2 space-y-2">
                  {/* Display message if no notifications or announcements */}
                  {notifications.length === 0 && announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  ) : (
                    <>

                      {/* Render announcements */}
                      {announcements.length > 0 && announcements.map((announcement) => (
                        <li key={announcement.id} className="p-2 hover:bg-neutral-100 cursor-pointer rounded-md">
                          <Link
                            href={`/tradesperson/announcement/${announcement.id}`}
                            onClick={() => { setShowNotifications(false); }}
                          >
                            <p className="text-sm font-medium line-clamp-2 break-words">{announcement.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 break-words">{announcement.description}</p>
                          </Link>
                        </li>
                      ))}

                      {/* Render notifications */}
                      {notifications.length > 0 && notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className="p-2 hover:bg-neutral-100 cursor-pointer rounded-md"
                          onClick={() => {
                            router.push('/tradesperson/leads'),
                              setShowNotifications(false);
                          }}
                        >
                          <p className="text-sm font-medium">
                            {notification.user.firstName ? `${notification.user.firstName} Requested your service` : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">Service Required: {notification.servicedata}</p>
                          <p className="text-xs text-muted-foreground">Postcode: {notification.job?.job?.postcode?.toUpperCase() || 'No Postcode'}</p>
                        </li>
                      ))}


                    </>
                  )}
                </ul>
              )}
            </div>
          </div>

          {/* Mobile Notification Box */}
          <div className="absolute block md:hidden right-0 mt-2 bg-surface border border-gold-500 rounded-lg shadow-lg sm:max-w-xs">
            <div className="p-4 w-[255px] md:w-auto">
              <h3 className="text-lg font-bold text-gold-500">Notifications</h3>
              {loading ? (
                <div className="flex justify-center items-center">
                  <svg
                    className={`animate-spin h-5 w-5`}
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291l1.414 1.414C8.204 18.047 10.042 18 12 18v-4c-1.506 0-2.933.432-4.14 1.172L6 17.291z"
                    ></path>
                  </svg>
                </div>
              ) : (
                <ul className="max-h-[300px] overflow-y-auto mt-2 space-y-2">
                  {/* Display message if no notifications or announcements */}
                  {notifications.length === 0 && announcements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No new notifications</p>
                  ) : (
                    <>


                      {/* Render announcements */}
                      {announcements.length > 0 && announcements.map((announcement) => (
                        <li key={announcement.id} className="p-2 hover:bg-neutral-100 cursor-pointer rounded-md">
                          <Link
                            href={`/tradesperson/announcement/${announcement.id}`}
                            onClick={() => { setShowNotifications(false); }}
                          >
                            <p className="text-sm font-medium line-clamp-2 break-words">{announcement.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2 break-words">{announcement.description}</p>
                          </Link>
                        </li>
                      ))}

                      {/* Render notifications */}
                      {notifications.length > 0 && notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className="p-2 hover:bg-neutral-100 cursor-pointer rounded-md"
                          onClick={() => {
                            router.push('/tradesperson/leads'),
                              setShowNotifications(false);
                          }}
                        >
                          <p className="text-sm font-medium">
                            {notification.user.firstName ? `${notification.user.firstName} Requested your service` : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">Service Required: {notification.servicedata}</p>
                          <p className="text-xs text-muted-foreground">Postcode: {notification.job?.job?.postcode?.toUpperCase() || 'No Postcode'}</p>
                        </li>
                      ))}


                    </>
                  )}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );



};

export default Notification;
