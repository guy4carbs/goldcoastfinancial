import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState } from "react";
import { Shield, Lock, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { SecurityBadges } from "@/components/ui/security-badges";

// Heritage Life Solutions color palette
const c = {
  background: "#f5f0e8",
  primary: "#4f5a3f",
  primaryHover: "#3d4730",
  secondary: "#d4a05b",
  secondaryHover: "#c49149",
  muted: "#c8b6a6",
  textPrimary: "#333333",
  textSecondary: "#5c5347",
  accent: "#8b5a3c",
  cream: "#fffaf3",
  white: "#ffffff",
};

const formSchema = z.object({
  coverageType: z.string().min(1, "Please select a coverage type"),
  coverageAmount: z.string().min(1, "Please select a coverage amount"),
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number is required"),
  streetAddress: z.string().min(5, "Street address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  heightFeet: z.string().min(1, "Please select feet"),
  heightInches: z.string().min(1, "Please select inches"),
  weight: z.string().min(1, "Weight is required"),
  birthDate: z.string().min(1, "Birth date is required"),
  medicalBackground: z.string().min(1, "Please provide your medical background"),
});

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

export default function HeritageGetQuote() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const totalSteps = 4;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      coverageType: "term",
      coverageAmount: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      streetAddress: "",
      addressLine2: "",
      city: "",
      state: "",
      zipCode: "",
      heightFeet: "",
      heightInches: "",
      weight: "",
      birthDate: "",
      medicalBackground: "",
    },
  });

  const submitQuoteMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const submitData = {
        ...values,
        height: `${values.heightFeet}'${values.heightInches}"`,
      };
      const response = await fetch('/api/quote-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit quote request');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Quote Request Received!",
        description: "One of our advisors will contact you shortly with personalized options.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quote request. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitQuoteMutation.mutate(values);
  }

  const nextStep = async () => {
    if (step === 1) {
      const valid = await form.trigger(["coverageType", "coverageAmount"]);
      if (valid) setStep(2);
    } else if (step === 2) {
      const valid = await form.trigger(["firstName", "lastName", "email", "phone"]);
      if (valid) setStep(3);
    } else if (step === 3) {
      const valid = await form.trigger(["streetAddress", "city", "state", "zipCode"]);
      if (valid) setStep(4);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (isSubmitted) {
    return (
      <HeritageLayout>
        <div className="min-h-screen py-12 flex items-center justify-center" style={{ backgroundColor: c.background }}>
          <Card className="max-w-2xl w-full mx-4 text-center" style={{ backgroundColor: c.cream }}>
            <CardContent className="pt-12 pb-12">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${c.secondary}30` }}>
                <Leaf className="w-10 h-10" style={{ color: c.primary }} />
              </div>
              <h2 className="text-3xl font-bold font-serif mb-4" style={{ color: c.primary }}>Thank You!</h2>
              <p className="text-lg mb-8" style={{ color: c.textSecondary }}>
                Your quote request has been received. One of our advisors will contact you within 24 hours to discuss your personalized insurance options.
              </p>
              <Button onClick={() => window.location.href = '/heritage'} style={{ backgroundColor: c.primary, color: c.white }}>
                Return to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </HeritageLayout>
    );
  }

  return (
    <HeritageLayout>
      <div className="min-h-screen py-12" style={{ backgroundColor: c.background }}>
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-serif mb-2" style={{ color: c.primary }}>Get Your Free Quote</h1>
            <p style={{ color: c.textSecondary }}>Compare rates from top-rated carriers in minutes. No obligation.</p>
          </div>

          <Card className="shadow-xl" style={{ backgroundColor: c.cream, borderTop: `4px solid ${c.secondary}` }}>
            <CardHeader className="border-b pb-6" style={{ backgroundColor: c.white }}>
              <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2 text-sm font-medium" style={{ color: c.textSecondary }}>
                   <Lock className="w-4 h-4" /> Secure Form
                 </div>
                 <div className="text-sm font-medium" style={{ color: c.textSecondary }}>Step {step} of {totalSteps}</div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: c.muted }}>
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / totalSteps) * 100}%`, backgroundColor: c.secondary }}
                />
              </div>
            </CardHeader>
            <CardContent className="pt-8 pb-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <FormField
                        control={form.control}
                        name="coverageType"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-lg font-semibold" style={{ color: c.primary }}>What type of coverage are you interested in?</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid md:grid-cols-2 gap-4"
                              >
                                {[
                                  { value: "term", label: "Mortgage Protection", desc: "Protect your home & family" },
                                  { value: "whole", label: "Whole Life", desc: "Permanent coverage, cash value" },
                                  { value: "universal", label: "IUL", desc: "Index-linked growth & flexibility" },
                                  { value: "final", label: "Final Expense", desc: "Cover end-of-life costs" },
                                  { value: "unsure", label: "I'm Not Sure", desc: "Help me decide" },
                                ].map((option) => (
                                  <FormItem key={option.value}>
                                    <FormControl>
                                      <RadioGroupItem value={option.value} className="peer sr-only" />
                                    </FormControl>
                                    <FormLabel
                                      className="flex flex-col items-center justify-between rounded-md border-2 bg-transparent p-4 hover:bg-opacity-5 peer-data-[state=checked]:border-opacity-100 cursor-pointer transition-all"
                                      style={{
                                        borderColor: field.value === option.value ? c.primary : c.muted,
                                        backgroundColor: field.value === option.value ? `${c.primary}08` : 'transparent'
                                      }}
                                    >
                                      <span className="text-lg font-bold mb-1" style={{ color: c.textPrimary }}>{option.label}</span>
                                      <span className="text-xs" style={{ color: c.textSecondary }}>{option.desc}</span>
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="coverageAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold" style={{ color: c.primary }}>Desired Coverage Amount</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 text-lg">
                                  <SelectValue placeholder="Select an amount" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="10000">$10,000</SelectItem>
                                <SelectItem value="25000">$25,000</SelectItem>
                                <SelectItem value="50000">$50,000</SelectItem>
                                <SelectItem value="100000">$100,000</SelectItem>
                                <SelectItem value="250000">$250,000</SelectItem>
                                <SelectItem value="500000">$500,000</SelectItem>
                                <SelectItem value="750000">$750,000</SelectItem>
                                <SelectItem value="1000000">$1,000,000</SelectItem>
                                <SelectItem value="2000000">$2,000,000+</SelectItem>
                                <SelectItem value="unsure">I'm not sure yet</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="button" size="lg" className="w-full h-12 text-lg" onClick={nextStep} style={{ backgroundColor: c.primary, color: c.white }}>
                        Continue
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <h3 className="text-lg font-semibold" style={{ color: c.primary }}>Your Contact Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>Email Address</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="john@example.com" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>Phone Number</FormLabel>
                              <FormControl>
                                <Input type="tel" placeholder="(555) 123-4567" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button type="button" variant="outline" className="flex-1 h-12" onClick={prevStep} style={{ borderColor: c.primary, color: c.primary }}>
                          Back
                        </Button>
                        <Button type="button" className="flex-[2] h-12" onClick={nextStep} style={{ backgroundColor: c.primary, color: c.white }}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <h3 className="text-lg font-semibold" style={{ color: c.primary }}>Your Address</h3>

                      <FormField
                        control={form.control}
                        name="streetAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: c.textPrimary }}>Street Address</FormLabel>
                            <FormControl>
                              <Input placeholder="123 Main Street" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="addressLine2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: c.textPrimary }}>Apt, Suite, Unit, PO Box (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Apt 4B, Suite 200, PO Box 123" className="h-12" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>City</FormLabel>
                              <FormControl>
                                <Input placeholder="Naperville" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>State</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select state" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {US_STATES.map((state) => (
                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>Zip Code</FormLabel>
                              <FormControl>
                                <Input placeholder="60563" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex gap-4">
                        <Button type="button" variant="outline" className="flex-1 h-12" onClick={prevStep} style={{ borderColor: c.primary, color: c.primary }}>
                          Back
                        </Button>
                        <Button type="button" className="flex-[2] h-12" onClick={nextStep} style={{ backgroundColor: c.primary, color: c.white }}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                      <h3 className="text-lg font-semibold" style={{ color: c.primary }}>Health Information</h3>

                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" style={{ color: c.textPrimary }}>Height</label>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="heightFeet"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12">
                                      <SelectValue placeholder="Feet" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[3, 4, 5, 6, 7].map((ft) => (
                                      <SelectItem key={ft} value={ft.toString()}>{ft} ft</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="heightInches"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-12">
                                      <SelectValue placeholder="Inches" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inch) => (
                                      <SelectItem key={inch} value={inch.toString()}>{inch} in</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>Weight (lbs)</FormLabel>
                              <FormControl>
                                <Input placeholder="175" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="birthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>Date of Birth</FormLabel>
                              <FormControl>
                                <Input type="date" className="h-12" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="medicalBackground"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: c.textPrimary }}>Medical & Prescription Background</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Please describe any medical conditions, surgeries, or prescriptions you currently have or have had in the past. This helps us find the best rates for you."
                                className="min-h-[150px] resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-4">
                        <Button type="button" variant="outline" className="flex-1 h-12" onClick={prevStep} style={{ borderColor: c.primary, color: c.primary }}>
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-[2] h-12 font-bold"
                          style={{ backgroundColor: c.secondary, color: c.textPrimary }}
                          disabled={submitQuoteMutation.isPending}
                        >
                          {submitQuoteMutation.isPending ? "Submitting..." : "Get My Quote"}
                        </Button>
                      </div>

                      <p className="text-xs text-center mt-4" style={{ color: c.textSecondary }}>
                        By submitting this form, you agree to our Privacy Policy. Your information is secure and will only be used to provide you with insurance quotes.
                      </p>

                      <SecurityBadges />
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </HeritageLayout>
  );
}
