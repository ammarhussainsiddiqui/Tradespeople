'use client';
import React, { useEffect, useState } from 'react';
import { getUserDetails, logout } from '../../../../actions/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";
import ProfileForm from '../../../../components/(User_flow)/ProfileForm';
import bcrypt from 'bcryptjs';
import { Eye, EyeOff } from 'lucide-react';
import Spinner from '../../../../components/Spinner';
import Twilio from '../../../../components/Twilio'
import * as Sentry from '@sentry/nextjs';
const Page = () => {
  const [userId, setUserId] = useState('');
  const [userData, setUserData] = useState({});
  const [pwdDefault, setPwdDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [dialoagError, setDialoagError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [showFinalPopupMessage, setShowFinalPopupMessage] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserDetails();
      const effectiveUserId = user?.id;
      setUserId(effectiveUserId)
      if (!effectiveUserId) return;

      try {
        const response = await fetch('/api/get-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ id: effectiveUserId }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setUserData(data.user);
          setUserPassword(data.user.password)
          const isDefault = await bcrypt.compare('00000', data.user.password);
          setPwdDefault(isDefault);
        }
      } catch (error) {
        Sentry.captureException('Error fetching user data:', error);
      }
    };

    getUser();
  }, [userId]);

  const handleCreatePassword = async () => {
    const user = await getUserDetails();
    const effectiveUserId = userId || user?.id;
    if (!effectiveUserId) return;
    if (newPassword == '00000') {
      setDialoagError('You can not set 00000 password try some different.')
      return;
    }
    if (newPassword.length < 5) {
      setDialoagError('Password is to short.')
      return;
    }

    if (newPassword !== confirmPassword) {
      setDialoagError('Password do not match.')
    } else {
      setLoading(true)
      try {
        const response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ userId: effectiveUserId, currentPassword: '00000', newPassword: newPassword }),
        });

        if (!response.ok) {
          setLoading(false)
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setShowCreateDialog(false);
          setShowChangeDialog(false);
          setShowFinalPopup(true)
          setShowFinalPopupMessage('Your password has been created successfully.')
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
        setDialoagError(error.message)
      }
    }
  };

  const handleChangePassword = async () => {

    const user = await getUserDetails();
    const effectiveUserId = userId || user?.id;
    if (!effectiveUserId) return;
    if (newPassword == '00000') {
      setDialoagError('You can not set 00000 password try some different.')
      return;
    }
    if (newPassword.length < 5) {
      setDialoagError('Password is to short.')
      return;
    }
    const compare = await bcrypt.compare(newPassword, userPassword);
    if (compare) {
      setDialoagError('This Password is alredy set.')
      return;
    }
    const currentMatch = await bcrypt.compare(currentPassword, userPassword);
    if (!currentMatch) {
      setDialoagError('Current Password is not valid.')
    } else if (newPassword !== confirmPassword) {
      setDialoagError('Password do not match.')
    } else {
      setLoading(true)
      try {
        const response = await fetch('/api/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ userId: effectiveUserId, currentPassword: currentPassword, newPassword: newPassword }),
        });

        if (!response.ok) {
          setLoading(false)
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setShowCreateDialog(false);
          setShowChangeDialog(false);
          setShowFinalPopup(true)
          setShowFinalPopupMessage('Your password has been changed successfully.')
          setLoading(false)
        }
      } catch (error) {
        setLoading(false)
        setDialoagError(error.message)
      }
    }


  };

  const closeDialog = () => {
    setShowCreateDialog(false);
    setShowChangeDialog(false);
  };
  const closeFinalPopup = () => {
    setShowFinalPopup(false);
    window.location.reload();
  };

  return (
    <>

      {/* Create Password Dialog */}
      <Dialog open={showFinalPopup} onOpenChange={closeFinalPopup} className="relative z-60">
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col text-center">
              <DialogTitle className="text-3xl">
                Thank You
              </DialogTitle>
              <DialogDescription className="text-sm">
                <span>
                  {showFinalPopupMessage}
                </span>
              </DialogDescription>
              <div className="mt-4 space-y-4">

                <button
                  type="button"
                  onClick={closeFinalPopup}
                  className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                >
                  OK!
                </button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Create Password Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={closeDialog} className="relative z-60">
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Create Password</DialogTitle>
              <DialogDescription className="text-xs mt-2">
                Please set your new password.
              </DialogDescription>
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <label htmlFor="new-password" className="block text-sm font-medium text-ink-soft">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showNewPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative">
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-ink-soft">
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCreatePassword}
                  className="mt-4 bg-accent w-full text-accent-foreground hover:bg-primary hover:text-ink-inverse px-4 py-2 rounded-md flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? <Spinner className="w-5 h-5" /> : 'Set Password'}
                </button>
                <span className="text-xs text-center text-destructive">{dialoagError}</span>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>


      {/* Change Password Dialog */}
      <Dialog open={showChangeDialog} onOpenChange={closeDialog} className="relative z-60">
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col">
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription className="text-xs mt-2">
                Please enter your current and new passwords.
              </DialogDescription>
              <div className="mt-4 space-y-4">
                <div className="relative">
                  <label htmlFor="current-password" className="block text-sm font-medium text-ink-soft">
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showCurrentPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative">
                  <label htmlFor="new-password" className="block text-sm font-medium text-ink-soft">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showNewPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <div className="relative mb-4">
                  <label htmlFor="confirm-new-password" className="block text-sm font-medium text-ink-soft">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-neutral-100 bg-neutral-100 rounded-md mt-1"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 mt-6 text-muted-foreground right-0 flex items-center px-2"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleChangePassword}
                  className="mt-8 bg-accent hover:bg-primary hover:text-ink-inverse w-full text-accent-foreground px-4 py-2 rounded-md flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? <Spinner className="w-5 h-5" /> : 'Change Password'}
                </button>
                <span className="text-xs text-center text-destructive">{dialoagError}</span>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>


      <div className='bg-muted p-4 w-screen'>
        <div>
          <h1 className='text-2xl font-bold mb-8'>Your Profile</h1>
          <div className='mt-4'>
            <ProfileForm userData={userData} />
          </div>
          <div className='mt-8 mb-6'>
            <div className='mb-2'>
              <Twilio userData={userData} />
            </div>
            {pwdDefault ? (
              <div className="p-6 bg-neutral-100 rounded-lg flex flex-col md:flex-row md:justify-between">
                <div className="mb-4 md:mb-0">
                  <p className="text-lg font-semibold">Want to sign in your account with a password?</p>
                  <p className="text-sm text-neutral-600">Set a secure password to protect your account.</p>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowCreateDialog(true)}
                    className="px-4 py-2 bg-accent mt-1 text-accent-foreground hover:bg-primary hover:text-ink-inverse font-semibold rounded-md shadow-sm hover:bg-primary"
                  >
                    &nbsp;&nbsp;&nbsp; Create Password &nbsp;&nbsp;&nbsp;
                  </button>
                </div>
              </div>

            ) : (
              <div className=" text-left">
                <button
                  type="button"
                  onClick={() => setShowChangeDialog(true)}
                  className="px-4 py-2 bg-surface text-foreground font-semibold rounded-md shadow-sm hover:bg-primary  hover:text-ink-inverse"
                >
                  Change Password
                </button>
              </div>
            )}


          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
