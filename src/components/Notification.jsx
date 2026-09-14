"use client";
import { useState, useEffect, useRef } from "react";
import { BellIcon, BellRing } from "lucide-react";
import { getUserDetails } from "../actions/auth";
import Link from "next/link";

const Notification = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const notificationRef = useRef(null);


  useEffect(() => {
    const fetchNotifications = async () => {
      const user = await getUserDetails();

      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/reviews-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ userId: user.id }), // Send userId in the request body
        });

        if (!response.ok) {
          throw new Error("Failed to fetch notifications");
        }

        const data = await response.json();
        setNotifications(data); // Assuming the response format is an array of notifications
      } catch (err) {
        setError(err.message);
        // toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);


  useEffect(() => {
    const fetchAnnouncements = async () => {
      const user = await getUserDetails();

      setIsLoading(true);
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
        // toast.error("Failed to load announcements");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();
  }, []); // Empty dependency array means this runs once when the component mounts



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-20" ref={notificationRef}>
      <button
        className="rounded-full bg-surface text-gold-500 p-2 border border-neutral-300 focus:outline-none"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        {notifications.length > 0 || announcements.length > 0 ? (
          <BellRing
            color="hsl(var(--success))"
            className={`h-5 w-5 ${notifications.length > 0 ? "animate-ring" : ""}`} // Add animation class
          />
        ) : (
          <BellIcon className="h-5 w-5" />
        )}
      </button>

      {showNotifications && (
        <>
          <div className="absolute hidden md:block right-0 mt-2 w-80 max-w-full bg-surface border border-gold-500 rounded-lg shadow-lg sm:max-w-xs">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gold-500">Notifications</h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : notifications.length === 0 && announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No new notifications</p>
              ) : (
                <ul className="max-h-[300px] overflow-y-auto mt-2 space-y-2">

                  {/* Render announcements */}
                  {announcements.length > 0 && announcements.map((announcement) => (
                    <li key={announcement.id} className="p-2 hover:bg-neutral-100 cursor-pointer rounded-md">
                      <Link
                        href={`/user/announcement/${announcement.id}`}
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
                    >
                      <Link
                        href={`/user/reviews/${notification.id}`}
                        onClick={() => {
                          setShowNotifications(false);
                        }}
                      >
                        <p className="text-sm font-medium">
                          New review requested from{" "}
                          {notification.tradeperson.firstName}{" "}
                          {notification.tradeperson.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.job.job.headline}
                        </p>
                      </Link>
                    </li>
                  ))}


                </ul>
              )}
            </div>
          </div>

          {/* Mobile view */}
          <div className="absolute block md:hidden right-0 mt-2 bg-surface border border-gold-500 rounded-lg shadow-lg sm:max-w-xs">
            <div className="p-4 w-[255px] md:w-auto">
              <h3 className="text-lg font-bold text-gold-500">Notifications</h3>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              ) : error ? (
                <p className="text-sm text-destructive">{error}</p>
              ) : notifications.length === 0 && announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No new notifications</p>
              ) : (
                <ul className="mt-2 space-y-2 max-h-[300px] overflow-y-auto">


                  {/* Render announcements */}
                  {announcements.length > 0 && announcements.map((announcement) => (
                    <li key={announcement.id} className="p-2 hover:bg-neutral-100 cursor-pointer rounded-md">
                      <Link
                        href={`/user/announcement/${announcement.id}`}
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
                    >
                      <Link
                        href={`/user/reviews/${notification.id}`}
                        onClick={() => {
                          setShowNotifications(false);
                        }}
                      >
                        <p className="text-sm font-medium">
                          New review requested from{" "}
                          {notification.tradeperson.firstName}{" "}
                          {notification.tradeperson.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {notification.job.job.headline}
                        </p>
                      </Link>
                    </li>
                  ))}


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
