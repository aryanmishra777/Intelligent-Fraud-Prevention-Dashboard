import { getJson, postJson } from "./apiClient";

export type RiskDecision = {
  decision: "APPROVE" | "REVIEW" | "REJECT";
  riskScore: number; // 0..100
  confidence: number; // 0..1
  subscores: {
    fraud: number;
    chargeback: number;
    credit: number;
    network: number;
  };
  explainability: {
    topFactors: Array<{ key: string; contribution: number; direction: "increases_risk" }>;
    notes: string[];
    signalCoverage?: { present: number; total: number };
  };
};

export type CreditRecommendation = {
  action: "EXPAND" | "HOLD" | "CONTRACT" | "PAUSE";
  currentCreditLimit: number;
  recommendedCreditLimit: number;
  rationale: string[];
};

export type OverrideResponse = {
  ok: boolean;
  override: {
    id: string;
    createdAt: string;
    caseId: string | null;
    bookingId: string | null;
    label: string | null;
    rationale: string;
    meta: Record<string, unknown>;
  };
};

export function scoreBookingRisk(input: {
  bookingId?: string;
  signals: Record<string, unknown>;
}) {
  return postJson<RiskDecision>("/api/risk/score", input);
}

export function recommendCredit(input: {
  currentCreditLimit: number;
  trustScore: number; // 0..1 or 0..100
  riskScore: number; // 0..1 or 0..100
}) {
  return postJson<CreditRecommendation>("/api/credit/recommend", input);
}

export function submitOverride(input: {
  caseId?: string;
  bookingId?: string;
  label: "approve" | "reject";
  rationale: string;
  meta?: Record<string, unknown>;
}) {
  return postJson<OverrideResponse>("/api/review/override", input);
}

export function listOverrides() {
  return getJson<{ ok: boolean; overrides: unknown[] }>("/api/review/overrides");
}
