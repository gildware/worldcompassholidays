export default function AdminPanelLoading() {
  return (
    <div className="admin-page-loading" aria-busy="true" aria-live="polite">
      <div className="admin-page-loading__bar" />
      <div className="admin-page-loading__card" />
      <div className="admin-page-loading__grid">
        <div className="admin-page-loading__card" />
        <div className="admin-page-loading__card" />
        <div className="admin-page-loading__card" />
      </div>
      <span className="sr-only">Loading page…</span>
    </div>
  );
}
