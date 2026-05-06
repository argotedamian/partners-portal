import type { Qualification } from '@/lib/quotation.api';
import { QualificationStatusId } from '@/mocks/qualification-status-id.enum';

import qualificationRejectedBase from './qualification-rejected.json';

type BuildRejectedParams = {
  tenantEmail: string;
  agentEmail: string;
  /** Por defecto {@link QualificationStatusId.Rejected}; la API también usa {@link QualificationStatusId.RejectedAlternate}. */
  variant?: QualificationStatusId.Rejected | QualificationStatusId.RejectedAlternate;
};

/**
 * Mock de calificación rechazada (`status_id` 7 u 8 → UI “no podemos ofrecerte una garantía”).
 * Activar con `NEXT_PUBLIC_USE_MOCK_RESULT=rejected`, `7` u `8`.
 */
export function buildMockQualificationRejected(params: BuildRejectedParams): Qualification {
  const { tenantEmail, agentEmail, variant = QualificationStatusId.Rejected } = params;
  const now = Date.now();
  const tenantLocal = ((tenantEmail ?? '').trim().split('@')[0] ?? '').trim() || 'usuario';
  const nombre = tenantLocal.charAt(0).toUpperCase() + tenantLocal.slice(1);
  const agentLocal = ((agentEmail ?? '').trim().split('@')[0] ?? '').trim() || 'agente';

  const base = qualificationRejectedBase as Qualification;

  return {
    ...base,
    status_id: variant,
    id: now,
    quotation_id: now,
    pipedrive_id: now,
    api_res_data: {
      ...base.api_res_data,
      idHoggax: now,
      front: {
        nombre,
        agente: {
          nombre: agentLocal.charAt(0).toUpperCase() + agentLocal.slice(1),
          email: agentEmail ?? '',
          telefono: '',
          foto: null,
        },
      },
    },
  };
}
