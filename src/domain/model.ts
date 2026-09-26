export type Platform = "instagram" | "tiktok" | "linkedin";
export type Field =
  | "likes"
  | "comments"
  | "shares"
  | "saves"
  | "clicks"
  | "reach"
  | "views"
  | "impressions"
  | "followers";
export type Metrics = Record<Field, number | null>;
export type Client = {
  id: string;
  name: string;
  sector: string;
  objective: string;
  archived: boolean;
};
export type Account = {
  id: string;
  clientId: string;
  name: string;
  platform: Platform;
  type: "personal" | "business";
  archived: boolean;
};
export type Campaign = {
  id: string;
  clientId: string;
  name: string;
  objective: string;
  start: string;
  end: string;
};
export type Analysis = {
  id: string;
  accountId: string;
  campaignId: string;
  title: string;
  postId: string;
  platform: Platform;
  method: string;
  methodVersion: 1;
  start: string;
  end: string;
  capturedAt: string;
  mode: "post" | "period";
  scope: "organic" | "paid" | "mixed";
  timing: "activity" | "lifetime";
  format: "post" | "video" | "carousel";
  source: string;
  notes: string;
  metrics: Metrics;
  goal: number | null;
  batchId?: string;
};
export type Report = {
  id: string;
  clientName: string;
  title: string;
  createdAt: string;
  start: string;
  end: string;
  notes: string;
  brand: string;
  rows: (Analysis & { accountName: string })[];
};
export type Settings = {
  brand: string;
  currency: string;
  timezone: string;
  lastBackup: string | null;
};
export type Store = {
  version: 1;
  clients: Client[];
  accounts: Account[];
  campaigns: Campaign[];
  analyses: Analysis[];
  reports: Report[];
  settings: Settings;
};
export const platforms: Record<Platform, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};
export const fieldLabels: Record<Field, string> = {
  likes: "Likes / reacciones",
  comments: "Comentarios",
  shares: "Compartidos",
  saves: "Guardados",
  clicks: "Clics",
  reach: "Alcance",
  views: "Visualizaciones",
  impressions: "Impresiones",
  followers: "Seguidores de referencia",
};
export const emptyMetrics = (): Metrics => ({
  likes: null,
  comments: null,
  shares: null,
  saves: null,
  clicks: null,
  reach: null,
  views: null,
  impressions: null,
  followers: null,
});
export const emptyStore = (): Store => ({
  version: 1,
  clients: [],
  accounts: [],
  campaigns: [],
  analyses: [],
  reports: [],
  settings: {
    brand: "Melany Brito",
    currency: "USD",
    timezone: "America/Guayaquil",
    lastBackup: null,
  },
});
export function uid() {
  return crypto.randomUUID();
}
export function localDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
