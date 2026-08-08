/**
 * Phase 2: Security Pillar Questions
 * Differentiates between Offensive Security (Pentesting, Red Team), Defensive Security (SOC, Application Security, Cloud Security), DFIR, Threat Intel, GRC, IAM, etc.
 */

module.exports = [
  {
    id: 501,
    phase: 2,
    pillar: "security",
    q: "In the cybersecurity world, which operational mindset fits your technical curiosity?",
    options: [
      { l: "A", t: "Offensive Security (Penetration Testing & Red Teaming): Finding web vulnerabilities, ethical hacking, and exploit payloads.", tags: ["penetration_tester", "red_team_operator", "cybersecurity"], i: "Ethical Hacker, {name}! Offensive testing, web security exploitation, and red team ops drive your thrill." },
      { l: "B", t: "Defensive Security & SOC Ops: Monitoring SIEM alerts, threat hunting, malware analysis, and securing corporate perimeters.", tags: ["soc_analyst", "dfir_analyst", "malware_analyst"], i: "Defender & SOC Analyst, {name}! Blue team threat hunting and digital forensic investigations are your fort." },
      { l: "C", t: "Application & Cloud Security (AppSec): Performing SAST/DAST code reviews, securing APIs, and hardening cloud IAM.", tags: ["application_security_engineer", "cloud_security_engineer"], i: "AppSec & Cloud Security Engineer, {name}! Securing software code and cloud workloads before deployment is vital." },
      { l: "D", t: "Governance, Risk & Compliance (GRC) & IAM: Identity access management policies, ISO 27001, and risk compliance audits.", tags: ["grc_analyst", "iam_engineer", "threat_intelligence_analyst"], i: "Security GRC Specialist, {name}! Identity governance, risk frameworks, and compliance structure modern enterprises." }
    ]
  }
];
