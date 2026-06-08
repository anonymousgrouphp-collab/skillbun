# Identity and Access Management (IAM) - Study Guide

AWS Identity and Access Management (IAM) is a foundational service that enables you to securely control access to AWS resources. It helps you manage who can authenticate (sign in) and what actions they are authorized to perform on your AWS resources.

## 1. Core IAM Concepts

### IAM Users
An IAM user is an entity that you create in AWS to represent the person or application that interacts with AWS. Each user can have their own unique credentials (e.g., username/password for console access, access keys for programmatic access via CLI/SDK).

*   **Use Cases**: Individual developers, administrators, or service accounts for specific applications.
*   **Best Practice**: Avoid using the AWS root account for daily operations. Always create individual IAM users with the minimum necessary permissions.

### IAM Groups
An IAM group is a collection of IAM users. You can attach access policies to a group, and all users within that group automatically inherit those permissions. This simplifies permission management for multiple users with similar access needs.

*   **Use Cases**: Organizing users into functional units like "Developers," "Operations," or "Auditors" to assign common permissions.

### IAM Roles
An IAM role is similar to an IAM user in that it is an AWS identity with permission policies that determine what the identity can and cannot do in AWS. However, a role is intended to be assumed by anyone or any service that needs it, rather than being permanently associated with one specific person or application.

*   **Use Cases**: 
    *   Granting permissions to AWS services (e.g., an EC2 instance accessing an S3 bucket).
    *   Allowing temporary access to users from other AWS accounts.
    *   Federated users (e.g., employees using corporate credentials to access AWS).
*   **Key Difference from Users**: Users have long-term credentials; roles provide temporary credentials that are dynamically generated upon assumption.

### IAM Policies
IAM policies are JSON documents that define permissions. They specify what actions are allowed or denied on which AWS resources, and under what conditions. Policies are the primary way you grant permissions in AWS.

*   **Policy Structure**: A policy consists of one or more statements. Each statement includes:
    *   `Effect`: `Allow` or `Deny` (whether the action is permitted or explicitly forbidden).
    *   `Action`: The specific AWS API actions being allowed or denied (e.g., `s3:GetObject`, `ec2:RunInstances`).
    *   `Resource`: The AWS resource(s) on which the action is allowed or denied, specified by their Amazon Resource Name (ARN) (e.g., `arn:aws:s3:::my-bucket/*`).
    *   `Condition` (Optional): Specifies when a policy is in effect (e.g., only from a specific IP address, or during a certain time of day).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-secure-bucket/*",
        "arn:aws:s3:::my-secure-bucket"
      ],
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": "203.0.113.0/24"
        }
      }
    }
  ]
}
```

*   **Types of Policies**:
    *   **AWS Managed Policies**: Pre-defined policies created and managed by AWS (e.g., `AmazonS3ReadOnlyAccess`). Best for quick starts but often too broad for least privilege.
    *   **Customer Managed Policies**: Policies you create and manage in your AWS account. Recommended for fine-grained control.
    *   **Inline Policies**: Policies embedded directly into a user, group, or role. They are deleted if the identity is deleted and are not reusable.
*   **Policy Evaluation Logic**: By default, all requests are implicitly denied. An explicit `Allow` grants access. An explicit `Deny` always overrides an `Allow`.

### Multi-Factor Authentication (MFA)
MFA adds an essential layer of security by requiring users to provide more than one method of verification to prove their identity before accessing AWS resources.

*   **How it Works**: Combines something you know (password) with something you have (MFA device) or something you are (biometrics).
*   **Types**: Virtual MFA devices (e.g., Google Authenticator, Authy), U2F security keys (e.g., YubiKey), hardware MFA devices.
*   **Best Practice**: Enable MFA for your AWS root account and all IAM users, especially those with administrative privileges, to significantly reduce the risk of unauthorized access.

### Least Privilege Principle
The principle of least privilege is a fundamental security concept that dictates that a user, program, or process should be given only the minimum set of permissions necessary to perform its specific task, and no more.

*   **Importance**: Reduces the attack surface and minimizes the potential impact of a security breach or accidental misconfiguration.
*   **Application**: Always start with the absolute minimum permissions and iteratively add more as required, rather than granting broad permissions and attempting to restrict them later.

## 2. Practical Application: Least Privilege for an EC2 Instance

Consider an EC2 instance that needs to upload logs to a specific S3 bucket named `my-app-logs`. Instead of giving the EC2 instance full S3 access (which would violate least privilege), you would create an IAM Role with a policy specifically allowing `s3:PutObject` and `s3:ListBucket` on only that bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-logs/*",
        "arn:aws:s3:::my-app-logs"
      ]
    }
  ]
}
```

This role would then have a trust policy allowing the EC2 service to assume it. By attaching this role to the EC2 instance, the instance can perform its logging task without having unnecessary permissions, such as deleting other buckets or accessing sensitive data in unrelated S3 locations.

## 3. Checklist / Exercise

1.  **Users vs. Roles**: Explain the primary difference between an IAM User and an IAM Role. Provide a scenario where an EC2 instance would utilize an IAM Role, and a scenario where a human administrator would utilize an IAM User.
2.  **Policy Evaluation**: An IAM user has two attached policies: Policy A explicitly allows `s3:GetObject` on `arn:aws:s3:::my-data-bucket/*`, and Policy B explicitly denies `s3:DeleteObject` on `arn:aws:s3:::my-data-bucket/*`. If the user attempts to delete an object from `my-data-bucket`, what will be the outcome and why?
3.  **MFA Setup**: Outline the high-level steps required to enable a virtual MFA device (like Google Authenticator) for your AWS root account, from the AWS Management Console.
