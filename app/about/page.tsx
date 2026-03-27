"use client";

import { motion } from "framer-motion";
import { SparklesIcon, HeartIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

const values = [
  {
    name: "Innovation",
    description: "We constantly push the boundaries of what's possible in task management.",
    icon: SparklesIcon,
  },
  {
    name: "User-Centric",
    description: "Every feature is designed with our users' needs and experience in mind.",
    icon: HeartIcon,
  },
  {
    name: "Performance",
    description: "Fast, reliable, and scalable. We never compromise on performance.",
    icon: RocketLaunchIcon,
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold mb-6">
              About
              <span className="text-gradient"> Planify</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Building the future of task management with modern technology
              and user-first design principles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              At Planify, we believe that productivity tools should be powerful yet simple,
              secure yet accessible, and professional yet delightful to use. Our mission is to provide
              developers and teams with a task management solution that meets enterprise-grade standards
              while maintaining an intuitive and modern user experience.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We&apos;re committed to building software that respects your privacy, protects your data,
              and helps you achieve more every day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-12 text-center">Our Values</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="inline-flex p-4 rounded-xl bg-primary/10 mb-6">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{value.name}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-6">Built with Modern Tech</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-12">
              Planify is built using cutting-edge technologies to ensure the best
              performance, security, and developer experience.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                "Next.js 16",
                "TypeScript",
                "Mongoose",
                "MongoDB",
                "NextAuth.js",
                "Tailwind CSS",
                "Framer Motion",
                "Zod Validation",
              ].map((tech, index) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: 0.05 * index }}
                  className="py-4 px-6 bg-muted rounded-lg font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {tech}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Join us in rethinking task management
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Experience the difference that modern technology and thoughtful
              design can make.
            </p>
            <a
              href="/auth/signup"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-lg bg-white text-blue-600 hover:bg-gray-100 transition-all cursor-pointer shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started Today
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
