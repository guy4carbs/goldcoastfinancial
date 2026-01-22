import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Play,
  Clock,
  ArrowRight,
  Shield,
  DollarSign,
  Heart,
  Users,
  TrendingUp,
  FileText,
  Award,
  Target,
  Lightbulb,
  Phone,
  PartyPopper,
  RotateCcw,
  X,
  AlertCircle,
  Zap,
  CircleDollarSign,
  Calculator,
  ClipboardCheck,
  Stethoscope,
  Home,
  GraduationCap as Graduation,
  PiggyBank,
  Scale,
  UserCheck,
  Building,
  HeartHandshake,
  Video,
  XCircle,
  CheckCircle2,
  Info,
  HelpCircle,
  Percent,
  Calendar,
  TrendingDown,
  Cigarette,
  Dumbbell,
  FileCheck,
  Send,
  UserPlus,
  Banknote,
  Receipt,
  CircleCheck,
  Search
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LifeInsurance101() {
  const [activeModule, setActiveModule] = useState<number>(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayVideo = () => {
    const video = videoRef.current;
    if (video) {
      video.play();
      setIsVideoPlaying(true);
    }
  };

  // Reset video state when switching modules
  useEffect(() => {
    setIsVideoPlaying(false);
  }, [activeModule]);

  // Load progress from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem("lifeInsurance101Progress");
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setCompletedModules(parsed.completedModules || []);
        setActiveModule(parsed.activeModule || 0);
      } catch (e) {
        // Invalid data, ignore
      }
    }
  }, []);

  // Save progress to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("lifeInsurance101Progress", JSON.stringify({
      completedModules,
      activeModule
    }));
  }, [completedModules, activeModule]);

  // Scroll to content when module changes
  const scrollToContent = () => {
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const modules = [
    {
      id: 0,
      title: "What Is Life Insurance?",
      icon: Shield,
      duration: "3 min"
    },
    {
      id: 1,
      title: "Term vs. Permanent Insurance",
      icon: Scale,
      duration: "4 min"
    },
    {
      id: 2,
      title: "How Much Coverage Do You Need?",
      icon: Calculator,
      duration: "5 min"
    },
    {
      id: 3,
      title: "The Application Process",
      icon: ClipboardCheck,
      duration: "4 min"
    },
    {
      id: 4,
      title: "Understanding Premiums",
      icon: CircleDollarSign,
      duration: "4 min"
    },
    {
      id: 5,
      title: "Beneficiaries & Payouts",
      icon: HeartHandshake,
      duration: "3 min"
    }
  ];

  // Video placeholder component
  const VideoPlaceholder = ({ title }: { title: string }) => (
    <div className="relative bg-gradient-to-br from-heritage-primary to-heritage-primary/80 rounded-2xl overflow-hidden mb-8 aspect-video flex items-center justify-center group cursor-pointer hover:shadow-xl transition-shadow">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative z-10 text-center">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
          <Play className="w-10 h-10 text-white ml-1" />
        </div>
        <p className="text-white font-semibold text-lg">{title}</p>
        <p className="text-white/70 text-sm mt-1">Click to play video</p>
      </div>
      <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
        <span className="text-white text-sm flex items-center gap-1">
          <Video className="w-4 h-4" /> 2:30
        </span>
      </div>
    </div>
  );

  // Tip box component
  const TipBox = ({ children, type = "tip" }: { children: React.ReactNode; type?: "tip" | "warning" | "info" }) => {
    const styles = {
      tip: { bg: "bg-green-50", border: "border-green-200", icon: Lightbulb, iconColor: "text-green-600", title: "Pro Tip" },
      warning: { bg: "bg-amber-50", border: "border-amber-200", icon: AlertCircle, iconColor: "text-amber-600", title: "Watch Out" },
      info: { bg: "bg-blue-50", border: "border-blue-200", icon: Info, iconColor: "text-blue-600", title: "Did You Know?" }
    };
    const style = styles[type];
    const Icon = style.icon;
    return (
      <div className={`${style.bg} ${style.border} border rounded-xl p-4 my-6`}>
        <div className="flex gap-3">
          <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
          <div>
            <p className={`font-semibold ${style.iconColor} text-sm mb-1`}>{style.title}</p>
            <p className="text-gray-700 text-sm">{children}</p>
          </div>
        </div>
      </div>
    );
  };

  // Comparison row component
  const ComparisonRow = ({ label, term, whole }: { label: string; term: string; whole: string }) => (
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="font-medium text-gray-700">{label}</div>
      <div className="text-center text-gray-600">{term}</div>
      <div className="text-center text-gray-600">{whole}</div>
    </div>
  );

  // Stat card component
  const StatCard = ({ value, label, icon: Icon }: { value: string; label: string; icon: any }) => (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
      <Icon className="w-8 h-8 text-heritage-accent mx-auto mb-2" />
      <p className="text-2xl font-bold text-heritage-primary">{value}</p>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );

  // Step card component
  const StepCard = ({ number, title, description, icon: Icon }: { number: number; title: string; description: string; icon: any }) => (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-heritage-accent text-white rounded-full flex items-center justify-center font-bold">
          {number}
        </div>
      </div>
      <div className="flex-1 pb-8 border-l-2 border-dashed border-gray-200 pl-6 -ml-5">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 text-heritage-primary" />
          <h4 className="font-semibold text-gray-900">{title}</h4>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );

  // Render module content based on active module
  const renderModuleContent = () => {
    switch (activeModule) {
      case 0:
        return (
          <>
            {/* What Is Life Insurance Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-8 aspect-video">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769098913768-Life%20Insurance_%20Essential%20Security.mp4?alt=media&token=18e4a4ce-e1a4-40fc-a48e-b5633a58e1d2"
                controls={isVideoPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 bg-gradient-to-br from-heritage-primary to-heritage-primary/80 flex items-center justify-center group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">What Is Life Insurance? Explained Simply</p>
                    <p className="text-white/70 text-sm mt-1">Click to play video</p>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm flex items-center gap-1">
                      <Video className="w-4 h-4" /> 2:33
                    </span>
                  </div>
                </button>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                You pay premiums, and when you pass away, your beneficiaries receive a <strong>tax-free lump sum</strong> (the death benefit). It's a financial safety net that replaces your income and keeps your family secure.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 my-8">
              <StatCard value="$500K" label="Average family coverage" icon={Shield} />
              <StatCard value="Tax-Free" label="Beneficiary payout" icon={Banknote} />
              <StatCard value="1-2 Weeks" label="Claim payout time" icon={Clock} />
            </div>

            <div className="bg-[#fffaf3] rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-heritage-accent" />
                Who Needs It?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Users, text: "Parents with kids" },
                  { icon: Home, text: "Homeowners with a mortgage" },
                  { icon: Heart, text: "Couples sharing expenses" },
                  { icon: Graduation, text: "Those leaving an inheritance" },
                  { icon: Building, text: "Business owners" },
                  { icon: UserCheck, text: "Co-signers on loans" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <item.icon className="w-5 h-5 text-heritage-primary flex-shrink-0" />
                    <span className="text-gray-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <TipBox type="info">
              60% of Americans are uninsured or underinsured. The average coverage gap is $200,000+.
            </TipBox>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-heritage-accent" />
                Quick Example
              </h3>
              <div className="bg-heritage-primary/5 rounded-xl p-5">
                <p className="text-gray-700 mb-4">
                  <strong>Sarah, 35, buys $500K coverage:</strong>
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    Pays $28/month
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    Names husband as beneficiary
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    He receives $500K tax-free if she passes
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    Covers mortgage, childcare, daily expenses
                  </li>
                </ul>
              </div>
            </div>

            <TipBox type="tip">
              Buy young and healthy. Rates increase 8-10% every year you wait.
            </TipBox>
          </>
        );

      case 1:
        return (
          <>
            {/* Term vs. Permanent Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-8 aspect-video">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769101354903-Term%20vs.%20Permanent%20Life.mp4?alt=media&token=42a7e181-6566-4dba-9fd3-cbce83cfeeca"
                controls={isVideoPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 bg-gradient-to-br from-heritage-primary to-heritage-primary/80 flex items-center justify-center group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">Term vs. Whole Life: Which Should You Choose?</p>
                    <p className="text-white/70 text-sm mt-1">Click to play video</p>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm flex items-center gap-1">
                      <Video className="w-4 h-4" /> 2:46
                    </span>
                  </div>
                </button>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong>Term</strong> = temporary coverage. <strong>Whole life</strong> = lifetime coverage + savings. Here's how to choose.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden my-8">
              <div className="grid grid-cols-3 gap-4 p-4 bg-heritage-primary text-white">
                <div className="font-semibold">Feature</div>
                <div className="text-center font-semibold">Term Life</div>
                <div className="text-center font-semibold">Whole Life</div>
              </div>
              <div className="p-4">
                <ComparisonRow label="Coverage Period" term="10-30 years" whole="Lifetime" />
                <ComparisonRow label="Monthly Cost (35 y/o, $500k)" term="~$25-35" whole="~$300-400" />
                <ComparisonRow label="Cash Value" term="None" whole="Builds over time" />
                <ComparisonRow label="Best For" term="Temporary needs" whole="Permanent needs" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              {/* Term Life Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500 rounded-xl">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">Term Life</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Like renting—pure protection, no equity.
                </p>
                <h4 className="font-semibold text-gray-900 mb-2">Best for:</h4>
                <ul className="space-y-2">
                  {["Mortgage protection", "Kids until they're grown", "Income replacement", "Budget-friendly coverage"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Whole Life Card */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-purple-500 rounded-xl">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900">Whole Life</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Like owning—builds cash value over time.
                </p>
                <h4 className="font-semibold text-gray-900 mb-2">Best for:</h4>
                <ul className="space-y-2">
                  {["Estate planning", "Special needs dependents", "Tax-advantaged savings", "Guaranteed inheritance"].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <TipBox type="tip">
              Most families should choose term—5-10x more coverage for the same price. Consider whole life only after maxing 401k/IRA.
            </TipBox>

            <div className="bg-[#fffaf3] rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Myths Busted
              </h3>
              <div className="space-y-4">
                {[
                  { myth: "Whole life is always bad", truth: "For high earners with maxed retirement accounts, it offers unique tax benefits." },
                  { myth: "Term is throwing money away", truth: "You're paying for protection—same as car or home insurance." },
                  { myth: "You can't have both", truth: "Many combine large term + smaller whole life policies." }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4">
                    <p className="font-medium text-red-600 flex items-center gap-2 mb-1">
                      <XCircle className="w-4 h-4" /> "{item.myth}"
                    </p>
                    <p className="text-gray-600 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                      {item.truth}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <TipBox type="info">
              Most term policies let you convert to whole life later—no new medical exam needed.
            </TipBox>
          </>
        );

      case 2:
        return (
          <>
            {/* How Much Coverage Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-8 aspect-video">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769103911664-DIME%20Life%20Insurance.mp4?alt=media&token=34eb6b75-f615-4cc4-b4ca-7083f8934e02"
                controls={isVideoPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 bg-gradient-to-br from-heritage-primary to-heritage-primary/80 flex items-center justify-center group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">Calculate Your Perfect Coverage Amount</p>
                    <p className="text-white/70 text-sm mt-1">Click to play video</p>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm flex items-center gap-1">
                      <Video className="w-4 h-4" /> 3:26
                    </span>
                  </div>
                </button>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Too little leaves your family vulnerable. Too much wastes money. Use the DIME method to find your number.
              </p>
            </div>

            <div className="bg-heritage-primary rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-white">
                <Calculator className="w-5 h-5" />
                The DIME Method
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { letter: "D", word: "Debt", desc: "All debts except mortgage" },
                  { letter: "I", word: "Income", desc: "10-15 years of salary" },
                  { letter: "M", word: "Mortgage", desc: "Full balance" },
                  { letter: "E", word: "Education", desc: "$100K+ per child" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="w-10 h-10 bg-heritage-accent rounded-full flex items-center justify-center font-bold text-xl text-white">{item.letter}</span>
                      <span className="font-semibold text-lg text-white">{item.word}</span>
                    </div>
                    <p className="text-white/80 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-heritage-accent" />
                Example: Maria, 38, $85K income, 2 kids
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-500 text-sm mb-3 font-medium">Add up needs:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Income (15 yrs)</span>
                      <span className="font-semibold">$1,275,000</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Mortgage</span>
                      <span className="font-semibold">$280,000</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Other debts</span>
                      <span className="font-semibold">$35,000</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">College (2 kids)</span>
                      <span className="font-semibold">$300,000</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                      <span>Total Need</span>
                      <span className="text-heritage-primary">$1,905,000</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-sm mb-3 font-medium">Subtract existing coverage:</p>
                  <div className="space-y-2">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">401(k)</span>
                      <span className="font-semibold text-red-500">-$120,000</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Work insurance</span>
                      <span className="font-semibold text-red-500">-$85,000</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Spouse income</span>
                      <span className="font-semibold text-red-500">-$200,000</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold">
                      <span>Coverage Needed</span>
                      <span className="text-green-600">$1,500,000</span>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-3 mt-4">
                    <p className="text-green-700 font-medium text-sm">
                      $1.5M 20-year term = ~$45/month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <TipBox type="warning">
              Don't rely on employer coverage—it's usually only 1-2x salary and disappears if you leave.
            </TipBox>

            <div className="bg-[#fffaf3] rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4">Quick Rules</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-heritage-primary">10-12x</p>
                  <p className="text-gray-600 text-sm">Annual income</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-heritage-primary">$100K+</p>
                  <p className="text-gray-600 text-sm">Per child (college)</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-heritage-primary">100%</p>
                  <p className="text-gray-600 text-sm">Mortgage balance</p>
                </div>
              </div>
            </div>

            <TipBox type="tip">
              When in doubt, round up. $500K to $750K is often just $5-10/month more.
            </TipBox>
          </>
        );

      case 3:
        return (
          <>
            {/* Application Process Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-8 aspect-video">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769109011851-Life%20Insurance%20Simplified.mp4?alt=media&token=cb101ac3-84a9-447d-af4c-55c02c0d7dc3"
                controls={isVideoPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 bg-gradient-to-br from-heritage-primary to-heritage-primary/80 flex items-center justify-center group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">The Life Insurance Application Process</p>
                    <p className="text-white/70 text-sm mt-1">Click to play video</p>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm flex items-center gap-1">
                      <Video className="w-4 h-4" /> 2:28
                    </span>
                  </div>
                </button>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Most people complete the process in 2-4 weeks. Here's what to expect.
              </p>
            </div>

            <div className="my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-heritage-accent" />
                5 Steps to Coverage
              </h3>
              <div className="space-y-2">
                <StepCard
                  number={1}
                  title="Compare Quotes"
                  description="Rates vary 30-50% between companies. Shop multiple carriers."
                  icon={Search}
                />
                <StepCard
                  number={2}
                  title="Complete Application"
                  description="Personal info, health history, beneficiary details. Be honest."
                  icon={FileText}
                />
                <StepCard
                  number={3}
                  title="Medical Exam (If Required)"
                  description="20-30 min at home: blood pressure, blood draw, urine sample."
                  icon={Stethoscope}
                />
                <StepCard
                  number={4}
                  title="Underwriting Review"
                  description="Company reviews records and assigns your rate class."
                  icon={FileCheck}
                />
                <StepCard
                  number={5}
                  title="Policy Delivery"
                  description="Sign, pay first premium, coverage starts immediately."
                  icon={Send}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  No-Exam Options
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Accelerated:</strong> Data-based, no exam</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Simplified:</strong> Questions only</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Guaranteed:</strong> Auto-approval</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Timelines
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">No-exam</span>
                    <span className="font-semibold bg-white px-3 py-1 rounded-full">Days - 1 week</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Accelerated</span>
                    <span className="font-semibold bg-white px-3 py-1 rounded-full">1-2 weeks</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">With exam</span>
                    <span className="font-semibold bg-white px-3 py-1 rounded-full">3-6 weeks</span>
                  </div>
                </div>
              </div>
            </div>

            <TipBox type="warning">
              Never lie on your application. Companies verify through medical records and prescriptions. Misrepresentation = denied claims.
            </TipBox>

            <div className="bg-[#fffaf3] rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-heritage-accent" />
                Exam Day Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { icon: Calendar, text: "Schedule morning (lower vitals)" },
                  { icon: Dumbbell, text: "No exercise 24 hours before" },
                  { icon: Cigarette, text: "No nicotine 24 hours before" },
                  { icon: Receipt, text: "Have medication list ready" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <item.icon className="w-5 h-5 text-heritage-primary flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <TipBox type="info">
              Most policies have a 10-30 day "free look" period—cancel for full refund, no questions asked.
            </TipBox>
          </>
        );

      case 4:
        return (
          <>
            {/* Understanding Premiums Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-8 aspect-video">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769112336022-Decoding%20Life%20Insurance%20Premiums.mp4?alt=media&token=e2b8f9dd-773e-4b2e-bb8f-21424b0e5257"
                controls={isVideoPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 bg-gradient-to-br from-heritage-primary to-heritage-primary/80 flex items-center justify-center group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">How Life Insurance Premiums Are Calculated</p>
                    <p className="text-white/70 text-sm mt-1">Click to play video</p>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm flex items-center gap-1">
                      <Video className="w-4 h-4" /> 2:29
                    </span>
                  </div>
                </button>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Your rate depends on how risky you are to insure. Here's what matters most.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-6 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-heritage-accent" />
                Rate Factors
              </h3>
              <div className="space-y-3">
                {[
                  { factor: "Age", impact: "HIGH", desc: "Rates increase 8-10% per year", icon: Calendar, color: "red" },
                  { factor: "Health", impact: "HIGH", desc: "Conditions, meds, family history", icon: Heart, color: "red" },
                  { factor: "Tobacco", impact: "HIGH", desc: "Smokers pay 2-3x more", icon: Cigarette, color: "red" },
                  { factor: "Coverage", impact: "MED", desc: "More coverage = higher cost", icon: Shield, color: "amber" },
                  { factor: "Term Length", impact: "MED", desc: "Longer terms cost more", icon: Clock, color: "amber" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className={`p-2 rounded-lg ${item.color === 'red' ? 'bg-red-100' : 'bg-amber-100'}`}>
                      <item.icon className={`w-4 h-4 ${item.color === 'red' ? 'text-red-600' : 'text-amber-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{item.factor}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.color === 'red' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.impact}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-heritage-primary rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-white">
                <CircleDollarSign className="w-5 h-5" />
                Sample Rates: $500K 20-Year Term
              </h3>
              <p className="text-white/80 text-sm mb-4">Healthy non-smoker:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { age: "25", male: "$18", female: "$15" },
                  { age: "35", male: "$23", female: "$20" },
                  { age: "45", male: "$45", female: "$38" },
                  { age: "55", male: "$110", female: "$85" }
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-white/70 text-xs">Age {item.age}</p>
                    <p className="text-xl font-bold text-white">{item.male}</p>
                    <p className="text-white/70 text-xs">{item.female} female</p>
                  </div>
                ))}
              </div>
            </div>

            <TipBox type="tip">
              Waiting from 30 to 35 = 40% higher rates. That's $100+/year extra for life.
            </TipBox>

            <div className="bg-[#fffaf3] rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5 text-heritage-accent" />
                Rate Classes
              </h3>
              <div className="space-y-2">
                {[
                  { class: "Preferred Plus", desc: "Excellent health", pct: "15% below" },
                  { class: "Preferred", desc: "Very good health", pct: "10% below" },
                  { class: "Standard", desc: "Average health", pct: "Baseline" },
                  { class: "Substandard", desc: "Health issues", pct: "25-400% above" }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.class}</p>
                      <p className="text-gray-600 text-xs">{item.desc}</p>
                    </div>
                    <span className="text-heritage-primary font-medium text-sm">{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <TipBox type="info">
              Same person = different rates at different companies. Shop around or use an independent agent.
            </TipBox>
          </>
        );

      case 5:
        return (
          <>
            {/* Beneficiaries & Payouts Video */}
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden mb-8 aspect-video">
              <video
                ref={videoRef}
                src="https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/videos%2Fgeneral%2F1769113956788-Life%20Insurance%20Beneficiaries.mp4?alt=media&token=0ad3ee11-58cc-458f-aaa7-baced3486aeb"
                controls={isVideoPlaying}
                playsInline
                className="w-full h-full object-cover"
                onEnded={() => setIsVideoPlaying(false)}
              />
              {!isVideoPlaying && (
                <button
                  onClick={handlePlayVideo}
                  className="absolute inset-0 bg-gradient-to-br from-heritage-primary to-heritage-primary/80 flex items-center justify-center group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                    <p className="text-white font-semibold text-lg">Understanding Beneficiaries & Claim Payouts</p>
                    <p className="text-white/70 text-sm mt-1">Click to play video</p>
                  </div>
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white text-sm flex items-center gap-1">
                      <Video className="w-4 h-4" /> 2:21
                    </span>
                  </div>
                </button>
              )}
            </div>

            <div className="prose max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Name the right beneficiaries and know how claims work so your family gets what they need.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-heritage-primary" />
                  Primary Beneficiary
                </h3>
                <p className="text-gray-600 text-sm mb-3">First in line. Can name multiple with percentages.</p>
                <div className="bg-heritage-primary/5 rounded-xl p-3">
                  <p className="text-xs text-gray-600">
                    <strong>Example:</strong> Spouse: 100% <em>or</em> Spouse: 60%, Kids: 40%
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-heritage-primary" />
                  Contingent Beneficiary
                </h3>
                <p className="text-gray-600 text-sm mb-3">Backup if primary is deceased.</p>
                <div className="bg-heritage-primary/5 rounded-xl p-3">
                  <p className="text-xs text-gray-600">
                    <strong>Example:</strong> Children split equally if spouse predeceases.
                  </p>
                </div>
              </div>
            </div>

            <TipBox type="warning">
              Never name minor children directly—use a trust or adult custodian to avoid court.
            </TipBox>

            <div className="bg-[#fffaf3] rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-heritage-accent" />
                Who Can Be a Beneficiary?
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { type: "Individuals", examples: "Spouse, kids, parents, friends", icon: Users },
                  { type: "Trusts", examples: "Revocable, irrevocable, special needs", icon: FileText },
                  { type: "Organizations", examples: "Charities, churches, nonprofits", icon: Building }
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4">
                    <item.icon className="w-6 h-6 text-heritage-primary mb-2" />
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.type}</h4>
                    <p className="text-gray-600 text-xs">{item.examples}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 my-8">
              <h3 className="font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
                <CircleCheck className="w-5 h-5 text-heritage-accent" />
                Claim Process
              </h3>
              <div className="space-y-3">
                {[
                  { step: "1", title: "Notify Company", desc: "Call with policy number" },
                  { step: "2", title: "Submit Docs", desc: "Death certificate + claim form" },
                  { step: "3", title: "Review", desc: "Company processes claim" },
                  { step: "4", title: "Payout", desc: "1-2 weeks, lump sum or installments" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-7 h-7 bg-heritage-accent text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-sm">{item.title}</span>
                      <span className="text-gray-600 text-sm"> — {item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 my-8">
              <StatCard value="Tax-Free" label="Beneficiary payout" icon={Banknote} />
              <StatCard value="1-2 Weeks" label="Claim payout time" icon={Clock} />
              <StatCard value="99%+" label="Approval rate" icon={CheckCircle2} />
            </div>

            <TipBox type="tip">
              Update beneficiaries after marriage, divorce, births. Outdated designations override your will.
            </TipBox>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 my-8">
              <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Claims Can Be Denied For:
              </h3>
              <div className="grid md:grid-cols-2 gap-2">
                {[
                  "Lying on application",
                  "Fraud in first 2 years",
                  "Suicide in first 2 years",
                  "Non-payment lapse"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 my-8 text-center">
              <PartyPopper className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="font-bold text-xl text-gray-900 mb-2">
                Course Complete!
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                You're ready to make informed decisions about life insurance.
              </p>
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const glossary = [
    { term: "Beneficiary", definition: "The person or entity who receives the death benefit" },
    { term: "Premium", definition: "The amount you pay for your insurance coverage" },
    { term: "Death Benefit", definition: "The amount paid to beneficiaries when you die" },
    { term: "Cash Value", definition: "Savings component in permanent life insurance" },
    { term: "Underwriting", definition: "The process insurers use to evaluate your risk" },
    { term: "Rider", definition: "Optional add-on coverage for extra benefits" },
    { term: "Term Length", definition: "The duration of coverage for term life policies" },
    { term: "Face Amount", definition: "Another name for the death benefit amount" }
  ];

  const quickFacts = [
    { stat: "60%", label: "of Americans are underinsured or uninsured" },
    { stat: "$500k", label: "average coverage needed for young families" },
    { stat: "$26/mo", label: "average cost for $500k term policy (age 30)" },
    { stat: "1-2 weeks", label: "typical claim payout time" }
  ];

  const handleModuleComplete = (moduleId: number) => {
    const newCompleted = completedModules.includes(moduleId)
      ? completedModules
      : [...completedModules, moduleId];

    setCompletedModules(newCompleted);

    if (moduleId < modules.length - 1) {
      // Move to next module
      setActiveModule(moduleId + 1);
      scrollToContent();
      toast.success(`Module ${moduleId + 1} complete!`, {
        description: `Moving to: ${modules[moduleId + 1].title}`
      });
    } else {
      // Last module completed - check if all modules are done
      if (newCompleted.length === modules.length) {
        setShowCompletionModal(true);
      } else {
        toast.success("Module complete!", {
          description: "Go back to finish any remaining modules."
        });
      }
    }
  };

  const handleModuleSelect = (moduleId: number) => {
    setActiveModule(moduleId);
    scrollToContent();
  };

  const resetProgress = () => {
    setCompletedModules([]);
    setActiveModule(0);
    setShowCompletionModal(false);
    localStorage.removeItem("lifeInsurance101Progress");
    toast.success("Progress reset!", {
      description: "Start fresh from Module 1."
    });
  };

  const progress = Math.round((completedModules.length / modules.length) * 100);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-heritage-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-heritage-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start pt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-heritage-primary/10 text-heritage-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <GraduationCap className="w-4 h-4" />
                Free Learning Center
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-heritage-primary mb-6 leading-tight">
                Life Insurance 101
                <span className="block text-heritage-accent">Learn the Basics</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Everything you need to know about life insurance in simple, jargon-free language. Complete all modules in under 20 minutes.
              </p>

              <div className="space-y-3 mb-8">
                {["6 bite-sized learning modules", "Real examples and scenarios", "Glossary of key terms"].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-heritage-accent flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveModule(0);
                  scrollToContent();
                }}
                className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2 shadow-lg"
              >
                <Play className="w-5 h-5" /> {completedModules.length > 0 ? "Continue Learning" : "Start Learning"}
              </motion.button>
            </motion.div>

            {/* Progress Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-heritage-primary">Your Progress</h3>
                <div className="flex items-center gap-3">
                  {completedModules.length > 0 && (
                    <button
                      onClick={resetProgress}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Reset progress"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <span className={`text-2xl font-bold ${progress === 100 ? 'text-green-500' : 'text-heritage-accent'}`}>
                    {progress}%
                  </span>
                </div>
              </div>

              {progress === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                  <Award className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-green-800">Course Complete!</p>
                    <p className="text-green-600 text-sm">You're ready to get covered.</p>
                  </div>
                </div>
              )}

              <div className="h-3 bg-gray-200 rounded-full mb-8 overflow-hidden">
                <motion.div
                  className="h-full bg-heritage-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="space-y-3">
                {modules.map((module) => (
                  <motion.button
                    key={module.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleModuleSelect(module.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      activeModule === module.id
                        ? 'bg-heritage-primary text-white'
                        : completedModules.includes(module.id)
                          ? 'bg-green-50 text-gray-900'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      activeModule === module.id
                        ? 'bg-white/20'
                        : completedModules.includes(module.id)
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                    }`}>
                      {completedModules.includes(module.id) ? (
                        <CheckCircle className={`w-5 h-5 ${activeModule === module.id ? 'text-white' : 'text-white'}`} />
                      ) : (
                        <module.icon className={`w-5 h-5 ${activeModule === module.id ? 'text-white' : 'text-gray-500'}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{module.title}</p>
                      <p className={`text-sm ${activeModule === module.id ? 'text-white/70' : 'text-gray-500'}`}>
                        {module.duration}
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${activeModule === module.id ? 'text-white' : 'text-gray-400'}`} />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="bg-heritage-primary py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {quickFacts.map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-white">{fact.stat}</p>
                <p className="text-white/80 text-sm">{fact.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Active Module Content */}
      <section ref={contentRef} className="py-16 bg-white scroll-mt-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Module Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-heritage-primary/10 rounded-full">
                    {(() => {
                      const Icon = modules[activeModule].icon;
                      return <Icon className="w-8 h-8 text-heritage-primary" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-heritage-accent font-medium">Module {activeModule + 1} of {modules.length}</p>
                    <h2 className="text-3xl font-bold text-gray-900">{modules[activeModule].title}</h2>
                  </div>
                  <div className="ml-auto hidden sm:flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{modules[activeModule].duration}</span>
                  </div>
                </div>

                {/* Module Content */}
                {renderModuleContent()}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setActiveModule(Math.max(0, activeModule - 1));
                      scrollToContent();
                    }}
                    disabled={activeModule === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                      activeModule === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-heritage-primary hover:bg-heritage-primary/5'
                    }`}
                  >
                    <ChevronRight className="w-5 h-5 rotate-180" /> Previous Module
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleModuleComplete(activeModule)}
                    className="bg-heritage-accent hover:bg-heritage-accent/90 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                  >
                    {activeModule === modules.length - 1 ? 'Complete Course' : 'Next Module'}
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Glossary */}
      <section className="py-16 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-gray-900 mb-4">
              Glossary of Terms
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600">
              Quick reference for common life insurance terminology.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto"
          >
            {glossary.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
              >
                <h3 className="font-bold text-heritage-primary mb-2">{item.term}</h3>
                <p className="text-gray-600 text-sm">{item.definition}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-heritage-primary">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Covered?
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Now that you understand the basics, let us help you find the right policy for your needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-heritage-accent text-white px-8 py-4 rounded-lg font-semibold flex items-center gap-2"
                >
                  Get Your Free Quote <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <a href="tel:6307780800">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 text-white border border-white/30 px-8 py-4 rounded-lg font-semibold flex items-center gap-2 hover:bg-white/20 transition-colors"
                >
                  <Phone className="w-5 h-5" /> Talk to an Expert
                </motion.button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCompletionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl relative"
            >
              <button
                onClick={() => setShowCompletionModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-20 h-20 bg-heritage-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-10 h-10 text-heritage-accent" />
              </div>

              <h3 className="text-2xl font-bold text-heritage-primary mb-2">
                Congratulations!
              </h3>
              <p className="text-gray-600 mb-6">
                You've completed Life Insurance 101! You now understand the basics of life insurance and are ready to make an informed decision.
              </p>

              <div className="bg-green-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">All 6 Modules Complete</span>
                </div>
              </div>

              <div className="space-y-3">
                <Link href="/quote">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-heritage-accent hover:bg-heritage-accent/90 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    Get Your Free Quote <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full text-heritage-primary hover:bg-heritage-primary/5 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Review Modules
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
