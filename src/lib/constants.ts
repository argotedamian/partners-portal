export interface PartnersAgent {
  label: string;
  email: string;
  phone: string;
}

export const PARTNERS_AGENTS: PartnersAgent[] = [
  { label: 'Juan Partner', email: 'juan@partners.com', phone: '1100000001' },
  { label: 'Maria Partner', email: 'maria@partners.com', phone: '1100000002' },
];

export const DOCUMENT_TYPES = [
  { id: 1, name: 'DNI' },
  { id: 2, name: 'Pasaporte' },
];

export const GENDERS = [
  { id: 1, name: 'Femenino' },
  { id: 2, name: 'Masculino' },
];

export const EMPLOYMENT_SITUATIONS = [
  { id: 1, name: 'Estudiante universitario' },
  { id: 2, name: 'Jubilado/a' },
  { id: 3, name: 'Monotributista' },
  { id: 4, name: 'Relación de dependencia' },
  { id: 5, name: 'Responsable inscripto' },
];

export const ANTIQUITIES = [
  { id: 1, name: '0 a 5 meses' },
  { id: 2, name: '6 a 12 meses' },
  { id: 3, name: '1 a 2 años' },
  { id: 4, name: '2 años o más' },
];

export const TERMS = [
  { name: '2 años', value: 2 },
  { name: '3 años', value: 3 },
];