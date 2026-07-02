export const APP_TEMPLATE_IDS = ["classic", "midnight", "sage", "paper"] as const;

export type AppTemplateId = (typeof APP_TEMPLATE_IDS)[number];

export const DEFAULT_TEMPLATE: AppTemplateId = "classic";

export const APP_TEMPLATES: {
  id: AppTemplateId;
  name: string;
  desc: string;
  swatch: [string, string, string];
}[] = [
  {
    id: "classic",
    name: "Classic",
    desc: "Warm cream and navy — the original LamaOS look.",
    swatch: ["#2c3448", "#f5f0e8", "#d4a853"],
  },
  {
    id: "midnight",
    name: "Midnight",
    desc: "Cool slate with bright gold accents.",
    swatch: ["#1a2235", "#e8ecf4", "#e8b84a"],
  },
  {
    id: "sage",
    name: "Sage",
    desc: "Soft green tones for calm focus.",
    swatch: ["#2a3d32", "#f2f6f0", "#7da882"],
  },
  {
    id: "paper",
    name: "Paper",
    desc: "High-contrast ink on clean white.",
    swatch: ["#111111", "#fafafa", "#555555"],
  },
];

export function isAppTemplateId(value: unknown): value is AppTemplateId {
  return typeof value === "string" && APP_TEMPLATE_IDS.includes(value as AppTemplateId);
}
