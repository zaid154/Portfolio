import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  FileText,
  Download,
  KeyRound,
  LayoutTemplate,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const FEATURES = [
  {
    icon: FileText,
    title: "Guided resume builder",
    text: "Fill simple sections and watch a polished resume assemble in real time.",
  },
  {
    icon: Target,
    title: "ATS score",
    text: "Score your resume against any job description and see exactly what to fix.",
  },
  {
    icon: KeyRound,
    title: "Keyword suggestions",
    text: "Discover the exact keywords recruiters' systems are scanning for.",
  },
  {
    icon: LayoutTemplate,
    title: "Multiple templates",
    text: "Switch between Modern, Classic, Minimal and Elegant with one click.",
  },
  {
    icon: Download,
    title: "One-click PDF export",
    text: "Export a clean, text-based PDF that parses perfectly in ATS software.",
  },
  {
    icon: ShieldCheck,
    title: "Secure accounts",
    text: "JWT auth with hashed passwords keeps every resume tied to your account.",
  },
];

export default function Landing() {
  const { user } = useAuth();
  const ctaTo = user ? "/dashboard" : "/register";

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="pill">
              <Sparkles size={14} /> Beat the bots. Land the interview.
            </span>
            <h1>
              Build a resume that <span className="grad">gets past the ATS</span>
            </h1>
            <p className="lead">
              Create a professional resume, score it against real job descriptions, get
              targeted keyword suggestions, and export an ATS-friendly PDF — all in one place.
            </p>
            <div className="hero-cta">
              <Link to={ctaTo} className="btn btn-primary btn-lg">
                <Sparkles size={18} /> {user ? "Go to dashboard" : "Start for free"}
              </Link>
              <Link to={user ? "/analyze" : "/login"} className="btn btn-ghost btn-lg">
                {user ? "Analyze a resume" : "I have an account"}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="features">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="feature"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <div className="f-icon">
              <f.icon size={20} />
            </div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
