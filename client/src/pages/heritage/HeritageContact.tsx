import { HeritageLayout } from "@/components/layout/HeritageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SecurityBadgesCompact } from "@/components/ui/security-badges";
import { HeritageAppointmentScheduler } from "@/components/ui/heritage-appointment-scheduler";

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
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export default function HeritageContact() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const submitContactMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await fetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to submit contact message');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitContactMutation.mutate(values);
  }

  return (
    <HeritageLayout>
      <section className="py-16" style={{ backgroundColor: c.background }}>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h1 className="text-4xl font-bold font-serif mb-6" style={{ color: c.primary }}>Contact Us</h1>
              <p className="text-lg mb-8" style={{ color: c.textSecondary }}>
                Ready to start the conversation? We're here to answer your questions and help you find the right coverage.
              </p>

              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: c.primary }}>Our Office</h3>
                    <p style={{ color: c.textSecondary }}>1240 Iroquois Ave Suite 506<br/>Naperville, Illinois 60563</p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: c.primary }}>Phone</h3>
                    <p style={{ color: c.textSecondary }}>(630) 555-0123</p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: c.primary }}>Email</h3>
                    <p style={{ color: c.textSecondary }}>contact@heritagels.com</p>
                  </div>
                </div>

                 <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${c.primary}15`, color: c.primary }}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold" style={{ color: c.primary }}>Hours</h3>
                    <p style={{ color: c.textSecondary }}>Mon-Fri: 9am - 5pm<br/>Sat: By Appointment</p>
                  </div>
                </div>
              </div>
            </div>

            <Card style={{ backgroundColor: c.cream }}>
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold font-serif mb-6" style={{ color: c.primary }}>Send us a Message</h2>

                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${c.secondary}30` }}>
                      <Mail className="w-8 h-8" style={{ color: c.secondary }} />
                    </div>
                    <h3 className="text-xl font-bold mb-2" style={{ color: c.primary }}>Thank You!</h3>
                    <p className="mb-6" style={{ color: c.textSecondary }}>
                      Your message has been sent. We'll respond within 24 hours.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)} variant="outline" style={{ borderColor: c.primary, color: c.primary }}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ color: c.textPrimary }}>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
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
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: c.textPrimary }}>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
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
                            <FormLabel style={{ color: c.textPrimary }}>Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="(630) 555-1234" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ color: c.textPrimary }}>Message</FormLabel>
                            <FormControl>
                              <Textarea placeholder="How can we help you?" className="min-h-[120px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full font-bold"
                        style={{ backgroundColor: c.secondary, color: c.textPrimary }}
                        disabled={submitContactMutation.isPending}
                      >
                        {submitContactMutation.isPending ? "Sending..." : "Send Message"}
                      </Button>

                      <SecurityBadgesCompact />
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Appointment Scheduler */}
      <HeritageAppointmentScheduler />

      {/* Google Maps Embed */}
      <section className="py-16" style={{ backgroundColor: c.background }}>
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2976.5!2d-88.1534!3d41.7508!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880e57c70e6c0b01%3A0x0!2s1240%20Iroquois%20Ave%2C%20Naperville%2C%20IL%2060563!5e0!3m2!1sen!2sus!4v1704067200000"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Heritage Life Solutions Office Location"
              />
            </div>
          </div>
        </div>
      </section>
    </HeritageLayout>
  );
}
