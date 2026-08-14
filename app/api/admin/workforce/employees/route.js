import { FieldPath } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'

import { getFirebaseAdminFirestore } from '@/utils/server/firebaseAdmin'
import {
  apiError,
  EMPLOYEE_STATUSES,
  enforceEmployeeRateLimit,
  prepareEmployeeData,
  requireWorkforceAdmin,
  serializeEmployee,
  validateEmployeeId,
  validateEmployeePayload,
} from '@/utils/server/workforceEmployees'

export const runtime = 'nodejs'

function parsePageSize(value) {
  if (value === null) return { isValid: true, value: 50 }
  if (!/^\d+$/.test(value)) return { isValid: false, error: 'limit must be an integer between 1 and 50.' }
  const parsed = Number(value)
  if (parsed < 1 || parsed > 50) return { isValid: false, error: 'limit must be between 1 and 50.' }
  return { isValid: true, value: parsed }
}

export async function GET(request) {
  try {
    const admin = await requireWorkforceAdmin(request)
    if (admin.response) return admin.response

    const limited = await enforceEmployeeRateLimit(request, admin.uid)
    if (limited) return limited

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const department = url.searchParams.get('department')
    const pageToken = url.searchParams.get('pageToken')
    const pageSize = parsePageSize(url.searchParams.get('limit'))

    if (!pageSize.isValid) return apiError(pageSize.error, 400, 'BAD_REQUEST')
    if (status && !EMPLOYEE_STATUSES.includes(status)) {
      return apiError('status must be a valid employee status.', 400, 'VALIDATION_ERROR')
    }
    if (department) {
      const departmentCheck = validateEmployeePayload({ department }, { partial: true })
      if (!departmentCheck.isValid) return apiError(departmentCheck.error, 400, 'VALIDATION_ERROR')
    }
    if (pageToken) {
      const tokenCheck = validateEmployeeId(pageToken)
      if (!tokenCheck.isValid) return apiError(tokenCheck.error, 400, 'VALIDATION_ERROR')
    }

    const db = getFirebaseAdminFirestore()
    const employees = db.collection('employees')
    let query = employees
    if (status) query = query.where('status', '==', status)
    if (department) query = query.where('department', '==', department.trim())
    query = query.orderBy(FieldPath.documentId())

    if (pageToken) {
      const cursor = await employees.doc(pageToken).get()
      if (!cursor.exists) return apiError('pageToken does not reference an employee.', 400, 'VALIDATION_ERROR')
      query = query.startAfter(cursor)
    }

    const snapshot = await query.limit(pageSize.value + 1).get()
    const hasMore = snapshot.docs.length > pageSize.value
    const visibleDocs = hasMore ? snapshot.docs.slice(0, pageSize.value) : snapshot.docs

    return NextResponse.json({
      success: true,
      employees: visibleDocs.map((doc) => serializeEmployee(doc.id, doc.data())),
      pagination: {
        limit: pageSize.value,
        has_more: hasMore,
        next_page_token: hasMore ? visibleDocs.at(-1).id : null,
      },
    })
  } catch (error) {
    console.error('[Workforce Employees GET]', error)
    return apiError('Unable to load employee records.', 500, 'INTERNAL_ERROR')
  }
}

export async function POST(request) {
  try {
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

    const validation = validateEmployeePayload(body)
    if (!validation.isValid) return apiError(validation.error, 400, 'VALIDATION_ERROR')
    if (validation.value.contract_end_date < validation.value.joining_date) {
      return apiError('Contract end date must be on or after joining date.', 400, 'VALIDATION_ERROR')
    }

    const prepared = prepareEmployeeData(validation.value)
    if (!prepared.isValid) return apiError(prepared.error, 400, 'VALIDATION_ERROR')

    const db = getFirebaseAdminFirestore()
    const employees = db.collection('employees')
    const employeeRef = employees.doc()
    const now = new Date()

    await db.runTransaction(async (transaction) => {
      const duplicate = await transaction.get(
        employees.where('personal_email', '==', prepared.value.personal_email).limit(1)
      )
      if (!duplicate.empty) {
        const error = new Error('DUPLICATE_EMAIL')
        error.code = 'DUPLICATE_EMAIL'
        throw error
      }

      transaction.set(employeeRef, {
        id: employeeRef.id,
        ...prepared.value,
        status: 'OFFER_SENT',
        created_at: now,
        updated_at: now,
      })
    })

    return NextResponse.json({ success: true, id: employeeRef.id }, { status: 201 })
  } catch (error) {
    if (error?.code === 'DUPLICATE_EMAIL') {
      return apiError('An employee with this personal email already exists.', 409, 'DUPLICATE_EMAIL')
    }
    console.error('[Workforce Employees POST]', error)
    return apiError('Unable to create the employee record.', 500, 'INTERNAL_ERROR')
  }
}
