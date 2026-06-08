# Configuration Management (Ansible)

## 1. What is Configuration Management?
Configuration Management (CM) is the process of maintaining computer systems, servers, and software in a desired, consistent state. It involves automating the setup, installation, and updating of applications and operating systems. The goal is to ensure consistency, prevent configuration drift, improve efficiency, and reduce human error across large infrastructure.

Key benefits of CM include:
*   **Consistency:** Ensures all servers are configured identically.
*   **Automation:** Reduces manual effort and speeds up deployment.
*   **Scalability:** Easily manage hundreds or thousands of servers.
*   **Reproducibility:** Quickly recreate environments.
*   **Error Reduction:** Minimizes human error through automation.

## 2. Introduction to Ansible
Ansible is an open-source automation engine that automates software provisioning, configuration management, and application deployment. It's designed to be simple, agentless, and powerful, making it a popular choice for DevOps and IT professionals.

**Why Ansible?**
*   **Agentless:** No software needs to be installed on target machines; Ansible communicates over SSH (or WinRM for Windows).
*   **Simple:** Uses YAML for playbooks, which is human-readable and easy to write.
*   **Powerful:** Can manage complex multi-tier deployments, perform orchestrations, and handle cloud provisioning.
*   **Extensible:** Thousands of built-in modules, and easy to write custom ones.

## 3. Core Ansible Concepts

### a. Inventory
The inventory defines the hosts (servers) that Ansible manages. It can be a static file (INI or YAML format) or a dynamic script that pulls host information from cloud providers (AWS, Azure, GCP) or CMDBs.

**Example (hosts.ini):**
```ini
[webservers]
web1.example.com
web2.example.com

[databases]
db1.example.com
```

### b. Playbooks
Playbooks are the core of Ansible automation. They are YAML files that define a set of tasks to be executed on specified hosts. Playbooks can orchestrate multi-step workflows, define variables, handle conditions, and much more.

**Structure of a Playbook:**
*   **Hosts:** Specifies which servers to run the tasks on.
*   **Tasks:** A list of operations to perform (e.g., install a package, copy a file, start a service).
*   **Modules:** Ansible's units of work (e.g., `apt`, `yum`, `copy`, `service`). Each task calls an Ansible module.
*   **Handlers:** Special tasks that are only triggered when explicitly notified by another task, often used for restarting services after configuration changes.

### c. Roles
Roles provide a way to organize playbooks and related files (tasks, handlers, templates, variables, etc.) into a reusable and shareable structure. This promotes modularity and makes complex projects easier to manage.

**Standard Role Directory Structure:**
```
my_role/
├── tasks/
│   └── main.yml
├── handlers/
│   └── main.yml
├── templates/
├── files/
├── vars/
│   └── main.yml
└── defaults/
    └── main.yml
```

### d. Ansible Vault
Ansible Vault is used to keep sensitive data like passwords, API keys, or certificates encrypted within your playbooks and roles. It protects your secrets both at rest and in transit.

**Basic Vault Commands:**
*   `ansible-vault create my_secrets.yml`
*   `ansible-vault edit my_secrets.yml`
*   `ansible-vault encrypt my_file.txt`
*   `ansible-vault decrypt my_file.txt`

## 4. Simple Ansible Playbook Example
This playbook installs the Nginx web server on a target host and ensures it's running.

**File: `nginx_install.yml`**
```yaml
---
- name: Install and Configure Nginx
  hosts: webservers # Refers to a group defined in your inventory
  become: yes         # Run tasks with sudo/root privileges

  tasks:
    - name: Ensure Nginx is installed
      ansible.builtin.apt:
        name: nginx
        state: present
      when: ansible_os_family == "Debian" # Conditional for Debian-based systems

    - name: Ensure Nginx service is running and enabled
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: yes
      handlers:
        - name: restart nginx
          ansible.builtin.service:
            name: nginx
            state: restarted
```

To run this playbook, you would use:
`ansible-playbook -i hosts.ini nginx_install.yml`

## 5. Checklist/Exercise
1.  **Define a Simple Inventory:** Create a `hosts.ini` file that includes two groups: `dev` and `prod`, each with at least one fictitious server entry (e.g., `devserver1.example.com`, `prodserver1.example.com`).
2.  **Write a Basic Playbook:** Create a `ping.yml` playbook that uses the `ansible.builtin.ping` module to test connectivity to all hosts defined in your inventory. Explain what `ansible.builtin.ping` actually does.
3.  **Explore Ansible Vault:** Using `ansible-vault create`, create an encrypted file named `secrets.yml` and add a sample sensitive variable inside it (e.g., `db_password: "supersecret123"`). Then, practice viewing its content with `ansible-vault view`.