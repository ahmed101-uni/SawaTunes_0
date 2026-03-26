import type { Route } from "./+types/charity";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Charity Awareness | SawaTunes" },
    {
      name: "description",
      content: "Learn about Sudan-related charitable and social awareness initiatives.",
    },
  ];
}

const initiatives = [
  {
    id: "initiative-1",
    title: "Community Health Support",
    summary:
      "Awareness resources about healthcare access initiatives in conflict-affected communities.",
  },
  {
    id: "initiative-2",
    title: "Education Continuity",
    summary:
      "Information on organizations focused on schooling support for displaced families.",
  },
  {
    id: "initiative-3",
    title: "Cultural Preservation",
    summary:
      "Campaigns that document and preserve Sudanese artistic heritage.",
  },
  {
    id: "initiative-4",
    title: "Emergency Relief Mapping",
    summary:
      "Directories that help communities find trusted relief organizations and urgent aid updates.",
  },
];

const awarenessGuidance = [
  "Verify organizations through official registrations and independent reporting.",
  "Share music and stories responsibly to amplify voices without spreading unverified claims.",
  "This page shares awareness resources; donations are handled by the organizations directly.",
];

export default function CharityPage() {
  return (
    <section className="page-stack">
      <header className="section-head">
        <p className="eyebrow">Awareness Section</p>
        <h1>Charity and Community Awareness</h1>
      </header>

      <div className="info-grid">
        {initiatives.map((initiative) => (
          <article key={initiative.id} className="info-card">
            <h2>{initiative.title}</h2>
            <p className="subtle-line">{initiative.summary}</p>
          </article>
        ))}
      </div>

      <article className="panel">
        <h2>Awareness Guidelines</h2>
        <ul className="task-list">
          {awarenessGuidance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
