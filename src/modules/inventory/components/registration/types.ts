export interface BasicInfoValues {
  name: string;
  category: string;
  uom: string;
  description: string;
  stockUnit: string;
}

export interface GradeDraft {
  name: string;
  rank: string;
}

export interface GradeItem {
  id: string;
  /** Backend grade ID — present when this grade came from the server. */
  serverId?: string;
  name: string;
  rank: string;
}

export type AttributeType = 'number' | 'text' | 'boolean' | 'date';

export interface AttributeItem {
  id: string;
  /** Backend property ID — present when this property came from the server. */
  serverId?: string;
  label: string;
  type: AttributeType;
  value: string;
}

export interface IntakeField {
  id: string;
  /** Backend intake field ID — present when this field came from the server. */
  serverId?: string;
  label: string;
  type: 'number' | 'text';
  required: boolean;
}

export interface IntakeFieldDraft {
  label: string;
  type: 'number' | 'text';
  required: boolean;
}
