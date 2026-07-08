import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  Palette,
  Plus,
  Trash2,
  Download,
  Target,
  Check,
  Loader2,
  Save,
} from "lucide-react";
import api, { apiError } from "../api/client.js";
import ResumePreview, { TEMPLATES, ACCENTS } from "../components/templates/index.jsx";
import Section from "../components/builder/Section.jsx";
import TagInput from "../components/builder/TagInput.jsx";

const BLANK = {
  experience: { company: "", role: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] },
  education: { school: "", degree: "", field: "", startDate: "", endDate: "", grade: "" },
  project: { name: "", description: "", link: "", tech: [] },
  certification: { name: "", issuer: "", date: "" },
};

export default function Builder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState("saved"); // saved | dirty | saving
  const skipSave = useRef(true);

  // ---- Load ----
  useEffect(() => {
    let alive = true;
    api
      .get(`/resumes/${id}`)
      .then((res) => {
        if (alive) setData(res.data.resume);
      })
      .catch((err) => {
        toast.error(apiError(err, "Resume not found"));
        navigate("/dashboard");
      });
    return () => {
      alive = false;
    };
  }, [id, navigate]);

  // ---- Debounced autosave ----
  useEffect(() => {
    if (!data) return;
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    setSaveState("dirty");
    const t = setTimeout(() => save(data), 1100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // ---- Warn on unsaved changes ----
  useEffect(() => {
    const handler = (e) => {
      if (saveState !== "saved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  const save = async (snapshot) => {
    setSaveState("saving");
    try {
      // eslint-disable-next-line no-unused-vars
      const { _id, user, createdAt, updatedAt, __v, lastScore, ...payload } = snapshot;
      await api.put(`/resumes/${id}`, payload);
      setSaveState("saved");
    } catch (err) {
      toast.error(apiError(err, "Save failed"));
      setSaveState("dirty");
    }
  };

  // ---- Update helpers ----
  const patch = (partial) => setData((d) => ({ ...d, ...partial }));
  const setPersonal = (key, val) =>
    setData((d) => ({ ...d, personal: { ...d.personal, [key]: val } }));

  const setItem = (section, index, key, val) =>
    setData((d) => {
      const list = [...d[section]];
      list[index] = { ...list[index], [key]: val };
      return { ...d, [section]: list };
    });
  const addItem = (section) =>
    setData((d) => ({ ...d, [section]: [...d[section], { ...BLANK[section] }] }));
  const removeItem = (section, index) =>
    setData((d) => ({ ...d, [section]: d[section].filter((_, i) => i !== index) }));

  const setBullet = (ei, bi, val) =>
    setData((d) => {
      const exp = [...d.experience];
      const bullets = [...exp[ei].bullets];
      bullets[bi] = val;
      exp[ei] = { ...exp[ei], bullets };
      return { ...d, experience: exp };
    });
  const addBullet = (ei) =>
    setData((d) => {
      const exp = [...d.experience];
      exp[ei] = { ...exp[ei], bullets: [...exp[ei].bullets, ""] };
      return { ...d, experience: exp };
    });
  const removeBullet = (ei, bi) =>
    setData((d) => {
      const exp = [...d.experience];
      exp[ei] = { ...exp[ei], bullets: exp[ei].bullets.filter((_, i) => i !== bi) };
      return { ...d, experience: exp };
    });

  const exportPDF = () => {
    const prev = document.title;
    document.title = data.title || "resume";
    window.print();
    setTimeout(() => (document.title = prev), 600);
  };

  if (!data) {
    return (
      <div className="app-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <>
      <div className="builder-toolbar">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={16} />
        </button>
        <input
          className="title-input"
          value={data.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder="Resume title"
        />
        <span className={`save-state ${saveState}`}>
          {saveState === "saving" ? (
            <>
              <Loader2 size={14} className="spin-inline" /> Saving…
            </>
          ) : saveState === "dirty" ? (
            <>Unsaved changes</>
          ) : (
            <>
              <Check size={14} /> Saved
            </>
          )}
        </span>
        <div className="toolbar-spacer" />
        <button className="btn btn-ghost btn-sm" onClick={() => save(data)}>
          <Save size={16} /> Save
        </button>
        <Link className="btn btn-ghost btn-sm" to={`/analyze/${id}`}>
          <Target size={16} /> Analyze
        </Link>
        <button className="btn btn-primary btn-sm" onClick={exportPDF}>
          <Download size={16} /> Download PDF
        </button>
      </div>

      <div className="builder">
        {/* ---------------- Editor ---------------- */}
        <div className="editor-panel">
          {/* Personal */}
          <Section icon={User} title="Personal details">
            <div className="grid-2">
              <div className="field">
                <label>Full name</label>
                <input
                  className="input"
                  value={data.personal.fullName}
                  onChange={(e) => setPersonal("fullName", e.target.value)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="field">
                <label>Job title</label>
                <input
                  className="input"
                  value={data.personal.jobTitle}
                  onChange={(e) => setPersonal("jobTitle", e.target.value)}
                  placeholder="Frontend Engineer"
                />
              </div>
              <div className="field">
                <label>Email</label>
                <input
                  className="input"
                  value={data.personal.email}
                  onChange={(e) => setPersonal("email", e.target.value)}
                  placeholder="jane@email.com"
                />
              </div>
              <div className="field">
                <label>Phone</label>
                <input
                  className="input"
                  value={data.personal.phone}
                  onChange={(e) => setPersonal("phone", e.target.value)}
                  placeholder="+1 555 123 4567"
                />
              </div>
              <div className="field">
                <label>Location</label>
                <input
                  className="input"
                  value={data.personal.location}
                  onChange={(e) => setPersonal("location", e.target.value)}
                  placeholder="Berlin, Germany"
                />
              </div>
              <div className="field">
                <label>Website / Portfolio</label>
                <input
                  className="input"
                  value={data.personal.website}
                  onChange={(e) => setPersonal("website", e.target.value)}
                  placeholder="janedoe.dev"
                />
              </div>
              <div className="field">
                <label>LinkedIn</label>
                <input
                  className="input"
                  value={data.personal.linkedin}
                  onChange={(e) => setPersonal("linkedin", e.target.value)}
                  placeholder="linkedin.com/in/jane"
                />
              </div>
              <div className="field">
                <label>GitHub</label>
                <input
                  className="input"
                  value={data.personal.github}
                  onChange={(e) => setPersonal("github", e.target.value)}
                  placeholder="github.com/jane"
                />
              </div>
            </div>
            <div className="field">
              <label>Professional summary</label>
              <textarea
                className="textarea"
                value={data.personal.summary}
                onChange={(e) => setPersonal("summary", e.target.value)}
                placeholder="2–3 lines summarizing your experience, strengths and what you're looking for."
              />
            </div>
          </Section>

          {/* Experience */}
          <Section icon={Briefcase} title="Experience" count={data.experience.length}>
            {data.experience.map((e, i) => (
              <div className="item-block" key={i}>
                <div className="item-head">
                  <span>Experience {i + 1}</span>
                  <button className="icon-btn" onClick={() => removeItem("experience", i)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Role</label>
                    <input
                      className="input"
                      value={e.role}
                      onChange={(ev) => setItem("experience", i, "role", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Company</label>
                    <input
                      className="input"
                      value={e.company}
                      onChange={(ev) => setItem("experience", i, "company", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Start</label>
                    <input
                      className="input"
                      value={e.startDate}
                      onChange={(ev) => setItem("experience", i, "startDate", ev.target.value)}
                      placeholder="Jan 2022"
                    />
                  </div>
                  <div className="field">
                    <label>End</label>
                    <input
                      className="input"
                      value={e.endDate}
                      onChange={(ev) => setItem("experience", i, "endDate", ev.target.value)}
                      placeholder="Present"
                      disabled={e.current}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Location</label>
                  <input
                    className="input"
                    value={e.location}
                    onChange={(ev) => setItem("experience", i, "location", ev.target.value)}
                  />
                </div>
                <label className="row" style={{ fontSize: "0.85rem", gap: 6, marginBottom: 8 }}>
                  <input
                    type="checkbox"
                    checked={e.current}
                    onChange={(ev) => setItem("experience", i, "current", ev.target.checked)}
                  />
                  I currently work here
                </label>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-soft)" }}>
                  Achievements
                </label>
                {e.bullets.map((b, bi) => (
                  <div className="bullet-row" key={bi}>
                    <textarea
                      className="textarea"
                      value={b}
                      onChange={(ev) => setBullet(i, bi, ev.target.value)}
                      placeholder="Led… / Built… / Reduced… (start with an action verb, add numbers)"
                    />
                    <button className="icon-btn" onClick={() => removeBullet(i, bi)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                <button className="add-btn" onClick={() => addBullet(i)}>
                  <Plus size={15} /> Add achievement
                </button>
              </div>
            ))}
            <button className="add-btn" onClick={() => addItem("experience")}>
              <Plus size={16} /> Add experience
            </button>
          </Section>

          {/* Education */}
          <Section icon={GraduationCap} title="Education" count={data.education.length}>
            {data.education.map((e, i) => (
              <div className="item-block" key={i}>
                <div className="item-head">
                  <span>Education {i + 1}</span>
                  <button className="icon-btn" onClick={() => removeItem("education", i)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>School</label>
                    <input
                      className="input"
                      value={e.school}
                      onChange={(ev) => setItem("education", i, "school", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Degree</label>
                    <input
                      className="input"
                      value={e.degree}
                      onChange={(ev) => setItem("education", i, "degree", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Field of study</label>
                    <input
                      className="input"
                      value={e.field}
                      onChange={(ev) => setItem("education", i, "field", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Grade / GPA</label>
                    <input
                      className="input"
                      value={e.grade}
                      onChange={(ev) => setItem("education", i, "grade", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Start</label>
                    <input
                      className="input"
                      value={e.startDate}
                      onChange={(ev) => setItem("education", i, "startDate", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>End</label>
                    <input
                      className="input"
                      value={e.endDate}
                      onChange={(ev) => setItem("education", i, "endDate", ev.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={() => addItem("education")}>
              <Plus size={16} /> Add education
            </button>
          </Section>

          {/* Skills */}
          <Section icon={Wrench} title="Skills" count={data.skills.length}>
            <TagInput
              value={data.skills}
              onChange={(skills) => patch({ skills })}
              placeholder="e.g. React, Node.js, TypeScript — Enter to add"
            />
          </Section>

          {/* Projects */}
          <Section icon={FolderGit2} title="Projects" count={data.projects.length}>
            {data.projects.map((pr, i) => (
              <div className="item-block" key={i}>
                <div className="item-head">
                  <span>Project {i + 1}</span>
                  <button className="icon-btn" onClick={() => removeItem("project", i)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="field">
                  <label>Name</label>
                  <input
                    className="input"
                    value={pr.name}
                    onChange={(ev) => setItem("project", i, "name", ev.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Description</label>
                  <textarea
                    className="textarea"
                    value={pr.description}
                    onChange={(ev) => setItem("project", i, "description", ev.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Link</label>
                  <input
                    className="input"
                    value={pr.link}
                    onChange={(ev) => setItem("project", i, "link", ev.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Tech used</label>
                  <TagInput
                    value={pr.tech}
                    onChange={(tech) => setItem("project", i, "tech", tech)}
                  />
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={() => addItem("project")}>
              <Plus size={16} /> Add project
            </button>
          </Section>

          {/* Certifications & languages */}
          <Section icon={Award} title="Certifications & languages" defaultOpen={false}>
            {data.certifications.map((c, i) => (
              <div className="item-block" key={i}>
                <div className="item-head">
                  <span>Certification {i + 1}</span>
                  <button className="icon-btn" onClick={() => removeItem("certification", i)}>
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Name</label>
                    <input
                      className="input"
                      value={c.name}
                      onChange={(ev) => setItem("certification", i, "name", ev.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Issuer</label>
                    <input
                      className="input"
                      value={c.issuer}
                      onChange={(ev) => setItem("certification", i, "issuer", ev.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <button className="add-btn" onClick={() => addItem("certification")}>
              <Plus size={16} /> Add certification
            </button>
            <div className="field" style={{ marginTop: 16 }}>
              <label>Languages</label>
              <TagInput
                value={data.languages}
                onChange={(languages) => patch({ languages })}
                placeholder="e.g. English, Hindi, German"
              />
            </div>
          </Section>

          {/* Design */}
          <Section icon={Palette} title="Design">
            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-soft)" }}>
              Template
            </label>
            <div className="template-picker" style={{ marginTop: 8 }}>
              {TEMPLATES.map((t) => (
                <div
                  key={t.id}
                  className={`template-opt ${data.template === t.id ? "active" : ""}`}
                  onClick={() => patch({ template: t.id })}
                >
                  <div className="template-thumb" />
                  {t.name}
                </div>
              ))}
            </div>
            <label
              style={{
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-soft)",
                display: "block",
                margin: "16px 0 8px",
              }}
            >
              Accent colour
            </label>
            <div className="accent-row">
              {ACCENTS.map((c) => (
                <span
                  key={c}
                  className={`accent-dot ${data.accent === c ? "active" : ""}`}
                  style={{ background: c }}
                  onClick={() => patch({ accent: c })}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* ---------------- Preview ---------------- */}
        <div className="preview-panel">
          <div className="preview-frame">
            <ResumePreview data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
