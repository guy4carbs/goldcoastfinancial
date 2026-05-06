import { z } from "zod";

export const accountSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "8+ characters").regex(/[A-Z]/, "Need uppercase").regex(/[a-z]/, "Need lowercase").regex(/[0-9]/, "Need number"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

export const personalSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  dateOfBirth: z.string().min(1, "Required"),
  ssn: z.string().min(9, "Valid SSN required"),
  phone: z.string().min(10, "Valid phone required"),
});

export const addressSchema = z.object({
  streetAddress: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().length(2, "Select a state"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Valid ZIP required"),
});

export const professionalSchema = z.object({
  npn: z.string().optional(),
  isLicensed: z.enum(["yes", "no", "in_progress"]),
  yearsExperience: z.string().min(1, "Required"),
});

export const bankingSchema = z.object({
  bankName: z.string().min(1, "Required"),
  bankAccountType: z.string().min(1, "Required"),
  routingNumber: z.string().regex(/^\d{9}$/, "9-digit routing number"),
  accountNumber: z.string().min(4, "Valid account number required"),
});

export const eoSchema = z.object({
  eoProvider: z.string().min(1, "Required"),
  eoPolicyNumber: z.string().min(1, "Required"),
  eoEffectiveDate: z.string().min(1, "Required"),
  eoExpirationDate: z.string().min(1, "Required"),
  eoCoverageAmount: z.string().min(1, "Required"),
});

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];
