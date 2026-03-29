export const TERMINAL_LINES = [
  { text: "$ aegis-factory run --source=./gcp-portfolio --target=aws --auto-remediate", type: "cmd" },
  { text: "[AEGIS] Initializing migration pipeline v2.4.1...", type: "aegis" },
  { text: "[AEGIS] Connecting to Amazon Bedrock (Claude 3.5 Sonnet)... ✓", type: "aegis" },
  { text: "[TECH-DEBT] Ingesting legacy GCP portfolio...", type: "tech-debt" },
  { text: "[TECH-DEBT] Scanning 847 files across 12 services...", type: "tech-debt" },
  { text: "[TECH-DEBT] Found 23 critical architectural issues", type: "error" },
  { text: "[TECH-DEBT] Cyclomatic complexity avg: 34.2 (threshold: 10)", type: "tech-debt" },
  { text: "[TECH-DEBT] Pre-flight health score: 34/100 → auto-cleaning...", type: "tech-debt" },
  { text: "[MIGRATION] Translating google_compute_engine → aws_instance ✓", type: "migration" },
  { text: "[MIGRATION] Translating google_pubsub_topic → aws_sqs_queue ✓", type: "migration" },
  { text: "[MIGRATION] Translating google_spanner → aws_aurora_serverless ✓", type: "migration" },
  { text: "[MIGRATION] Translating google_cloud_run → aws_lambda ✓", type: "migration" },
  { text: "[ARCHITECT] Generating optimized AWS architecture...", type: "architect" },
  { text: "[ARCHITECT] GCP monthly cost: $12,400 → AWS projected: $4,190", type: "architect" },
  { text: "[ARCHITECT] Savings identified: $8,210/mo (66.2% reduction) ✓", type: "architect" },
  { text: "[SECURITY] Scanning translated IAM policies...", type: "security" },
  { text: "[SECURITY] CRITICAL: 4x FullAdministratorAccess violations found", type: "error" },
  { text: "[SECURITY] Generating Zero-Trust least-privilege policies...", type: "security" },
  { text: "[SECURITY] Attack surface reduction: 98.3% ✓", type: "security" },
  { text: "[AUDIT] Mapping evidence to SOC-2 framework...", type: "audit" },
  { text: "[AUDIT] CC6.1 Logical Access: PASS ✓", type: "audit" },
  { text: "[AUDIT] CC7.2 Vulnerability Mgmt: PASS ✓", type: "audit" },
  { text: "[AUDIT] CC8.1 Encryption at Rest: PASS ✓", type: "audit" },
  { text: "[AUDIT] Generating cryptographically signed audit PDF... ✓", type: "audit" },
  { text: "[AEGIS] ══════════════════════════════════════", type: "aegis" },
  { text: "[AEGIS] Migration complete in 00:00:47", type: "aegis" },
  { text: "[AEGIS] Human interventions required: 0", type: "aegis" },
  { text: "[AEGIS] ══════════════════════════════════════", type: "aegis" },
];

export const AGENTS_DATA = [
  {
    id: "01",
    name: "Tech Debt Scanner",
    track: "Track 1.6",
    icon: "Bug",
    color: "accent-amber",
    description: "Parses Abstract Syntax Trees, measures cyclomatic complexity, scores architectural health before migration begins",
    code: `health = ast_scanner.analyze(gcp_codebase)
# Returns: {score: 34, issues: [...23 critical]}`
  },
  {
    id: "02",
    name: "Migration Translator",
    track: "Track 2.1",
    icon: "ArrowRightLeft",
    color: "text-primary",
    description: "Maps every GCP service to its AWS equivalent, rewrites Terraform preserving business logic",
    code: `aws_tf = translator.convert(
  gcp_tf, mapping=GCP_AWS_SERVICE_MAP
)`
  },
  {
    id: "03",
    name: "Solution Architect",
    track: "Track 1.3",
    icon: "Network",
    color: "purple-400",
    description: "Generates architecture diagram, runs AWS Pricing API, calculates FinOps savings vs GCP baseline",
    code: `diagram = architect.mermaid(aws_services)
savings = finops.compare(gcp_cost, aws_estimate)`
  },
  {
    id: "04",
    name: "Security Enforcer",
    track: "Track 1.5",
    icon: "ShieldCheck",
    color: "danger",
    description: "Derives least-privilege IAM from AST analysis. Zero FullAdminAccess. 98% attack surface reduction.",
    code: `iam = security.least_privilege(
  code_ast, aws_resources
) # mathematically minimal`
  },
  {
    id: "05",
    name: "Audit Compiler",
    track: "Track 4.4",
    icon: "FileCheck",
    color: "accent-green",
    description: "Maps migration evidence to SOC-2 controls. Generates cryptographically signed PDF receipt.",
    code: `report = auditor.generate_soc2(
  evidence, framework="SOC2_TYPE2"
)`
  }
];

export const TRACKS_DATA = [
  {
    track: "Track 1.3",
    name: "Solution Architect Agent",
    description: "Generates live AWS architecture diagram + FinOps cost comparison from translated infrastructure",
  },
  {
    track: "Track 1.5",
    name: "Security Review Agent",
    description: "Derives mathematically minimal IAM policies directly from AST code analysis. Zero guesswork.",
  },
  {
    track: "Track 1.6",
    name: "Tech Debt Quantifier",
    description: "Scores architectural health, detects coupling, flags deprecated deps before migration begins",
  },
  {
    track: "Track 2.1",
    name: "GCP→AWS Migration Accelerator",
    description: "Fully autonomous service-to-service Terraform translation across all major GCP/AWS equivalents",
  },
  {
    track: "Track 4.4",
    name: "Internal Audit Workbench",
    description: "Auto-generates cryptographically signed SOC-2 Type II PDF from collected migration evidence",
  },
  {
    track: "Theme 2",
    name: "Automating Ops Workflows",
    description: "The Meta-Track: entire migration ops pipeline is fully automated, zero human touchpoints",
  }
];
