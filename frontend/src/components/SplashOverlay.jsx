import { motion, AnimatePresence } from "framer-motion";
import { useUi } from "../context/UiContext";
import { FaBlog } from "react-icons/fa";

export function SplashOverlay() {
  const { splashVisible, splashMessage } = useUi();

  return (
    <AnimatePresence>
      {splashVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex flex-col items-center gap-4 rounded-2xl bg-slate-900 px-10 py-8 shadow-2xl border border-slate-700"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <motion.div
              className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            >
              <FaBlog size={28} />
            </motion.div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-50">
                {splashMessage || "Loading blog experience..."}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Just a moment, we're preparing everything for you.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

