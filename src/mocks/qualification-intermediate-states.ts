import type { Qualification } from '@/lib/quotation.api';
import type { MockIntermediateStatusId } from '@/mocks/qualification-status-id.enum';

export type { MockIntermediateStatusId };

export { isMockIntermediateStatusId } from '@/mocks/qualification-status-id.enum';

type BuildIntermediateParams = {
  tenantEmail: string;
  agentEmail: string;
};

function displayNameFromEmail(email: string, fallback: string): string {
  const local = email.split('@')[0]?.trim() ?? fallback;
  if (!local) return fallback;
  return local.charAt(0).toUpperCase() + local.slice(1);
}

/**
 * Mock para estados intermedios / especiales de calificación.
 * Usar `QualificationMockMode` en `NEXT_PUBLIC_USE_MOCK_RESULT`.
 */
export function buildMockQualificationIntermediate(
  statusId: MockIntermediateStatusId,
  params: BuildIntermediateParams,
): Qualification {
  const now = Date.now();
  const nombre = displayNameFromEmail(params.tenantEmail, 'Usuario');
  const agentNombre = displayNameFromEmail(params.agentEmail, 'Asesor');

  return {
    status_id: statusId,
    is_quotation_only: false,
    id: now,
    bail_number: null,
    pipedrive_id: now,
    quotation_id: now,
    api_res_data: {
      idHoggax: now,
      front: {
        nombre,
        agente: {
          nombre: agentNombre,
          email: params.agentEmail,
          telefono: '',
          foto: null,
        },
      },
    },
  };
}
