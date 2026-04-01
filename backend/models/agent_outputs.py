"""
Aegis Migration Factory — Agent Output Models
Typed Pydantic models for each agent's output
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


# ── Agent 1: Tech Debt Scanner ──

class TechDebtIssue(BaseModel):
    severity: str = "MEDIUM"
    type: str = "MISSING_BEST_PRACTICE"
    resource: str = ""
    description: str = ""
    suggestion: str = ""


class FileAnalysis(BaseModel):
    health_score: int = 50
    issues: List[TechDebtIssue] = Field(default_factory=list)


class TechDebtSummary(BaseModel):
    total_issues: int = 0
    critical: int = 0
    high: int = 0
    medium: int = 0
    low: int = 0
    deprecated_resources: List[str] = Field(default_factory=list)
    security_violations: List[str] = Field(default_factory=list)
    resource_inventory: Dict[str, int] = Field(default_factory=dict)


class TechDebtOutput(BaseModel):
    overall_health_score: int = 50
    files: Dict[str, FileAnalysis] = Field(default_factory=dict)
    summary: TechDebtSummary = Field(default_factory=TechDebtSummary)
    recommendations: List[str] = Field(default_factory=list)


# ── Agent 2: Migration Translator ──

class MigrationMapEntry(BaseModel):
    gcp_resource: str = ""
    aws_resource: str = ""
    gcp_type: str = ""
    aws_type: str = ""
    notes: str = ""


class TranslatorOutput(BaseModel):
    terraform_files: Dict[str, str] = Field(default_factory=dict)
    migration_map: List[MigrationMapEntry] = Field(default_factory=list)
    unmapped_resources: List[str] = Field(default_factory=list)
    terraform_version: str = "~> 1.6"


# ── Agent 3: Solution Architect ──

class GraphNode(BaseModel):
    id: str = ""
    label: str = ""
    type: str = ""
    service: str = ""
    group: str = ""
    x: int = 0
    y: int = 0


class GraphEdge(BaseModel):
    id: str = ""
    source: str = ""
    target: str = ""
    label: str = ""
    type: str = "DEPENDS_ON"


class ArchitectureGraph(BaseModel):
    nodes: List[GraphNode] = Field(default_factory=list)
    edges: List[GraphEdge] = Field(default_factory=list)


class CostBreakdownItem(BaseModel):
    resource: str = ""
    type: str = ""
    monthly_usd: float = 0.0
    category: str = ""


class CostEstimate(BaseModel):
    total_monthly_usd: float = 0.0
    gcp_equivalent_usd: float = 0.0
    monthly_savings_usd: float = 0.0
    annual_savings_usd: float = 0.0
    breakdown: List[CostBreakdownItem] = Field(default_factory=list)
    by_category: Dict[str, float] = Field(default_factory=dict)


class ArchitectOutput(BaseModel):
    architecture_graph: ArchitectureGraph = Field(default_factory=ArchitectureGraph)
    cost_estimate: CostEstimate = Field(default_factory=CostEstimate)
    executive_summary: str = ""


# ── Agent 4: Security Enforcer ──

class PermissionPolicy(BaseModel):
    PolicyName: str = ""
    PolicyDocument: Dict[str, Any] = Field(default_factory=dict)
    rationale: str = ""


class IAMPolicy(BaseModel):
    name: str = ""
    type: str = "IAM_ROLE"
    resource: str = ""
    trust_policy: Dict[str, Any] = Field(default_factory=dict)
    permission_policies: List[PermissionPolicy] = Field(default_factory=list)
    terraform_resource: str = ""


class SecurityViolation(BaseModel):
    severity: str = "MEDIUM"
    resource: str = ""
    description: str = ""
    original_gcp: str = ""
    recommended_aws: str = ""


class SecurityOutput(BaseModel):
    security_score: int = 50
    iam_policies: List[IAMPolicy] = Field(default_factory=list)
    violations: List[SecurityViolation] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


# ── Agent 5: Audit Compiler ──

class ReportMetadata(BaseModel):
    title: str = "Aegis Migration Factory — SOC-2 Type II Compliance Assessment"
    generated_at: str = ""
    migration_scope: str = "GCP to AWS Migration"
    auditor: str = "Aegis AI Audit Engine v1.0"
    overall_compliance_score: int = 70


class CriterionResult(BaseModel):
    status: str = "NOT_SATISFIED"
    evidence: str = ""
    gaps: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class TrustServiceCategory(BaseModel):
    name: str = ""
    overall_status: str = "NOT_SATISFIED"
    score: int = 0
    criteria: Dict[str, CriterionResult] = Field(default_factory=dict)


class Finding(BaseModel):
    finding_id: str = ""
    severity: str = "MEDIUM"
    category: str = ""
    title: str = ""
    description: str = ""
    affected_resources: List[str] = Field(default_factory=list)
    recommendation: str = ""
    remediation_effort: str = "MEDIUM"


class RiskEntry(BaseModel):
    risk_id: str = ""
    description: str = ""
    likelihood: int = 1
    impact: int = 1
    risk_score: int = 1
    mitigation: str = ""
    residual_risk: int = 1


class AuditOutput(BaseModel):
    report_metadata: ReportMetadata = Field(default_factory=ReportMetadata)
    executive_summary: str = ""
    trust_service_criteria: Dict[str, TrustServiceCategory] = Field(default_factory=dict)
    findings: List[Finding] = Field(default_factory=list)
    risk_matrix: List[RiskEntry] = Field(default_factory=list)
    controls_satisfied: List[str] = Field(default_factory=list)
    controls_partial: List[str] = Field(default_factory=list)
    controls_failed: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
