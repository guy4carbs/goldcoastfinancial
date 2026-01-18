import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Shield, Users, TrendingUp, Heart, Building2,
  Briefcase, GraduationCap, Clock, DollarSign, MapPin,
  ChevronRight, Upload, Loader2, CheckCircle2,
  FileText, Video, UserCheck, Calendar, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const applicationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  position: z.string().min(1, "Please select a position"),
  linkedIn: z.string().optional(),
  experience: z.string().min(1, "Please describe your experience"),
  whyJoinUs: z.string().min(20, "Please tell us why you want to join (at least 20 characters)"),
  hasLicense: z.boolean().optional(),
  consent: z.boolean().refine((val) => val === true, { message: "You must agree to the privacy policy" }),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const cultureValues = [
  {
    icon: Shield,
    title: "Independent Model",
    description: "Access to 40+ A-rated carriers. Offer clients the best solutions, not just one company's products."
  },
  {
    icon: Users,
    title: "Supportive Team Culture",
    description: "Work alongside experienced professionals who genuinely want to see you succeed."
  },
  {
    icon: GraduationCap,
    title: "Professional Development",
    description: "Ongoing training, mentorship, and resources to help you grow your skills and career."
  },
  {
    icon: Heart,
    title: "People-Centered",
    description: "Our people are our greatest asset. We invest in growth, well-being, and professional development."
  }
];

const benefits = [
  "Competitive compensation packages",
  "Performance-based bonuses",
  "Flexible work arrangements",
  "Professional development budget",
  "Work-life balance",
  "Nationwide impact",
  "Mentorship programs",
  "Career advancement opportunities"
];

const openPositions = [
  {
    id: "life-insurance-agent",
    title: "Life Insurance Agent",
    department: "Sales",
    location: "Naperville, IL / Remote",
    type: "Full-time",
    description: "Join our team as a licensed life insurance agent, helping families and businesses secure their financial futures. You'll have access to our portfolio of 40+ carriers and comprehensive training to build a rewarding career in financial services.",
    requirements: [
      "Illinois Life Insurance License (or willingness to obtain)",
      "Strong communication and interpersonal skills",
      "Self-motivated with a passion for helping others",
      "No prior experience required – we provide full training",
      "In-office preferred; remote options available via Zoom"
    ]
  },
  {
    id: "sales-associate",
    title: "Sales Associate",
    department: "Sales Support",
    location: "Naperville, IL / Remote",
    type: "Full-time / Part-time",
    description: "Support our sales team by generating leads, scheduling appointments, and assisting with client communications. This is an excellent entry point into the insurance industry with significant growth potential.",
    requirements: [
      "Strong phone and written communication skills",
      "Eager to learn and grow in the insurance industry",
      "Proficiency with CRM systems and basic technology",
      "No prior experience required – training provided",
      "In-office preferred; remote options available via Zoom"
    ]
  },
  {
    id: "financial-advisor",
    title: "Financial Advisor",
    department: "Wealth Management",
    location: "Naperville, IL / Remote",
    type: "Full-time",
    description: "Provide comprehensive financial planning services including life insurance, retirement planning, and wealth protection strategies. Work with high-net-worth clients to develop customized solutions for their unique needs.",
    requirements: [
      "Series 65 or CFP designation preferred",
      "Life and Health Insurance License preferred",
      "Experience in financial services a plus but not required",
      "Strong analytical and planning skills",
      "Excellent client relationship management abilities"
    ]
  },
  {
    id: "marketing-coordinator",
    title: "Marketing Coordinator",
    department: "Marketing",
    location: "Naperville, IL / Remote",
    type: "Full-time / Part-time",
    description: "Drive our brand presence through digital marketing, social media management, and advertising campaigns. Help us reach more families who need protection through creative and data-driven marketing strategies.",
    requirements: [
      "Experience with social media platforms and content creation",
      "Basic graphic design or video editing skills a plus",
      "Knowledge of digital advertising platforms (Meta, Google)",
      "Creative thinker with strong attention to detail",
      "No prior insurance experience required"
    ]
  },
  {
    id: "media-specialist",
    title: "Media & Content Specialist",
    department: "Creative",
    location: "Naperville, IL / Remote",
    type: "Full-time / Part-time",
    description: "Create engaging content for our digital channels including video, graphics, and written materials. Support our advertising and lead generation efforts with compelling visual storytelling.",
    requirements: [
      "Skills in video production, photography, or graphic design",
      "Familiarity with advertising platforms (Meta, Google, etc.)",
      "Strong creative and storytelling abilities",
      "Portfolio demonstrating relevant work",
      "Self-starter who can manage multiple projects"
    ]
  },
  {
    id: "administrative-assistant",
    title: "Administrative Assistant",
    department: "Operations",
    location: "Naperville, IL / Remote",
    type: "Full-time / Part-time",
    description: "Provide essential support to our team with scheduling, data entry, client communications, and office operations. Keep our agency running smoothly and contribute to our culture of excellence.",
    requirements: [
      "Strong organizational and time management skills",
      "Proficiency with Microsoft Office or Google Workspace",
      "Professional phone and email communication",
      "Attention to detail and accuracy",
      "In-office preferred; remote options available via Zoom"
    ]
  }
];

const processSteps = [
  {
    number: 1,
    icon: FileText,
    title: "Apply & Book",
    description: "Fill out the application form and schedule a 30-minute intro call with our team."
  },
  {
    number: 2,
    icon: Video,
    title: "Intro Call",
    description: "Connect with us to discuss the opportunity, learn about our culture, and see if we're a good fit for each other."
  },
  {
    number: 3,
    icon: UserCheck,
    title: "Final Interview",
    description: "If there's mutual interest and you're in the Chicagoland area, visit our Naperville office to meet the team in person."
  }
];

export default function Careers() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
      linkedIn: "",
      experience: "",
      whyJoinUs: "",
      hasLicense: false,
      consent: false,
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: ApplicationFormData & { resumeFileName?: string }) => {
      const response = await fetch('/api/job-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit application');
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Application Submitted",
        description: "Thank you for your interest. We'll be in touch within 2-3 business days.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please try again or email us directly at applications@goldcoastfnl.com",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ApplicationFormData) => {
    submitMutation.mutate({
      ...data,
      resumeFileName: resumeFile?.name
    });
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a resume under 5MB",
          variant: "destructive",
        });
        return;
      }
      setResumeFile(file);
    }
  };

  const scrollToForm = () => {
    document.getElementById('application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-secondary/5 skew-x-12 transform translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent" />

        <motion.div
          className="container mx-auto px-4 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-secondary rounded-full" />
              <span className="text-secondary font-medium tracking-wide uppercase text-sm">Careers</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight mb-6 text-white">
              Build a Rewarding Career Protecting Families
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 font-light leading-relaxed">
              Join Naperville's trusted independent life insurance agency. We're seeking passionate professionals who want competitive pay, real growth opportunities, and meaningful impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={scrollToForm}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-lg px-8 py-6 font-semibold shadow-lg"
              >
                Apply Now <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                onClick={() => document.getElementById('positions')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Open Positions
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Culture & Values */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Our Culture</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mt-2">
              A Culture Built on Success
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              We're building something meaningful—a company where talented people can do their best work.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cultureValues.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-muted">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <value.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-serif font-bold text-lg text-primary mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-secondary font-medium tracking-wide uppercase text-sm">Benefits & Perks</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mt-2 mb-6">
                Comprehensive Benefits That Support Your Success
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We offer competitive compensation and benefits designed to support our team members. Our benefits reflect our commitment to your growth, well-being, and long-term success.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="positions" className="py-16 md:py-24 bg-white scroll-mt-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Open Positions</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mt-2">
              Current Opportunities
            </h2>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {openPositions.map((position, index) => (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          <h3 className="text-lg font-serif font-bold text-primary">{position.title}</h3>
                        </div>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {position.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {position.type}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={scrollToForm}
                        className="bg-primary hover:bg-primary/90 shrink-0"
                      >
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">{position.description}</p>

                    {/* Requirements */}
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-3">Requirements</h4>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {position.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Application Process</span>
            <h2 className="text-3xl md:text-4xl font-bold font-serif mt-2">
              What to Expect
            </h2>
            <p className="text-white/80 mt-4 max-w-xl mx-auto">
              We value your time. Our process is quick, transparent, and respectful.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.number}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="relative inline-block mb-4">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                    <step.icon className="w-8 h-8 text-black" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary font-bold">
                    {step.number}
                  </div>
                </div>
                <h3 className="font-serif font-bold text-xl mb-2">{step.title}</h3>
                <p className="text-white/70 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="application-form" className="py-16 md:py-24 bg-white scroll-mt-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-10">
              <span className="text-secondary font-medium tracking-wide uppercase text-sm">Step 1</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mt-2">
                Submit Your Application
              </h2>
              <p className="text-muted-foreground mt-4">
                Complete the form below, then you'll be able to book your intro call with our team.
              </p>
            </div>

            {submitted ? (
              <motion.div
                className="text-center p-10 bg-muted/30 rounded-xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <span className="text-secondary font-medium tracking-wide uppercase text-sm">Step 2</span>
                <h3 className="font-serif font-bold text-2xl text-primary mt-2 mb-2">Now Book Your Call</h3>
                <p className="text-muted-foreground mb-6">
                  Your application has been received! Complete your application by scheduling a 30-minute intro call with our team.
                </p>
                <a
                  href="https://calendly.com/applications-goldcoastfnl/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white text-lg px-8">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Your 30-Minute Call
                  </Button>
                </a>
                <p className="text-sm text-muted-foreground mt-6">
                  Questions? Email us at{" "}
                  <a href="mailto:applications@goldcoastfnl.com" className="text-primary hover:underline">
                    applications@goldcoastfnl.com
                  </a>
                </p>
              </motion.div>
            ) : (
              <Card className="shadow-lg">
                <CardContent className="p-6 md:p-8">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...register("firstName")}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...register("lastName")}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          {...register("email")}
                          className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm">{errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          className={errors.phone ? "border-red-500" : ""}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm">{errors.phone.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="position">Position of Interest *</Label>
                      <select
                        id="position"
                        {...register("position")}
                        className={`w-full h-10 px-3 rounded-md border ${errors.position ? "border-red-500" : "border-input"} bg-background text-sm`}
                      >
                        <option value="">Select a position...</option>
                        {openPositions.map(pos => (
                          <option key={pos.id} value={pos.title}>{pos.title}</option>
                        ))}
                        <option value="Other">Other / General Interest</option>
                      </select>
                      {errors.position && (
                        <p className="text-red-500 text-sm">{errors.position.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedIn">LinkedIn Profile (optional)</Label>
                      <Input
                        id="linkedIn"
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...register("linkedIn")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="resume">Resume (optional)</Label>
                      <div className="flex items-center gap-4">
                        <label className="flex-1 cursor-pointer">
                          <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                            resumeFile ? "border-secondary bg-secondary/5" : "border-muted-foreground/30 hover:border-primary/50"
                          }`}>
                            <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                            {resumeFile ? (
                              <p className="text-sm text-primary font-medium">{resumeFile.name}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground">Click to upload (PDF, DOC, max 5MB)</p>
                            )}
                          </div>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleResumeChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Relevant Experience *</Label>
                      <Textarea
                        id="experience"
                        placeholder="Tell us about your background in insurance, sales, or finance..."
                        rows={3}
                        {...register("experience")}
                        className={errors.experience ? "border-red-500" : ""}
                      />
                      {errors.experience && (
                        <p className="text-red-500 text-sm">{errors.experience.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="whyJoinUs">Why do you want to join Heritage Life Solutions? *</Label>
                      <Textarea
                        id="whyJoinUs"
                        placeholder="Share what drew you to our agency and what you hope to achieve..."
                        rows={4}
                        {...register("whyJoinUs")}
                        className={errors.whyJoinUs ? "border-red-500" : ""}
                      />
                      {errors.whyJoinUs && (
                        <p className="text-red-500 text-sm">{errors.whyJoinUs.message}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="hasLicense"
                        onCheckedChange={(checked) => setValue("hasLicense", !!checked)}
                      />
                      <Label htmlFor="hasLicense" className="text-sm cursor-pointer">
                        I currently hold an Illinois Life Insurance License
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="consent"
                        onCheckedChange={(checked) => setValue("consent", checked as boolean)}
                      />
                      <Label htmlFor="consent" className="text-sm cursor-pointer">
                        I agree to the{" "}
                        <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
                        {" "}and consent to Heritage Life Solutions contacting me regarding this application. *
                      </Label>
                    </div>
                    {errors.consent && (
                      <p className="text-red-500 text-sm">{errors.consent.message}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 py-6 text-lg font-semibold"
                      disabled={submitMutation.isPending}
                    >
                      {submitMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      Heritage Life Solutions is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
                    </p>
                  </form>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </section>

      {/* General Applications CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-secondary font-medium tracking-wide uppercase text-sm">General Applications</span>
              <h2 className="text-3xl md:text-4xl font-bold font-serif mt-2 mb-6">
                Don't See the Right Fit?
              </h2>
              <p className="text-white/80 leading-relaxed mb-8">
                We're always interested in hearing from talented professionals who share our values and want to help families protect what matters most. Send your resume and a brief note about your background and interests.
              </p>
              <a
                href="mailto:applications@goldcoastfnl.com"
                className="inline-flex items-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
              >
                applications@goldcoastfnl.com
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
