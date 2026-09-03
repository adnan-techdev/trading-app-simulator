export default function SummaryCard({ label, value, description }) {
  return <div className="summary-card"><p>{label}</p><h2>{value}</h2>{description && <span>{description}</span>}</div>;
}
