'use client';
import { useEffect, useState } from 'react';
import Progress from '../../../../components/(Tradesperson)/Progress';
import AboutSection from '../../../../components/(Tradesperson)/ProfileSessions/AboutSection';
import LeadsSettingsSection from '../../../../components/(Tradesperson)/ProfileSessions/LeadsSection';
import '../radio-tabs.css';
import { getUserDetails } from '../../../../actions/auth';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../components/ui/dialog";

import { useGlobalState } from '../../../context/GlobalStateContext';
const Page = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('about');
  const [aboutCompleted, setAboutCompleted] = useState(false);
  const [leadsCompleted, setLeadsCompleted] = useState(false);
  const [accountDetailsSave, setAccountDetailsSave] = useState(false);
  const { isFormDirty, setisFormDirty } = useGlobalState();
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

      if (dbUser.user.SubscriptionType.type == "Deactivate") {
        router.push('/tradesperson/subscription')
      }
    } catch (error) {
    }
  }

  useEffect(() => {
    getuserFromDb();
  }, [])

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutSection setCompleted={setAboutCompleted} />;
      case 'leadsSettings':
        return <LeadsSettingsSection setCompleted={setLeadsCompleted} />;
      default:
        return <AboutSection accountDetailsSave={accountDetailsSave} setCompleted={setAboutCompleted} />;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      const Tab = query.get('tab');
      if (Tab) {
        setActiveTab(Tab);
      }
    }
  }, []);


  useEffect(() => {
    if (aboutCompleted) {
      setActiveTab('leadsSettings');
    }
  }, [aboutCompleted, leadsCompleted
  ]);


  // Handle "Discard Changes" action
  const handleDiscardChanges = () => {
    setisFormDirty(false);
    setAccountDetailsSave(false)
    setActiveTab("leadsSettings");
  };

  // Handle "Keep Editing" action
  const handleKeepEditing = () => {
    setAccountDetailsSave(false)
    setisFormDirty(true);
  };


  const handleTabChange = (tab) => {
    if (isFormDirty !== "true") {
      setActiveTab(tab);
    } else {
      setAccountDetailsSave(true)
    }
  };


  return (
    <div className="bg-muted py-4 ">
      {/* Custom Confirmation Dialog */}
      <Dialog open={accountDetailsSave} onOpenChange={() => setAccountDetailsSave(false)} className="relative z-60">
        <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <div className="flex flex-col items-center">
              <DialogTitle className="text-center font-semibold text-2xl">
                Unsaved Changes
              </DialogTitle>
              <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                You have unsaved changes. Do you want to discard them and leave this page?
              </DialogDescription>
              <div className="flex justify-center space-x-4 mt-6 w-full">
                <button
                  onClick={handleDiscardChanges}
                  className="w-full bg-destructive text-destructive-foreground font-semibold py-3 rounded-md"
                >
                  Discard Changes
                </button>
                <button
                  onClick={handleKeepEditing}
                  className="w-full bg-neutral-300 text-foreground font-semibold py-3 rounded-md"
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-muted">
        <Progress />
        <h2 className="text-2xl font-bold mb-4 mt-4">My Profile</h2>
        <div className="bg-surface rounded-2xl p-6">
          <div className="radio-inputs mb-6 flex justify-between max-w-80 ">
            <label className="radio">
              <input
                type="radio"
                name="tab"
                value="about"
                checked={activeTab === 'about'}
                onChange={() => handleTabChange('about')}
                className="form-radio text-accent focus:ring-0"
              />
              <span className="ml-2 name">About</span>
            </label>
            <label className="radio">
              <input
                type="radio"
                name="tab"
                value="leadsSettings"
                checked={activeTab === 'leadsSettings'}
                onChange={() => handleTabChange('leadsSettings')}
                className="form-radio text-accent focus:ring-0"
              />
              <span className="ml-2 name">Leads Settings</span>
            </label>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Page;
