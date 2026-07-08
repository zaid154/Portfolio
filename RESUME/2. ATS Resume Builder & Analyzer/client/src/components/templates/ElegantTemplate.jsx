import { dateRange, contactList, hasArr, Bullets } from "./helpers.jsx";

export default function ElegantTemplate({ data }) {
  const p = data.personal || {};
  const contacts = contactList(p);

  return (
    <div className="resume-doc tpl-elegant">
      <aside className="rd-sidebar">
        <h1 className="rd-name">{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <div className="rd-title" style={{ marginBottom: 18 }}>{p.jobTitle}</div>}

        {contacts.length > 0 && (
          <div className="rd-sidebar-section">
            <h2 className="rd-section-title">Contact</h2>
            <div className="rd-contact">
              {contacts.map((c, i) => (
                <span key={i}>{c}</span>
              ))}
            </div>
          </div>
        )}

        {hasArr(data.skills) && (
          <div className="rd-sidebar-section">
            <h2 className="rd-section-title">Skills</h2>
            <div className="rd-skills">
              {data.skills.map((s, i) => (
                <span className="rd-skill" key={i}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasArr(data.languages) && (
          <div className="rd-sidebar-section">
            <h2 className="rd-section-title">Languages</h2>
            <p>{data.languages.join(", ")}</p>
          </div>
        )}

        {hasArr(data.certifications) && (
          <div className="rd-sidebar-section">
            <h2 className="rd-section-title">Certifications</h2>
            {data.certifications.map((c, i) => (
              <p key={i} style={{ marginBottom: 6 }}>
                {[c.name, c.issuer].filter(Boolean).join(" — ")}
              </p>
            ))}
          </div>
        )}
      </aside>

      <main className="rd-main">
        {p.summary && (
          <section className="rd-section">
            <h2 className="rd-section-title">Profile</h2>
            <p>{p.summary}</p>
          </section>
        )}

        {hasArr(data.experience) && (
          <section className="rd-section">
            <h2 className="rd-section-title">Experience</h2>
            {data.experience.map((e, i) => (
              <div className="rd-item" key={i}>
                <div className="rd-item-head">
                  <span className="rd-role">{e.role || "Role"}</span>
                  <span className="rd-meta">{dateRange(e.startDate, e.endDate, e.current)}</span>
                </div>
                <div className="rd-org">
                  {e.company}
                  {e.location ? `, ${e.location}` : ""}
                </div>
                <Bullets items={e.bullets} />
              </div>
            ))}
          </section>
        )}

        {hasArr(data.projects) && (
          <section className="rd-section">
            <h2 className="rd-section-title">Projects</h2>
            {data.projects.map((pr, i) => (
              <div className="rd-item" key={i}>
                <span className="rd-role">{pr.name || "Project"}</span>
                {pr.description && <p>{pr.description}</p>}
                {hasArr(pr.tech) && <div className="rd-meta">{pr.tech.join(", ")}</div>}
              </div>
            ))}
          </section>
        )}

        {hasArr(data.education) && (
          <section className="rd-section">
            <h2 className="rd-section-title">Education</h2>
            {data.education.map((e, i) => (
              <div className="rd-item" key={i}>
                <div className="rd-item-head">
                  <span className="rd-role">
                    {e.degree || "Degree"}
                    {e.field ? `, ${e.field}` : ""}
                  </span>
                  <span className="rd-meta">{dateRange(e.startDate, e.endDate)}</span>
                </div>
                <div className="rd-org">
                  {e.school}
                  {e.grade ? ` · ${e.grade}` : ""}
                </div>
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
