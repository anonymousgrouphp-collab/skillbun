import { NextResponse } from 'next/server'

import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin'
import {
  apiError,
  enforceEmployeeRateLimit,
  isStatusTransitionAllowed,
  prepareEmployeeData,
  requireWorkforceAdmin,
  validateEmployeeId,
  validateEmployeePayload,
} from '@/utils/server/workforceEmployees'

export const runtime = 'nodejs'

function toTimestampMilliseconds(value) {
  if (value instanceof Date) return value.getTime()
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  return Number.NaN
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const idCheck = validateEmployeeId(id)
    if (!idCheck.isValid) return apiError(idCheck.error, 400, 'VALIDATION_ERROR')

    const admin = await requireWorkforceAdmin(request)
    if (admin.response) return admin.response

    const limited = await enforceEmployeeRateLimit(request, admin.uid)
    if (limited) return limited

    let body
    try {
      body = await request.json()
    } catch {
      return apiError('Payload must be valid JSON.', 400, 'BAD_REQUEST')
    }

    const validation = validateEmployeePayload(body, { partial: true })
    if (!validation.isValid) return apiError(validation.error, 400, 'VALIDATION_ERROR')

    const prepared = prepareEmployeeData(validation.value)
    if (!prepared.isValid) return apiError(prepared.error, 400, 'VALIDATION_ERROR')

    const db = getFirebaseAdminFirestore()
    const employees = db.collection('employees')
    const employeeRef = employees.doc(idCheck.value)
    const now = new Date()

    await db.runTransaction(async (transaction) => {
      const current = await transaction.get(employeeRef)
      if (!current.exists) {
        const error = new Error('NOT_FOUND')
        error.code = 'NOT_FOUND'
        throw error
      }

      const currentData = current.data()
      if (prepared.value.status && !isStatusTransitionAllowed(currentData.status, prepared.value.status)) {
        const error = new Error('INVALID_STATUS_TRANSITION')
        error.code = 'INVALID_STATUS_TRANSITION'
        throw error
      }

      if (prepared.value.personal_email && prepared.value.personal_email !== currentData.personal_email) {
        const duplicate = await transaction.get(
          employees.where('personal_email', '==', prepared.value.personal_email).limit(1)
        )
        if (!duplicate.empty && duplicate.docs.some((doc) => doc.id !== employeeRef.id)) {
          const error = new Error('DUPLICATE_EMAIL')
          error.code = 'DUPLICATE_EMAIL'
          throw error
        }
      }

      const nextJoiningDate = prepared.value.joining_date || currentData.joining_date
      const nextContractEndDate = prepared.value.contract_end_date || currentData.contract_end_date
      if (
        nextJoiningDate &&
        nextContractEndDate &&
        toTimestampMilliseconds(nextContractEndDate) < toTimestampMilliseconds(nextJoiningDate)
      ) {
        const error = new Error('INVALID_CONTRACT_DATES')
        error.code = 'INVALID_CONTRACT_DATES'
        throw error
      }

      transaction.update(employeeRef, { ...prepared.value, updated_at: now })
    })

    return NextResponse.json({ success: true, id: employeeRef.id })
  } catch (error) {
    if (error?.code === 'NOT_FOUND') return apiError('Employee record not found.', 404, 'NOT_FOUND')
    if (error?.code === 'DUPLICATE_EMAIL') return apiError('An employee with this personal email already exists.', 409, 'DUPLICATE_EMAIL')
    if (error?.code === 'INVALID_STATUS_TRANSITION') return apiError('This employee status transition is not allowed.', 400, 'VALIDATION_ERROR')
    if (error?.code === 'INVALID_CONTRACT_DATES') return apiError('Contract end date must be on or after joining date.', 400, 'VALIDATION_ERROR')
    console.error('[Workforce Employee PATCH]', error)
    return apiError('Unable to update the employee record.', 500, 'INTERNAL_ERROR')
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const idCheck = validateEmployeeId(id)
    if (!idCheck.isValid) return apiError(idCheck.error, 400, 'VALIDATION_ERROR')

    const admin = await requireWorkforceAdmin(request)
    if (admin.response) return admin.response

    const limited = await enforceEmployeeRateLimit(request, admin.uid)
    if (limited) return limited

    const hardParam = new URL(request.url).searchParams.get('hard')
    if (hardParam !== null && hardParam !== 'true' && hardParam !== 'false') {
      return apiError('hard must be either true or false.', 400, 'VALIDATION_ERROR')
    }

    const db = getFirebaseAdminFirestore()
    const employeeRef = db.collection('employees').doc(idCheck.value)
    const hardDelete = hardParam === 'true'

    if (!hardDelete) {
      const snapshot = await employeeRef.get()
      if (!snapshot.exists) return apiError('Employee record not found.', 404, 'NOT_FOUND')
      const now = new Date()
      await employeeRef.update({ status: 'ARCHIVED', archived_at: now, updated_at: now })
      return NextResponse.json({ success: true, id: employeeRef.id, status: 'ARCHIVED' })
    }

    await db.runTransaction(async (transaction) => {
      const [employee, certificates, milestones, workforceDocs] = await Promise.all([
        transaction.get(employeeRef),
        transaction.get(db.collection('certificates').where('employee_id', '==', employeeRef.id).limit(1)),
        transaction.get(db.collection('milestones').where('employee_id', '==', employeeRef.id).limit(1)),
        transaction.get(db.collection('workforce_docs').where('employee_id', '==', employeeRef.id).limit(1)),
      ])

      if (!employee.exists) {
        const error = new Error('NOT_FOUND')
        error.code = 'NOT_FOUND'
        throw error
      }
      if (!certificates.empty || !milestones.empty || !workforceDocs.empty) {
        const error = new Error('LINKED_RECORDS')
        error.code = 'LINKED_RECORDS'
        throw error
      }

      transaction.delete(employeeRef)
    })

    return NextResponse.json({ success: true, id: employeeRef.id, deleted: true })
  } catch (error) {
    if (error?.code === 'NOT_FOUND') return apiError('Employee record not found.', 404, 'NOT_FOUND')
    if (error?.code === 'LINKED_RECORDS') {
      return apiError('Hard deletion is unavailable while certificates, milestones, or workforce documents are linked to this employee.', 409, 'CONFLICT')
    }
    console.error('[Workforce Employee DELETE]', error)
    return apiError('Unable to delete the employee record.', 500, 'INTERNAL_ERROR')
  }
}
