// src/components/InfoCard.jsx
export default function InfoCard({ title, children }) {
  return (
    <div className="
      p-6 rounded-xl border border-dark-border 
      bg-dark-surface
    ">
      <h3 className="text-xl text-text-white mb-2">{title}</h3>
      <p className="text-text-secondary">{children}</p>
    </div>
  );
}