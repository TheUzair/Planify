"use client";

import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  BoltIcon,
  SparklesIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  KeyIcon,
  DocumentMagnifyingGlassIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    category: "Task Management",
    items: [
      {
        name: "Full CRUD Operations",
        description: "Create, read, update, and delete tasks with a clean and intuitive interface. Manage your workflow with ease.",
        icon: CheckCircleIcon,
      },
      {
        name: "Advanced Filtering",
        description: "Filter tasks by status (To Do, In Progress, Completed), search by title, and navigate with pagination.",
        icon: DocumentMagnifyingGlassIcon,
      },
      {
        name: "Real-time Updates",
        description: "Get instant feedback with toast notifications for all operations and see changes reflected immediately.",
        icon: BoltIcon,
      },
    ],
  },
  {
    category: "Security & Privacy",
    items: [
      {
        name: "Secure Authentication",
        description: "JWT-based authentication with HTTP-only cookies, bcrypt password hashing (12 salt rounds), and session management.",
        icon: LockClosedIcon,
      },
      {
        name: "Data Encryption",
        description: "AES-256 encryption for sensitive task descriptions, ensuring your data remains private and secure.",
        icon: ShieldCheckIcon,
      },
      {
        name: "Authorization Controls",
        description: "Users can only access their own tasks. Proper authorization checks on all API endpoints.",
        icon: KeyIcon,
      },
    ],
  },
  {
    category: "User Experience",
    items: [
      {
        name: "Modern UI/UX",
        description: "Beautiful interface with smooth animations, hover effects, and micro-interactions for a delightful experience.",
        icon: SparklesIcon,
      },
      {
        name: "Dark Mode Support",
        description: "Fully-featured dark mode that works seamlessly across the entire application. Easy toggle from anywhere.",
        icon: CloudArrowUpIcon,
      },
      {
        name: "Responsive Design",
        description: "Works perfectly on all devices - desktop, tablet, and mobile. Optimized for touch and accessibility.",
        icon: DevicePhoneMobileIcon,
      },
    ],
  },
  {
    category: "Developer Features",
    items: [
      {
        name: "Type-Safe APIs",
        description: "Built with TypeScript and Zod for runtime validation. Catch errors before they reach production.",
        icon: CpuChipIcon,
      },
      {
        name: "RESTful Architecture",
        description: "Clean API design following REST principles with proper HTTP status codes and error messages.",
        icon: ChartBarIcon,
      },
      {
        name: "Scalable Database",
        description: "MongoDB with Mongoose ODM for flexible, schema-based data modeling and efficient queries.",
        icon: UserGroupIcon,
      },
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              Powerful Features for
              <span className="block text-gradient">Modern Task Management</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage tasks efficiently, securely, and beautifully.
              Built with modern technologies and best practices.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      {features.map((section, sectionIndex) => (
        <section
          key={section.category}
          className={`py-20 px-4 sm:px-6 lg:px-8 ${sectionIndex % 2 === 1 ? "bg-muted/30" : ""
            }`}
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-12 text-center">
                {section.category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {section.items.map((feature, index) => (
                  <motion.div
                    key={feature.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="group bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to experience these features?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Start managing your tasks like a pro today. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/auth/signup"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
              >
                Get Started Free
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-white/10 border-2 border-white/20 text-white hover:bg-white/20 transition-all cursor-pointer hover:scale-105"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
