"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  LockClosedIcon,
  BoltIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const features = [
  {
    name: "Full CRUD Operations",
    description: "Create, read, update, and delete tasks with ease. Manage your workflow efficiently with intuitive controls.",
    icon: CheckCircleIcon,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Secure Authentication",
    description: "JWT-based authentication with HTTP-only cookies, bcrypt password hashing, and social login options.",
    icon: LockClosedIcon,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Modern UI/UX",
    description: "Beautiful interface with dark mode, smooth animations, and responsive design that works on all devices.",
    icon: BoltIcon,
    gradient: "from-orange-500 to-red-500",
  },
  {
    name: "Enterprise Security",
    description: "AES-256 encryption for sensitive data, input validation, SQL injection prevention, and proper authorization.",
    icon: ShieldCheckIcon,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    name: "Real-time Updates",
    description: "Get instant feedback with toast notifications and loading states for all operations.",
    icon: SparklesIcon,
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    name: "Advanced Filtering",
    description: "Search, filter by status, and paginate through tasks. Find what you need in seconds.",
    icon: ChartBarIcon,
    gradient: "from-pink-500 to-rose-500",
  },
];

const stats = [
  { label: "Tasks Created", value: "10K+" },
  { label: "Active Users", value: "2.5K+" },
  { label: "Uptime", value: "99.9%" },
  { label: "Countries", value: "50+" },
];

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >

            {/* Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Manage Tasks Like a
              <span className="block text-gradient">
                Pro Developer
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
              Professional task management with enterprise-grade security, modern UI,
              and powerful features. Built for developers who demand excellence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth/signup">
                <Button size="lg" className="cursor-pointer text-lg px-8 h-14 w-full sm:w-auto bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/features">
                <Button size="lg" variant="outline" className="cursor-pointer text-lg px-8 h-14 w-full sm:w-auto hover:bg-accent transition-all">
                  Explore Features
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mt-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-gradient mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to
              <span className="text-gradient"> stay organized</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you manage tasks efficiently
              and securely
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="group relative bg-card border border-border rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl bg-linear-to-br ${feature.gradient} mb-6`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.name}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative rounded-3xl bg-linear-to-br from-blue-600 to-purple-600 p-12 text-center text-white overflow-hidden"
          >
            <div className="absolute inset-0 bg-grid-white/10" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">
                Ready to boost your productivity?
              </h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of developers who trust Planify for their
                daily task management needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="text-lg px-8 h-14 w-full sm:w-auto shadow-xl hover:shadow-2xl transition-shadow"
                  >
                    Start Free Today
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 h-14 w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

