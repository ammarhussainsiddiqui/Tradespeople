'use client'
import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import Spinner from '../../components/Spinner';
import { Edit } from 'lucide-react';
import { getUserDetails } from '../../actions/auth'
import userIcon from '../../app/assets/user.webp'
import { toast } from "react-toastify";
import * as Sentry from '@sentry/nextjs';
const ProfileForm = ({ userData }) => {
  const [image, setImage] = useState(userIcon);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const allowedFormats = ['image/svg+xml', 'image/jpeg', 'image/png', 'image/webp'];
  const maxImageSize = 5 * 1024 * 1024;
  useEffect(() => {
    if (userData) {
      setImage(userData.profileUrl || userIcon);
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
      setEmail(userData.email || '');
      setPhone(userData.phone || '');
    }
  }, [userData]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!allowedFormats.includes(file.type)) {
        toast.warning('Only SVG, JPG, PNG and WEBP formats are allowed.', {
          position: "top-center",
        });
        return;
      }
      if (file.size > maxImageSize) {
        toast.warning('Maximum image size limit is 5MB.', {
          position: "top-center",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
        setImage(reader.result);
        setIsChanged(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
    setIsChanged(true);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
    setIsChanged(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setStatusMessage('');
    const formDatas = new FormData();
    formDatas.append('id', userData.id);
    formDatas.append('firstName', firstName);
    formDatas.append('lastName', lastName);
    formDatas.append('profileUrl', image); // If profileUrl is a URL or string
    if (selectedFile) {
      // Generate a unique name based on timestamp and original extension
      const uniqueFileName = `file_${Date.now()}${selectedFile.name.slice(selectedFile.name.lastIndexOf('.'))}`;

      // Create a new File object with the unique name
      const renamedFile = new File([selectedFile], uniqueFileName, { type: selectedFile.type });
      formDatas.append('file', renamedFile);  // Append the file object
    }
    const jwt = await getUserDetails();
    try {
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt?.token}`,
        },
        body: formDatas,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Profile updated successfully.', {
          position: "top-center",
        });
        window.location.reload();
        setIsChanged(false);
      } else {
        setStatusMessage(`Failed to update profile: ${data.message}`);
      }
    } catch (error) {
      Sentry.captureException('Error updating profile:', error);
      setStatusMessage('Error updating profile. Please try again.');
      toast.error('Error in updating profile. Please try again.', {
        position: "top-center",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button
          type="button"
          onClick={handleImageClick}
          className="focus:outline-none relative group"
        >
          <Image
            src={image}
            alt="Profile Picture"
            className="rounded-full h-20 w-20 border-2 border-accent object-cover"
            width={80}
            height={80}
          />

          {/* Edit icon */}
          <Edit className="absolute bottom-0 right-0 bg-surface p-1 rounded-full text-accent opacity-0 opacity-100 transition-opacity duration-200 h-6 w-6" />
        </button>

        <div className="ml-4">
          <h1 className="text-xl font-semibold">{firstName} {lastName}</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block font-semibold text-sm font-medium text-ink-soft">First Name</label>
            <input
              type="text"
              name="firstName"
              value={firstName}
              onChange={handleFirstNameChange}
              className="mt-1 block w-full py-4 px-3 text-xs border border-neutral-50 rounded-lg focus:ring-accent focus:border-accent"
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block font-semibold text-sm font-medium text-ink-soft">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={lastName}
              onChange={handleLastNameChange}
              className="mt-1 block w-full py-4 px-3 text-xs border border-neutral-50 rounded-lg focus:ring-accent focus:border-accent"
              placeholder="Last Name"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block font-semibold text-sm font-medium text-success-soft-foreground">Your email is verified</label>
            <input
              type="email"
              name="email"
              value={email}
              className="mt-1 block w-full py-4 px-3 text-xs bg-neutral-100 text-ink-muted border border-neutral-300 rounded-lg ring-neutral-400  order-gray-400 focus:ring-neutral-300 focus:border-neutral-300"
              placeholder='Email'
              readOnly
            />
          </div>
          {
            phone ? (<div>
              <label className="block font-semibold text-sm font-medium text-success-soft-foreground">Your phone number is verified</label>
              <input
                type="text"
                name="phoneNumber"
                value={phone ? phone : ''}
                className="mt-1 block w-full py-4 px-3 text-xs bg-neutral-100 text-ink-muted border border-neutral-300 rounded-lg ring-neutral-400  order-gray-400 focus:ring-neutral-300 focus:border-neutral-300"
                placeholder='Phone Number'
                readOnly
              />
            </div>) : (
              <></>
            )
          }
        </div>
        <input
          type="file"
          name="profileImage"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          ref={fileInputRef}
        />
        {isChanged && (
          <div className="mt-6">
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-accent-foreground hover:bg-primary hover:text-ink-inverse font-semibold rounded-md shadow-sm "
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileForm;
