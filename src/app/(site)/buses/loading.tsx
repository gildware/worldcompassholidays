export default function BusesLoading() {
  return (
    <div
      className="bus-route-loading"
      aria-busy="true"
      aria-live="polite"
      style={{ minHeight: "100dvh", background: "#f6f7fb", padding: "18px 16px 32px" }}
    >
      <div className="bus-route-loading__bar" style={{ height: 18, width: "42%", maxWidth: 180, marginBottom: 16, borderRadius: 16, background: "#e8ebf3" }} />
      <div className="bus-route-loading__search" style={{ height: 64, marginBottom: 18, borderRadius: 16, background: "#e8ebf3" }} />
      <div className="bus-route-loading__stack" style={{ display: "grid", gap: 12 }}>
        <div className="bus-route-loading__card" style={{ height: 112, borderRadius: 16, background: "#e8ebf3" }} />
        <div className="bus-route-loading__card" style={{ height: 112, borderRadius: 16, background: "#e8ebf3" }} />
        <div className="bus-route-loading__card" style={{ height: 112, borderRadius: 16, background: "#e8ebf3" }} />
      </div>
      <span className="sr-only">Loading buses…</span>
    </div>
  );
}
