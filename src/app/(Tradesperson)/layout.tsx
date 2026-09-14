'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getUserDetails } from "../../actions/auth";
import Navbar from "../../components/(Tradesperson)/Navbar";
import Footer from "../../components/layout/Footer";
export default function AdminLayout({ children }) {

  const router = useRouter();
  useEffect(() => {
    const userValidate = async () => {
      let user = await getUserDetails();
      try {
        const response = await fetch('/api/get-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ id: user?.id }),
        });
        const data = await response.json();
        if (data.success) {
          if (user?.roleId == 1) {
            window.location.replace('/user/myjobs')
          } else if (user?.roleId == 2) {
            if (data.SubscriptionType == "Deactivate") {
              router.push('/tradesperson/subscription')
            }
          } else {
            window.location.replace('/login')
          }
        } else {
          window.location.replace('/login')
        }
      } catch (error) {
        window.location.replace('/login')
      }
    }
    userValidate();
  }, [])

  return (
    <div className="main-container">
      <div>
        <Navbar />
      </div>
      <div className="my-auto">
        {children}
      </div>
      <Footer />
    </div>
  );
}
