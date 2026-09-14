"use client"; 

import { createContext, useContext, useState , useEffect} from "react";

// 1. Create Context
const GlobalStateContext = createContext();

// 2. Create Provider Component
export const GlobalStateProvider = ({ children }) => {
  const [understand, setUnderstand] = useState({}); 
  const [emailFlag, setEmailFlag] = useState(false); 
  const [updateFlag, setupdateFlag] = useState(); 
  const [userId, setUserId]  = useState();
  const [servicename, setservicename]  = useState(); 
  const [isFormDirty, setisFormDirty]  = useState();
  const [jobId, setJobId]  = useState(); 
  const [profileId, setprofileId]  = useState();
  const [jobCache, setjobCache]  = useState();
  const [pwdCache, setpwdCache]  = useState();
  const [qouteCache, setqouteCache]  = useState();
  const [leadCache, setleadCache]  = useState();
  const [detailCache, setdetailCache]  = useState();
  const [profileCache, setprofileCache]  = useState();


  const setUnderstandState = async (value) => {
    setUnderstand(value)
  }

  useEffect(() => {
  }, [understand]);
  return (
    <GlobalStateContext.Provider value={{ understand, setUnderstandState, emailFlag, setEmailFlag, updateFlag, setupdateFlag, userId, setUserId, servicename, setservicename , isFormDirty, setisFormDirty, jobId, setJobId, jobCache, setjobCache, pwdCache, setpwdCache, qouteCache, setqouteCache, leadCache, setleadCache, detailCache, setdetailCache, profileCache, setprofileCache, profileId, setprofileId}}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// 3. Create a custom hook for easy access
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }
  return context;
};
