import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";

export function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative max-h-[90vh] w-full max-w-xl overflow-hidden rounded-2xl bg-slate-900 p-6 shadow-2xl border border-slate-800"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors"
              onClick={onClose}
            >
              <FaTimes size={14} />
            </button>
            {title && (
              <h2 className="mb-4 text-lg font-semibold text-slate-50">
                {title}
              </h2>
            )}
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

