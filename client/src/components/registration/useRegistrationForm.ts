import { useState, useCallback, useEffect } from "react";

const STORAGE_KEY = "heritage-registration-form";

export interface RegistrationFormData {
  // Step 1: Credentials
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2: Personal
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  // Step 3: Address
  streetAddress: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  // Step 4: Professional
  isLicensed: string;
  licenseNumber: string;
  licensedStates: string[];
  yearsExperience: string;
  previousAgency: string;
  npn: string;
  // Step 5: Motivation
  interestedProducts: string[];
  whyJoinHeritage: string;
  referralSource: string;
  referringAgentName: string;
  // Step 6: Consent
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
}

const defaultFormData: RegistrationFormData = {
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  phone: "",
  dateOfBirth: "",
  streetAddress: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  isLicensed: "",
  licenseNumber: "",
  licensedStates: [],
  yearsExperience: "",
  previousAgency: "",
  npn: "",
  interestedProducts: [],
  whyJoinHeritage: "",
  referralSource: "",
  referringAgentName: "",
  agreedToTerms: false,
  agreedToPrivacy: false,
};

export type StepErrors = Record<string, string>;

function loadFromSession(): RegistrationFormData {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Never restore passwords from session
      return { ...defaultFormData, ...parsed, password: "", confirmPassword: "" };
    }
  } catch {}
  return { ...defaultFormData };
}

function saveToSession(data: RegistrationFormData) {
  try {
    // Don't store passwords
    const { password, confirmPassword, ...safe } = data;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
  } catch {}
}

export function clearRegistrationSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function useRegistrationForm() {
  const [formData, setFormData] = useState<RegistrationFormData>(loadFromSession);
  const [errors, setErrors] = useState<StepErrors>({});

  useEffect(() => {
    saveToSession(formData);
  }, [formData]);

  const updateField = useCallback(<K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: StepErrors = {};

    switch (step) {
      case 1: {
        if (!formData.firstName) newErrors.firstName = "First name is required";
        if (!formData.lastName) newErrors.lastName = "Last name is required";
        if (!formData.phone) newErrors.phone = "Phone number is required";
        else if (formData.phone.replace(/\D/g, "").length < 10)
          newErrors.phone = "Valid phone number required";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
        else {
          const dob = new Date(formData.dateOfBirth);
          const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
          if (age < 18) newErrors.dateOfBirth = "You must be at least 18 years old";
        }
        break;
      }
      case 2: {
        if (!formData.email) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          newErrors.email = "Please enter a valid email";
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 8)
          newErrors.password = "Must be at least 8 characters";
        else if (!/[A-Z]/.test(formData.password))
          newErrors.password = "Must contain an uppercase letter";
        else if (!/[a-z]/.test(formData.password))
          newErrors.password = "Must contain a lowercase letter";
        else if (!/[0-9]/.test(formData.password))
          newErrors.password = "Must contain a number";
        if (!formData.confirmPassword)
          newErrors.confirmPassword = "Please confirm your password";
        else if (formData.password !== formData.confirmPassword)
          newErrors.confirmPassword = "Passwords do not match";
        break;
      }
      case 3: {
        if (!formData.streetAddress) newErrors.streetAddress = "Street address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.zipCode) newErrors.zipCode = "ZIP code is required";
        else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode))
          newErrors.zipCode = "Enter a valid 5-digit ZIP code";
        break;
      }
      case 4: {
        if (!formData.isLicensed) newErrors.isLicensed = "Please select your license status";
        if (!formData.yearsExperience)
          newErrors.yearsExperience = "Please select your experience level";
        break;
      }
      case 5: {
        if (!formData.whyJoinHeritage)
          newErrors.whyJoinHeritage = "This field is required";
        else if (formData.whyJoinHeritage.length < 50)
          newErrors.whyJoinHeritage = `Please write at least 50 characters (${formData.whyJoinHeritage.length}/50)`;
        if (!formData.referralSource)
          newErrors.referralSource = "Please tell us how you heard about us";
        break;
      }
      case 6: {
        if (!formData.agreedToTerms)
          newErrors.agreedToTerms = "You must agree to the Terms of Service";
        if (!formData.agreedToPrivacy)
          newErrors.agreedToPrivacy = "You must agree to the Privacy Policy";
        break;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    updateField,
    validateStep,
    errors,
    setErrors,
  };
}
