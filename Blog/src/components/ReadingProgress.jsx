import { motion, useScroll } from "framer-motion";

export const ReadingProgress = () => {
  const { scrollYProgress } = useScroll();
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 z-[100] origin-left"
      style={{ scaleX: scrollYProgress }}
    />
  );
};