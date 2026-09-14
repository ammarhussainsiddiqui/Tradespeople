'use client';

import { Phone, CheckCircle, X, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getUserDetails } from '../../../../actions/auth';
import { useRouter } from 'next/navigation';
import Progress from "../../../../components/(Tradesperson)/Progress";
export default function ContractorProfile() {
  const [tradespersonData, setTradespersonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTradespersonData = async () => {
      const userId = await getUserDetails();
      try {
        const response = await fetch(`/api/get-tradepersons-location-service?location=&service=&user_id=${userId.id}`);
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          setTradespersonData(data.data[0]);
        }
      } catch (error) {
        console.error('Error fetching tradesperson data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTradespersonData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface p-8 relative overflow-hidden">
        {/* Particle Animation Background */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(370)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              <div
                className="w-1 h-1 bg-accent text-accent-foreground rounded-full opacity-30"
                style={{
                  boxShadow: '0 0 20px hsl(var(--accent) / 0.5)'
                }}
              />
            </div>
          ))}
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            {/* Logo animation */}
            <div className="mb-8 relative">
              <div className="w-24 h-24 mx-auto relative">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 border-4 border-accent rounded-full animate-spin border-t-transparent"></div>

                {/* Inner pulsing circle */}
                <div className="absolute inset-2 bg-gradient-to-br from-accent to-warning rounded-full animate-pulse flex items-center justify-center">
                  <div className="text-ink-inverse font-bold text-xl font-bold">TC</div>
                </div>

                {/* Orbiting dots */}
                <div className="absolute inset-0 animate-spin">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="w-3 h-3 bg-accent text-accent-foreground rounded-full"></div>
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                    <div className="w-3 h-3 bg-warning rounded-full"></div>
                  </div>
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2">
                    <div className="w-3 h-3 bg-accent/70 text-accent-foreground rounded-full"></div>
                  </div>
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2">
                    <div className="w-3 h-3 bg-warning-soft rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-ink-soft font-semibold text-lg animate-pulse">Loading...</div>
            <div className="text-muted-foreground text-sm mt-2">Preparing your workspace</div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px) translateX(0px) scale(1);
            }
            25% {
              transform: translateY(-20px) translateX(10px) scale(1.1);
            }
            50% {
              transform: translateY(-10px) translateX(-10px) scale(0.9);
            }
            75% {
              transform: translateY(-30px) translateX(5px) scale(1.05);
            }
          }
        `}</style>
      </div>
    );
  }

  if (!tradespersonData) {
    return (
      <div className="min-h-screen bg-neutral-50 p-8">
        <div className="max-w-2xl mx-auto bg-surface rounded-lg shadow-sm p-8">
          <div className="text-center">No tradesperson data found.</div>
        </div>
      </div>
    );
  }

  const services = tradespersonData.services || [];
  const portfolioImages = tradespersonData.portfolioUrls || [];

  return (
    <div className="min-h-screen bg-surface p-8 relative overflow-hidden">
      {/* Particle Animation Background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(270)].map((_, i) => (
          <div
            key={i}
            className="absolute z-1000"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            <div
              className="w-1 h-1 bg-accent text-accent-foreground rounded-full z-100"
              style={{
                boxShadow: '0 0 20px hsl(var(--accent) / 0.5)'
              }}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          25% {
            transform: translateY(-20px) translateX(10px) scale(1.1);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) scale(0.9);
          }
          75% {
            transform: translateY(-30px) translateX(5px) scale(1.05);
          }
        }
      `}</style>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Current Profile UI */}
          <div className="lg:col-span-2">
            <div className="bg-surface/20  rounded-2xl shadow-xl border-2 border-neutral-200 p-8 relative overflow-hidden">
              {/* Glossy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface/20 via-transparent to-surface/10 pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface/60 to-transparent"></div>
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                {/* Avatar */}
                <div className="flex-shrink-0 mx-auto sm:mx-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-neutral-800 bg-neutral-100 flex items-center justify-center">
                    {tradespersonData.profileUrl ? (
                      <img
                        src={tradespersonData.profileUrl}
                        alt={`${tradespersonData.firstName} ${tradespersonData.lastName}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-800"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div className="flex-grow text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <h1 className="text-2xl sm:text-3xl font-bold text-ink-strong">{tradespersonData.firstName} {tradespersonData.lastName}</h1>
                    {tradespersonData.featured && (
                      <span className="gap-1 bg-info text-info-foreground px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  {/* Service Tags */}
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {services.map((service, index) => (
                      <span
                        key={index}
                        className="bg-neutral-200 text-ink-soft px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-neutral-600 mb-8 text-lg">
                {tradespersonData.introduction || 'No introduction available.'}
              </p>

              {/* Portfolio Images */}
              <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {portfolioImages.length > 0 ? (
                  portfolioImages.map((image, index) => (
                    <div
                      key={index}
                      className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden bg-neutral-200"
                    >
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  // Placeholder images if no portfolio images are available
                  <>
                    {[...Array(4)].map((_, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-28 h-28 rounded-lg bg-neutral-200 flex items-center justify-center"
                      >
                        <svg
                          className="w-12 h-12 text-ink-muted"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm1 2v8.586l3.293-3.293a1 1 0 011.414 0L14 14.586l2.293-2.293a1 1 0 011.414 0L19 14.586V7h-2l-3 3-4-4-5 5H5z" />
                        </svg>
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-neutral-200">
                {/* Verification Badge */}
                {
                  tradespersonData.phone &&
                  <div className="flex items-center gap-2 text-ink-strong font-semibold text-sm sm:text-base">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success-soft-foreground" />
                    <span className="text-sm sm:text-base">Phone Verified</span>
                  </div>
                }

                {/* CTA Button */}
                <button
                  onClick={() => router.push('/tradesperson/profile')}
                  className="flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-bold transition-colors text-sm sm:text-base"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">Edit Profile Details</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Placeholder for future content */}
          <div className="lg:col-span-1">
            <div className="bg-surface/20 rounded-2xl shadow-xl border-2 border-neutral-200 p-6 relative overflow-hidden">
              {/* Glossy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-surface/20 via-transparent to-surface/10 pointer-events-none"></div>
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-surface/60 to-transparent"></div>
              <h2 className="text-xl font-semibold text-ink-strong mb-4 flex items-center gap-2">
                <span className="animate-bounce">🎉</span>
                Welcome
                <span className="animate-bounce" style={{ animationDelay: '0.5s' }}>🚀</span>
              </h2>
                          <Progress />
              <p className="text-neutral-600 flex items-start gap-2">
                <span className="text-2xl animate-pulse">✨</span>
                <span>Congratulations! You're now listed in our directory, and customers can contact you directly through your preferred channels.</span>
              </p>
              <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 to-warning-soft rounded-lg border border-accent/30">
                <div className="flex items-center gap-3">
                  <div className="animate-spin">
                    <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 2.28 4.88L12 22l-7.28-4.88L7 14.14l-5-4.87L8.91 8.26 12 2z" />
                    </svg>
                  </div>
                  <div className="text-sm font-medium text-ink-soft">
                    <div className="font-bold text-accent">Profile Active</div>
                    <div>Your business is now visible to potential customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}