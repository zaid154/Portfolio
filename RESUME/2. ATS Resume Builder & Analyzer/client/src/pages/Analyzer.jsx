import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Target, Sparkles, Check, X, Lightbulb, ArrowLeft, Pencil } from "lucide-react";
import api, { apiError } from "../api/client.js";
import ScoreRing from "../components/ScoreRing.jsx";
import { scoreColor } from "../lib/score.js";

const SAMPLE = `We're hiring a Full-Stack Developer to build and scale web apps.

Requirements:
- Strong JavaScript, React and Node.js
- Experience with REST APIs, MongoDB and Express
- Familiarity with Git, CI/CD and cloud deployment (AWS)
- Bonus: TypeScript, Docker, testing (Jest)
You will collaborate with designers, ship features and optimize performance.`;

export default function Analyzer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState(id || "");
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/resumes")
      .then((res) => {
        setResumes(res.data.resumes);
        if (!id && res.data.resumes[0]) setSelectedId(res.data.resumes[0]._id);
      })
      .catch((err) => toast.error(apiError(err)));
  }, [id]);

  const analyze = async () => {
    if (!selectedId) return toast.error("Select a resume first");
    if (jd.trim().length < 20) return toast.error("Paste a fuller job description");
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/ats/analyze", { resumeId: selectedId, jobDescription: jd });
      setResult(res.data.result);
    } catch (err) {
      toast.error(apiError(err, "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1>ATS Analyzer</h1>
          <p>Score a resume against a job description and get keyword suggestions.</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} /> Dashboard
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="empty">
          <Target size={44} />
          <h3>No resume to analyze</h3>
          <p>Create a resume first, then come back to score it.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 14 }}>
            Go to dashboard
          </Link>
        </div>
      ) : (
        <div className="analyzer-grid">
          {/* Input */}
          <div className="card card-pad">
            <div className="field">
              <label>Resume</label>
              <select
                className="input"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title} {r.personal?.fullName ? `— ${r.personal.fullName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <label style={{ marginBottom: 0 }}>Job description</label>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setJd(SAMPLE)}
                  type="button"
                >
                  Use sample
                </button>
              </div>
              <textarea
                className="textarea"
                style={{ minHeight: 260, marginTop: 6 }}
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here…"
              />
              <p className="field-hint">
                We extract the most important keywords and check your resume against them.
              </p>
            </div>

            <button className="btn btn-primary btn-block" onClick={analyze} disabled={loading}>
              <Target size={18} /> {loading ? "Analyzing…" : "Analyze resume"}
            </button>
            {selectedId && (
              <Link
                to={`/builder/${selectedId}`}
                className="btn btn-ghost btn-block"
                style={{ marginTop: 10 }}
              >
                <Pencil size={16} /> Edit this resume
              </Link>
            )}
          </div>

          {/* Results */}
          <div className="card card-pad">
            {!result ? (
              <div className="empty" style={{ padding: "40px 10px" }}>
                <Sparkles size={40} />
                <h3>Your score appears here</h3>
                <p>Pick a resume, paste a job description, and hit Analyze.</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Score header */}
                <div className="row" style={{ gap: 20, alignItems: "center" }}>
                  <ScoreRing score={result.score} />
                  <div>
                    <span
                      className="rating-badge"
                      style={{
                        background: `${scoreColor(result.score)}22`,
                        color: scoreColor(result.score),
                      }}
                    >
                      {result.rating}
                    </span>
                    <p style={{ margin: "10px 0 0", color: "var(--text-soft)", fontSize: "0.9rem" }}>
                      Matched <strong>{result.matchedKeywords.length}</strong> of{" "}
                      <strong>{result.totalKeywords}</strong> key terms · {result.wordCount} words
                    </p>
                  </div>
                </div>

                {/* Breakdown */}
                <h4 className="section-title" style={{ marginTop: 26 }}>
                  Score breakdown
                </h4>
                {result.breakdown.map((b) => (
                  <div className="breakdown-row" key={b.key}>
                    <div className="br-head">
                      <span>{b.label}</span>
                      <span style={{ color: scoreColor(b.score) }}>{b.score}</span>
                    </div>
                    <div className="br-bar">
                      <div
                        className="br-fill"
                        style={{ width: `${b.score}%`, background: scoreColor(b.score) }}
                      />
                    </div>
                    <div className="br-tip">{b.tip}</div>
                  </div>
                ))}

                {/* Keywords */}
                <h4 className="section-title" style={{ marginTop: 22 }}>
                  Matched keywords
                </h4>
                {result.matchedKeywords.length ? (
                  <div className="keyword-cloud">
                    {result.matchedKeywords.map((k) => (
                      <span className="kw kw-match" key={k}>
                        <Check size={12} /> {k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="br-tip">No overlap yet — add relevant keywords below.</p>
                )}

                <h4 className="section-title" style={{ marginTop: 18 }}>
                  Missing keywords
                </h4>
                {result.missingKeywords.length ? (
                  <div className="keyword-cloud">
                    {result.missingKeywords.map((k) => (
                      <span className="kw kw-miss" key={k}>
                        <X size={12} /> {k}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="br-tip">Great — you covered the important terms.</p>
                )}

                {/* Suggestions */}
                <h4 className="section-title" style={{ marginTop: 22 }}>
                  <Lightbulb size={14} style={{ verticalAlign: "-2px" }} /> Suggestions
                </h4>
                {result.suggestions.map((s, i) => (
                  <div className="suggestion" key={i}>
                    <span className={`prio prio-${s.priority}`}>{s.priority}</span>
                    <span>{s.text}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
