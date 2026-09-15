'use client'
import Link from 'next/link';
import Select from "react-select";
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { getUserDetails, updatedAreaSegments } from '../../../actions/auth';
import Spinner from '../../Spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { isValidUKPostalCode } from '../../../utils/functions';

import "../barstyle.css";
import { toast } from "react-toastify";
import * as Sentry from '@sentry/nextjs';

const LeadsSettingsSection = ({ setCompleted }) => {
  const inputRef = useRef(null);
  const [userData, setUserData] = useState();
  const [userDetails, setUserDetails] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [services, setServices] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [distance, setDistance] = useState("10");
  const [background, setBackground] = useState("");
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [servicesList, setServicesList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const openServiceDialog = () => setShowServiceDialog(true);
  const closeServiceDialog = () => { setShowServiceDialog(false), setstatusMessage("") };
  const [statusMessage, setstatusMessage] = useState('');
  const [subscription, setSubscription] = useState('');
  const [tradeServiceLength, setTradeServiceLength] = useState();
  const [showMainTradeDialog, setShowMainTradeDialog] = useState(false);
  const openMainTradeDialog = () => setShowMainTradeDialog(true);
  const closeMainTradeDialog = () => setShowMainTradeDialog(false);
  const [showMainLocationDialog, setShowMainLocationDialog] = useState(false);
  const openMainLocationDialog = () => setShowMainLocationDialog(true);
  const closeMainLocationDialog = () => {
    setShowMainLocationDialog(false);
    setFormData({ area: '' });
    setDistance('');
  };
  const [formData, setFormData] = useState({
    area: ""
  });

  const [areas, setAreas] = useState([]);
  useEffect(() => {
    const getAreas = async () => {
      const areas = await updatedAreaSegments();

      setAreas(areas)
    }
    getAreas()
  }, [])

  const [errors, setErrors] = useState({});
  const handleChangeArea = (selectedOption) => {
    setErrors('')
    setFormData({
      ...formData,
      area: selectedOption ? selectedOption.label : "",
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.area) {
      newErrors.area = "Area is required";
    }

    return newErrors;
  };

  const saveServiceDialog = async () => {
    if (userDetails?.trade == searchTerm) {
      toast.error('Service already exists for this user.', {
        position: "top-center",
      });
      setShowServiceDialog(false);
      setSelectedService("");
      setSearchTerm('');
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const jwt = await getUserDetails();
    if (selectedService == "") {
      setstatusMessage("Please select a service.")
      setLoading(false);
      return
    } else {
      setstatusMessage("")
    }
    try {
      const response = await fetch("/api/save-trade-service", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({
          serviceId: selectedService,
          userId: userData.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        toast.error(data.message, {
          position: "top-center",
        });
      }

      const data = await response.json();
      if (data.success) {
        setSearchTerm('');
        setShowDropdown(false);
        setLoading(false);
        getUser();
      }
    } catch (error) {
      Sentry.captureException("Error fetching user data:", error);
      setSearchTerm('');
      setShowDropdown(false);
      setLoading(false);
    } finally {
      setShowServiceDialog(false);
      setSelectedService("");
    }
  };
  const openLocationDialog = () => setShowLocationDialog(true);
  const closeLocationDialog = () => { setShowLocationDialog(false), setstatusMessage("") };

  const saveLocationDialog = async () => {

    const jwt = await getUserDetails();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch("/api/save-trade-location", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${jwt?.token}`,
          },
          body: JSON.stringify({
            postcode: formData?.area,
            distance: distance,
            userId: userData.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          toast.error(data.message, {
            position: "top-center",
          });
        }

        const data = await response.json();
        if (data.success) {
          setSelectedLocation('');
          setErrors('')
          setShowLocationDialog(false);
          setLoading(false);
          getUser();
        }
      } catch (error) {
        toast.error(error, {
          position: "top-center",
        });
        setSelectedLocation('');
        setErrors('')
        setLoading(false);
      } finally {
        setErrors('')
        setstatusMessage("")
        setSelectedLocation("")
      }
    } else {
      setErrors(validationErrors);
      return
    }
  };
  const saveMainLocationDialog = async () => {

    const jwt = await getUserDetails();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await fetch("/api/save-trade-location", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${jwt?.token}`,
          },
          body: JSON.stringify({
            postcode: formData?.area,
            distance: distance,
            userId: userData.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          toast.error(data.message, {
            position: "top-center",
          });
        }

        const data = await response.json();
        if (data.success) {
          setSelectedLocation('');
          setErrors('')
          setShowLocationDialog(false);
          setLoading(false);
          getUser();
          setShowMainLocationDialog(false);
        }
      } catch (error) {
        toast.error(error, {
          position: "top-center",
        });
        setSelectedLocation('');
        setErrors('')
        setLoading(false);
      } finally {
        setErrors('')
        setstatusMessage("")
        setSelectedLocation("")
      }
    } else {
      setErrors(validationErrors);
      return
    }
  };

  useEffect(() => {
    setBackground(
      `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${(distance / 45) * 100
      }%, hsl(var(--surface-soft)) ${(distance / 45) * 100}%, hsl(var(--surface-soft)) 100%)`
    );
  }, [distance]);

  useEffect(() => {
    const getServices = async () => {
      const jwt = await getUserDetails();
      try {
        const response = await fetch("/api/services");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        setServices(result.services);
        setFilteredServices(result.services);
      } catch (error) {
        Sentry.captureException("Error fetching services:", error);
      }
    };

    getServices();
  }, []);

  useEffect(() => {
    const filtered = searchTerm
      ? services.filter((service) =>
        service.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : [];
    setFilteredServices(filtered);
    setHighlightedIndex(-1);
  }, [searchTerm, services]);

  const handleSearchChange = (e) => {
    setstatusMessage("")
    setSearchTerm(e.target.value);
    setShowDropdown(!!e.target.value);
  };

  const handleSelectService = (service) => {
    setSelectedService(service.id);
    setSearchTerm(service.type);
    setShowDropdown(false);
  };

  const handleSelectServicemob = (service_id) => {
    let srchServises = services.find(service => service.id == service_id);
    setSelectedService(srchServises.id);
    setSearchTerm(srchServises.type);
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (showDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          Math.min(prevIndex + 1, filteredServices.length - 1)
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelectService(filteredServices[highlightedIndex]);
      }
    }
  };

  useEffect(() => {
    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (inputElement) {
        inputElement.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [showDropdown, highlightedIndex, filteredServices]);

  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

  const getUser = async () => {
    const user = await getUserDetails();
    setUserData(user);
    const effectiveUserId = user?.id;
    if (!effectiveUserId) return;

    try {
      const response = await fetch(`/api/get-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ id: effectiveUserId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {
        setUserDetails(data.user);
        setSubscription(data.user.SubscriptionType.type)
        setTradeServiceLength(data.user.tradeService.length)
      }
    } catch (error) {
      Sentry.captureException("Error fetching user data:", error);
    }
    try {
      const response = await fetch(
        `/api/save-trade-service?userId=${effectiveUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {
        setServicesList(data.services);
      }
    } catch (error) {
      Sentry.captureException("Error fetching user data:", error);
    }
    try {
      const response = await fetch(
        `/api/save-trade-location?userId=${effectiveUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {

        setLocationList(data.tradeLocations);
      }
    } catch (error) {
      Sentry.captureException("Error fetching user data:", error);
    }
  };
  useEffect(() => {
    getUser();
  }, []);

  const deleteTradeService = async (id) => {
    const jwt = await getUserDetails();
    try {
      const response = await fetch(`/api/save-trade-service?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${jwt?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Service Deleted', {
          position: "top-center",
        });
        getUser();
      }
    } catch (error) {
      Sentry.captureException("Error fetching user data:", error);
      toast.error('Network Error', {
        position: "top-center",
      });
    }
  };
  const deleteTradeLocation = async (id) => {
    const jwt = await getUserDetails();
    try {
      const response = await fetch(`/api/save-trade-location?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${jwt?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();
      if (data.success) {
        toast.success('Location Deleted', {
          position: "top-center",
        });
        getUser();
      }
    } catch (error) {
      toast.error('Network Error', {
        position: "top-center",
      });
      Sentry.captureException("Error fetching user data:", error);
    }
  };

  const isPostcodeValid = (postcode) => {
    return areas.some(
      (area) => area.label.toLowerCase() === postcode?.toLowerCase()
    );
  };
  const updateMainTrade = async () => {
    if (!selectedService) {
      toast.error("Please select a main trade before saving.", {
        position: "top-center",
      });
      return;
    }

    setLoading(true);
    const jwt = await getUserDetails();

    try {
      const response = await fetch("/api/save-trade-service", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({
          id: userData?.id,
          trade: services.find(s => s.id === selectedService)?.type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to update main trade.", {
          position: "top-center",
        });
        return;
      }

      if (data.success) {
        toast.success("Main trade updated successfully!", {
          position: "top-center",
        });
        getUser(); // refresh state
      }
    } catch (error) {
      Sentry.captureException(error);
      toast.error("Something went wrong while updating your trade.", {
        position: "top-center",
      });
    } finally {
      setLoading(false);
    }
  };
  function canUserAddTrade(subscriptionType, tradeServiceCount) {
    const subType = subscriptionType;
    let maxTradesAllowed = 0;

    if (subType === "Gold" || subType === "Gold Plus") {
      maxTradesAllowed = 4;
    } else if (subType === "Silver" || subType === "Silver plus") {
      maxTradesAllowed = 0;
    }
    return tradeServiceCount < maxTradesAllowed;
  }
  const canAddTrade = canUserAddTrade(subscription, tradeServiceLength || 0);
  return (
    <>
      {/* Edit Main Service Dialog */}
      <Dialog open={showMainTradeDialog} onOpenChange={closeMainTradeDialog}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Edit Main Trade</DialogTitle>
              <DialogDescription className="text-xs mt-2">
                Select your main trade
              </DialogDescription>

              <div className="mt-4 space-y-4">
                <div className="relative">
                  <input
                    id="main-trade-search"
                    name="main-trade-search"
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search service..."
                    className="w-full px-4 py-4 text-xs border-none focus:ring-0 middle bg-neutral-100 rounded-lg"
                    onFocus={() => setShowDropdown(true)}
                    onBlur={handleBlur}
                    ref={inputRef}
                    autoComplete="off"
                  />

                  {showDropdown && (
                    <div className="absolute top-full mt-1 bg-surface rounded-md shadow-lg w-full max-w-md z-60">
                      {filteredServices.length > 0 ? (
                        filteredServices.map((service, index) => (
                          <div
                            key={service.id}
                            onMouseDown={() => {
                              setSelectedService(service.id);
                              setSearchTerm(service.type);
                              setShowDropdown(false);
                            }}
                            className={`cursor-pointer p-2 hover:bg-neutral-100 ${selectedService === service.id ? "bg-neutral-200" : ""
                              } ${highlightedIndex === index ? "bg-neutral-300" : ""}`}
                          >
                            {service.type}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-muted-foreground">No services found</div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className="mt-4 bg-accent w-full text-accent-foreground px-4 py-2 rounded-md flex justify-center hover:bg-primary hover:text-ink-inverse items-center"
                  onClick={async () => {
                    await updateMainTrade();
                    closeMainTradeDialog();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : "Save Main Trade"}
                </button>

                {statusMessage && (
                  <div className="mt-4 text-sm w-full text-destructive">
                    {statusMessage}
                  </div>
                )}
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Service Dialog */}
      <Dialog
        open={showServiceDialog}
        onOpenChange={closeServiceDialog}
        className="relative z-60 top-0"

      >
        <DialogContent
        >
          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Add a Service</DialogTitle>
              <DialogDescription className="text-xs mt-2">
                Please choose the details for the new service you would like to add.
              </DialogDescription>
              <div className="mt-4 space-y-4 ">
                <div className="relative">
                  <div className="relative hidden md:block">
                    <input
                      id="service-search"
                      name="service-search"
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder="Type in the service you would like to add"
                      className="w-full px-4 py-4 text-xs border-none focus:ring-0 middle bg-neutral-100 rounded-lg"
                      onFocus={() => setShowDropdown(true)}
                      onBlur={handleBlur}

                      ref={inputRef}
                      autoComplete="off"
                    />
                    {showDropdown && (
                      <div className="absolute top-full mt-1 bg-surface  rounded-md shadow-lg w-full max-w-md z-60">
                        {filteredServices.length > 0 ? (
                          filteredServices.map((service, index) => (
                            <div
                              key={service.id}
                              onMouseDown={() => handleSelectService(service)}
                              className={`cursor-pointer p-2 hover:bg-neutral-100 ${selectedService === service.id
                                ? "bg-neutral-200"
                                : ""
                                } ${highlightedIndex === index ? "bg-neutral-300" : ""
                                }`}
                            >
                              {service.type}
                            </div>
                          ))
                        ) : (
                          <></>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative block md:hidden">
                    <select
                      value={selectedService}
                      onChange={(e) => { handleSelectServicemob(e.target.value) }}
                      className="hjmDlo"
                    >
                      <option value="" disabled>
                        Select a service
                      </option>
                      {services.length > 0 ? (
                        services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.type}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No services available
                        </option>
                      )}
                    </select>
                  </div>


                </div>
                <button
                  type="button"
                  className="mt-4 bg-accent w-full text-accent-foreground px-4 py-2 rounded-md flex justify-center hover:bg-primary hover:text-ink-inverse items-center"
                  onClick={saveServiceDialog}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : " Add Service"}
                </button>
              </div>
              {statusMessage && (
                <div className="mt-4 text-sm w-full text-destructive">
                  {statusMessage}
                </div>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Location Dialog */}
      <Dialog
        open={showLocationDialog}
        onOpenChange={closeLocationDialog}
        className="relative z-60"
      >

        <DialogContent className="">

          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Add a Location</DialogTitle>
              <div className="mt-4 space-y-4">
                <div className="relative ">
                  <div className="relative mt-1 hidden md:block">
                    <Select
                      value={areas.find((option) => option.label === formData.area)}
                      onChange={handleChangeArea}
                      options={areas}
                      menuPosition='top'
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "hsl(var(--surface-soft))",
                          borderColor: "hsl(var(--neutral-300))",
                          borderRadius: "0.375rem",
                          padding: "0.5rem",
                          boxShadow: "0 1px 2px 0 hsl(var(--shadow-soft))",
                          "&:hover": {
                            borderColor: "hsl(var(--accent))",
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isFocused ? "hsl(var(--accent))" : "hsl(var(--surface))",
                          color: "hsl(var(--ink-strong))",
                          "&:hover": {
                            backgroundColor: "hsl(var(--accent))",
                            color: "hsl(var(--ink-strong))",
                          },
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "hsl(var(--ink-strong))",
                        }),
                      }}
                      placeholder="Select your area"
                    />
                    {errors.area && (
                      <p className="text-destructive text-sm mt-1">{errors.area}</p>
                    )}
                  </div>
                  <div className="relative mt-1 block md:hidden">
                    <select
                      value={formData.area}
                      onChange={(e) => {
                        setErrors('')
                        setFormData({
                          ...formData,
                          area: e.target.value,
                        });
                      }}
                      className="hjmDlo"
                    >
                      <option value="" disabled>
                        Select your area
                      </option>
                      {areas.length > 0 ? (
                        areas.map((option) => (
                          <option key={option.value} value={option.label}>
                            {option.label}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No areas available
                        </option>
                      )}
                    </select>
                    {errors.area && (
                      <p className="text-destructive text-sm mt-1">{errors.area}</p>
                    )}
                  </div>
                </div>
                <button
                  className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                  onClick={saveLocationDialog}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : "Add Location"}
                </button>
              </div>
              {statusMessage && (
                <div className="mt-4 text-sm w-full text-destructive">
                  {statusMessage}
                </div>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Edit Main Location Dialog */}
      <Dialog
        open={showMainLocationDialog}
        onOpenChange={closeMainLocationDialog}
        className="relative z-60"
      >

        <DialogContent className="">

          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Update Location</DialogTitle>
              <div className="mt-4 space-y-4">
                <div className="relative ">
                  <div className="relative mt-1 hidden md:block">
                    <Select
                      value={areas.find((option) => option.label === formData.area)}
                      onChange={handleChangeArea}
                      options={areas}
                      menuPosition='top'
                      styles={{
                        control: (provided) => ({
                          ...provided,
                          backgroundColor: "hsl(var(--surface-soft))",
                          borderColor: "hsl(var(--neutral-300))",
                          borderRadius: "0.375rem",
                          padding: "0.5rem",
                          boxShadow: "0 1px 2px 0 hsl(var(--shadow-soft))",
                          "&:hover": {
                            borderColor: "hsl(var(--accent))",
                          },
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isFocused ? "hsl(var(--accent))" : "hsl(var(--surface))",
                          color: "hsl(var(--ink-strong))",
                          "&:hover": {
                            backgroundColor: "hsl(var(--accent))",
                            color: "hsl(var(--ink-strong))",
                          },
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "hsl(var(--ink-strong))",
                        }),
                      }}
                      placeholder="Select your area"
                    />
                    {errors.area && (
                      <p className="text-destructive text-sm mt-1">{errors.area}</p>
                    )}
                  </div>
                  <div className="relative mt-1 block md:hidden">
                    <select
                      value={formData.area}
                      onChange={(e) => {
                        setErrors('')
                        setFormData({
                          ...formData,
                          area: e.target.value,
                        });
                      }}
                      className="hjmDlo"
                    >
                      <option value="" disabled>
                        Select your area
                      </option>
                      {areas.length > 0 ? (
                        areas.map((option) => (
                          <option key={option.value} value={option.label}>
                            {option.label}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No areas available
                        </option>
                      )}
                    </select>
                    {errors.area && (
                      <p className="text-destructive text-sm mt-1">{errors.area}</p>
                    )}
                  </div>
                </div>
                <button
                  className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                  onClick={saveMainLocationDialog}
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : "Update Location"}
                </button>
              </div>
              {statusMessage && (
                <div className="mt-4 text-sm w-full text-destructive">
                  {statusMessage}
                </div>
              )}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="space-y-8">
        <section>
          <h3 className="text-xl font-semibold">Your Services</h3>
          <span className="text-xs mb-4 block">
            Customise the leads you want to be notified about.
          </span>
          <section className="grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2 ">
              {userDetails?.trade && (
                <div className="flex justify-between items-center p-4 border rounded-md shadow-sm bg-surface hover:bg-neutral-100 transition-colors duration-150 ease-in-out">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {userDetails?.trade}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={openMainTradeDialog}
                  >
                    <Edit3 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              )}
              {servicesList.map((service, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-md shadow-sm bg-surface hover:bg-neutral-100 transition-colors duration-150 ease-in-out"
                >
                  <div>
                    <h3 className="text-lg font-semibold">
                      {service.Service.type}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteTradeService(service.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          </section>
          <div>
            {canAddTrade && (
              <button
                onClick={openServiceDialog}
                className="text-md font-semibold hover:bg-neutral-200 px-4 py-2 rounded-lg mt-2"
                type="button"
              >
                + Add a Service
              </button>
            )}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold">Your Location</h3>
          <span className="text-xs mb-4 block">
            Select the areas where you’d like to attract new customers. You can add multiple locations, one at a time.
          </span>
          <section className="grid grid-cols-1 md:grid-cols-2">
            <div className="space-y-2">
              {userDetails && isPostcodeValid(userDetails?.postcode) && (
                <div className="flex justify-between items-center p-4 border rounded-md shadow-sm bg-surface hover:bg-neutral-100 transition-colors duration-150 ease-in-out">
                  <div className="flex">
                    <MapPin className="w-5 h-5 text-muted-foreground mr-2" />
                    <h3 className="text-md font-semibold my-auto">
                      {userDetails?.postcode?.toUpperCase()}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={openMainLocationDialog} >
                    <Edit3 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              )}
              {locationList.map((location, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 border rounded-md shadow-sm bg-surface hover:bg-neutral-100 transition-colors duration-150 ease-in-out"
                >
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-muted-foreground mr-2" />
                    <div>
                      <h3 className="text-md font-semibold my-auto">
                        {location.postcode?.toUpperCase()}
                      </h3>
                    </div>

                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteTradeLocation(location.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              ))}

            </div>
          </section>
          <div>
            <button
              onClick={openLocationDialog}
              className="text-md font-semibold hover:bg-neutral-200 px-4 py-2 rounded-lg mt-2"
              type="button"
            >
              + Add a Location
            </button>
          </div>
        </section>
      </div>
    </>
  );
};

export default LeadsSettingsSection;
