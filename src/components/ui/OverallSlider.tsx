export function OverallSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value || 3}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "var(--accent)" }}
      />
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: 18, marginTop: 4, color: "var(--accent)" }}>
        {value || 3}
      </div>
    </div>
  );
}
