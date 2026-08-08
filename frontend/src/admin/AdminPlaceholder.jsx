// src/admin/AdminPlaceholder.jsx  — reusable placeholder for in-progress admin pages
export default function AdminPlaceholder({ title, icon = '🚧' }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-dark-900 mb-8">{title}</h1>
      <div className="bg-white rounded-2xl shadow-card flex flex-col items-center justify-center py-24 text-center">
        <span className="text-6xl mb-4">{icon}</span>
        <h2 className="text-xl font-bold text-dark-900 mb-2">{title}</h2>
        <p className="text-dark-400 text-sm max-w-xs">This section is ready for backend integration. Connect the API and this page will be fully functional.</p>
      </div>
    </div>
  );
}
