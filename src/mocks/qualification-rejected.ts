import type { Qualification } from '@/lib/quotation.api';

import qualificationRejectedBase from './qualification-rejected.json';

type BuildRejectedParams = {
  tenantEmail: string;
  agentEmail: string;
};

/**
 * Mock de calificación rechazada (`status_id` 7 u 8 → UI “no podemos ofrecerte una garantía”).
 * Activar con `NEXT_PUBLIC_USE_MOCK_RESULT=rejected`.
 */
export function buildMockQualificationRejected(params: BuildRejectedParams): Qualification {
  const { tenantEmail, agentEmail } = params;
  const now = Date.now();
  const tenantLocal = tenantEmail.split('@')[0] ?? 'usuario';
  const nombre = tenantLocal.charAt(0).toUpperCase() + tenantLocal.slice(1);
  const agentLocal = agentEmail.split('@')[0] ?? 'agente';

  const base = qualificationRejectedBase as Qualification;

  return {
    ...base,
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
          email: agentEmail,
          telefono: '',
          foto: null,
        },
      },
    },
  };
}
