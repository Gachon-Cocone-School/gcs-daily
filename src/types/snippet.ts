import type { Database } from "~/lib/database.types";

export type Snippet = Database["public"]["Tables"]["snippets"]["Row"];
export type SnippetInsert = Database["public"]["Tables"]["snippets"]["Insert"];

export interface SnippetExpanded extends Snippet {
  badge: number;
  avatar_url: string | null;
  full_name: string;
}

export interface SnippetProps {
  date: Date;
  userEmail: string;
  teamName: string;
}

export interface SnippetEditProps extends SnippetProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export interface SnippetViewProps extends SnippetProps {
  onEdit?: () => void;
}
