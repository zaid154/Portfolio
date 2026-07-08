import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Section({ icon: Icon, title, count, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section-block">
      <div className="section-head" onClick={() => setOpen((o) => !o)}>
        <span className="sh-icon">
          <Icon size={18} />
        </span>
        <h3>{title}</h3>
        {count != null && <span className="count">{count}</span>}
        <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: "inline-flex" }}>
          <ChevronDown size={18} color="#94a3b8" />
        </motion.span>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: "hidden" }}
          >
            <div className="section-body">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
