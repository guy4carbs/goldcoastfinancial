import { motion } from "framer-motion";
import { Link } from "wouter";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { useAgentStore } from "@/lib/agentStore";
import {
  BookOpen,
  GraduationCap,
  Megaphone,
  Wrench,
  Building2,
  Headphones,
  ArrowRight,
  Bell,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  User,
  ChevronRight,
  Star,
  FileText,
  Phone
} from "lucide-react";

const quickAccessCards = [
  {
    icon: BookOpen,
    title: "Product Guides",
    description: "Comprehensive guides for all insurance products",
    color: "bg-blue-500",
    tab: "guides"
  },
  {
    icon: GraduationCap,
    title: "Training Center",
    description: "Video training and certification courses",
    color: "bg-purple-500",
    tab: "training"
  },
  {
    icon: Megaphone,
    title: "Marketing Materials",
    description: "Brochures, presentations, and social content",
    color: "bg-green-500",
    tab: "marketing"
  },
  {
    icon: Wrench,
    title: "Sales Tools",
    description: "Calculators, quote tools, and case status",
    color: "bg-orange-500",
    tab: "tools"
  },
  {
    icon: Building2,
    title: "Carrier Portals",
    description: "Quick access to all carrier systems",
    color: "bg-indigo-500",
    tab: "carriers"
  },
  {
    icon: Headphones,
    title: "Support Center",
    description: "Get help from our team",
    color: "bg-rose-500",
    tab: "support"
  }
];

const announcements = [
  {
    date: "Jan 15, 2026",
    title: "New IUL Product Launch",
    description: "Introducing our enhanced IUL product with improved cap rates. Training webinar scheduled for next week.",
    priority: "high"
  },
  {
    date: "Jan 10, 2026",
    title: "Q4 Commission Statements Ready",
    description: "Your Q4 2025 commission statements are now available for download in the Support section.",
    priority: "normal"
  },
  {
    date: "Jan 5, 2026",
    title: "Updated Underwriting Guidelines",
    description: "North American has updated their underwriting guidelines for Final Expense products.",
    priority: "normal"
  }
];

const upcomingEvents = [
  {
    date: "Jan 22",
    title: "IUL Product Training Webinar",
    time: "2:00 PM CST"
  },
  {
    date: "Jan 25",
    title: "Monthly Sales Meeting",
    time: "10:00 AM CST"
  },
  {
    date: "Feb 1",
    title: "New Agent Orientation",
    time: "9:00 AM CST"
  }
];

export default function AgentLounge() {
  const { currentUser } = useAgentStore();

  return (
    <AgentLoungeLayout>
      {/* Welcome Banner */}
      <section className="pb-8 -mx-4 lg:-mx-6 -mt-4 lg:-mt-6 px-4 lg:px-6 pt-6 bg-primary rounded-b-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-violet-500/20 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-violet-500" />
              </div>
              <div>
                <p className="text-violet-500/80 text-sm">Welcome back,</p>
                <h1 className="text-2xl font-bold text-white">
                  {currentUser?.name || 'Agent'}
                </h1>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link
              href="/agents/resources"
              className="bg-violet-500 text-primary px-6 py-2.5 rounded-xl font-semibold hover:bg-violet-500/90 transition-colors flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Agent Resources
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: TrendingUp, label: "YTD Production", value: "$125,450", color: "text-green-600" },
              { icon: FileText, label: "Pending Cases", value: "8", color: "text-blue-600" },
              { icon: Award, label: "Agent Level", value: "Gold", color: "text-violet-500" },
              { icon: Clock, label: "Last Login", value: "Today", color: "text-gray-600" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-4 text-center"
              >
                <stat.icon className={`w-5 h-5 ${stat.color} mx-auto mb-2`} />
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Access - Left Column */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h2 className="text-xl font-bold text-primary mb-1">Quick Access</h2>
                <p className="text-gray-600 text-sm">Jump directly to the resources you need</p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickAccessCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/agents/resources?tab=${card.tab}`}
                      className="block bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all group border border-gray-100"
                    >
                      <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                        <card.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-primary mb-1 group-hover:text-violet-500 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-gray-500">{card.description}</p>
                      <div className="mt-3 flex items-center text-violet-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Access <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Featured Resource */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-6 text-white"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6 text-violet-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Featured: New IUL Training Series</h3>
                    <p className="text-white/80 text-sm mb-4">
                      Master the art of selling Indexed Universal Life with our comprehensive 6-part training series.
                      Learn advanced concepts, overcome objections, and close more sales.
                    </p>
                    <Link
                      href="/agents/resources?tab=training"
                      className="inline-flex items-center gap-2 bg-violet-500 text-primary px-4 py-2 rounded-lg font-semibold text-sm hover:bg-violet-500/90 transition-colors"
                    >
                      Start Training <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Announcements & Events */}
            <div className="space-y-6">
              {/* Announcements */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-violet-500" />
                  <h3 className="font-bold text-primary">Announcements</h3>
                </div>
                <div className="space-y-4">
                  {announcements.map((announcement, index) => (
                    <div
                      key={index}
                      className={`pb-4 ${index !== announcements.length - 1 ? 'border-b border-gray-100' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {announcement.priority === 'high' && (
                          <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                        )}
                        <div>
                          <p className="text-xs text-gray-400 mb-1">{announcement.date}</p>
                          <h4 className="font-semibold text-primary text-sm mb-1">
                            {announcement.title}
                          </h4>
                          <p className="text-xs text-gray-600">{announcement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Upcoming Events */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-violet-500" />
                  <h3 className="font-bold text-primary">Upcoming Events</h3>
                </div>
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <div className="text-center min-w-[50px]">
                        <p className="text-xs text-gray-500">{event.date.split(' ')[0]}</p>
                        <p className="font-bold text-primary">{event.date.split(' ')[1]}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-primary text-sm">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Need Help */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-violet-500/10 rounded-2xl p-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="w-5 h-5 text-violet-500" />
                  <h3 className="font-bold text-primary">Need Help?</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Our agent support team is here to help you succeed.
                </p>
                <div className="space-y-2">
                  <a
                    href="tel:6307780800"
                    className="block text-sm font-medium text-primary hover:text-violet-500 transition-colors"
                  >
                    (630) 778-0800
                  </a>
                  <a
                    href="mailto:agents@heritagels.org"
                    className="block text-sm font-medium text-primary hover:text-violet-500 transition-colors"
                  >
                    agents@heritagels.org
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </AgentLoungeLayout>
  );
}
