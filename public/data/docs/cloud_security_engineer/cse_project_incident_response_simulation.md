# Project: Cloud Incident Response Simulation & Playbook

This project provides a hands-on experience in preparing for, detecting, responding to, and recovering from cloud security incidents. As cloud adoption grows, so does the complexity and frequency of security threats. Developing robust incident response capabilities, including well-defined playbooks and the effective use of cloud-native tools, is crucial for minimizing damage and ensuring business continuity.

## Core Concepts

### What is Cloud Incident Response?
Cloud Incident Response (IR) is a structured approach to managing the aftermath of a security breach or cyberattack in a cloud environment. Its primary goals are to minimize disruption, eradicate threats, recover affected systems, and learn from the incident to prevent future occurrences.

### Phases of Incident Response (NIST SP 800-61 R2 Model)

The widely accepted NIST framework outlines six key phases:

1.  **Preparation:** Establishing policies, procedures, tools, and training for the IR team before an incident occurs. This includes developing playbooks, setting up monitoring, and ensuring logging is enabled.
2.  **Detection & Analysis:** Identifying potential security incidents through monitoring systems, logs, and alerts. This phase involves analyzing the scope, nature, and impact of the incident.
3.  **Containment:** Limiting the damage of the incident and preventing its spread. This might involve isolating compromised systems, revoking credentials, or blocking malicious IP addresses.
4.  **Eradication:** Removing the root cause of the incident and eliminating the threat. This includes patching vulnerabilities, removing malware, and deleting malicious accounts or resources.
5.  **Recovery:** Restoring affected systems and services to normal operation. This might involve restoring data from backups, rebuilding compromised instances, or reconfiguring security settings.
6.  **Post-Incident Activity (Post-Mortem):** Documenting the incident, conducting a lessons learned session, updating policies and procedures, and improving security controls based on the incident's findings.

### Cloud-Native Tools for Incident Response

Cloud providers offer a rich set of services that are invaluable for IR:

*   **Logging & Monitoring:** AWS CloudTrail, AWS CloudWatch, Azure Monitor, Azure Activity Logs, Google Cloud Audit Logs, Google Cloud Logging. These provide visibility into API calls, resource changes, and application performance.
*   **Threat Detection:** AWS GuardDuty, Azure Security Center (Defender for Cloud), Google Cloud Security Command Center. These services proactively identify potential threats and anomalies.
*   **Security Information and Event Management (SIEM):** AWS Security Hub, Azure Sentinel, Google Chronicle Security Operations. These aggregate security data from various sources for centralized analysis and threat hunting.
*   **Automation:** AWS Lambda, Azure Functions, Google Cloud Functions. Serverless functions can be triggered by alerts to automate containment or remediation actions.
*   **Forensics:** Snapshots of disks (EC2 EBS snapshots, Azure Managed Disks, Google Compute Engine persistent disks), object storage (S3, Azure Blob Storage, Google Cloud Storage) for storing forensic data.
*   **Identity & Access Management (IAM):** AWS IAM, Azure AD, Google Cloud IAM for managing and revoking access.

### Incident Response Playbooks

A playbook is a documented set of procedures that guides an incident response team through the steps required to handle a specific type of security incident. They ensure consistency, speed, and effectiveness in response. Key components include:

*   **Incident Type:** e.g., "Compromised IAM Credential"
*   **Trigger/Detection:** How the incident is identified.
*   **Response Steps:** Detailed actions for each IR phase.
*   **Roles & Responsibilities:** Who does what.
*   **Communication Plan:** Internal and external communication during the incident.
*   **Tools:** Specific cloud-native tools to be used.

## Simulation Scenario: Compromised IAM Credential & Data Exfiltration

**Scenario:** An AWS IAM Access Key belonging to a developer is compromised. The attacker uses this key to gain programmatic access, enumerate S3 buckets, and exfiltrate sensitive data from an S3 bucket to an external location.

### Attacker Steps (Simplified):

1.  **Reconnaissance:** Attacker uses compromised programmatic access (e.g., via AWS CLI configured with compromised keys) to list S3 buckets.
2.  **Discovery:** Attacker identifies a bucket containing sensitive data (e.g., `sensitive-customer-data-prod`).
3.  **Exfiltration:** Attacker downloads data from the sensitive S3 bucket.

## Developing and Executing the Playbook

Let's outline a playbook for the "Compromised IAM Credential & Data Exfiltration" scenario.

### 1. Preparation Phase (Pre-incident)

*   **Objective:** Ensure readiness.
*   **Actions:**
    *   Enable AWS CloudTrail for all regions and send logs to a secure S3 bucket.
    *   Enable AWS GuardDuty and configure it to send findings to AWS Security Hub and CloudWatch Events.
    *   Enable S3 server access logging for all critical S3 buckets.
    *   Configure CloudWatch Alarms for suspicious IAM activities (e.g., `ConsoleLogin` from unusual IPs, `CreateAccessKey` for root account, frequent `ListBuckets` or `GetObject` calls from a single user).
    *   Define IR team roles and responsibilities.
    *   Develop a communication plan.

### 2. Detection & Analysis Phase (During incident)

*   **Objective:** Identify, understand, and scope the incident.
*   **Trigger:**
    *   GuardDuty finding: "Stealth:IAMUser/NetworkActivity" or "Discovery:S3/AnomalousBehavior".
    *   CloudTrail alert: `GetObject` from `sensitive-customer-data-prod` bucket by an unfamiliar IP address or user agent, or `ListBuckets` from an unusual location.
*   **Actions:**
    *   **Verify Alert:** Confirm the alert's legitimacy and identify the affected IAM user/role.
    *   **Scope Assessment:**
        *   Review CloudTrail logs for the compromised IAM user: What API calls were made? From which IP addresses?
        *   Check S3 access logs for the affected bucket: Which objects were accessed? When? By whom?
        *   Examine GuardDuty findings for related activities.
        *   Check VPC Flow Logs if any EC2 instances were involved in the exfiltration (e.g., via an EC2 instance acting as a proxy).
    *   **Identify Impact:** Determine what data was accessed/exfiltrated and the potential business impact.

### 3. Containment Phase

*   **Objective:** Stop the attack from spreading and prevent further damage.
*   **Actions:**
    *   **Revoke Credentials:** Immediately revoke the compromised IAM Access Key. If a user, reset the console password and enforce MFA.
    *   **Isolate Source:** If the attack originated from a specific EC2 instance, isolate it from the network (e.g., modify Security Group to deny all outbound/inbound) and take a forensic snapshot.
    *   **Block Malicious IPs:** Add rules to WAF/Security Groups/Network ACLs to block identified malicious IP addresses.
    *   **Temporarily Restrict S3 Access:** Apply a temporary S3 bucket policy to deny access from unknown sources or specific IP ranges, or restrict access to read-only for critical buckets until the threat is neutralized.

### 4. Eradication Phase

*   **Objective:** Remove the attacker's presence and eliminate the root cause.
*   **Actions:**
    *   **Identify Root Cause:** Investigate how the IAM credentials were compromised (e.g., phishing, exposed code, weak password, lack of MFA). Implement corrective measures.
    *   **Remove Backdoors:** Check for any rogue IAM users, roles, or resources created by the attacker and delete them.
    *   **Patch Vulnerabilities:** Address the vulnerability that led to the compromise (e.g., enforce MFA, improve secret management practices, update code). Remove any malicious code or configurations.
    *   **Sanitize Environment:** Ensure no malicious code or configurations remain. Conduct thorough scans.

### 5. Recovery Phase

*   **Objective:** Restore services to normal, secure operations.
*   **Actions:**
    *   **Restore Data:** If data was corrupted or deleted, restore from the last known good backup. Verify data integrity.
    *   **Rebuild Resources:** If instances or resources were compromised beyond repair, rebuild them from trusted golden images or source code.
    *   **Re-establish Access:** Re-enable legitimate access to affected resources, ensuring new, strong credentials are in place and MFA is enforced for all critical accounts.
    *   **Monitor Closely:** Continuously monitor the environment for any signs of re-compromise or unusual activity.

### 6. Post-Incident Activity (Post-Mortem)

*   **Objective:** Learn from the incident to improve future security.
*   **Actions:**
    *   **Data Collection:** Gather all relevant logs, findings, and incident reports for comprehensive analysis.
    *   **Timeline Creation:** Document a detailed timeline of the incident, including detection, response, and recovery actions.
    *   **Lessons Learned Meeting:** Conduct a formal review with the IR team and relevant stakeholders to discuss what went well, what could be improved, and identify root causes.
    *   **Report Generation:** Create an incident report summarizing the attack, response, impact, and recommendations for improvement.
    *   **Policy/Procedure Update:** Update IR playbooks, security policies, and technical controls based on lessons learned to prevent similar incidents.
    *   **Improve Controls:** Implement new preventive measures (e.g., stricter IAM policies, advanced threat detection mechanisms, enhanced employee training).

## Forensic Data Collection

During an incident, collecting forensic data is critical for understanding "how" and "what":

*   **AWS CloudTrail:** Primary source for API activity, crucial for tracing actions of a compromised credential.
*   **AWS S3 Access Logs:** Detailed object-level access information for S3 buckets, vital for determining exfiltrated data.
*   **AWS GuardDuty Findings:** High-level threat intelligence and anomalous behavior alerts.
*   **AWS Config:** Tracks resource configuration changes, useful for identifying unauthorized modifications.
*   **VPC Flow Logs:** Network traffic metadata within your VPC, helps identify unusual network connections.
*   **EC2 Instance Snapshots:** Create disk snapshots of compromised instances for offline forensic analysis without affecting live systems.
*   **Memory Dumps:** Collect memory dumps from compromised instances to analyze running processes and volatile data (more advanced).

## Response Automation Example (Conceptual)

Serverless functions (e.g., AWS Lambda) can automate parts of the containment phase based on specific alerts.

```python
import boto3
import os

def lambda_handler(event, context):
    # This is a highly simplified example for demonstration.
    # In a real scenario, robust error handling, logging,
    # and validation would be required, along with parsing
    # the actual event structure from GuardDuty, CloudWatch, etc.

    print(f"Received event: {event}")

    # Extract compromised IAM User ARN from the event. (Example placeholder)
    # In a real scenario, this would dynamically parse the triggering event.
    # For a GuardDuty finding, it might look like:
    # user_name = event['detail']['resource']['accessKeyDetails']['userName']
    
    # For this example, let's assume the compromised user name is passed or derived.
    compromised_user_name = "developer-user-compromised-123" # Replace with actual user name from event

    iam_client = boto3.client('iam')

    try:
        # Step 1: Revoke all active access keys for the compromised user
        print(f"Attempting to revoke active access keys for user: {compromised_user_name}")
        response = iam_client.list_access_keys(UserName=compromised_user_name)
        
        for key in response['AccessKeyMetadata']:
            access_key_id = key['AccessKeyId']
            if key['Status'] == 'Active':
                print(f"Deactivating access key: {access_key_id}")
                iam_client.update_access_key(
                    UserName=compromised_user_name,
                    AccessKeyId=access_key_id,
                    Status='Inactive'
                )
                print(f"Access key {access_key_id} deactivated.")

        # Step 2: Detach all inline and managed policies from the user (aggressive containment)
        print(f"Attempting to detach policies from user: {compromised_user_name}")
        
        # Detach managed policies
        attached_policies = iam_client.list_attached_user_policies(UserName=compromised_user_name)
        for policy in attached_policies['AttachedPolicies']:
            print(f"Detaching managed policy: {policy['PolicyArn']}")
            iam_client.detach_user_policy(
                UserName=compromised_user_name,
                PolicyArn=policy['PolicyArn']
            )
        
        # Delete inline policies
        inline_policies = iam_client.list_user_policies(UserName=compromised_user_name)
        for policy_name in inline_policies['PolicyNames']:
            print(f"Deleting inline policy: {policy_name}")
            iam_client.delete_user_policy(
                UserName=compromised_user_name,
                PolicyName=policy_name
            )

        # Step 3: Recommend manual password reset for console access and enforce MFA if not already.
        print(f"Manual action required: Force password reset and enforce MFA for user {compromised_user_name} for console access.")

        print(f"Containment actions for user {compromised_user_name} completed.")
        return {
            'statusCode': 200,
            'body': 'Containment actions executed successfully.'
        }

    except iam_client.exceptions.NoSuchEntityException:
        print(f"IAM user {compromised_user_name} not found. Cannot proceed with containment.")
        return {
            'statusCode': 404,
            'body': f"IAM user {compromised_user_name} not found."
        }
    except Exception as e:
        print(f"Error during containment: {e}")
        return {
            'statusCode': 500,
            'body': f"Error during containment: {str(e)}"
        }

```

## Quick Checklist/Exercise

1.  **Scenario Design:** Outline a different cloud security incident scenario (e.g., a vulnerable web application leading to database compromise in Azure) and list the key cloud-native tools you would use for Detection and Containment in that specific scenario.
2.  **Playbook Step Expansion:** For the "Compromised IAM Credential" scenario, detail three specific `GetObject` CloudTrail log entries (including relevant fields like `sourceIPAddress`, `eventName`, `requestParameters.bucketName`, `userIdentity.arn`) that would be strong indicators of data exfiltration from an S3 bucket.
3.  **Automation Idea:** Propose an additional automated response action using AWS Lambda (or equivalent) for the "Eradication" phase in the compromised IAM credential scenario, explaining how it would work and what it would achieve (e.g., automated scanning for newly created suspicious resources by the compromised user).
