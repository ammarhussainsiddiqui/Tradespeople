"use client";
import { useState, useEffect } from "react";
import { ChevronDown, MapPin, Mail } from "lucide-react";
import "./barstyle.css";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { toast } from "react-toastify";
import { generateToken, isValidUKPostalCode } from '../../utils/functions'
import { updatedAreaSegments } from "../../actions/auth";
import Link from "next/link";
import * as Sentry from '@sentry/nextjs';
import { useGlobalState } from '../../app/context/GlobalStateContext';
const SignupForm = () => {
  const router = useRouter();

  const [distance, setDistance] = useState(10);
  const [background, setBackground] = useState("");
  const [options, setOptions] = useState([]);
  const [formData, setFormData] = useState({
    trade: "",
    email: "",
    area: ""
  });
  const [errors, setErrors] = useState({});
  const { emailFlag, setEmailFlag, updateFlag, setupdateFlag } = useGlobalState();
  useEffect(() => {
    setBackground(
      `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${(distance / 45) * 100
      }%, hsl(var(--surface-soft)) ${(distance / 45) * 100}%, hsl(var(--surface-soft)) 100%)`
    );
  }, [distance]);

  const validate = () => {
    const newErrors = {};
    if (!formData.trade) {
      newErrors.trade = "Trade is required";
    }

    if (!formData.area) {
      newErrors.area = "Area is required";
    }

    if (formData.postcode) {
      const resultUkPostCode = isValidUKPostalCode(formData?.postcode);
      if (!resultUkPostCode) {
        newErrors.postcode = "Postcode is not valid";
      }
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    return newErrors;
  };

  const [areas, setAreas] = useState([]);
  useEffect(() => {
    const getAreas = async () => {
      try {
        const areasData = await updatedAreaSegments();
        const sortedAreas = areasData.sort((a, b) =>
          a.label.localeCompare(b.label)
        );

        setAreas(sortedAreas);
      } catch (error) {
      }
    };

    getAreas();
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await generateToken();
    const checkExistingUser = await fetch("/api/check-existing-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`,
      },
      cache: "no-cache",
      body: JSON.stringify({
        email: formData.email.toLowerCase(),
      }),
    });

    const checkExistingUserResult = await checkExistingUser.json();

    if (checkExistingUserResult?.success === "exist") {
      toast.info('User already exists, Please Login', {
        position: "top-center",
      });
      setupdateFlag(false)
      setEmailFlag(null)
      return;
    } else if (checkExistingUserResult?.success === "true") {
      toast.info('User already exists, Please Login', {
        position: "top-center",
      });
      setupdateFlag(false)
      setEmailFlag(null)
      return;
    } else if (checkExistingUserResult?.success === "false") {
      setupdateFlag(false)
      setEmailFlag(null)
      const validationErrors = validate();
      if (Object.keys(validationErrors).length === 0) {
        router.push(
          `/login/join-tradesperson/varify-email?trade=${formData.trade}&postcode=${formData.area}&email=${formData.email}&distance=${distance}`
        );
      } else {
        setErrors(validationErrors);
      }
    }
  };

  const handleChange = (selectedOption) => {
    setErrors('')
    setFormData({
      ...formData,
      trade: selectedOption ? selectedOption.label : "",
    });
  };

  const handleChangeArea = (selectedOption) => {
    setErrors('')
    setFormData({
      ...formData,
      area: selectedOption ? selectedOption.label : "",
    });
  };

  useEffect(() => {
    const getLeads = async () => {
      try {
        const response = await fetch(`/api/main-trade`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        if (data.success) {
          const tradeOptions = data.services.map((service) => ({
            value: service.id,
            label: service.type,
          }));
          setOptions(tradeOptions);
        }
      } catch (error) {
        Sentry.captureException("Error fetching user data:", error);
      }
    };

    getLeads();
  }, []);

  return (
    <div className="bg-surface rounded-3xl p-6 shadow-md w-full">
      <h2 className="text-2xl font-bold mb-6">
        Find local trade work
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="trade"
            className="block text-md font-bold text-ink-soft"
          >
            What is your main trade?
          </label>
          <label
            htmlFor="trade"
            className="block text-sm font-medium text-ink-soft"
          >
            You can add multiple trades after signing up in the leads settings.
          </label>

          <div className="relative mt-1 hidden md:block">
            <Select
              value={options.find((option) => option.label === formData.trade)}
              onChange={handleChange}
              options={options}
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
              placeholder="Select your trade"
            />
            {errors.trade && (
              <p className="text-destructive text-sm mt-1">{errors.trade}</p>
            )}
          </div>
          <div className="relative mt-1 block md:hidden">
            <select
              value={formData.trade}
              onChange={(e) => {
                setErrors('')
                setFormData({
                  ...formData,
                  trade: e.target.value,
                });
              }}
              className="hjmDlo"
              placeholder="Select your trade"
            >
              <option value="" disabled>
                Select your trade
              </option>
              {options.map((option) => (
                <option key={option.value} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.trade && (
              <p className="text-destructive text-sm mt-1">{errors.trade}</p>
            )}
          </div>

        </div>

        <div className="mb-4">
          <label
            htmlFor="area"
            className="block text-md font-bold text-ink-soft"
          >
            What is your trade area?
          </label>
          <label
            htmlFor="area"
            className="block text-sm font-medium text-ink-soft"
          >
            Once signed up, you’ll be able to add multiple trade areas in the leads settings. When selecting Central London as your trade area all postcodes within the Central London borough are included.
          </label>

          <div className="relative mt-1 hidden md:block">
            <Select
              value={areas.find((option) => option.label === formData.area)}
              onChange={handleChangeArea}
              options={areas}
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
          <div className="relative mt-1  block md:hidden" >
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
              placeholder="Select your area"
            >
              <option value="" disabled>
                Select your area
              </option>
              {areas.map((area) => (
                <option key={area.value} value={area.label}>
                  {area.label}
                </option>
              ))}
            </select>
            {errors.area && (
              <p className="text-destructive text-sm mt-1">{errors.area}</p>
            )}
          </div>

        </div>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="block text-md font-bold text-ink-soft"
          >
            Your email
          </label>
          <div className="relative mt-1">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value.toLowerCase() }), setErrors('')
              }
              }
              className="imcTPj"
              placeholder="Email"
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div className="flex items-start text-sm mb-4 space-x-2">
          <input
            type="checkbox"
            id="terms-conditions"
            name="terms-conditions"
            value="Boat"
            required
            className="mt-1"
          />
          <label htmlFor="terms-conditions" className="leading-relaxed">
            <p>
              Do you agree to our{" "}
              <a
                href="https://tradepeople.co.uk/terms-and-conditions/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-b-2 font-bold border-accent"
              >
                Terms and Conditions
              </a>
              ? For information on how we process your data, see our{" "}
              <a
                href="https://tradepeople.co.uk/privacy-policy/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-b-2 font-bold border-accent"
              >
                Privacy Policy
              </a>.
            </p>
          </label>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-accent text-accent-foreground font-semibold rounded-lg shadow-md hover:bg-primary hover:text-ink-inverse focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-75"
        >
          Sign Up
        </button>

      </form>
      <p className="mt-2 text-center">
        Already have an account? <Link href="/login" className="text-foreground border-b-2 border-accent font-bold">Log in</Link>
      </p>

    </div>
  );
};

export default SignupForm;
