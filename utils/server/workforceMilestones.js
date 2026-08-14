import { getFirebaseAdminAuth } from './firebaseAdmin.js';
import { isAuthorizedAdminEmail } from './env.js';

export const MILESTONE_PRIORITIES = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const MILESTONE_STATUSES = Object.freeze(['TODO', 'IN_PROGRESS', 'UNDER_REVIEW', 'COMPLETED']);

export function validateMilestoneId(id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(id.trim())) {
    return { isValid: false, error: 'Invalid milestone ID format.' };
  }
  return { isValid: true, value: id.trim() };
}

function isValidUrlOrPath(val) {
  if (!val) return true;
  if (typeof val !== 'string' || val.length > 500) return false;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates milestone create and patch payloads.
 * @param {Object} payload
 * @param {Object} [options]
 * @param {boolean} [options.partial=false]
 * @param {boolean} [options.isIntern=false]
 */
export function validateMilestonePayload(payload, { partial = false, isIntern = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { isValid: false, error: 'Payload must be a JSON object.' };
  }

  const result = {};

  // If request comes from an intern, only status and deliverable_url may be modified
  if (isIntern) {
    const allowedKeys = ['status', 'deliverable_url'];
    const keys = Object.keys(payload);
    for (const key of keys) {
      if (!allowedKeys.includes(key)) {
        return { isValid: false, error: `Interns are not permitted to modify "${key}".` };
      }
    }

    if (payload.status !== undefined) {
      if (!MILESTONE_STATUSES.includes(payload.status)) {
        return { isValid: false, error: `status must be one of: ${MILESTONE_STATUSES.join(', ')}.` };
      }
      result.status = payload.status;
    }

    if (payload.deliverable_url !== undefined) {
      if (payload.deliverable_url !== null && payload.deliverable_url !== '') {
        const urlStr = String(payload.deliverable_url).trim();
        if (!isValidUrlOrPath(urlStr)) {
          return { isValid: false, error: 'deliverable_url must be a valid HTTP or HTTPS URL (max 500 characters).' };
        }
        result.deliverable_url = urlStr;
      } else {
        result.deliverable_url = '';
      }
    }

    return { isValid: true, value: result };
  }

  // Admin validation
  if (!partial || payload.employee_id !== undefined) {
    if (!payload.employee_id || typeof payload.employee_id !== 'string') {
      return { isValid: false, error: 'employee_id is required.' };
    }
    result.employee_id = payload.employee_id.trim();
  }

  if (!partial || payload.title !== undefined) {
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim().length < 3 || payload.title.trim().length > 200) {
      return { isValid: false, error: 'title must be between 3 and 200 characters.' };
    }
    result.title = payload.title.trim();
  }

  if (payload.description !== undefined) {
    if (payload.description !== null && typeof payload.description !== 'string') {
      return { isValid: false, error: 'description must be a string (max 500 characters).' };
    }
    if (payload.description && payload.description.trim().length > 500) {
      return { isValid: false, error: 'description cannot exceed 500 characters.' };
    }
    result.description = payload.description ? payload.description.trim() : '';
  } else if (!partial) {
    result.description = '';
  }

  if (!partial || payload.priority !== undefined) {
    const priority = payload.priority || 'MEDIUM';
    if (!MILESTONE_PRIORITIES.includes(priority)) {
      return { isValid: false, error: `priority must be one of: ${MILESTONE_PRIORITIES.join(', ')}.` };
    }
    result.priority = priority;
  }

  if (!partial || payload.status !== undefined) {
    const status = payload.status || 'TODO';
    if (!MILESTONE_STATUSES.includes(status)) {
      return { isValid: false, error: `status must be one of: ${MILESTONE_STATUSES.join(', ')}.` };
    }
    result.status = status;
  }

  if (!partial || payload.due_date !== undefined) {
    if (!payload.due_date) {
      return { isValid: false, error: 'due_date is required.' };
    }
    const d = new Date(payload.due_date);
    if (Number.isNaN(d.getTime())) {
      return { isValid: false, error: 'due_date must be a valid date format (e.g. YYYY-MM-DD).' };
    }
    result.due_date = typeof payload.due_date === 'string' ? payload.due_date.slice(0, 10) : d.toISOString().slice(0, 10);
  }

  if (payload.deliverable_url !== undefined) {
    if (payload.deliverable_url !== null && payload.deliverable_url !== '') {
      const urlStr = String(payload.deliverable_url).trim();
      if (!isValidUrlOrPath(urlStr)) {
        return { isValid: false, error: 'deliverable_url must be a valid HTTP or HTTPS URL (max 500 characters).' };
      }
      result.deliverable_url = urlStr;
    } else {
      result.deliverable_url = '';
    }
  }

  if (payload.review_notes !== undefined) {
    if (payload.review_notes !== null && typeof payload.review_notes !== 'string') {
      return { isValid: false, error: 'review_notes must be a string (max 500 characters).' };
    }
    if (payload.review_notes && payload.review_notes.trim().length > 500) {
      return { isValid: false, error: 'review_notes cannot exceed 500 characters.' };
    }
    result.review_notes = payload.review_notes ? payload.review_notes.trim() : '';
  }

  return { isValid: true, value: result };
}

/**
 * Serializes milestone firestore document to clean JSON.
 * @param {string} id
 * @param {Object} data
 */
export function serializeMilestone(id, data = {}) {
  const toIso = (val) => {
    if (!val) return null;
    if (val.toDate && typeof val.toDate === 'function') return val.toDate().toISOString();
    if (val instanceof Date) return val.toISOString();
    if (typeof val === 'string') return val;
    return null;
  };

  return {
    id,
    employee_id: data.employee_id || '',
    employee_email: data.employee_email || '',
    title: data.title || '',
    description: data.description || '',
    priority: data.priority || 'MEDIUM',
    status: data.status || 'TODO',
    due_date: typeof data.due_date === 'string' ? data.due_date.slice(0, 10) : toIso(data.due_date)?.slice(0, 10) || '',
    deliverable_url: data.deliverable_url || '',
    review_notes: data.review_notes || '',
    created_at: toIso(data.created_at),
    updated_at: toIso(data.updated_at),
  };
}

/**
 * Authenticates request for Milestone endpoints.
 * Returns { isAdmin: boolean, isIntern: boolean, email: string, uid: string, response?: Response }
 */
export async function authenticateMilestoneCaller(request) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      response: new Response(
        JSON.stringify({ error: { message: 'Authentication required. Bearer token missing.', code: 'UNAUTHORIZED' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  const token = authHeader.slice(7).trim();
  try {
    const auth = getFirebaseAdminAuth();
    const decoded = await auth.verifyIdToken(token);
    const email = (decoded.email || '').toLowerCase().trim();
    const isAdmin = decoded.admin === true || isAuthorizedAdminEmail(email);

    return {
      uid: decoded.uid,
      email,
      isAdmin,
      isIntern: !isAdmin && Boolean(email),
    };
  } catch (err) {
    return {
      response: new Response(
        JSON.stringify({ error: { message: 'Invalid or expired authentication token.', code: 'UNAUTHORIZED' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }
}
