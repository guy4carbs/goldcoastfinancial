import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calculator, 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Home, 
  GraduationCap, 
  DollarSign,
  Shield,
  CheckCircle2,
  Users,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link } from "wouter";

interface CalculatorData {
  annualIncome: number;
  yearsToReplace: number;
  mortgage: number;
  otherDebts: number;
  childrenCount: number;
  collegePerChild: number;
  finalExpenses: number;
  existingCoverage: number;
  ageRange: string;
  healthStatus: string;
}

const initialData: CalculatorData = {
  annualIncome: 75000,
  yearsToReplace: 10,
  mortgage: 250000,
  otherDebts: 25000,
  childrenCount: 2,
  collegePerChild: 100000,
  finalExpenses: 15000,
  existingCoverage: 0,
  ageRange: "30-39",
  healthStatus: "good"
};

const steps = [
  { id: 1, title: "Income", icon: DollarSign, description: "Your earning power" },
  { id: 2, title: "Debts", icon: Home, description: "What you owe" },
  { id: 3, title: "Family", icon: Users, description: "Your dependents" },
  { id: 4, title: "Profile", icon: User, description: "About you" },
  { id: 5, title: "Results", icon: Shield, description: "Your recommendation" }
];

export function CoverageCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<CalculatorData>(initialData);
  const [isOpen, setIsOpen] = useState(false);

  const updateData = (field: keyof CalculatorData, value: number | string) => {
    if (typeof value === 'string' && field !== 'ageRange' && field !== 'healthStatus') {
      const parsed = parseInt(value) || 0;
      setData(prev => ({ ...prev, [field]: parsed }));
    } else {
      setData(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateCoverage = () => {
    const incomeReplacement = data.annualIncome * data.yearsToReplace;
    const totalDebts = data.mortgage + data.otherDebts;
    const educationFund = data.childrenCount * data.collegePerChild;
    const totalNeeded = incomeReplacement + totalDebts + educationFund + data.finalExpenses;
    const recommendedCoverage = Math.max(0, totalNeeded - data.existingCoverage);
    return {
      incomeReplacement,
      totalDebts,
      educationFund,
      finalExpenses: data.finalExpenses,
      totalNeeded,
      existingCoverage: data.existingCoverage,
      recommendedCoverage,
      monthlyEstimate: getMonthlyEstimate(recommendedCoverage, data.ageRange, data.healthStatus)
    };
  };

  const getMonthlyEstimate = (coverage: number, ageRange: string, health: string) => {
    const baseRates: Record<string, number> = {
      "18-29": 0.08,
      "30-39": 0.12,
      "40-49": 0.22,
      "50-59": 0.45,
      "60+": 0.85
    };
    const healthMultiplier: Record<string, number> = {
      "excellent": 0.85,
      "good": 1.0,
      "fair": 1.25,
      "poor": 1.5
    };
    const baseRate = baseRates[ageRange] || 0.15;
    const multiplier = healthMultiplier[health] || 1.0;
    return Math.round((coverage / 1000) * baseRate * multiplier);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const results = calculateCoverage();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-1 w-12 bg-secondary rounded-full" />
            <span className="text-secondary font-medium tracking-wide uppercase text-sm">Interactive Tool</span>
            <div className="h-1 w-12 bg-secondary rounded-full" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">
            Coverage Calculator
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Answer a few simple questions to get a personalized life insurance coverage recommendation based on your unique situation.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Card className="max-w-3xl mx-auto shadow-xl border-0 overflow-hidden">
            <div className="bg-primary p-4">
              <div className="flex justify-between items-center">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex flex-col items-center ${currentStep >= step.id ? 'opacity-100' : 'opacity-50'}`}>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                        currentStep > step.id 
                          ? 'bg-secondary text-black' 
                          : currentStep === step.id 
                            ? 'bg-white text-primary' 
                            : 'bg-white/20 text-white'
                      }`}>
                        {currentStep > step.id ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <step.icon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-xs text-white/80 mt-1 hidden sm:block">{step.title}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 ${
                        currentStep > step.id ? 'bg-secondary' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <CardContent className="p-6 md:p-8">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold font-serif text-primary mb-2">Your Income</h3>
                      <p className="text-muted-foreground text-sm">Let's start with your household's earning power</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="income" className="text-sm font-medium">Annual Household Income</Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="income"
                            type="number"
                            min="0"
                            value={data.annualIncome || ''}
                            onChange={(e) => updateData('annualIncome', e.target.value)}
                            className="pl-10 text-lg"
                            placeholder="75000"
                            data-testid="input-annual-income"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="years" className="text-sm font-medium">Years of Income to Replace</Label>
                        <p className="text-xs text-muted-foreground mb-2">How many years would your family need financial support?</p>
                        <RadioGroup
                          value={data.yearsToReplace.toString()}
                          onValueChange={(val) => updateData('yearsToReplace', parseInt(val))}
                          className="grid grid-cols-4 gap-2"
                        >
                          {[5, 10, 15, 20].map(years => (
                            <div key={years}>
                              <RadioGroupItem
                                value={years.toString()}
                                id={`years-${years}`}
                                className="peer sr-only"
                                data-testid={`radio-years-${years}`}
                              />
                              <Label
                                htmlFor={`years-${years}`}
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                                data-testid={`label-years-${years}`}
                              >
                                <span className="font-bold text-lg">{years}</span>
                                <span className="text-xs text-muted-foreground">years</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold font-serif text-primary mb-2">Your Debts</h3>
                      <p className="text-muted-foreground text-sm">What financial obligations would need to be covered?</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mortgage" className="text-sm font-medium flex items-center gap-2">
                          <Home className="w-4 h-4" /> Mortgage Balance
                        </Label>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="mortgage"
                            type="number"
                            min="0"
                            value={data.mortgage || ''}
                            onChange={(e) => updateData('mortgage', e.target.value)}
                            className="pl-10"
                            placeholder="250000"
                            data-testid="input-mortgage"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="debts" className="text-sm font-medium flex items-center gap-2">
                          <Briefcase className="w-4 h-4" /> Other Debts
                        </Label>
                        <p className="text-xs text-muted-foreground mb-1">Car loans, credit cards, student loans, etc.</p>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="debts"
                            type="number"
                            min="0"
                            value={data.otherDebts || ''}
                            onChange={(e) => updateData('otherDebts', e.target.value)}
                            className="pl-10"
                            placeholder="25000"
                            data-testid="input-other-debts"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="final" className="text-sm font-medium">Final Expenses</Label>
                        <p className="text-xs text-muted-foreground mb-1">Funeral, medical bills, legal fees (typically $10,000-$25,000)</p>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="final"
                            type="number"
                            min="0"
                            value={data.finalExpenses || ''}
                            onChange={(e) => updateData('finalExpenses', e.target.value)}
                            className="pl-10"
                            placeholder="15000"
                            data-testid="input-final-expenses"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold font-serif text-primary mb-2">Your Family</h3>
                      <p className="text-muted-foreground text-sm">Who depends on you financially?</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <GraduationCap className="w-4 h-4" /> Children to Put Through College
                        </Label>
                        <RadioGroup
                          value={data.childrenCount.toString()}
                          onValueChange={(val) => updateData('childrenCount', parseInt(val))}
                          className="grid grid-cols-5 gap-2 mt-2"
                        >
                          {[0, 1, 2, 3, 4].map(count => (
                            <div key={count}>
                              <RadioGroupItem
                                value={count.toString()}
                                id={`children-${count}`}
                                className="peer sr-only"
                                data-testid={`radio-children-${count}`}
                              />
                              <Label
                                htmlFor={`children-${count}`}
                                className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                                data-testid={`label-children-${count}`}
                              >
                                <span className="font-bold">{count === 4 ? '4+' : count}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      {data.childrenCount > 0 && (
                        <div>
                          <Label htmlFor="college" className="text-sm font-medium">Estimated College Cost Per Child</Label>
                          <p className="text-xs text-muted-foreground mb-1">Average 4-year degree: $100,000 - $250,000</p>
                          <div className="relative mt-1">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="college"
                              type="number"
                              min="0"
                              value={data.collegePerChild || ''}
                              onChange={(e) => updateData('collegePerChild', e.target.value)}
                              className="pl-10"
                              placeholder="100000"
                              data-testid="input-college-cost"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="existing" className="text-sm font-medium">Existing Life Insurance Coverage</Label>
                        <p className="text-xs text-muted-foreground mb-1">Include employer-provided and personal policies</p>
                        <div className="relative mt-1">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="existing"
                            type="number"
                            min="0"
                            value={data.existingCoverage || ''}
                            onChange={(e) => updateData('existingCoverage', e.target.value)}
                            className="pl-10"
                            placeholder="0"
                            data-testid="input-existing-coverage"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold font-serif text-primary mb-2">About You</h3>
                      <p className="text-muted-foreground text-sm">This helps us estimate your premium range</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Your Age Range</Label>
                        <RadioGroup
                          value={data.ageRange}
                          onValueChange={(val) => updateData('ageRange', val)}
                          className="grid grid-cols-5 gap-2 mt-2"
                        >
                          {["18-29", "30-39", "40-49", "50-59", "60+"].map(age => (
                            <div key={age}>
                              <RadioGroupItem
                                value={age}
                                id={`age-${age}`}
                                className="peer sr-only"
                                data-testid={`radio-age-${age}`}
                              />
                              <Label
                                htmlFor={`age-${age}`}
                                className="flex items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all text-sm"
                                data-testid={`label-age-${age}`}
                              >
                                {age}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">General Health Status</Label>
                        <RadioGroup
                          value={data.healthStatus}
                          onValueChange={(val) => updateData('healthStatus', val)}
                          className="grid grid-cols-2 gap-2 mt-2"
                        >
                          {[
                            { value: "excellent", label: "Excellent", desc: "No health issues" },
                            { value: "good", label: "Good", desc: "Minor issues only" },
                            { value: "fair", label: "Fair", desc: "Some conditions" },
                            { value: "poor", label: "Needs Attention", desc: "Multiple conditions" }
                          ].map(health => (
                            <div key={health.value}>
                              <RadioGroupItem
                                value={health.value}
                                id={`health-${health.value}`}
                                className="peer sr-only"
                                data-testid={`radio-health-${health.value}`}
                              />
                              <Label
                                htmlFor={`health-${health.value}`}
                                className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                                data-testid={`label-health-${health.value}`}
                              >
                                <span className="font-medium">{health.label}</span>
                                <span className="text-xs text-muted-foreground">{health.desc}</span>
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-secondary" />
                      </div>
                      <h3 className="text-xl font-bold font-serif text-primary mb-2">Your Personalized Recommendation</h3>
                      <p className="text-muted-foreground text-sm">Based on the information you provided</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl p-6 text-white text-center">
                      <p className="text-white/80 text-sm mb-1">Recommended Coverage</p>
                      <p className="text-4xl md:text-5xl font-bold font-serif">
                        {formatCurrency(results.recommendedCoverage)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Income Replacement</p>
                        <p className="font-semibold">{formatCurrency(results.incomeReplacement)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Total Debts</p>
                        <p className="font-semibold">{formatCurrency(results.totalDebts)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Education Fund</p>
                        <p className="font-semibold">{formatCurrency(results.educationFund)}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-muted-foreground text-xs">Final Expenses</p>
                        <p className="font-semibold">{formatCurrency(results.finalExpenses)}</p>
                      </div>
                    </div>

                    {data.existingCoverage > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                        <p className="text-green-800 text-sm">
                          Existing coverage of {formatCurrency(data.existingCoverage)} has been deducted
                        </p>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Link href="/get-quote" className="flex-1">
                        <Button className="w-full bg-secondary text-black hover:bg-secondary/90" size="lg" data-testid="button-get-personalized-quote">
                          Get Your Personalized Quote
                        </Button>
                      </Link>
                      <Link href="/contact" className="flex-1">
                        <Button variant="outline" className="w-full" size="lg" data-testid="button-speak-advisor">
                          Speak with an Advisor
                        </Button>
                      </Link>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      * Estimates are for illustration purposes only. Actual premiums depend on health, lifestyle, and other factors.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {currentStep < 5 && (
                <div className="flex justify-between mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    data-testid="button-calculator-prev"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-calculator-next"
                  >
                    {currentStep === 4 ? 'See Results' : 'Continue'} <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {currentStep === 5 && (
                <div className="mt-6 pt-4 border-t text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(1)}
                    className="text-muted-foreground"
                    data-testid="button-calculator-restart"
                  >
                    Start Over with Different Values
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
