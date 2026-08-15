'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/app/components/AuthProvider'
import { useAdminAccess } from '@/utils/client/adminAuth'
import styles from './workforce.module.css'

const STATUS_TABS = [
  { key: 'ALL', label: 'All' },
  { key: 'OFFER_SENT', label: 'Offer Sent' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'EXPIRING_SOON', label: 'Expiring Soon' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'TERMINATED', label: 'Terminated' },
]

const EMPTY_FORM = {
  salutation: 'Mr.',
  full_name: '',
  parent_name: '',
  personal_email: '',
  phone: '',
  course_degree: '',
  college_name: '',
  current_address: '',
  permanent_address: '',
  employment_type: 'INTERN',
  department: '',
  designation: '',
  joining_date: '',
  contract_end_date: '',
  stipend_amount: '0',
  stipend_currency: 'INR',
  work_email: '',
  credentials_data: { work_email: '', password: '', access_notes: '' },
}

function Icon({ name, size = 18 }) {
  const paths = {
    plus: <path d="M12 5v14M5 12h14" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    edit: <><path d="m4 20 4.2-1 10.5-10.5a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z" /><path d="m13.8 7.4 3 3" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    alert: <><path d="M12 3 2.9 20h18.2L12 3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    refresh: <><path d="M20 11a8 8 0 0 0-14.8-4.2L3 9" /><path d="M3 4v5h5" /><path d="M4 13a8 8 0 0 0 14.8 4.2L21 15" /><path d="M21 20v-5h-5" /></>,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function dateOnly(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function daysUntil(value) {
  if (!value) return null
  const end = new Date(`${dateOnly(value)}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - today.getTime()) / 86400000)
}

function tenureMeta(employee) {
  const days = daysUntil(employee.contract_end_date)
  if (days === null || !['ACTIVE', 'EXTENDED'].includes(employee.status)) return null
  if (days <= 10) return { tone: 'critical', label: days < 0 ? `${Math.abs(days)}d overdue` : `${days}d remaining` }
  if (days <= 30) return { tone: 'warning', label: `${days}d remaining` }
  return { tone: 'good', label: `${days}d remaining` }
}

function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formFromEmployee(employee) {
  return {
    ...EMPTY_FORM,
    ...employee,
    joining_date: dateOnly(employee.joining_date),
    contract_end_date: dateOnly(employee.contract_end_date),
    stipend_amount: String(employee.stipend_amount ?? 0),
    // Credentials are intentionally never returned by the API. Keep this section blank
    // during edits so unchanged encrypted values are preserved server-side.
    credentials_data: { ...EMPTY_FORM.credentials_data },
  }
}

function toPayload(form, { includeStatus = false } = {}) {
  const credentials = form.credentials_data
  const hasCredentialInput = Boolean(credentials.work_email || credentials.password || credentials.access_notes)
  const payload = {
    salutation: form.salutation,
    full_name: form.full_name.trim(),
    parent_name: form.parent_name.trim(),
    personal_email: form.personal_email.trim().toLowerCase(),
    phone: form.phone.trim(),
    course_degree: form.course_degree.trim(),
    college_name: form.college_name.trim(),
    current_address: form.current_address.trim(),
    permanent_address: form.permanent_address.trim(),
    employment_type: form.employment_type,
    department: form.department.trim(),
    designation: form.designation.trim(),
    joining_date: form.joining_date,
    contract_end_date: form.contract_end_date,
    stipend_amount: Number(form.stipend_amount),
    stipend_currency: 'INR',
  }

  if (form.work_email.trim()) payload.work_email = form.work_email.trim().toLowerCase()
  if (hasCredentialInput) {
    payload.credentials_data = {
      work_email: (credentials.work_email || form.work_email).trim().toLowerCase(),
      password: credentials.password,
      access_notes: credentials.access_notes.trim(),
    }
  }
  if (includeStatus && form.status) payload.status = form.status
  return payload
}

export default function WorkforcePage() {
  const router = useRouter()
  const { user, authLoading } = useAuth()
  const { isAdmin, isFounder, role, checking } = useAdminAccess(user, authLoading)
  const [employees, setEmployees] = useState([])
  const [pagination, setPagination] = useState({ has_more: false, next_page_token: null })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('full_name')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [dispatchFallback, setDispatchFallback] = useState(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const showToast = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 4000)
  }

  const redirectDenied = () => {
    showToast('Workforce Hub is restricted to authorised administrators.')
    window.setTimeout(() => router.replace('/dashboard'), 850)
  }

  const request = async (url, options = {}) => {
    const token = await user.getIdToken()
    const response = await fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    })
    const data = await response.json().catch(() => ({}))
    if (response.status === 401 || response.status === 403) {
      redirectDenied()
      throw new Error('Admin access is required.')
    }
    if (!response.ok) throw new Error(data?.error?.message || 'The workforce request could not be completed.')
    return data
  }

  const loadEmployees = async ({ append = false, pageToken = null } = {}) => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (pageToken) params.set('pageToken', pageToken)
      const data = await request(`/api/admin/workforce/employees?${params.toString()}`)
      setEmployees((current) => append ? [...current, ...(data.employees || [])] : (data.employees || []))
      setPagination(data.pagination || { has_more: false, next_page_token: null })
    } catch (loadError) {
      if (!/Admin access/.test(loadError.message)) setError(loadError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      const deniedTimer = window.setTimeout(redirectDenied, 0)
      return () => window.clearTimeout(deniedTimer)
    }
    const loadTimer = window.setTimeout(() => {
      if (isAdmin) loadEmployees()
    }, 0)
    return () => window.clearTimeout(loadTimer)
    // Authentication state determines when the first protected request may run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, isAdmin])

  const expiringSoon = useMemo(() => employees.filter((employee) => {
    const days = daysUntil(employee.contract_end_date)
    return ['ACTIVE', 'EXTENDED'].includes(employee.status) && days !== null && days <= 10
  }), [employees])

  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()
    return employees
      .filter((employee) => {
        if (activeTab === 'EXPIRING_SOON') return expiringSoon.some((item) => item.id === employee.id)
        return activeTab === 'ALL' || employee.status === activeTab
      })
      .filter((employee) => !query || employee.full_name?.toLowerCase().includes(query) || employee.personal_email?.toLowerCase().includes(query))
      .sort((left, right) => {
        if (sortBy === 'full_name') return (left.full_name || '').localeCompare(right.full_name || '')
        return dateOnly(left[sortBy]).localeCompare(dateOnly(right[sortBy]))
      })
  }, [activeTab, employees, expiringSoon, search, sortBy])

  const countForTab = (key) => key === 'ALL'
    ? employees.length
    : key === 'EXPIRING_SOON'
      ? expiringSoon.length
      : employees.filter((employee) => employee.status === key).length

  const [modalTab, setModalTab] = useState('DETAILS')
  const [milestones, setMilestones] = useState([])
  const [loadingMilestones, setLoadingMilestones] = useState(false)
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    due_date: '',
    deliverable_url: '',
    review_notes: '',
    status: 'TODO',
  })
  const [editingMilestoneId, setEditingMilestoneId] = useState(null)
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)

  const loadMilestones = async (employeeId) => {
    if (!employeeId || !user) return
    setLoadingMilestones(true)
    try {
      const data = await request(`/api/admin/workforce/milestones?employeeId=${employeeId}`)
      setMilestones(data.milestones || [])
    } catch (err) {
      console.error('Failed to load milestones', err)
    } finally {
      setLoadingMilestones(false)
    }
  }

  const startAddMilestone = () => {
    setMilestoneForm({
      title: '',
      description: '',
      priority: 'MEDIUM',
      due_date: new Date().toISOString().slice(0, 10),
      deliverable_url: '',
      review_notes: '',
      status: 'TODO',
    })
    setEditingMilestoneId(null)
    setShowMilestoneForm(true)
  }

  const startEditMilestone = (m) => {
    setMilestoneForm({
      title: m.title || '',
      description: m.description || '',
      priority: m.priority || 'MEDIUM',
      due_date: m.due_date ? m.due_date.slice(0, 10) : '',
      deliverable_url: m.deliverable_url || '',
      review_notes: m.review_notes || '',
      status: m.status || 'TODO',
    })
    setEditingMilestoneId(m.id)
    setShowMilestoneForm(true)
  }

  const cancelMilestoneForm = () => {
    setShowMilestoneForm(false)
    setEditingMilestoneId(null)
  }

  const saveMilestone = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      if (editingMilestoneId) {
        await request(`/api/admin/workforce/milestones/${editingMilestoneId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(milestoneForm),
        })
        showToast('Milestone updated successfully.')
      } else {
        await request('/api/admin/workforce/milestones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employee_id: form.id,
            ...milestoneForm,
          }),
        })
        showToast('New milestone assigned to employee.')
      }
      setShowMilestoneForm(false)
      setEditingMilestoneId(null)
      await loadMilestones(form.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const deleteMilestone = async (milestoneId) => {
    if (!window.confirm('Delete this milestone permanently?')) return
    setSubmitting(true)
    setError('')
    try {
      await request(`/api/admin/workforce/milestones/${milestoneId}`, {
        method: 'DELETE',
      })
      showToast('Milestone deleted.')
      await loadMilestones(form.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const updateMilestoneStatus = async (milestoneId, newStatus) => {
    setSubmitting(true)
    setError('')
    try {
      await request(`/api/admin/workforce/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      showToast(`Milestone marked ${newStatus.replace('_', ' ')}.`)
      await loadMilestones(form.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const [credentials, setCredentials] = useState([])
  const [loadingCredentials, setLoadingCredentials] = useState(false)
  const [issuanceModal, setIssuanceModal] = useState(null)
  const [issuanceForm, setIssuanceForm] = useState({
    stream_or_track: '',
    start_date: '',
    end_date: '',
    recommendation_text: '',
  })

  const loadCredentials = async (employeeId) => {
    if (!employeeId || !user) return
    setLoadingCredentials(true)
    try {
      const data = await request(`/api/admin/workforce/credentials?employeeId=${employeeId}`)
      setCredentials(data.credentials || [])
    } catch (err) {
      console.error('Failed to load credentials', err)
    } finally {
      setLoadingCredentials(false)
    }
  }

  const openIssuance = (type) => {
    const defaultStream = form.department ? `${form.department} (Development & Engineering)` : 'Technology & Product Engineering'
    const defaultLor = `During their tenure at SkillBun, ${form.full_name} demonstrated exceptional dedication, technical excellence, and collaboration within the ${form.department} department as a ${form.designation}. They consistently delivered high-quality contributions across all assigned sprint deliverables, showing deep problem-solving proficiency, proactive communication, and high ethical standards. I strongly recommend ${form.full_name} for future professional and academic pursuits.`

    setIssuanceForm({
      stream_or_track: type === 'TRAINING' ? 'Full-Stack Web Engineering & Distributed Cloud Systems' : defaultStream,
      start_date: form.joining_date || '',
      end_date: form.contract_end_date || '',
      recommendation_text: defaultLor,
    })
    setIssuanceModal(type)
  }

  const closeIssuance = () => {
    setIssuanceModal(null)
  }

  const submitIssuance = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const data = await request('/api/certify/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cert_type: issuanceModal,
          employee_id: form.id,
          name: form.full_name,
          email: form.personal_email,
          ...issuanceForm,
        }),
      })
      showToast(`Credential issued successfully! Ref: ${data.certId}`)
      setIssuanceModal(null)
      await loadCredentials(form.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleRevocation = async (credId, isRevoked) => {
    const actionName = isRevoked ? 'reinstate' : 'revoke'
    if (!window.confirm(`Are you sure you want to ${actionName} this credential?`)) return
    setSubmitting(true)
    setError('')
    try {
      await request(`/api/admin/workforce/credentials/${credId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_revoked: !isRevoked }),
      })
      showToast(`Credential ${isRevoked ? 'reinstated' : 'revoked'} successfully.`)
      await loadCredentials(form.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setModalTab('DETAILS')
    setShowMilestoneForm(false)
    setEditingMilestoneId(null)
    setMilestones([])
    setCredentials([])
    setIssuanceModal(null)
    setError('')
    setModal('add')
  }

  const openEdit = (employee) => {
    setForm(formFromEmployee(employee))
    setModalTab('DETAILS')
    setShowMilestoneForm(false)
    setEditingMilestoneId(null)
    setIssuanceModal(null)
    setError('')
    setModal('edit')
    loadMilestones(employee.id)
    loadCredentials(employee.id)
  }

  const closeModal = () => {
    if (!submitting) {
      setModal(null)
      setShowMilestoneForm(false)
      setEditingMilestoneId(null)
      setIssuanceModal(null)
    }
  }

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const updateCredential = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, credentials_data: { ...current.credentials_data, [name]: value } }))
  }

  const saveEmployee = async (event) => {
    event.preventDefault()
    if (modal === 'confirm-terminate') return
    setSubmitting(true)
    setError('')
    try {
      const isEdit = modal === 'edit'
      await request(isEdit ? `/api/admin/workforce/employees/${form.id}` : '/api/admin/workforce/employees', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toPayload(form, { includeStatus: isEdit })),
      })
      setModal(null)
      showToast(isEdit ? 'Employee details updated.' : 'Candidate added to the workforce hub.')
      await loadEmployees()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const changeStatus = async (employee, status) => {
    if (status === 'TERMINATED') {
      setForm(formFromEmployee(employee))
      setModal('confirm-terminate')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await request(`/api/admin/workforce/employees/${employee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      showToast(`Employee marked ${statusLabel(status)}.`)
      await loadEmployees()
    } catch (statusError) {
      setError(statusError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmTermination = async () => {
    setSubmitting(true)
    setError('')
    try {
      await request(`/api/admin/workforce/employees/${form.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'TERMINATED' }),
      })
      setModal(null)
      showToast('Employee marked Terminated.')
      await loadEmployees()
    } catch (terminationError) {
      setError(terminationError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const downloadOfferPdf = async (employeeId) => {
    if (!user) return
    setSubmitting(true)
    setError('')
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/admin/workforce/pdf/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ employeeId }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to generate offer letter PDF.')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const headerDisposition = res.headers.get('Content-Disposition')
      const match = headerDisposition && headerDisposition.match(/filename="?([^"]+)"?/)
      a.download = match ? match[1] : 'Offer_Letter.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showToast('Offer letter PDF generated and downloaded.')
    } catch (pdfErr) {
      setError(pdfErr.message)
    } finally {
      setSubmitting(false)
    }
  }

  const downloadExtensionPdf = async (employeeId, newContractEndDate) => {
    if (!user) return
    setSubmitting(true)
    setError('')
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/admin/workforce/pdf/extension', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ employeeId, new_contract_end_date: newContractEndDate }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to generate extension letter PDF.')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const headerDisposition = res.headers.get('Content-Disposition')
      const match = headerDisposition && headerDisposition.match(/filename="?([^"]+)"?/)
      a.download = match ? match[1] : 'Extension_Letter.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showToast('Extension letter PDF generated and downloaded.')
    } catch (pdfErr) {
      setError(pdfErr.message)
    } finally {
      setSubmitting(false)
    }
  }

  const dispatchOfferLetter = async (employeeId) => {
    if (!user) return
    setSubmitting(true)
    setError('')
    try {
      const idToken = await user.getIdToken()
      const res = await fetch('/api/admin/workforce/offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ employeeId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok && !data.fallbackDownload) {
        throw new Error(data?.error?.message || data?.message || 'Failed to dispatch offer letter.')
      }

      if (data.success) {
        setModal(null)
        showToast(`Offer letter (${data.referenceId}) generated & dispatched via email!`)
        await loadEmployees()
      } else if (data.fallbackDownload) {
        setDispatchFallback(data)
        setModal('dispatch-fallback')
        await loadEmployees()
      }
    } catch (dispatchErr) {
      setError(dispatchErr.message)
    } finally {
      setSubmitting(false)
    }
  }

  const downloadBase64Pdf = (base64Content, filename) => {
    try {
      const byteCharacters = atob(base64Content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'Offer_Letter.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showToast('Generated PDF downloaded to device.')
    } catch (downloadErr) {
      setError('Unable to download fallback PDF: ' + downloadErr.message)
    }
  }

  const actionsFor = (employee) => {
    const actions = []
    if (employee.status === 'OFFER_SENT') actions.push(['ACTIVE', 'Mark Active'])
    if (employee.status === 'ACTIVE') actions.push(['EXTENDED', 'Mark Extended'])
    if (['ACTIVE', 'EXTENDED'].includes(employee.status)) actions.push(['COMPLETED', 'Mark Completed'])
    if (['OFFER_SENT', 'ACTIVE', 'EXTENDED'].includes(employee.status)) actions.push(['TERMINATED', 'Mark Terminated'])
    return actions
  }

  if (authLoading || checking || (!user && !toast)) {
    return <main className={styles.page}><div className={styles.loading}>Checking Workforce Hub access...</div></main>
  }

  if (!isAdmin) {
    return (
      <main className={styles.page}>
        <div style={{ maxWidth: '480px', margin: '10vh auto', padding: '2.5rem', background: 'var(--card-bg)', border: '1px solid #ef4444', borderRadius: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>403 — Unauthorized Access</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Signed in as <strong>{user?.email || 'Student'}</strong>. This section is restricted to authorized platform administrators.
          </p>
          <a href="/dashboard" style={{ background: 'var(--surface-raised)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
            ← Back to Student Dashboard
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />
      <section className={styles.container} aria-labelledby="workforce-title">
        <header className={styles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <p className={styles.eyebrow} style={{ margin: 0 }}>SkillBun Operations</p>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>•</span>
              <a href="/dashboard/console/admin" style={{ color: 'var(--green)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: '700' }}>← Admin Hub</a>
              <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>•</span>
              <a href="/dashboard/console/admin/analytics" style={{ color: 'var(--muted)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: '600' }}>📊 Analytics & CRM</a>
            </div>
            <h1 id="workforce-title">Workforce Hub</h1>
            <p className={styles.subtitle}>Manage candidate details, employment status, and upcoming contract milestones.</p>
          </div>
          <button type="button" className={styles.primaryButton} onClick={openAdd}>
            <Icon name="plus" /> Add Candidate
          </button>
        </header>

        {expiringSoon.filter((employee) => daysUntil(employee.contract_end_date) <= 7).length > 0 && (
          <div className={styles.alertBanner} role="alert">
            <Icon name="alert" />
            <span><strong>Contract attention needed.</strong> {expiringSoon.filter((employee) => daysUntil(employee.contract_end_date) <= 7).length} active contract{expiringSoon.filter((employee) => daysUntil(employee.contract_end_date) <= 7).length === 1 ? '' : 's'} expire within 7 days.</span>
          </div>
        )}

        <div className={styles.toolbar}>
          <div className={styles.tabs} aria-label="Employee status filters">
            {STATUS_TABS.map((tab) => (
              <button key={tab.key} type="button" className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`} onClick={() => setActiveTab(tab.key)}>
                {tab.label}<span>{countForTab(tab.key)}</span>
              </button>
            ))}
          </div>
          <label className={styles.searchField}>
            <Icon name="search" />
            <span className={styles.srOnly}>Search employees</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" />
          </label>
          <label className={styles.sortField}>
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="full_name">Name</option>
              <option value="joining_date">Joining date</option>
              <option value="contract_end_date">Contract end date</option>
            </select>
          </label>
          <button type="button" className={styles.refreshButton} onClick={loadEmployees} disabled={loading} aria-label="Refresh employee list"><Icon name="refresh" /></button>
        </div>

        {error && <div className={styles.error} role="alert">{error}</div>}

        <section className={styles.tableWrap} aria-label="Workforce employees">
          {loading ? <div className={styles.loading}>Loading employees...</div> : visibleEmployees.length === 0 ? (
            <div className={styles.empty}><strong>No employees found.</strong><span>Adjust the filters or add a new candidate to begin.</span></div>
          ) : (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Designation</th><th>Status</th><th>Tenure remaining</th><th><span className={styles.srOnly}>Actions</span></th></tr></thead>
              <tbody>{visibleEmployees.map((employee) => {
                const tenure = tenureMeta(employee)
                return <tr key={employee.id} onClick={() => openEdit(employee)} className={styles.employeeRow}>
                  <td data-label="Name"><strong>{employee.full_name}</strong><small>{employee.employment_type.replace('_', ' ')}</small></td>
                  <td data-label="Email">{employee.personal_email}</td>
                  <td data-label="Department">{employee.department}</td>
                  <td data-label="Designation">{employee.designation}</td>
                  <td data-label="Status"><span className={`${styles.status} ${styles[`status${employee.status}`] || ''}`}>{statusLabel(employee.status)}</span></td>
                  <td data-label="Tenure remaining">{tenure ? <span className={`${styles.tenure} ${styles[tenure.tone]}`}>{tenure.label}</span> : <span className={styles.muted}>--</span>}</td>
                  <td data-label="Actions" onClick={(event) => event.stopPropagation()}><div className={styles.actions}>
                    <button type="button" className={styles.iconButton} onClick={() => openEdit(employee)} aria-label={`Edit ${employee.full_name}`}><Icon name="edit" /></button>
                    {actionsFor(employee).map(([status, label]) => <button key={status} type="button" className={status === 'TERMINATED' ? styles.terminateButton : styles.actionButton} onClick={() => changeStatus(employee, status)} disabled={submitting}>{label}</button>)}
                  </div></td>
                </tr>
              })}</tbody>
            </table>
          )}
        </section>
        {pagination.has_more && !loading && (
          <div className={styles.loadMoreWrap}>
            <button type="button" className={styles.secondaryButton} onClick={() => loadEmployees({ append: true, pageToken: pagination.next_page_token })}>Load more employees</button>
          </div>
        )}
      </section>

      {modal && <div className={styles.backdrop} role="presentation" onMouseDown={closeModal}>
        <section className={`${styles.modal} ${modal === 'confirm-terminate' ? styles.confirmModal : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
          {modal === 'confirm-terminate' ? <>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>Status change</p><h2 id="modal-title">Terminate employment?</h2></div><button type="button" className={styles.iconButton} onClick={closeModal} aria-label="Close dialog"><Icon name="close" /></button></div>
            <p className={styles.confirmText}>This will mark <strong>{form.full_name}</strong> as terminated. You can archive the record later, but this status change is logged immediately.</p>
            <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={closeModal}>Cancel</button><button type="button" className={styles.terminateButton} onClick={confirmTermination} disabled={submitting}>{submitting ? 'Updating...' : 'Confirm termination'}</button></div>
          </> : <div>
            <div className={styles.modalHeader}><div><p className={styles.eyebrow}>{modal === 'add' ? 'New workforce record' : 'Employee record'}</p><h2 id="modal-title">{modal === 'add' ? 'Add Candidate' : `Edit ${form.full_name}`}</h2></div><button type="button" className={styles.iconButton} onClick={closeModal} aria-label="Close dialog"><Icon name="close" /></button></div>
            {modal === 'edit' && (
              <div className={styles.modalTabs}>
                <button
                  type="button"
                  className={`${styles.modalTab} ${modalTab === 'DETAILS' ? styles.modalTabActive : ''}`}
                  onClick={() => setModalTab('DETAILS')}
                >
                  Candidate Details
                </button>
                <button
                  type="button"
                  className={`${styles.modalTab} ${modalTab === 'MILESTONES' ? styles.modalTabActive : ''}`}
                  onClick={() => setModalTab('MILESTONES')}
                >
                  Sprint Milestones ({milestones.length})
                </button>
                <button
                  type="button"
                  className={`${styles.modalTab} ${modalTab === 'CREDENTIALS' ? styles.modalTabActive : ''}`}
                  onClick={() => setModalTab('CREDENTIALS')}
                >
                  Credentials & LOR ({credentials.length})
                </button>
              </div>
            )}

            {modalTab === 'DETAILS' && (
              <form onSubmit={saveEmployee}>
                <div className={styles.formGrid}>
                  <label>Salutation<select name="salutation" value={form.salutation} onChange={updateField}><option>Mr.</option><option>Ms.</option></select></label>
                  <label>Full name<input name="full_name" value={form.full_name} onChange={updateField} required /></label>
                  <label>Parent name<input name="parent_name" value={form.parent_name} onChange={updateField} required /></label>
                  <label>Personal email<input name="personal_email" type="email" value={form.personal_email} onChange={updateField} required /></label>
                  <label>Phone<input name="phone" value={form.phone} onChange={updateField} required /></label>
                  <label>Employment type<select name="employment_type" value={form.employment_type} onChange={updateField}><option value="INTERN">Intern</option><option value="FULL_TIME">Full time</option><option value="CONTRACTOR">Contractor</option></select></label>
                  <label>Course / degree<input name="course_degree" value={form.course_degree} onChange={updateField} required /></label>
                  <label>College name<input name="college_name" value={form.college_name} onChange={updateField} required /></label>
                  <label>Department<input name="department" value={form.department} onChange={updateField} required /></label>
                  <label>Designation<input name="designation" value={form.designation} onChange={updateField} required /></label>
                  <label>Joining date<input name="joining_date" type="date" value={form.joining_date} onChange={updateField} required /></label>
                  <label>Contract end date<input name="contract_end_date" type="date" value={form.contract_end_date} onChange={updateField} required /></label>
                  <label>Stipend amount (INR)<input name="stipend_amount" type="number" min="0" step="0.01" value={form.stipend_amount} onChange={updateField} required /></label>
                  <label>Work email <span className={styles.optional}>Optional</span><input name="work_email" type="email" value={form.work_email} onChange={updateField} /></label>
                  <label className={styles.fullWidth}>Current address<textarea name="current_address" value={form.current_address} onChange={updateField} required rows="2" /></label>
                  <label className={styles.fullWidth}>Permanent address<textarea name="permanent_address" value={form.permanent_address} onChange={updateField} required rows="2" /></label>
                </div>
                <fieldset className={styles.credentials}><legend>Zoho credentials <span>optional and encrypted on save</span></legend><div className={styles.formGrid}>
                  <label>Zoho work email<input name="work_email" type="email" value={form.credentials_data.work_email} onChange={updateCredential} /></label>
                  <label>Zoho password<input name="password" type="password" value={form.credentials_data.password} onChange={updateCredential} autoComplete="new-password" /></label>
                  <label className={styles.fullWidth}>Access notes<textarea name="access_notes" value={form.credentials_data.access_notes} onChange={updateCredential} rows="2" /></label>
                </div></fieldset>
                {error && <div className={styles.error} role="alert">{error}</div>}
                <div className={styles.modalActions}>
                  {modal === 'edit' && (
                    <>
                      <button
                        type="button"
                        className={styles.dispatchButton}
                        onClick={() => dispatchOfferLetter(form.id)}
                        disabled={submitting}
                      >
                        {submitting ? 'Dispatching...' : '✉️ Dispatch Offer via Email'}
                      </button>
                      {form.status === 'OFFER_SENT' && (
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => downloadOfferPdf(form.id)}
                          disabled={submitting}
                        >
                          Download Offer PDF
                        </button>
                      )}
                      {['ACTIVE', 'EXTENDED'].includes(form.status) && (
                        <button
                          type="button"
                          className={styles.secondaryButton}
                          onClick={() => downloadExtensionPdf(form.id, form.contract_end_date)}
                          disabled={submitting}
                        >
                          Download Extension PDF
                        </button>
                      )}
                    </>
                  )}
                  <button type="button" className={styles.secondaryButton} onClick={closeModal}>Cancel</button>
                  <button type="submit" className={styles.primaryButton} disabled={submitting}>{submitting ? 'Saving...' : modal === 'add' ? 'Add Candidate' : 'Save changes'}</button>
                </div>
              </form>
            )}

            {modalTab === 'MILESTONES' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <p className={styles.eyebrow}>Sprint Deliverables</p>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Assigned Milestones</h3>
                  </div>
                  {!showMilestoneForm && (
                    <button type="button" className={styles.primaryButton} onClick={startAddMilestone}>
                      <Icon name="plus" /> Add Milestone
                    </button>
                  )}
                </div>

                {showMilestoneForm && (
                  <form onSubmit={saveMilestone} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)', marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem' }}>{editingMilestoneId ? 'Edit Milestone' : 'New Sprint Milestone'}</h4>
                    <div className={styles.formGrid}>
                      <label className={styles.fullWidth}>
                        Title
                        <input
                          value={milestoneForm.title}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                          placeholder="e.g. Next.js API Authentication & Unit Tests"
                          required
                        />
                      </label>
                      <label>
                        Priority
                        <select
                          value={milestoneForm.priority}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, priority: e.target.value })}
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </label>
                      <label>
                        Status
                        <select
                          value={milestoneForm.status}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, status: e.target.value })}
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="UNDER_REVIEW">Under Review</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </label>
                      <label>
                        Due Date
                        <input
                          type="date"
                          value={milestoneForm.due_date}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, due_date: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        Deliverable URL
                        <input
                          type="url"
                          value={milestoneForm.deliverable_url}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, deliverable_url: e.target.value })}
                          placeholder="https://github.com/..."
                        />
                      </label>
                      <label className={styles.fullWidth}>
                        Description
                        <textarea
                          value={milestoneForm.description}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                          rows="2"
                          placeholder="Brief description of requirements..."
                        />
                      </label>
                      <label className={styles.fullWidth}>
                        Admin Review Notes
                        <textarea
                          value={milestoneForm.review_notes}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, review_notes: e.target.value })}
                          rows="2"
                          placeholder="Feedback or acceptance criteria..."
                        />
                      </label>
                    </div>
                    {error && <div className={styles.error} role="alert" style={{ marginTop: '0.85rem' }}>{error}</div>}
                    <div className={styles.modalActions} style={{ marginTop: '0.85rem' }}>
                      <button type="button" className={styles.secondaryButton} onClick={cancelMilestoneForm}>Cancel</button>
                      <button type="submit" className={styles.primaryButton} disabled={submitting}>
                        {submitting ? 'Saving...' : editingMilestoneId ? 'Update Milestone' : 'Assign Milestone'}
                      </button>
                    </div>
                  </form>
                )}

                {loadingMilestones ? (
                  <div className={styles.loading}>Loading milestones...</div>
                ) : milestones.length === 0 ? (
                  <div className={styles.empty}>
                    <strong>No sprint milestones yet.</strong>
                    <span>Assign core tasks and deliverables to track intern sprint progress.</span>
                  </div>
                ) : (
                  <div className={styles.milestoneList}>
                    {milestones.map((m) => {
                      const isOverdue = m.due_date && new Date(`${m.due_date}T00:00:00`) < new Date(new Date().setHours(0,0,0,0)) && m.status !== 'COMPLETED'
                      return (
                        <div key={m.id} className={`${styles.milestoneCard} ${isOverdue ? styles.milestoneCardOverdue : ''}`}>
                          <div className={styles.milestoneHeader}>
                            <div>
                              <strong>{m.title}</strong>
                              {m.description && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>{m.description}</p>}
                            </div>
                            <div className={styles.milestoneBadges}>
                              <span className={`${styles.priorityBadge} ${styles[`priority${m.priority}`] || ''}`}>
                                {m.priority === 'URGENT' ? '🔴' : m.priority === 'HIGH' ? '🟠' : m.priority === 'MEDIUM' ? '🔵' : '⚪'} {m.priority}
                              </span>
                              <select
                                value={m.status}
                                onChange={(e) => updateMilestoneStatus(m.id, e.target.value)}
                                className={styles.status}
                                style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)', cursor: 'pointer', outline: 'none' }}
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="UNDER_REVIEW">Under Review</option>
                                <option value="COMPLETED">Completed</option>
                              </select>
                            </div>
                          </div>
                          <div className={styles.milestoneMeta}>
                            <span>Due: <strong style={{ color: isOverdue ? 'var(--danger)' : 'inherit' }}>{m.due_date || 'N/A'}{isOverdue ? ' (Overdue)' : ''}</strong></span>
                            {m.deliverable_url ? (
                              <a href={m.deliverable_url} target="_blank" rel="noopener noreferrer" className={styles.deliverableLink}>
                                🔗 Open Deliverable ↗
                              </a>
                            ) : (
                              <span>No deliverable URL</span>
                            )}
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem' }}>
                              <button type="button" className={styles.actionButton} onClick={() => startEditMilestone(m)}>Edit</button>
                              <button type="button" className={styles.terminateButton} onClick={() => deleteMilestone(m.id)}>Delete</button>
                            </div>
                          </div>
                          {m.review_notes && (
                            <div className={styles.reviewNotesBox}>
                              <strong>Review Notes:</strong> {m.review_notes}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={closeModal}>Close</button>
                </div>
              </div>
            )}

            {modalTab === 'CREDENTIALS' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <p className={styles.eyebrow}>Verified Digital Credentials</p>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Issued Credentials & LOR</h3>
                  </div>
                </div>

                <div className={styles.issuanceButtons}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => openIssuance('INTERNSHIP')}
                    disabled={form.status !== 'COMPLETED'}
                    title={form.status !== 'COMPLETED' ? 'Internship certificate requires employee status to be COMPLETED.' : ''}
                  >
                    🎓 Issue Certificate of Internship
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    style={{ background: '#7c3aed' }}
                    onClick={() => openIssuance('TRAINING')}
                    disabled={!['ACTIVE', 'EXTENDED', 'COMPLETED'].includes(form.status)}
                    title={!['ACTIVE', 'EXTENDED', 'COMPLETED'].includes(form.status) ? 'Training certificate requires ACTIVE, EXTENDED, or COMPLETED status.' : ''}
                  >
                    📜 Issue Certificate of Training
                  </button>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    style={{ background: '#ca8a04' }}
                    onClick={() => openIssuance('LOR')}
                    disabled={form.status !== 'COMPLETED'}
                    title={form.status !== 'COMPLETED' ? 'Letter of Recommendation requires employee status to be COMPLETED.' : ''}
                  >
                    ✍️ Issue Letter of Recommendation (LOR)
                  </button>
                </div>

                {issuanceModal && (
                  <form onSubmit={submitIssuance} style={{ padding: '1.1rem', border: '1px solid var(--green)', borderRadius: '12px', background: 'var(--surface)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--green)' }}>
                        {issuanceModal === 'INTERNSHIP' ? '🎓 Issue Certificate of Internship' : issuanceModal === 'TRAINING' ? '📜 Issue Certificate of Training' : '✍️ Issue Letter of Recommendation'}
                      </h4>
                      <button type="button" className={styles.iconButton} onClick={closeIssuance} aria-label="Close issuance form">
                        <Icon name="close" />
                      </button>
                    </div>

                    <div className={styles.formGrid}>
                      <label>
                        Candidate Name
                        <input value={form.full_name} disabled style={{ opacity: 0.75 }} />
                      </label>
                      <label>
                        Personal Email
                        <input value={form.personal_email} disabled style={{ opacity: 0.75 }} />
                      </label>
                      <label className={styles.fullWidth}>
                        Stream / Track Title
                        <input
                          value={issuanceForm.stream_or_track}
                          onChange={(e) => setIssuanceForm({ ...issuanceForm, stream_or_track: e.target.value })}
                          placeholder="e.g. Full-Stack Web Development & Cloud Systems"
                          required
                        />
                      </label>
                      <label>
                        Start Date
                        <input
                          type="date"
                          value={issuanceForm.start_date}
                          onChange={(e) => setIssuanceForm({ ...issuanceForm, start_date: e.target.value })}
                          required
                        />
                      </label>
                      <label>
                        End Date
                        <input
                          type="date"
                          value={issuanceForm.end_date}
                          onChange={(e) => setIssuanceForm({ ...issuanceForm, end_date: e.target.value })}
                          required
                        />
                      </label>
                      {issuanceModal === 'LOR' && (
                        <label className={styles.fullWidth}>
                          Letter of Recommendation Text (Editable Boilerplate)
                          <textarea
                            value={issuanceForm.recommendation_text}
                            onChange={(e) => setIssuanceForm({ ...issuanceForm, recommendation_text: e.target.value })}
                            rows="5"
                            required
                          />
                        </label>
                      )}
                    </div>
                    {error && <div className={styles.error} role="alert" style={{ marginTop: '0.85rem' }}>{error}</div>}
                    <div className={styles.modalActions} style={{ marginTop: '0.85rem' }}>
                      <button type="button" className={styles.secondaryButton} onClick={closeIssuance}>Cancel</button>
                      <button type="submit" className={styles.primaryButton} disabled={submitting}>
                        {submitting ? 'Minting Credential...' : `Mint & Issue ${issuanceModal}`}
                      </button>
                    </div>
                  </form>
                )}

                {loadingCredentials ? (
                  <div className={styles.loading}>Loading credentials...</div>
                ) : credentials.length === 0 ? (
                  <div className={styles.empty}>
                    <strong>No credentials issued yet.</strong>
                    <span>Use the buttons above to issue verified Internship, Training, or LOR credentials.</span>
                  </div>
                ) : (
                  <div>
                    {credentials.map((cred) => (
                      <div key={cred.id} className={`${styles.credentialCard} ${cred.is_revoked ? styles.credentialCardRevoked : ''}`}>
                        <div className={styles.credentialHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span className={`${styles.certBadge} ${styles[`cert${cred.cert_type}`] || ''}`}>
                              {cred.cert_type === 'INTERNSHIP' ? '🎓' : cred.cert_type === 'TRAINING' ? '📜' : cred.cert_type === 'LOR' ? '✍️' : '🏅'} {cred.cert_type}
                            </span>
                            <span className={cred.is_revoked ? styles.revokedBadge : styles.activeBadge}>
                              {cred.is_revoked ? 'Revoked' : 'Active'}
                            </span>
                            <strong style={{ fontSize: '0.88rem' }}>{cred.id}</strong>
                          </div>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <a
                              href={`/certificate/${cred.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.actionButton}
                              style={{ textDecoration: 'none' }}
                            >
                              🔗 View ↗
                            </a>
                            <button
                              type="button"
                              className={cred.is_revoked ? styles.actionButton : styles.terminateButton}
                              onClick={() => toggleRevocation(cred.id, cred.is_revoked)}
                              disabled={submitting}
                            >
                              {cred.is_revoked ? 'Reinstate' : 'Revoke'}
                            </button>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text)', margin: '0.35rem 0' }}>
                          <strong>Track:</strong> {cred.stream_or_track}
                        </div>
                        <div className={styles.milestoneMeta}>
                          {cred.start_date && cred.end_date && (
                            <span>Tenure: {cred.start_date} to {cred.end_date}</span>
                          )}
                          <span>Issued: {cred.created_at ? new Date(cred.created_at).toLocaleDateString() : 'N/A'}</span>
                          {cred.issued_by && <span>Issued by: {cred.issued_by}</span>}
                        </div>
                        {cred.recommendation_text && (
                          <div className={styles.reviewNotesBox} style={{ borderLeftColor: '#ca8a04', marginTop: '0.45rem' }}>
                            <strong>Recommendation:</strong> {cred.recommendation_text}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className={styles.modalActions}>
                  <button type="button" className={styles.secondaryButton} onClick={closeModal}>Close</button>
                </div>
              </div>
            )}
          </div>}
          {modal === 'dispatch-fallback' && dispatchFallback && (
            <div>
              <div className={styles.modalHeader}>
                <div>
                  <p className={styles.eyebrow}>SMTP Dispatch Notice</p>
                  <h2 id="modal-title">Manual Dispatch Ready</h2>
                </div>
                <button type="button" className={styles.iconButton} onClick={closeModal} aria-label="Close dialog"><Icon name="close" /></button>
              </div>
              <p className={styles.confirmText}>
                The 4-page formal Offer Letter PDF (Ref: <strong>{dispatchFallback.referenceId}</strong>) was generated successfully.
                However, automated Zoho SMTP delivery failed. You can download the generated PDF below and email the candidate manually:
              </p>
              <div className={styles.alertBanner} role="alert" style={{ margin: '1rem 0' }}>
                <span>{dispatchFallback.error}</span>
              </div>
              <div className={styles.boxDark} style={{ margin: '1rem 0', fontSize: '0.86rem', lineHeight: '1.6' }}>
                <p style={{ margin: '0 0 0.35rem 0' }}><strong>Recipient:</strong> {dispatchFallback.recipient}</p>
                <p style={{ margin: 0 }}><strong>Subject:</strong> {dispatchFallback.subject}</p>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => downloadBase64Pdf(dispatchFallback.pdfBase64, dispatchFallback.filename)}
                >
                  Download Generated PDF
                </button>
                <button type="button" className={styles.secondaryButton} onClick={closeModal}>Close</button>
              </div>
            </div>
          )}
        </section>
      </div>}
      {toast && <div className={styles.toast} role="status">{toast}</div>}
    </main>
  )
}
