"use client";
import { Computer, Network, Sparkles } from "lucide-react";
import { FaBusinessTime } from "react-icons/fa";
// import { OrbitingCirclesComponent } from './orbiting-circles'
import { motion } from "motion/react";

const features = [
  {
    name: "🔖 Generate metadata instantly",
    description:
      "Upload your image or video and let our AI do the heavy lifting. Say goodbye to repetitive typing and research.",
    icon: Computer,
  },
  {
    name: "🧠 Optimized for stock platforms",
    description:
      "Our tool understands the unique requirements of leading stock agencies, helping improve discoverability and approval rates.",
    icon: FaBusinessTime,
  },
  {
    name: "📈 Scale your submissions",
    description:
      "Whether you are an individual contributor or an agency, TagPix Ai helps you publish more content in less time with consistent, professional metadata.",
    icon: Network,
  },
];

export default function SideBySide() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto  max-w-2xl  gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:pr-8 lg:pt-4 lg:col-span-3"
          >
            <div className="lg:max-w-lg">
              {/* Pill badge */}
              <div className="mb-6 w-fit rounded-full border px-4 py-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Sparkles className="h-4 w-4" />
                  <span>Why Choose TagPix Ai</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold pb-2">
                Smart Metadata for Stock Creators
              </h2>
              <p className="mt-6 text-lg">
                Accelerate your stock submission workflow with AI-powered
                automation. TagPix Ai instantly generates high-quality titles,
                keywords, and descriptions optimized for platforms like Adobe
                Stock and Shutterstock — so you can focus on creating, not
                tagging.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 lg:max-w-none">
                {features.map((feature, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    key={feature.name}
                    className="relative pl-12 group p-4 rounded-xl transition-colors"
                  >
                    <dt className="inline font-semibold">
                      <feature.icon
                        className="absolute left-3 top-5 h-6 w-6 group-hover:scale-110 transition-transform"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{" "}
                    <dd className="inline">
                      {feature.description}
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
