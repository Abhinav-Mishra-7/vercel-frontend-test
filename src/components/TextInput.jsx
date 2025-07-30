// src/components/TextInput.jsx
export default function TextInput({ label, placeholder }) {
  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium text-text-secondary">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        className="
          w-full p-3 rounded-lg border border-dark-border 
          bg-dark-bg text-text-primary
          focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent
          transition-colors duration-200
        "
      />
    </div>
  );
}