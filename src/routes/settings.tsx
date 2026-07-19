import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { history } from "@/lib/library";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Mangaverse" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [mode, setMode] = useLocalStorage<"vertical" | "ltr" | "rtl">("mv:reader:mode", "vertical");
  const [fit, setFit] = useLocalStorage<"width" | "height">("mv:reader:fit", "width");
  const [quality, setQuality] = useLocalStorage<"data" | "dataSaver">("mv:reader:quality", "data");
  const [rating, setRating] = useLocalStorage<string[]>("mv:content-rating", ["safe", "suggestive"]);
  const [lang, setLang] = useLocalStorage<string>("mv:lang", "en");
  const [animations, setAnimations] = useLocalStorage<boolean>("mv:animations", true);
  const [zoom, setZoom] = useLocalStorage<number>("mv:default-zoom", 1);

  const toggleRating = (v: string) => {
    setRating(rating.includes(v) ? rating.filter((x) => x !== v) : [...rating, v]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Settings</h1>
        <p className="mt-2 text-muted-foreground">Customize your reading experience.</p>
      </motion.div>

      <div className="mt-10 space-y-6">
        <Section title="Reader">
          <Field label="Reading direction">
            <Chips value={mode} options={[{ v: "vertical", l: "Vertical" }, { v: "ltr", l: "Left → Right" }, { v: "rtl", l: "Right → Left" }]} onChange={(v) => setMode(v as "vertical" | "ltr" | "rtl")} />
          </Field>
          <Field label="Default fit">
            <Chips value={fit} options={[{ v: "width", l: "Fit width" }, { v: "height", l: "Fit height" }]} onChange={(v) => setFit(v as "width" | "height")} />
          </Field>
          <Field label="Image quality">
            <Chips value={quality} options={[{ v: "data", l: "High" }, { v: "dataSaver", l: "Data saver" }]} onChange={(v) => setQuality(v as "data" | "dataSaver")} />
          </Field>
          <Field label={`Default zoom · ${zoom.toFixed(1)}×`}>
            <input type="range" min={0.8} max={2} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-primary" />
          </Field>
        </Section>

        <Section title="Content">
          <Field label="Content rating">
            <div className="flex flex-wrap gap-2">
              {["safe", "suggestive", "erotica"].map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRating(r)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${rating.includes(r) ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Preferred language">
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="rounded-lg bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/50">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="pt-br">Português (Brasil)</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
            </select>
          </Field>
        </Section>

        <Section title="Appearance">
          <Field label="Animations">
            <button
              onClick={() => setAnimations(!animations)}
              className={`relative h-7 w-12 rounded-full transition-colors ${animations ? "bg-primary" : "bg-white/10"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition-transform ${animations ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </Field>
          <Field label="Theme">
            <div className="text-sm text-muted-foreground">Deep dark (always). More themes coming soon.</div>
          </Field>
        </Section>

        <Section title="Data">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { if (confirm("Clear reading history?")) history.clear(); }}
              className="rounded-full bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Clear reading history
            </button>
            <button
              onClick={() => { if (confirm("Reset all local data?")) { localStorage.clear(); location.reload(); } }}
              className="rounded-full bg-destructive/20 px-4 py-2 text-sm text-destructive hover:bg-destructive/30"
            >
              Reset all
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass rounded-2xl p-6"
    >
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <div className="mt-4 space-y-5">{children}</div>
    </motion.section>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-medium">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Chips({ value, options, onChange }: { value: string; options: { v: string; l: string }[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${value === o.v ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"}`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
