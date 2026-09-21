"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.6,
    },
  },
};

const container2 = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 1.8,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const BIRTHDAY = { year: 2000, month: 8, day: 8 };

function yearsSince({ year, month, day }: typeof BIRTHDAY) {
  const now = new Date();
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= day);
  return now.getFullYear() - year - (hadBirthday ? 0 : 1);
}

/** Live age. Hover the number to see how it's computed. */
function Age() {
  return (
    <span
      className="group cursor-help font-mono text-amber-300 underline decoration-dotted decoration-amber-300/60 underline-offset-4"
      title="computed at render"
    >
      <span className="group-hover:hidden" suppressHydrationWarning>
        {yearsSince(BIRTHDAY)}
      </span>
      <span className="hidden text-white/60 group-hover:inline">yearsSince(&quot;2000-08-08&quot;)</span>
    </span>
  );
}

const sentences = [
  <>
    <Age /> years old, from Alexandria, Egypt.
  </>,
  "I studied computer engineering, but I realized my passion was to create, design, and explore the world, so I shifted to product design.",
  "Now I\u2019ve come full circle, bridging design and code to produce beautiful and functional products.",
];

const sentences2 = [
  <>
    I care about <strong>simple things done well</strong>: an interface that doesn’t need
    explaining, a decision with numbers behind it, a problem understood before it’s solved.
  </>,
  "Off the clock I lift, read, and collect things from the internet that make me stop scrolling.",
];

export function AboutContent() {
  return (
    <div className="relative z-10 w-full flex flex-col items-center min-h-[calc(100vh-10rem)] justify-center">
      <motion.img
        src="/animations/heart-alpha.apng"
        alt=""
        className="w-20 h-20 object-cover object-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
      <motion.div
        className="text-white/80 text-base sm:text-lg leading-relaxed text-center sm:text-justify px-6 sm:px-0 sm:max-w-lg"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {sentences.map((sentence, i) => (
          <motion.span key={i} variants={item}>
            {sentence}{" "}
          </motion.span>
        ))}
      </motion.div>
      <motion.div
        className="text-white/80 text-base sm:text-lg leading-relaxed text-center sm:text-justify px-6 sm:px-0 sm:max-w-lg mt-8"
        variants={container2}
        initial="hidden"
        animate="show"
      >
        {sentences2.map((sentence, i) => (
          <motion.span key={i} variants={item}>
            {sentence}{" "}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
