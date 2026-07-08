import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Plus,
  FileText,
  Pencil,
  Target,
  Copy,
  Trash2,
  FileStack,
} from "lucide-react";
import api, { apiError } from "../api/client.js";
import { scoreColor } from "../lib/score.js";

const BLANK = {
  title: "Untitled Resume",
  template: "modern",
  personal: { fullName: "", jobTitle: "" },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    try {
      const res = await api.get("/resumes");
      setResumes(res.data.resumes);
    } catch (err) {
      toast.error(apiError(err, "Could not load resumes"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createResume = async () => {
    setCreating(true);
    try {
      const res = await api.post("/resumes", BLANK);
      navigate(`/builder/${res.data.resume._id}`);
    } catch (err) {
      toast.error(apiError(err, "Could not create resume"));
      setCreating(false);
    }
  };

  const duplicate = async (id) => {
    try {
      await api.post(`/resumes/${id}/duplicate`);
      toast.success("Duplicated");
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const remove = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/resumes/${id}`);
      setResumes((r) => r.filter((x) => x._id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>Your resumes</h1>
          <p>Build, score and export. Every resume is auto-saved.</p>
        </div>
        <button className="btn btn-primary" onClick={createResume} disabled={creating}>
          <Plus size={18} /> {creating ? "Creating…" : "New resume"}
        </button>
      </div>

      {loading ? (
        <div className="app-loader" style={{ minHeight: 240 }}>
          <div className="spinner" />
        </div>
      ) : resumes.length === 0 ? (
        <div className="empty">
          <FileStack size={44} />
          <h3>No resumes yet</h3>
          <p>Create your first resume to get an instant ATS score.</p>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={createResume}>
            <Plus size={18} /> Create resume
          </button>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map((r, i) => (
            <motion.div
              key={r._id}
              className="resume-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
            >
              <div className="rc-top">
                <div>
                  <h3>{r.title}</h3>
                  <div className="rc-sub">
                    {r.personal?.fullName || "Unnamed"}
                    {r.personal?.jobTitle ? ` · ${r.personal.jobTitle}` : ""}
                  </div>
                </div>
                <div
                  className="score-badge"
                  style={{ background: scoreColor(r.lastScore) }}
                  title="Last ATS score"
                >
                  {r.lastScore ?? "—"}
                </div>
              </div>

              <div className="row" style={{ gap: 8 }}>
                <span className="chip chip-template">
                  <FileText size={12} /> {r.template}
                </span>
                <span className="rc-sub">
                  Updated {new Date(r.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <div className="rc-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/builder/${r._id}`)}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/analyze/${r._id}`)}
                >
                  <Target size={14} /> Analyze
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => duplicate(r._id)}
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => remove(r._id, r.title)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
