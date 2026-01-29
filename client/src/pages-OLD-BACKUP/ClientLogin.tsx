import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, User, Mail, Phone, CheckCircle, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@shared/models/auth";
import { toast } from "sonner";

export default function ClientLogin() {
  const { user, isLoading, isAuthenticated, login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/client-portal");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const handleLogin = async (data: LoginInput) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      setLocation("/client-portal");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    }
  };

  const handleRegister = async (data: RegisterInput) => {
    try {
      await register(data);
      toast.success("Account created successfully!");
      setLocation("/client-portal");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    }
  };

  return (
    <Layout>
      <section className="bg-primary relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-50 rounded-full -translate-x-1/2 translate-y-1/2" />
        <motion.div 
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-1 w-12 bg-secondary rounded-full" />
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Secure Access</span>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif text-white mb-6">Client Portal</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Access your personalized dashboard, policy documents, and communicate securely with your advisor.
          </p>
        </motion.div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="shadow-2xl border-0 overflow-hidden">
                  <div className="bg-gradient-to-br from-primary to-primary/90 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/10 mx-auto mb-4 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-secondary" />
                    </div>
                    <h2 className="text-xl font-bold font-serif text-white">Welcome</h2>
                    <p className="text-white/70 text-sm mt-1">Sign in or create your account</p>
                  </div>
                  <CardContent className="p-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="login" data-testid="tab-login">Sign In</TabsTrigger>
                        <TabsTrigger value="register" data-testid="tab-register">Create Account</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="login">
                        <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="login-email">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="login-email"
                                type="email"
                                placeholder="your@email.com"
                                className="pl-10"
                                {...loginForm.register("email")}
                                data-testid="input-login-email"
                              />
                            </div>
                            {loginForm.formState.errors.email && (
                              <p className="text-destructive text-sm">{loginForm.formState.errors.email.message}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="login-password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="login-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                className="pl-10 pr-10"
                                {...loginForm.register("password")}
                                data-testid="input-login-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {loginForm.formState.errors.password && (
                              <p className="text-destructive text-sm">{loginForm.formState.errors.password.message}</p>
                            )}
                          </div>
                          
                          <Button 
                            type="submit"
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-6 text-lg font-semibold"
                            disabled={isLoggingIn}
                            data-testid="button-login"
                          >
                            {isLoggingIn ? "Signing In..." : "Sign In"}
                          </Button>
                        </form>
                      </TabsContent>
                      
                      <TabsContent value="register">
                        <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="register-firstName">First Name</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="register-firstName"
                                  placeholder="John"
                                  className="pl-10"
                                  {...registerForm.register("firstName")}
                                  data-testid="input-register-firstName"
                                />
                              </div>
                              {registerForm.formState.errors.firstName && (
                                <p className="text-destructive text-xs">{registerForm.formState.errors.firstName.message}</p>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="register-lastName">Last Name</Label>
                              <Input
                                id="register-lastName"
                                placeholder="Doe"
                                {...registerForm.register("lastName")}
                                data-testid="input-register-lastName"
                              />
                              {registerForm.formState.errors.lastName && (
                                <p className="text-destructive text-xs">{registerForm.formState.errors.lastName.message}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-email">Email Address</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="register-email"
                                type="email"
                                placeholder="your@email.com"
                                className="pl-10"
                                {...registerForm.register("email")}
                                data-testid="input-register-email"
                              />
                            </div>
                            {registerForm.formState.errors.email && (
                              <p className="text-destructive text-sm">{registerForm.formState.errors.email.message}</p>
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-phone">Phone Number (Optional)</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="register-phone"
                                type="tel"
                                placeholder="(555) 123-4567"
                                className="pl-10"
                                {...registerForm.register("phone")}
                                data-testid="input-register-phone"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="register-password">Password</Label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="register-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 8 characters"
                                className="pl-10 pr-10"
                                {...registerForm.register("password")}
                                data-testid="input-register-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            {registerForm.formState.errors.password && (
                              <p className="text-destructive text-sm">{registerForm.formState.errors.password.message}</p>
                            )}
                          </div>
                          
                          <Button 
                            type="submit"
                            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 py-6 text-lg font-semibold"
                            disabled={isRegistering}
                            data-testid="button-register"
                          >
                            {isRegistering ? "Creating Account..." : "Create Account"}
                          </Button>
                        </form>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="mt-6 pt-6 border-t border-border">
                      <div className="flex items-center gap-3 text-muted-foreground text-sm">
                        <Lock className="w-4 h-4 text-primary shrink-0" />
                        <span>Bank-level 256-bit SSL encryption</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-bold font-serif text-primary mb-4">Your Secure Client Portal</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Access everything you need to manage your life insurance policies and stay connected with your dedicated advisor.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "Policy Dashboard",
                      description: "View all your policies, coverage details, and premium schedules at a glance."
                    },
                    {
                      title: "Secure Documents",
                      description: "Access and download your policy documents, statements, and tax forms anytime."
                    },
                    {
                      title: "Direct Messaging",
                      description: "Communicate securely with your advisor through encrypted messaging."
                    },
                    {
                      title: "Account Settings",
                      description: "Update your contact information and notification preferences."
                    }
                  ].map((feature, i) => (
                    <motion.div 
                      key={i}
                      className="flex gap-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                    >
                      <div className="shrink-0">
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-secondary" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-xl p-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>New client?</strong> Create your account to access your portal once your first policy is issued.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Questions? Contact us at <a href="mailto:contact@goldcoastfnl.com" className="text-secondary hover:underline">contact@goldcoastfnl.com</a>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
