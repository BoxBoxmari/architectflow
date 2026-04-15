import { calcOutputs } from '@/lib/simulator/calcOutputs';

export const FUNCTIONS = [
  { id: 'fn-audit', name: 'Audit', color: '#006397' },
  { id: 'fn-law', name: 'KPMG Law', color: '#45004F' },
  { id: 'fn-tax', name: 'Tax', color: '#00B8A9' },
  { id: 'fn-deal', name: 'Deal Advisory', color: '#F39C12' },
  { id: 'fn-consulting', name: 'Consulting', color: '#0F6E56' },
];

export const SERVICES = [
  { id: 'svc-ada', functionId: 'fn-audit', name: 'Audit Data & Analytics' },
  { id: 'svc-fsa', functionId: 'fn-audit', name: 'Financial Statement Audit' },
  { id: 'svc-aa', functionId: 'fn-audit', name: 'Accounting Advisory' },
  { id: 'svc-crc', functionId: 'fn-law', name: 'Corporate Regulatory Compliance' },
  { id: 'svc-ccd', functionId: 'fn-law', name: 'Commercial Contracts & Dispute' },
  { id: 'svc-tadr', functionId: 'fn-tax', name: 'Tax Advisory & Dispute Resolution' },
  { id: 'svc-gtp', functionId: 'fn-tax', name: 'Global Transfer Pricing' },
  { id: 'svc-ts', functionId: 'fn-deal', name: 'Transaction Services' },
  { id: 'svc-ma', functionId: 'fn-deal', name: 'M&A Advisory' },
  { id: 'svc-fsr', functionId: 'fn-consulting', name: 'FS Regulatory / GRC' },
  { id: 'svc-rf', functionId: 'fn-consulting', name: 'Risk Consulting / Forensics' },
  { id: 'svc-pc', functionId: 'fn-consulting', name: 'People & Change / FS Transform' },
];

export type CaseStatus = 'Concept' | 'In Development' | 'Pilot' | 'Active' | 'Scaled';
export type MaturityLevel = 'Experimental' | 'Emerging' | 'Established' | 'Mature';
export type AITechnique = 'LLM' | 'NLP' | 'ML Classification' | 'Computer Vision' | 'RAG' | 'Generative AI';

export interface AICase {
  id: string;
  code: string;
  title: string;
  originatingFunction: string;
  description: string;
  aiTechnique: AITechnique;
  maturityLevel: MaturityLevel;
  status: CaseStatus;
  valueScore: number;
  readinessScore: number;
  reusabilityScore: number;
  linkedFunctions: string[];
  linkedServices: string[];
  metrics: {
    annualizedReturn: number;
    hoursRecoveredPerMonth: number;
    ftesFreed: number;
    adoptionRate: number;
  };
  governanceNotes: string;
  partnerInsight: string;
  problemStatement: string;
  executiveSummary: string;
  architectureLineage: string;
}

export const AI_CASES: AICase[] = [
  {
    id: 'case-001',
    code: 'AF-001',
    title: 'HS Code Classifier',
    originatingFunction: 'fn-tax',
    description: 'Automated Harmonised System code classification using LLM-based reasoning over product descriptions, reducing manual lookup time by 78%.',
    aiTechnique: 'LLM',
    maturityLevel: 'Established',
    status: 'Active',
    valueScore: 87,
    readinessScore: 92,
    reusabilityScore: 78,
    linkedFunctions: ['fn-tax', 'fn-deal'],
    linkedServices: ['svc-tadr', 'svc-gtp', 'svc-ts'],
    metrics: {
      annualizedReturn: 1240000,
      hoursRecoveredPerMonth: 860,
      ftesFreed: 5.1,
      adoptionRate: 74,
    },
    governanceNotes: 'Reviewed by Tax Technology Council Q1 2026. Data residency compliant. Audit trail enabled. Model refresh cycle: quarterly.',
    partnerInsight: 'Strong cross-sell signal into Deal Advisory when clients undergo supply chain restructuring. Recommend bundling with Transaction Services engagements.',
    problemStatement: 'Tax professionals spend 3–5 hours per engagement manually classifying trade goods against 5,000+ HS codes. Error rates average 12%, triggering customs disputes.',
    executiveSummary: 'AF-001 deploys a fine-tuned LLM pipeline against KPMG\'s global trade taxonomy to classify product descriptions in under 2 seconds with 94% accuracy. Deployed across 6 Tax offices.',
    architectureLineage: 'Extends the KPMG Global Trade Intelligence framework. Reuses the Document Ingestion Pipeline (DIP-Core) and connects to the Entity Resolution Service shared by AF-005.',
  },
  {
    id: 'case-002',
    code: 'AF-002',
    title: 'Tax Research Assistant',
    originatingFunction: 'fn-tax',
    description: 'RAG-powered research assistant that retrieves and synthesises tax legislation, case law, and internal guidance notes to accelerate advisor research workflows.',
    aiTechnique: 'RAG',
    maturityLevel: 'Mature',
    status: 'Scaled',
    valueScore: 94,
    readinessScore: 96,
    reusabilityScore: 91,
    linkedFunctions: ['fn-tax', 'fn-law', 'fn-audit'],
    linkedServices: ['svc-tadr', 'svc-gtp', 'svc-crc', 'svc-ada'],
    metrics: {
      annualizedReturn: 3180000,
      hoursRecoveredPerMonth: 2140,
      ftesFreed: 12.7,
      adoptionRate: 89,
    },
    governanceNotes: 'GDPR and client confidentiality controls enforced at retrieval layer. No client data enters the model context. Reviewed by KPMG Legal & Risk Q4 2025.',
    partnerInsight: 'Highest adoption of any AI case in the portfolio. Partners in 4 regions report it has become a default workflow tool. Expansion to KPMG Law is the highest-priority next move.',
    problemStatement: 'Research tasks consume 35–40% of junior advisor time. Inconsistent quality across offices creates reputational risk when advice conflicts with recent legislative changes.',
    executiveSummary: 'AF-002 is the portfolio\'s flagship scaled deployment. It indexes 2.4M legislative documents across 38 jurisdictions and returns cited, structured responses in under 8 seconds.',
    architectureLineage: 'Built on the KPMG Knowledge Mesh (KM-Core). Shares vector store infrastructure with AF-005 Contract Intelligence Review. Candidate for platform-level promotion.',
  },
  {
    id: 'case-003',
    code: 'AF-003',
    title: 'Audit Evidence Summarizer',
    originatingFunction: 'fn-audit',
    description: 'Generative AI tool that ingests structured and unstructured audit evidence packages and produces draft workpaper summaries with flagged exceptions.',
    aiTechnique: 'Generative AI',
    maturityLevel: 'Emerging',
    status: 'Pilot',
    valueScore: 76,
    readinessScore: 68,
    reusabilityScore: 65,
    linkedFunctions: ['fn-audit'],
    linkedServices: ['svc-ada', 'svc-fsa', 'svc-aa'],
    metrics: {
      annualizedReturn: 890000,
      hoursRecoveredPerMonth: 590,
      ftesFreed: 3.5,
      adoptionRate: 41,
    },
    governanceNotes: 'Pilot governance framework in place. Output requires senior reviewer sign-off before inclusion in audit file. Model hallucination rate < 1.2% on validation set.',
    partnerInsight: 'Audit Partners are cautiously optimistic. The risk is over-reliance by juniors before the model is fully validated. Recommend a 6-month supervised pilot with EQCR oversight.',
    problemStatement: 'Audit workpaper preparation is the single largest time sink in the audit cycle. Senior staff spend disproportionate time reformatting evidence rather than applying judgment.',
    executiveSummary: 'AF-003 automates first-draft workpaper creation from evidence packages. Currently in pilot with 3 Audit engagement teams. Exception flagging accuracy is 87% on test data.',
    architectureLineage: 'Standalone pipeline. Candidate for integration with the KPMG Audit Platform (KAP) in Phase 2. Document processing module reusable across AF-001 and AF-005.',
  },
  {
    id: 'case-004',
    code: 'AF-004',
    title: 'Meeting-to-Action Converter',
    originatingFunction: 'fn-consulting',
    description: 'NLP pipeline that transcribes, summarises, and extracts structured action items from client meeting recordings, reducing post-meeting administration by 65%.',
    aiTechnique: 'NLP',
    maturityLevel: 'Established',
    status: 'Active',
    valueScore: 72,
    readinessScore: 85,
    reusabilityScore: 88,
    linkedFunctions: ['fn-consulting', 'fn-audit', 'fn-deal'],
    linkedServices: ['svc-fsr', 'svc-rf', 'svc-pc', 'svc-ada', 'svc-ma'],
    metrics: {
      annualizedReturn: 760000,
      hoursRecoveredPerMonth: 510,
      ftesFreed: 3.0,
      adoptionRate: 62,
    },
    governanceNotes: 'Recording consent and data handling policy enforced. Transcripts stored for 90 days then purged. Reviewed by Data Privacy team Q2 2025.',
    partnerInsight: 'Highest reusability score in the horizontal tools category. The action extraction module is already being repurposed for Deal Advisory due diligence call summaries.',
    problemStatement: 'Consultants spend an average of 45 minutes after each client meeting writing notes and distributing action items. Accuracy of recall degrades significantly after 24 hours.',
    executiveSummary: 'AF-004 connects to Microsoft Teams and Zoom, transcribes in real-time, and delivers a structured action register within 3 minutes of meeting end. Deployed to 280 consultants.',
    architectureLineage: 'Integrates with M365 ecosystem. NLP summarisation module is reused in AF-002. Action extraction logic is a candidate shared service for the AI Platform roadmap.',
  },
  {
    id: 'case-005',
    code: 'AF-005',
    title: 'Contract Intelligence Review',
    originatingFunction: 'fn-law',
    description: 'LLM-based contract review tool that identifies non-standard clauses, risk flags, and missing provisions across commercial and regulatory contract portfolios.',
    aiTechnique: 'LLM',
    maturityLevel: 'Established',
    status: 'Active',
    valueScore: 83,
    readinessScore: 79,
    reusabilityScore: 74,
    linkedFunctions: ['fn-law', 'fn-deal', 'fn-consulting'],
    linkedServices: ['svc-crc', 'svc-ccd', 'svc-ts', 'svc-ma', 'svc-fsr'],
    metrics: {
      annualizedReturn: 1560000,
      hoursRecoveredPerMonth: 1040,
      ftesFreed: 6.2,
      adoptionRate: 67,
    },
    governanceNotes: 'Privileged document handling protocols enforced. Output is advisory only — does not constitute legal advice. Reviewed by KPMG Law Risk Committee Q1 2026.',
    partnerInsight: 'Strong demand signal from M&A Advisory for due diligence acceleration. The 40-contract batch processing capability is the key differentiator for Deal Advisory cross-sell.',
    problemStatement: 'Legal review of a standard commercial contract takes 4–8 hours. In M&A contexts, 200–500 contracts require review under time pressure, creating quality risk.',
    executiveSummary: 'AF-005 processes up to 40 contracts in parallel, flags 23 risk clause types, and produces a structured risk register in 18 minutes — compared to 3 days manually.',
    architectureLineage: 'Shares Entity Resolution Service with AF-001. Vector store co-located with AF-002 Knowledge Mesh. Risk taxonomy maintained by KPMG Law Knowledge Management.',
  },
  {
    id: 'case-006',
    code: 'AF-006',
    title: 'DD Document Scanner',
    originatingFunction: 'fn-deal',
    description: 'ML classification pipeline that ingests due diligence data rooms, categorises documents by type and materiality, and surfaces high-priority items for advisor review.',
    aiTechnique: 'ML Classification',
    maturityLevel: 'Experimental',
    status: 'In Development',
    valueScore: 68,
    readinessScore: 52,
    reusabilityScore: 71,
    linkedFunctions: ['fn-deal', 'fn-audit'],
    linkedServices: ['svc-ts', 'svc-ma', 'svc-ada'],
    metrics: {
      annualizedReturn: 620000,
      hoursRecoveredPerMonth: 410,
      ftesFreed: 2.4,
      adoptionRate: 28,
    },
    governanceNotes: 'In development. No production deployment. Data room access governed by engagement-level NDA. Model training uses synthetic data only at this stage.',
    partnerInsight: 'High strategic value if delivered before Q3 2026 deal cycle. Risk: competing vendor solutions are already in market. Differentiation must be KPMG-specific taxonomy.',
    problemStatement: 'Due diligence teams manually triage 1,000–10,000 documents per transaction. Critical items are missed when analyst fatigue sets in during high-volume deals.',
    executiveSummary: 'AF-006 uses a 47-class document classifier trained on KPMG deal taxonomy to triage a 5,000-document data room in under 90 minutes. Currently in internal testing.',
    architectureLineage: 'Document processing module shared with AF-003. Classification model architecture follows the KPMG ML Standards v2.1 framework. Roadmap: integrate with VDR APIs.',
  },
];

export const SCENARIOS = [
  {
    id: 'scen-001',
    name: 'Status Quo',
    description: 'Current deployment footprint with no additional investment or scale-up.',
    useCaseCount: 3,
    activationRate: 60,
    targetUsers: 150,
    adoptionRate: 45,
    tasksPerUserPerUseCasePerMonth: 8,
    avgTimeSavedMinutes: 22,
  },
  {
    id: 'scen-002',
    name: 'Accelerated Flow',
    description: 'Targeted investment in top 3 cases with active change management and enablement.',
    useCaseCount: 5,
    activationRate: 75,
    targetUsers: 320,
    adoptionRate: 68,
    tasksPerUserPerUseCasePerMonth: 12,
    avgTimeSavedMinutes: 28,
  },
  {
    id: 'scen-003',
    name: 'Optimised Guardrail',
    description: 'Full portfolio activation with governance guardrails and phased rollout by function.',
    useCaseCount: 6,
    activationRate: 85,
    targetUsers: 500,
    adoptionRate: 78,
    tasksPerUserPerUseCasePerMonth: 15,
    avgTimeSavedMinutes: 32,
  },
];

// Re-export centralized calc logic. Maps SCENARIOS shape → SimInputs and delegates to the single source of truth.
export function calculateScenarioOutputs(scenario: typeof SCENARIOS[0]) {
  return calcOutputs({
    targetUseCaseCount: scenario.useCaseCount,
    activationRate: scenario.activationRate,
    targetUserCount: scenario.targetUsers,
    adoptionRate: scenario.adoptionRate,
    tasksPerUserPerUseCasePerMonth: scenario.tasksPerUserPerUseCasePerMonth,
    avgTimeSavedMinutes: scenario.avgTimeSavedMinutes,
  });
}

export const ACTIVITY_FEED = [
  { id: 'act-001', type: 'case_updated', label: 'AF-002 Tax Research Assistant promoted to Scaled', time: '2h ago', icon: 'TrendingUp' },
  { id: 'act-002', type: 'pilot_requested', label: 'Pilot request submitted for AF-003 by J. Hartmann', time: '5h ago', icon: 'Send' },
  { id: 'act-003', type: 'scenario_saved', label: 'Accelerated Flow scenario saved by M. Chen', time: '1d ago', icon: 'BookMarked' },
  { id: 'act-004', type: 'report_generated', label: 'Deal Advisory AI Review report exported', time: '1d ago', icon: 'FileText' },
  { id: 'act-005', type: 'case_added', label: 'AF-006 DD Document Scanner added to portfolio', time: '3d ago', icon: 'Plus' },
];

export const HEATMAP_DATA = [
  { function: 'Audit', experimental: 1, emerging: 1, established: 0, mature: 0 },
  { function: 'KPMG Law', experimental: 0, emerging: 0, established: 1, mature: 0 },
  { function: 'Tax', experimental: 0, emerging: 0, established: 1, mature: 1 },
  { function: 'Deal Advisory', experimental: 1, emerging: 0, established: 0, mature: 0 },
  { function: 'Consulting', experimental: 0, emerging: 0, established: 1, mature: 0 },
];