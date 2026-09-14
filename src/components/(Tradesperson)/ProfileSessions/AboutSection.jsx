'use client';
import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Spinner from '../../Spinner';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { getUserDetails } from '../../../actions/auth';
import editImage from '../../../app/assets/user.webp'
import { isValidUKPostalCode } from '../../../utils/functions';
import { isValidNumber, parsePhoneNumber } from 'libphonenumber-js';
import CheckImage from '../../../app/assets/varified.webp';
import SocialMediaSection from './SocialLinksSection'
import { Edit } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
import bcrypt from 'bcryptjs';
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../../../components/ui/input-otp";
import Select from 'react-select';
import { toast } from "react-toastify";
import { useRouter, usePathname } from "next/navigation";
import * as Sentry from '@sentry/nextjs';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "../../../components/ui/tooltip";

import { useGlobalState } from '../../../app/context/GlobalStateContext';
const ProfileForm = ({ accountDetailsSave }) => {
  const [userData, setUserData] = useState();
  const [profileImage, setProfileImage] = useState();
  const [portfolioImages, setPortfolioImages] = useState([]);
  const [companyLogo, setCompanyLogo] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [mapLink, setMapLink] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companySize, setCompanySize] = useState('1-10');
  const [businessYears, setBusinessYears] = useState('1995');
  const [companyDescription, setCompanyDescription] = useState('');
  const [isCompanyOwner, setIsCompanyOwner] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusMessageSuccess, setStatusMessageSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCompanyLogoFile, setCompanyLogoSelectedFile] = useState(null);
  const [selectedPortfolioFile, setSelectedPortfolioFile] = useState([]);
  const profileImageRef = useRef(null);
  const portfolioImageRef = useRef(null);
  const companyLogoRef = useRef(null);
  const { isFormDirty, setisFormDirty } = useGlobalState();
  const allowedFormats = ['image/svg+xml', 'image/jpeg', 'image/png', 'image/webp'];
  const maxImageSize = 5 * 1024 * 1024;
  const maxWords = 500;
  const [gender, setGender] = useState('');

  const companySizeOptions = [
    { value: '1-10', label: '1-10' },
    { value: '11-50', label: '11-50' },
    { value: '51-200', label: '51-200' },
    { value: '201-500', label: '201-500' },
    { value: '500+', label: '500+' },
  ];
  const companyYearOptions = [
    { value: '1995', label: '1995' },
    { value: '1996', label: '1996' },
    { value: '1997', label: '1997' },
    { value: '1998', label: '1998' },
    { value: '1999', label: '1999' },
    { value: '2000', label: '2000' },
    { value: '2001', label: '2001' },
    { value: '2002', label: '2002' },
    { value: '2003', label: '2003' },
    { value: '2004', label: '2004' },
    { value: '2005', label: '2005' },
    { value: '2006', label: '2006' },
    { value: '2007', label: '2007' },
    { value: '2008', label: '2008' },
    { value: '2009', label: '2009' },
    { value: '2010', label: '2010' },
    { value: '2011', label: '2011' },
    { value: '2012', label: '2012' },
    { value: '2013', label: '2013' },
    { value: '2014', label: '2014' },
    { value: '2015', label: '2015' },
    { value: '2016', label: '2016' },
    { value: '2017', label: '2017' },
    { value: '2018', label: '2018' },
    { value: '2019', label: '2019' },
    { value: '2020', label: '2020' },
    { value: '2021', label: '2021' },
    { value: '2022', label: '2022' },
    { value: '2023', label: '2023' },
    { value: '2024', label: '2024' },

  ];


  useEffect(() => {
    const getUser = async () => {
      const user = await getUserDetails();
      setUserData(user)
      const effectiveUserId = user?.id;
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
          setUserData(data);
          setProfileImage(data.user.profileUrl);
          setFirstName(data.user.firstName || '');
          setLastName(data.user.lastName || '');
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
          setDescription(data.user.introduction || '')
          setGender(data.user.gender || '');
        }
      } catch (error) {
        Sentry.captureException('Error fetching user data:', error);
      }

      try {
        const response = await fetch(`/api/update-tradeperson?id=${effectiveUserId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          if (data.data.info.companyName) {
            setIsCompanyOwner(true)
          }
          setPortfolioImages(data.data.info.portfolioUrls || []);
          setMapLink(data.data.info.maplink || '');
          setSelectedPortfolioFile(data.data.info.portfolioUrls || []);
          setCompanyLogo(data.data.info.companyLogoUrl || '');
          setCompanyLogoSelectedFile(data.data.info.companyLogoUrl || '');
          setBusinessYears(data.data.info.businessYears || '');
          setCompanyDescription(data.data.info.companyDescription || '');
          setCompanyEmail(data.data.info.companyEmail || '');
          setCompanyLocation(data.data.info.companyLocation || '');
          setCompanyName(data.data.info.companyName || '');
          setCompanyPhone(data.data.info.companyPhone || '');
          setCompanySize(data.data.info.companySize || '');
        }
      } catch (error) {
        Sentry.captureException('Error fetching user data:', error);
      }


    };

    getUser();
  }, []);

  const handleImageChange = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      // Check allowed formats
      if (!allowedFormats.includes(file.type)) {
        toast.warning('Only SVG, JPG, PNG and WEBP formats are allowed.', {
          position: "top-center",
        });
        return;
      }

      // Check maximum file size
      if (file.size > maxImageSize) {
        toast.warning('Maximum image size limit is 5MB.', {
          position: "top-center",
        });
        return;
      }

      // Generate a unique name for the file
      const uniqueFileName = `image_${Date.now()}${file.name.slice(file.name.lastIndexOf('.'))}`;
      const renamedFile = new File([file], uniqueFileName, { type: file.type });

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(renamedFile); // Set the renamed file
        setImage(reader.result);      // Set the image preview
        setIsChanged(true);
      };
      reader.readAsDataURL(renamedFile); // Read the renamed file for preview
    }
  };

  const handleCompanyImageChange = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      // Check allowed formats
      if (!allowedFormats.includes(file.type)) {
        toast.warning('Only SVG, JPG, PNG and WEBP formats are allowed.', {
          position: "top-center",
        });
        return;
      }

      // Check maximum file size
      if (file.size > maxImageSize) {
        toast.warning('Maximum image size limit is 5MB.', {
          position: "top-center",
        });
        return;
      }

      // Generate a unique name for the file
      const uniqueFileName = `image_${Date.now()}${file.name.slice(file.name.lastIndexOf('.'))}`;
      const renamedFile = new File([file], uniqueFileName, { type: file.type });

      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogoSelectedFile(renamedFile); // Set the renamed file
        setImage(reader.result);      // Set the image preview
        setIsChanged(true);
      };
      reader.readAsDataURL(renamedFile); // Read the renamed file for preview
    }
  };

  const handlePortfolioImageChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = [];


    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {

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
        newImages.push(reader.result);
        const uniqueFileName = `image_${Date.now()}${file.name.slice(file.name.lastIndexOf('.'))}`;
        const renamedFile = new File([file], uniqueFileName, { type: file.type });
        if (newImages.length === files.length) {
          setPortfolioImages((prevImages) => [...prevImages, ...newImages].slice(0, 10)); // Limit to 10 images
          setSelectedPortfolioFile((prevFile) => [...prevFile, renamedFile]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageClick = (ref) => {
    ref.current.click();
  };

  const handleRemovePortfolioImage = (index) => {
    setPortfolioImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setSelectedPortfolioFile((prevFile) => prevFile.filter((_, i) => i !== index));
    setIsChanged(true);
  };

  const handleSubmit = async () => {
    setisFormDirty(false);
    // localStorage.setItem("isFormDirty",false);
    const user = await getUserDetails();
    setUserData(user)
    const effectiveUserId = user?.id;
    if (!effectiveUserId) return;

    // event.preventDefault();
    setStatusMessage('');
    setStatusMessageSuccess('')
    setIsLoading(true);
    const formData = {
      id: effectiveUserId,
      firstName,
      lastName,
      mapLink,
      description,
      email,
      phone,
      profileUrl: profileImage,
      portfolioUrls: portfolioImages,
      companyLogoUrl: companyLogo,
      companyName,
      companyEmail,
      companyPhone,
      companyLocation,
      companySize,
      businessYears,
      companyDescription,
    };

    // Validation
    const errors = {};
    const wordCount = description.split(/\s+/).filter((word) => word.length > 0).length;
    if (wordCount > maxWords) {
      setStatusMessage('Maximum word limit reached in tradesperson description. Limit 500 Words');
      toast.warning('Description word limit is 500 words.', {
        position: "top-center",
      });
      setStatusMessageSuccess('')
      setIsLoading(false);
      return;
    } else if (!firstName || !lastName) {
      setStatusMessage('All fields are required.');
      toast.warning('All fields are required.', {
        position: "top-center",
      });
      setStatusMessageSuccess('')
      setIsLoading(false);
      return;
    }

    if (isCompanyOwner) {
      const wordCount = companyDescription.split(/\s+/).filter((word) => word.length > 0).length;
      if (wordCount > maxWords) {
        setStatusMessage('Maximum word limit reached in company description. Limit 500 Words');
        toast.warning('Description word limit is 500 words.', {
          position: "top-center",
        });
        setStatusMessageSuccess('')
        setIsLoading(false);
        return;
      } else
        if (!companyName || !companyEmail || !companyLocation || !companyDescription) {
          setStatusMessage('All company details are required.');
          toast.warning('All company details are required.', {
            position: "top-center",
          });
          setStatusMessageSuccess('')
          setIsLoading(false);
          return;
        } else {
          if (companyLocation) {
            const verifiedPostalCode = isValidUKPostalCode(companyLocation);
            if (!verifiedPostalCode) {
              toast.error('Postcode is not valid', {
                position: "top-center",
              });
              setIsLoading(false);
              return;
            }
          }
        }
    }

    try {
      // Update user profile
      const formDatas = new FormData();
      formDatas.append('id', effectiveUserId);
      formDatas.append('firstName', firstName);
      formDatas.append('lastName', lastName);
      formDatas.append('mapLink', mapLink);
      formDatas.append('profileUrl', profileImage); // If profileUrl is a URL or string
      formDatas.append('introduction', description);
      formDatas.append('gender', gender)
      if (selectedFile) {
        formDatas.append('file', selectedFile);  // Append the file object
      }
      const jwt = await getUserDetails();
      const userProfileResponse = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt?.token}`,
        },
        body: formDatas
      });

      const userProfileData = await userProfileResponse.json();
      if (!userProfileResponse.ok) {
        setStatusMessage(`Failed to update profile: ${userProfileData.message}`);
        setStatusMessageSuccess('')
        setIsLoading(false);
        return;
      }

      // 
      const formDataUpdated = new FormData();
      formDataUpdated.append('id', effectiveUserId);
      formDataUpdated.append('firstName', firstName);
      formDataUpdated.append('lastName', lastName);
      formDataUpdated.append('mapLink', mapLink);
      formDataUpdated.append('description', description);
      formDataUpdated.append('email', email);
      formDataUpdated.append('gender', gender);
      formDataUpdated.append('phone', phone);
      formDataUpdated.append('profileUrl', profileImage); // Ensure this is a valid URL or string
      formDataUpdated.append('companyName', companyName);
      formDataUpdated.append('companyEmail', companyEmail);
      formDataUpdated.append('companyPhone', companyPhone);
      formDataUpdated.append('companyLocation', companyLocation);
      formDataUpdated.append('companySize', companySize);
      formDataUpdated.append('businessYears', businessYears);
      formDataUpdated.append('companyDescription', companyDescription);

      if (selectedPortfolioFile && selectedPortfolioFile.length > 0) {
        selectedPortfolioFile.forEach((file, index) => {
          formDataUpdated.append(`portfolioUrls[${index}]`, file);
        });
      }

      if (selectedCompanyLogoFile) {
        formDataUpdated.append('companyLogoUrl', selectedCompanyLogoFile);  // Append the file object
      }
      // 

      // Update tradeperson info
      const tradepersonResponse = await fetch('/api/update-tradeperson-form', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${jwt?.token}`,
        },
        body: formDataUpdated,
      });
      const tradepersonData = await tradepersonResponse.json();
      if (tradepersonData.success) {
        toast.success('Information updated successfully.', {
          position: "top-center",
        });
        window.location.replace('/tradesperson/profile?tab=about')
        setStatusMessage('');
        setIsLoading(false);
      } else {
        toast.error('Failed to update tradeperson information.', {
          position: "top-center",
        });
        setStatusMessage('Failed to update tradeperson information.');
        setStatusMessageSuccess('')
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('Error updating profile. Please try again.', {
        position: "top-center",
      });
      setStatusMessageSuccess('')
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };


  const [counter, setCounter] = useState(60);
  const [OtpError, setOtpError] = useState('');
  const [otp, setOtp] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [canVarify, setCanVarify] = useState(false);
  const [isVarify, setIsVarify] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showOTPDialog, setShowOTPDialog] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resandLoading, setResandLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('gb');
  const [isOpenmin, setIsOpenmin] = useState(false);
  const otpSentRef = useRef(true);

  function isValidPhoneNumber(number, countryCode) {
    try {
      const phoneNumber = parsePhoneNumber(number, countryCode.toUpperCase());
      return phoneNumber.isValid();
    } catch (error) {
      return false;
    }
  }

  // Function to close the dialog
  const closeDialog = () => {
    setShowPhoneDialog(false);
    setShowOTPDialog(false);
    setDialogError('');
    setOtp('');
    setPhoneNumber('');
  };

  const sendOTP = async () => {
    setLoading(true);
    setResandLoading(true);
    const user = await getUserDetails();
    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}` }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setGeneratedCode(result.otp)
      setCanResend(false); // Disable resend button immediately
      setCounter(60); // Reset counter
      otpSentRef.current = true; // Mark OTP as sent
    } catch (error) {
      Sentry.captureException('Error sending OTP:', error);
      setOtpError('Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
      setResandLoading(false);
    }
  }
  const verifyOtp = async () => {
    const jwt = await getUserDetails();
    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt?.token}`,
        },
        body: JSON.stringify({ phoneNumber: `+${phoneNumber}`, otp }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      setOtpError('');
      return { status: 200 };
    } catch (error) {
      Sentry.captureException('Error verifying OTP:', error);
      setOtpError('Invalid OTP. Please try again.');
      return { status: 400 };
    }
  };
  // Function to handle phone number submission
  const handleSubmitphone = (e) => {
    e.preventDefault();
    if (phoneNumber == '' || phoneNumber == undefined) {
      setDialogError('Please Enter Phone Number.')
      return;
    } else if (!isValidPhoneNumber(phoneNumber, selectedCountry)) {
      setDialogError('Number is Not Valid.')
      return;
    } else {
      setDialogError('')
    }
    setLoading(true);
    setTimeout(async () => {
      await sendOTP();
      setLoading(false);
      openOTPModal(); // Close the dialog after sending otp
    }, 2000);
  };

  const openOTPModal = () => {
    setShowOTPDialog(true);
    setShowPhoneDialog(false);
  }


  const varifyPhone = async (otp) => {
    setLoading(true);
    const user = await getUserDetails();
    try {
      const verifyResponse = await verifyOtp(); // This should call your API
      setOtpError(''); // Clear any previous errors

      if (verifyResponse?.status === 200) {
        const response = await fetch('/api/update-number', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ userId: user?.id, phoneNumber: phoneNumber }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          setOtpError(result.message);
        } else {
          setIsVarify(true);
          setTimeout(async () => {
            window.location.reload();
            setShowOTPDialog(false);
          }, 2000);
        }
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (error) {
      setOtpError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const handleClick = () => {
    setIsOpenmin((prev) => !prev); // Toggle on click
  };

  // Resend OTP code
  const resendCode = useCallback(async () => {
    if (canResend) {
      await sendOTP();
      setOtp('');
      setCanResend(false); // Disable resend button immediately
      setCounter(60); // Reset counter
      setOtpError(''); // Clear previous errors
    }
  }, [canResend]);

  useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [counter]);

  useEffect(() => {
    if (otp.length === 6) {
      setCanVarify(true);
    } else {
      setCanVarify(false);
      setOtpError('');
    }
  }, [otp]);
  const [userIdp, setUserIdP] = useState('');
  const [pwdDefault, setPwdDefault] = useState(false);
  const [loadingp, setLoadingp] = useState(false);
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
      setUserIdP(effectiveUserId);
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
  }, [userIdp]);

  const handleCreatePassword = async () => {
    const user = await getUserDetails();
    const effectiveUserId = user?.id;
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
      setLoadingp(true)
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
          setLoadingp(false)
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setShowCreateDialog(false);
          setShowChangeDialog(false);
          setShowFinalPopup(true)
          setShowFinalPopupMessage('Your password has been created successfully.')
          setLoadingp(false)
        }
      } catch (error) {
        setLoadingp(false)
        setDialoagError(error.message)
      }
    }
  };

  const handleChangePassword = async () => {

    const user = await getUserDetails();
    const effectiveUserId = user?.id;
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
      setLoadingp(true)
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
          setLoadingp(false)
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setShowCreateDialog(false);
          setShowChangeDialog(false);
          setShowFinalPopup(true)
          setShowFinalPopupMessage('Your password has been changed successfully.')
          setLoadingp(false)
        }
      } catch (error) {
        setLoadingp(false)
        setDialoagError(error.message)
      }
    }
  };

  const closeDialogpwd = () => {
    setShowCreateDialog(false);
    setShowChangeDialog(false);
  };

  const closeFinalPopup = () => {
    setShowFinalPopup(false);
    window.location.reload();
  };

  const [showConfirmation, setShowConfirmation] = useState(false); // Show/hide confirmation dialog
  const [pendingAction, setPendingAction] = useState(null); // Track pending navigation action
  const router = useRouter();

  // Handle input changes and mark the form as dirty
  const handleInputChange = () => {
    setisFormDirty(true);
    // localStorage.setItem("isFormDirty",true);
  };

  // Function to handle navigation logic
  const handleRouteChange = (nextPath) => {
    if (isFormDirty) {
      setShowConfirmation(true);
      setPendingAction(() => () => router.push(nextPath)); // Store the route action
      return false; // Block navigation
    }
    return true; // Allow navigation
  };

  // Handle "Discard Changes" action
  const handleDiscardChanges = () => {
    setisFormDirty(false); // Reset dirty state
    setShowConfirmation(false); // Close confirmation dialog
    if (pendingAction) {
      pendingAction(); // Execute pending action
    }
  };

  // Handle "Keep Editing" action
  const handleKeepEditing = () => {
    setShowConfirmation(false);
  };

  // Intercept programmatic navigation
  useEffect(() => {
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (url, options) => {
      const shouldNavigate = handleRouteChange(url);
      if (shouldNavigate) {
        originalPush(url, options);
      }
    };

    router.replace = (url, options) => {
      const shouldNavigate = handleRouteChange(url);
      if (shouldNavigate) {
        originalReplace(url, options);
      }
    };

    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [isFormDirty, router]);
  return (
    <div className="space-y-8">

      <Dialog open={showFinalPopup} onOpenChange={closeFinalPopup} className="relative z-60">
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col text-center">
              <DialogTitle className="text-3xl">
                Thank You
              </DialogTitle>
              <DialogDescription className="text-sm ">
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
      <Dialog open={showCreateDialog} onOpenChange={closeDialogpwd} className="relative z-60">
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
                  className="mt-4 bg-accent w-full text-accent-foreground px-4 py-2 rounded-md hover:bg-primary hover:text-ink-inverse flex justify-center items-center"
                  disabled={loadingp}
                >
                  {loadingp ? <Spinner className="w-5 h-5" /> : 'Set Password'}
                </button>
                <span className="text-xs text-center text-destructive">{dialoagError}</span>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Change Password Dialog */}
      <Dialog open={showChangeDialog} onOpenChange={closeDialogpwd} className="relative z-60">
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
                  className="mt-8 bg-accent w-full text-accent-foreground px-4 py-2 rounded-md flex justify-center hover:bg-primary hover:text-ink-inverse items-center"
                  disabled={loadingp}
                >
                  {loadingp ? <Spinner className="w-5 h-5" /> : 'Change Password'}
                </button>
                <span className="text-xs text-center text-destructive">{dialoagError}</span>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Varified OTP Dialog */}
      <Dialog open={showOTPDialog} onOpenChange={closeDialog} className="relative z-60">
        <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <div className="flex flex-col items-center">
              {isVarify ?
                <>
                  <DialogTitle className="text-center font-semibold text-2xl">
                    Phone Number Is Verified
                  </DialogTitle>
                  <Image className='h-full w-40' src={CheckImage} alt='varifide' />
                  <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                    Successfully Verified Your Phone Number<br /> {'+' + phoneNumber}
                  </DialogDescription>
                </>
                :
                <>
                  <DialogTitle className="text-center font-semibold text-2xl">
                    OTP (One-Time Verification Password)
                  </DialogTitle>
                  <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                    Enter the 6-digit verification code sent to <br /> {'+' + phoneNumber}
                  </DialogDescription>
                  <div className="mt-4">
                    <InputOTP id='otpInput' maxLength={6} value={otp} onChange={setOtp}>
                      <InputOTPGroup>
                        {[0, 1, 2].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            onChange={(e) => {
                              const newOtp = otp.split('');
                              newOtp[index] = e.target.value;
                              setOtp(newOtp.join(''));
                            }}

                          />
                        ))}
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        {[3, 4, 5].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            onChange={(e) => {
                              const newOtp = otp.split('');
                              newOtp[index] = e.target.value;
                              setOtp(newOtp.join(''));
                            }}
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {OtpError && <p className="text-destructive mt-2">{OtpError}</p>}
                  <div className="w-full text-center mt-4 justifu-center item-center">
                    {resandLoading ?
                      <div style={{ marginLeft: 'auto', marginRight: 'auto' }} className=' w-full  text-center item-center'>
                        <span
                          style={{ justifyContent: 'center' }}
                          className="flex text-xs text-center item-center text-muted-foreground font-normal ml-auto cursor-pointer"
                        >
                          Didnâ€™t receive the code? <b>
                            <svg
                              style={{ marginTop: '2px', marginLeft: '10px' }}
                              className={`animate-spin h-3 w-3`}
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
                          </b>
                        </span>
                      </div>
                      :
                      <>
                        {OtpError ? '' :
                          <>
                            {canResend ? (
                              <span
                                className="text-xs text-center text-muted-foreground font-normal cursor-pointer"
                                onClick={resendCode}
                              >
                                Didnâ€™t receive the code? <b><u>Resend Code</u></b>
                              </span>
                            ) : (
                              <span className="text-xs text-center text-muted-foreground font-normal">
                                Resend code in {counter} seconds
                              </span>
                            )}
                          </>
                        }
                      </>
                    }
                  </div>
                  {OtpError ? '' :
                    <>
                      {canVarify ?
                        <button
                          type="button"
                          onClick={() => varifyPhone(otp)}
                          className="mt-4 w-full bg-accent text-accent-foreground font-semibold py-3 rounded-md flex hover:bg-primary hover:text-ink-inverse justify-center items-center"
                          disabled={loading}
                        >
                          {loading ? <Spinner className="w-5 h-5" /> : 'Verify'}
                        </button>
                        :
                        ''
                      }
                    </>
                  }
                </>}
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      {/* Phone Number Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={closeDialog} className="relative z-60">
        <DialogContent className="max-w-md mt-[-150px] md:mt-0 rounded-lg p-6 shadow-lg">
          <DialogHeader>
            <div className="flex flex-col items-center">
              <DialogTitle className="text-center font-semibold text-2xl">
                Your number is safe with us.
              </DialogTitle>
              <DialogDescription className="text-sm text-center mt-2 text-muted-foreground">
                Please provide a phone number that can receive text messages.
              </DialogDescription>
              <form onSubmit={handleSubmitphone} className="w-full mt-6">
                <div className="relative">
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-ink-soft">
                    Phone Number
                  </label>
                  <PhoneInput
                    className='py-2 rounded-lg bg-[hsl(var(--surface-subtle))]'
                    country={'gb'} // Default country set to the United Kingdom
                    value={phoneNumber}
                    onChange={(phone, country) => {
                      setSelectedCountry(country.countryCode)
                      setPhoneNumber(phone);
                      setDialogError('');
                    }}
                    inputStyle={{
                      width: '100%',
                      paddingLeft: '45px',
                      borderRadius: '8px',
                      border: '1px solid hsl(var(--surface-subtle))',
                      backgroundColor: 'hsl(var(--surface-subtle))',
                      fontSize: '18px',
                    }}
                    containerStyle={{
                      width: '100%',
                    }}
                    buttonStyle={{
                      background: 'hsl(var(--surface-subtle))',
                      border: '1px solid hsl(var(--surface-subtle))',
                      backgroundColor: 'hsl(var(--surface-subtle))',
                      borderRadius: '8px',
                    }}
                  />
                  {dialogError && (
                    <p className="text-xs text-destructive mt-2">{dialogError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full bg-accent text-accent-foreground font-semibold py-3 rounded-md flex justify-center items-center"
                  disabled={loading}
                >
                  {loading ? <Spinner className="w-5 h-5" /> : 'Continue'}
                </button>
              </form>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Custom Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={() => setShowConfirmation(false)} className="relative z-60">
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

      <form action={handleSubmit}>


        <section className=''>
          <h3 className="text-xl font-semibold">Your Details</h3>
          <span className="text-xs mb-4 block">The information you provide will be visible to customers seeking to hire a local tradesperson in their area.</span>

          <div className="mt-6 mb-6" >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              <div>
                {phone ?
                  <label className="block font-semibold text-sm font-medium text-success-soft-foreground">Your Phone Number is verified</label>
                  :
                  <label className="block font-semibold text-sm font-medium text-foreground">Phone Number</label>
                }

                <input

                  type="text"
                  name="phone"
                  value={phone ? phone : ''}
                  disabled
                  placeholder={"Click 'Add Phone Number' to enter contactÂ details"}
                  className="mt-1 block w-full py-4 px-3 text-xs bg-neutral-100 text-ink-muted border border-neutral-300 rounded-lg ring-neutral-400  order-gray-400 focus:ring-neutral-300 focus:border-neutral-300"
                />

                {phone ? '' :
                  <p className='text-sm mt-2'>Add your phone number to allow customers to contact you directly. <a onClick={() => { setShowPhoneDialog(true); handleClick() }} className='border-b border-accent font-bold cursor-pointer'>Add Phone Number</a> </p>
                }
                <p className='py-2 text-sm'><b>Note: </b> Adding your phone number to your profile will display a verification badge, increasing trust and encouraging customers to contact you for your services.</p>

              </div>

              <div>
                <label className="block font-semibold text-sm font-medium text-success-soft-foreground">Your email is verified</label>
                <input
                  type="text"
                  name="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full py-4 px-3 text-xs bg-neutral-100 text-ink-muted border border-neutral-300 rounded-lg ring-neutral-400  order-gray-400 focus:ring-neutral-300 focus:border-neutral-300"
                  placeholder="Email"
                />
              </div>
            </div>

            {pwdDefault ? (
              <p className='text-left mt-2 text-sm w-full' >Please add password to complete your profile!&nbsp;&nbsp;
                <b onClick={() => { setShowCreateDialog(true); handleClick() }} className='border-b border-accent cursor-pointer'>Create Password</b>
              </p>
            ) : (
              <p className='text-left mt-2 text-sm w-full' >Would you like to change your password?&nbsp;&nbsp;
                <b onClick={() => { setShowChangeDialog(true); handleClick() }} className='border-b border-accent cursor-pointer'> Change Password</b>
              </p>
            )}

          </div>

          <label className="block font-semibold text-sm font-medium text-ink-soft my-2">Profile Picture</label>
          <div className="flex items-left justify-left mb-6">
            <button type="button" onClick={() => handleImageClick(profileImageRef)} className="focus:outline-none relative group">
              <Image
                src={profileImage || editImage}
                alt="Profile Picture"
                className="rounded-full h-20 w-20 border-2 border-accent object-cover"
                width={96}
                height={96}
              />

              {/* Edit icon */}
              <Edit className="absolute bottom-0 right-0 bg-surface p-1 rounded-full text-accent opacity-0 opacity-100 transition-opacity duration-200 h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-sm font-medium text-ink-soft">First Name<b className='text-destructive'>*</b></label>
              <input
                type="text"
                name="firstName"
                required
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value), handleInputChange() }}
                className="mt-1 block w-full py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                placeholder="Enter Your First Name"
              />
            </div>
            <div>
              <label className="block font-semibold text-sm font-medium text-ink-soft">Last Name<b className='text-destructive'>*</b></label>
              <input
                type="text"
                name="lastName"
                required
                value={lastName}
                onChange={(e) => { setLastName(e.target.value), handleInputChange() }}
                className="mt-1 block w-full py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                placeholder="Enter Your Last Name"
              />
            </div>

          </div>
          <div className="grid grid-cols-1 gap-6 mt-6">
            <div>
              <label className="block font-semibold text-sm font-medium text-foreground">Your Introduction (Max 500 Words)<b className='text-destructive'>*</b></label>
              <textarea
                required
                name="description"
                value={description}
                onChange={(e) => (setDescription(e.target.value), handleInputChange())}
                rows={8}
                className="mt-1 block w-full py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                placeholder="Describe yourself here..."
              />
            </div>
          </div>
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            onChange={(e) => { handleImageChange(e, setProfileImage), handleInputChange() }}
            className="hidden"
            ref={profileImageRef}
          />
        </section>

        <section className='flex flex-col md:flex-row gap-6 gap-6' >
          <div className="flex flex-col items-start w-full md:w-1/2 gap-4 overflow-hidden rounded-md py-6">
            <h2 className="block font-semibold text-sm font-medium text-ink-soft">Google Map URL</h2>
            <div className="flex justify-around items-center gap-2 w-full">
              <input
                type="text"
                name="mapLink"
                value={mapLink}
                onChange={(e) => {
                  const value = e.target.value;
                  const match = value.match(/<iframe.*?src=["'](https:\/\/www\.google\.com\/maps\/embed\?[^"']+)["']/);
                  const extracted = match ? match[1] : value;
                  setMapLink(extracted);
                  handleInputChange();
                }}
                className="mt-1 block w-[90%] py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                placeholder="Enter Your Google Map URL"
              />
              <TooltipProvider >
                <Tooltip >
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer text-center border w-[5%] rounded-full hover:text-ink-soft bg-neutral-100 text-ink-strong border-neutral-100 ">
                      â„¹
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" align="center" className="max-w-xs">
                    Go to Google Maps â†’ click <strong>Share</strong> â†’ then <strong>Embed a map</strong> â†’ copy the iframe code or the src link and paste it here.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 overflow-hidden rounded-md py-6">
            <h2 className="font-semibold text-sm font-medium text-ink-soft">Select Your Gender</h2>

            <div className="flex items-center px-2 gap-4">
              {/* Male */}
              <div className="relative flex h-[40px] w-[40px] items-center justify-center">
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  id="male"
                  className="peer z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={() => setGender("Male")}
                  checked={gender === "Male"}
                />
                <div className="absolute h-full w-full rounded-full bg-info-soft p-4 shadow-sm shadow-[hsl(var(--shadow-strong))] ring-info duration-300 peer-checked:scale-110 peer-checked:ring-2"></div>
                <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-info-soft duration-500 peer-checked:scale-[500%]"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40px"
                  height="40px"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="absolute stroke-info"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M15.5631 16.1199C14.871 16.81 13.9885 17.2774 13.0288 17.462C12.0617 17.6492 11.0607 17.5459 10.1523 17.165C8.29113 16.3858 7.07347 14.5723 7.05656 12.5547C7.04683 11.0715 7.70821 9.66348 8.8559 8.72397C10.0036 7.78445 11.5145 7.4142 12.9666 7.71668C13.9237 7.9338 14.7953 8.42902 15.4718 9.14008C16.4206 10.0503 16.9696 11.2996 16.9985 12.6141C17.008 13.9276 16.491 15.1903 15.5631 16.1199Z"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                  <path
                    d="M14.9415 8.60977C14.6486 8.90266 14.6486 9.37754 14.9415 9.67043C15.2344 9.96332 15.7093 9.96332 16.0022 9.67043L14.9415 8.60977ZM18.9635 6.70907C19.2564 6.41617 19.2564 5.9413 18.9635 5.64841C18.6706 5.35551 18.1958 5.35551 17.9029 5.64841L18.9635 6.70907ZM16.0944 5.41461C15.6802 5.41211 15.3424 5.74586 15.3399 6.16007C15.3374 6.57428 15.6711 6.91208 16.0853 6.91458L16.0944 5.41461ZM18.4287 6.92872C18.8429 6.93122 19.1807 6.59747 19.1832 6.18326C19.1857 5.76906 18.8519 5.43125 18.4377 5.42875L18.4287 6.92872ZM19.1832 6.17421C19.1807 5.76001 18.8429 5.42625 18.4287 5.42875C18.0145 5.43125 17.6807 5.76906 17.6832 6.18326L19.1832 6.17421ZM17.6973 8.52662C17.6998 8.94082 18.0377 9.27458 18.4519 9.27208C18.8661 9.26958 19.1998 8.93177 19.1973 8.51756L17.6973 8.52662ZM16.0022 9.67043L18.9635 6.70907L17.9029 5.64841L14.9415 8.60977L16.0022 9.67043ZM16.0853 6.91458L18.4287 6.92872L18.4377 5.42875L16.0944 5.41461L16.0853 6.91458ZM17.6832 6.18326L17.6973 8.52662L19.1973 8.51756L19.1832 6.17421L17.6832 6.18326Z"
                  ></path>
                </svg>
              </div>

              {/* Female */}
              <div className="relative flex h-[40px] w-[40px] items-center justify-center">
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  id="female"
                  className="peer z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={() => setGender("Female")}
                  checked={gender === "Female"}
                />
                <div className="absolute h-full w-full rounded-full bg-warning-soft p-2 shadow-sm shadow-[hsl(var(--shadow-strong))] ring-warning duration-300 peer-checked:scale-110 peer-checked:ring-2"></div>
                <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-warning-soft duration-500 peer-checked:scale-[500%]"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30px"
                  height="30px"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="absolute fill-warning"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M20 9C20 13.0803 16.9453 16.4471 12.9981 16.9383C12.9994 16.9587 13 16.9793 13 17V19H14C14.5523 19 15 19.4477 15 20C15 20.5523 14.5523 21 14 21H13V22C13 22.5523 12.5523 23 12 23C11.4477 23 11 22.5523 11 22V21H10C9.44772 21 9 20.5523 9 20C9 19.4477 9.44772 19 10 19H11V17C11 16.9793 11.0006 16.9587 11.0019 16.9383C7.05466 16.4471 4 13.0803 4 9C4 4.58172 7.58172 1 12 1C16.4183 1 20 4.58172 20 9ZM6.00365 9C6.00365 12.3117 8.68831 14.9963 12 14.9963C15.3117 14.9963 17.9963 12.3117 17.9963 9C17.9963 5.68831 15.3117 3.00365 12 3.00365C8.68831 3.00365 6.00365 5.68831 6.00365 9Z"
                  ></path>
                </svg>
              </div>

              {/* Prefer not to say */}
              <div className="relative flex h-[40px] w-[40px] items-center justify-center">
                <input
                  type="radio"
                  name="gender"
                  value="Prefer not to say"
                  id="prefer-not"
                  className="peer z-10 h-full w-full cursor-pointer opacity-0"
                  onChange={() => setGender("Prefer not to say")}
                  checked={gender === "Prefer not to say"}
                />
                <div className="absolute h-full w-full rounded-full bg-neutral-100 p-2 shadow-sm shadow-[hsl(var(--shadow-strong))] ring-neutral-400 duration-300 peer-checked:scale-110 peer-checked:ring-2"></div>
                <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-neutral-200 duration-500 peer-checked:scale-[500%]"></div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40px"
                  height="40px"
                  viewBox="0 0 24 24"
                  fill="none"
                  class="absolute stroke-neutral-400"
                >
                  <path
                    id="Vector"
                    d="M8.19531 8.76498C8.42304 8.06326 8.84053 7.43829 9.40137 6.95899C9.96221 6.47968 10.6444 6.16501 11.373 6.0494C12.1017 5.9338 12.8486 6.02202 13.5303 6.3042C14.2119 6.58637 14.8016 7.05166 15.2354 7.64844C15.6691 8.24521 15.9295 8.95008 15.9875 9.68554C16.0455 10.421 15.8985 11.1581 15.5636 11.8154C15.2287 12.4728 14.7192 13.0251 14.0901 13.4106C13.4611 13.7961 12.7377 14.0002 12 14.0002V14.9998M12.0498 19V19.1L11.9502 19.1002V19H12.0498Z"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mt-4">Add Portfolio</h3>
          <span className="text-xs mb-4 block">Add your previous work to build trust for your customers. You can add up to 4 images.</span>
          <div className="flex flex-wrap gap-4 mb-6">
            {portfolioImages?.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image}
                  alt={`Portfolio Image ${index + 1}`}
                  className="rounded-md h-24 w-24 md:w-20 md:h-20 border-2 border-accent object-cover"
                  width={96}
                  height={96}
                />
                <button
                  type="button"
                  onClick={() => { handleRemovePortfolioImage(index), handleInputChange() }}
                  className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-1 text-xs"
                >
                  &times;
                </button>
              </div>
            ))}
            {portfolioImages.length < 10 && (
              <button
                type="button"
                onClick={() => { handleImageClick(portfolioImageRef), handleInputChange() }}
                className="flex items-center justify-center w-24 h-24 md:w-20 md:h-20 border-2 border-accent rounded-md text-neutral-600 bg-neutral-100"
              >
                +
              </button>
            )}
          </div>
          <input
            type="file"
            name="portfolioImages"
            accept="image/*"
            onChange={handlePortfolioImageChange}
            multiple
            className="hidden"
            ref={portfolioImageRef}
          />
        </section>

        <div className="flex items-center mb-6">
          <Label htmlFor="company_owner" className="font-semibold">Are you a company owner?&nbsp;&nbsp;</Label>
          <Switch id="company_owner" checked={isCompanyOwner} onCheckedChange={setIsCompanyOwner} />
        </div>

        {isCompanyOwner && (
          <section>
            <section>
              <h3 className="text-xl font-semibold mt-4">Company Name & Logo</h3>
              <span className="text-xs mb-4 block">This is the first thing customers will see when searching for professionals. As a sole-trader, you can just enter your name.</span>
              <label className="block font-semibold text-sm font-medium text-ink-soft my-2">Company Logo</label>
              <div className="flex items-left justify-left mb-6">
                <button type="button" onClick={() => { handleImageClick(companyLogoRef), handleInputChange() }} className="focus:outline-none relative group">
                  <Image
                    src={companyLogo || editImage}
                    alt="Company Logo"
                    className="rounded-full h-20 w-20 border-2 border-accent object-cover"
                    width={96}
                    height={96}
                  />
                  <Edit className="absolute bottom-0 right-0 bg-surface p-1 rounded-full text-accent opacity-0 opacity-100 transition-opacity duration-200 h-6 w-6" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block font-semibold text-sm font-medium text-ink-soft">Company Name<b className='text-destructive'>*</b></label>
                  <input
                    type="text"
                    name="companyName"
                    required={isCompanyOwner}
                    value={companyName}
                    onChange={(e) => { setCompanyName(e.target.value), handleInputChange() }}
                    className="mt-1 block w-full py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                    placeholder="Enter your company name"
                  />
                </div>
              </div>
              <input

                type="file"
                name="companyLogo"
                accept="image/*"
                onChange={(e) => { handleCompanyImageChange(e, setCompanyLogo), handleInputChange() }}
                className="hidden"
                ref={companyLogoRef}
              />
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">Company Contact Details</h3>
              <span className="text-xs mb-4 block">This information will be seen by customers on the platform.</span>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-sm font-medium text-ink-soft">Company Email<b className='text-destructive'>*</b></label>
                  <input
                    type="email"
                    name="companyEmail"
                    required={isCompanyOwner}
                    value={companyEmail}
                    onChange={(e) => { setCompanyEmail(e.target.value), handleInputChange() }}
                    className="mt-1 block w-full py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                    placeholder="Enter your company email address"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-sm font-medium text-ink-soft">Company Postcode<b className='text-destructive'>*</b></label>
                  <input
                    type="text"
                    name="companyLocation"
                    required={isCompanyOwner}
                    value={companyLocation}
                    onChange={(e) => { setCompanyLocation(e.target.value.toUpperCase()), handleInputChange() }}
                    className="mt-1 block w-full py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                    placeholder="Enter your company postcode"
                  />
                  <span className="block text-xs text-ink-soft">â“˜ This will not affect the areas where you offer or provide services.</span>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold mt-4">About Company</h3>
              <span className="text-xs mb-4 block">Introduce the company to your customers.</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-semibold text-sm font-medium text-ink-soft">Company Size</label>

                  <Select
                    value={companySizeOptions.find(option => option.value === companySize)}
                    onChange={(selectedOption) => { setCompanySize(selectedOption ? selectedOption.value : ''), handleInputChange() }}
                    options={companySizeOptions}
                    defaultValue={companySizeOptions[0]}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: 'hsl(var(--surface-soft))',
                        borderColor: 'hsl(var(--surface-soft))',
                        borderRadius: '0.5rem',
                        marginTop: '5px',
                        padding: '0.25rem',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: 'hsl(var(--neutral-300))',
                        },
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'hsl(var(--surface))',
                        color: 'hsl(var(--ink-strong))',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--accent))',
                          color: 'hsl(var(--surface))',
                        },
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: 'hsl(var(--ink-strong))',
                      }),
                    }}
                    placeholder="Select your company size"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sm font-medium text-ink-soft">Year Established</label>
                  <Select
                    value={companyYearOptions.find(option => option.value === businessYears)}
                    defaultValue={companyYearOptions[0]}
                    onChange={(selectedOption) => { setBusinessYears(selectedOption ? selectedOption.value : ''), handleInputChange() }}
                    options={companyYearOptions}
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        backgroundColor: 'hsl(var(--surface-soft))',
                        borderColor: 'hsl(var(--surface-soft))',
                        borderRadius: '0.5rem',
                        marginTop: '5px',
                        padding: '0.25rem',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: 'hsl(var(--neutral-300))',
                        },
                      }),
                      option: (provided, state) => ({
                        ...provided,
                        backgroundColor: state.isFocused ? 'hsl(var(--accent))' : 'hsl(var(--surface))',
                        color: 'hsl(var(--ink-strong))',
                        '&:hover': {
                          backgroundColor: 'hsl(var(--accent))',
                          color: 'hsl(var(--surface))',
                        },
                      }),
                      singleValue: (provided) => ({
                        ...provided,
                        color: 'hsl(var(--ink-strong))',
                      }),
                    }}
                    placeholder="Select your company year"
                  />

                </div>
              </div>
              <div className="grid grid-cols-1 gap-6 mt-6">
                <div>
                  <label className="block font-semibold text-sm font-medium text-foreground">About Your Company (Max 500 Words)<b className='text-destructive'>*</b></label>
                  <textarea
                    name="companyDescription"
                    required={isCompanyOwner}
                    value={companyDescription}
                    onChange={(e) => { setCompanyDescription(e.target.value), handleInputChange() }}
                    rows={8}
                    className="mt-1 block w-full py-3 px-3 text-sm bg-neutral-100 text-ink-strong border border-neutral-100 rounded-lg focus:ring-neutral-300 focus:border-neutral-300"
                    placeholder="Describe your company here..."
                  />
                </div>
              </div>
            </section>
          </section>
        )}
        <div className="flex justify-between">
        </div>

        <section className="flex justify-between w-full mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-accent-foreground font-semibold rounded-lg hover:bg-primary hover:text-ink-inverse transition duration-200"

            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : 'Save'}
          </button>
        </section>
      </form>
      <SocialMediaSection />


    </div>
  );
};

export default ProfileForm;
