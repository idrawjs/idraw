export interface HTMLNode {
  type: 'material' | 'text' | 'comment';
  name: string | null;
  attributes: Record<string, string>;
  children: HTMLNode[];
  isVoid: boolean;
  comment?: string;
  textContent?: string;
}
