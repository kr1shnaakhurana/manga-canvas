import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { history } from "@/lib/library";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — AniRead" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [mode, setMode] = useLocalStorage<"vertical" | "ltr" | "rtl">("mv:reader:mode", "vertical");
  const [fit, setFit] = useLocalStorage<"width" | "height">("mv:reader:fit", "width");
  const [quality, setQuality] = useLocalStorage<"data" | "dataSaver">("mv:reader:quality", "data");
  const [rating, setRating] = useLocalStorage<string[]>("mv:content-rating", ["safe", "suggestive"]);
  const [lang, setLang] = useLocalStorage<string>("mv:lang", "en");
  const [animations, setAnimations] = useLocalStorage<boolean>("mv:animations", true);

  const toggleRating = (v: string) =>
    setRating(rating.includes(v) ? rating.filter((x) => x !== v) : [...rating, v]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="pointer-events-none absolute -left-4 select-none font-display text-[9rem] font-black text-primary/5 leading-none">
          設定
        </div>
        <h1 className="relative font-display text-5xl font-black tracking-wide sm:text-6xl">
          <span className="text-gradient">Settings</span>
        </h1>
        <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Customize your reading experience
        </p>
      </motion.div>

      <div className="mt-10 space-y-4">
        <Section title="Reader" delay={0.1}>
          <Field label="Reading direction">
            <Chips
              value={mode}
              options={[
                { v: "vertical", l: "Vertical" },
                { v: "ltr", l: "Left → Right" },
                { v: "rtl", l: "Right → Left" },
              ]}
              onChange={(v) => setMode(v as "vertical" | "ltr" | "rtl")}
            />
          </Field>
          <Field label="Default fit">
            <Chips
              value={fit}
              options={[
                { v: "width", l: "Fit Width" },
                { v: "height", l: "Fit Height" },
              ]}
              onChange={(v) => setFit(v as "width" | "height")}
            />
          </Field>
          <Field label="Image quality">
            <Chips
              value={quality}
              options={[
                { v: "data", l: "High Quality" },
                { v: "dataSaver", l: "Data Saver" },
              ]}
              onChange={(v) => setQuality(v as "data" | "dataSaver")}
            />
          </Field>
        </Section>

        <Section title="Content" delay={0.2}>
          <Field label="Content rating">
            <div className="flex flex-wrap gap-2">
              {["safe", "suggestive", "erotica"].map((r) => (
                <button
                  key={r}
                  onClick={() => toggleRating(r)}
                  className={`rounded-full px-4 py-1.5 text-xs font-black capitalize transition-all ${
                    rating.includes(r)
                      ? "bg-primary text-white shadow-md shadow-primary/30"
                      : "border border-white/8 bg-white/3 text-muted-foreground hover:border-primary/30 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Preferred language">
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-xl border border-white/8 bg-input px-4 py-2 text-sm font-semibold outline-none focus:border-primary/50"
            >
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

        <Section title="Appearance" delay={0.3}>
          <Field label="Animations">
            <button
              onClick={() => setAnimations(!animations)}
              className={`relative h-7 w-12 rounded-full transition-colors ${animations ? "bg-primary shadow-sm shadow-primary/30" : "bg-white/10"}`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  animations ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </Field>
          <Field label="Theme">
            <span className="text-xs font-bold text-muted-foreground">
              Midnight Anime (always on)
            </span>
          </Field>
        </Section>

        <Section title="Data" delay={0.4}>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (confirm("Clear all reading history?")) history.clear();
              }}
              className="rounded-full border border-white/8 bg-white/5 px-5 py-2.5 text-sm font-bold transition-all hover:bg-white/10"
            >
              Clear history
            </button>
            <button
              onClick={() => {
                if (confirm("Reset ALL local data? This cannot be undone.")) {
                  localStorage.clear();
                  location.reload();
                }
              }}
              className="rounded-full border border-destructive/30 bg-destructive/10 px-5 py-2.5 text-sm font-bold text-destructive transition-all hover:bg-destructive/20"
            >
              Reset all data
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="rounded-2xl border border-white/6 bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <span className="h-4 w-1 rounded-full bg-primary" />
        <h2 className="font-display text-xl font-black tracking-wide">{title}</h2>
      </div>
      <div className="space-y-5">{children}</div>
    </motion.section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm font-bold">{label}</div>
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
          className={`rounded-full px-4 py-1.5 text-xs font-black transition-all ${
            value === o.v
              ? "bg-primary text-white shadow-md shadow-primary/30"
              : "border border-white/8 bg-white/3 text-muted-foreground hover:border-primary/30 hover:text-white"
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
