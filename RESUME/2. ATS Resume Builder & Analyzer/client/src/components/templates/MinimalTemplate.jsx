import { dateRange, contactList, hasArr, Bullets } from "./helpers.jsx";

export default function MinimalTemplate({ data }) {
  const p = data.personal || {};
  const contacts = contactList(p);

  return (
    <div className="resume-doc tpl-minimal">
      <header className="rd-header">
        <h1 className="rd-name">{p.fullName || "Your Name"}</h1>
        {p.jobTitle && <div className="rd-title">{p.jobTitle}</div>}
        {contacts.length > 0 && (
          <div className="rd-contact" style={{ marginTop: 8 }}>
            {contacts.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </div>
        )}
      </header>

      {p.summary && (
        <section className="rd-section">
          <h2 className="rd-section-title">About</h2>
          <p>{p.summary}</p>
        </section>
      )}

      {hasArr(data.experience) && (
        <section className="rd-section">
          <h2 className="rd-section-title">Experience</h2>
          {data.experience.map((e, i) => (
            <div className="rd-item" key={i}>
              <div className="rd-item-head">
                <span className="rd-role">
                  {e.role || "Role"}
                  {e.company ? `, ${e.company}` : ""}
                </span>
                <span className="rd-meta">{dateRange(e.startDate, e.endDate, e.current)}</span>
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
              <div className="rd-org">{e.school}</div>
            </div>
          ))}
        </section>
      )}

      {hasArr(data.skills) && (
        <section className="rd-section">
          <h2 className="rd-section-title">Skills</h2>
          <div className="rd-skills">
            {data.skills.map((s, i) => (
              <span className="rd-skill" key={i}>
                {s}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
