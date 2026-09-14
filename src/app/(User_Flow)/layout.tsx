'use client'
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getUserDetails } from "../../actions/auth";
import Navbar from "../../components/(User_flow)/Navbar";
import Footer from "../../components/layout/Footer";
export default function AdminLayout({ children }) {

  const router = useRouter();
  useEffect(() => {
    const userValidate = async () => {
      let user = await getUserDetails();
      if (user?.roleId !== null) {
        if (user?.roleId == 1) {
        } else if (user?.roleId == 2) {
          window.location.replace('/tradesperson/subscription')
        } else {
          window.location.replace('/login')
        }
      }
    }
    userValidate();
  }, [])

  return (
    <div className="main-container">
      <div>

        <Navbar />
      </div>
      <div className="content max-w-7xl mx-auto my-auto w-full px-4 sm:px-6 lg:px-8 bg-muted">
        {children}
      </div>
      <Footer />
    </div>
  );
}
