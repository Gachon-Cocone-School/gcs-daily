export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_achievements: {
        Row: {
          user_email: string;
          snippet_date: string;
          score: number;
          feedback: string;
          meta_data: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_email: string;
          snippet_date: string;
          score: number;
          feedback: string;
          meta_data: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_email?: string;
          snippet_date?: string;
          score?: number;
          feedback?: string;
          meta_data?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_email_fkey";
            columns: ["user_email"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["email"];
          }
        ];
      };
      team_achievements: {
        Row: {
          created_at: string;
          team_name: string;
          snippet_date: string;
          point: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          team_name: string;
          snippet_date: string;
          point: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          team_name?: string;
          snippet_date?: string;
          point?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_achievements_team_name_fkey";
            columns: ["team_name"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["team_name"];
          }
        ];
      };
      allowed_emails: {
        Row: {
          created_at: string;
          description: string | null;
          email: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          email: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          email?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_email_fkey";
            columns: ["email"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["email"];
          },
        ];
      };
      snippets: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          snippet_date: string;
          team_name: string;
          updated_at: string;
          user_email: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          snippet_date: string;
          team_name: string;
          updated_at?: string;
          user_email?: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          snippet_date?: string;
          team_name?: string;
          updated_at?: string;
          user_email?: string;
        };
        Relationships: [
          {
            foreignKeyName: "snippets_team_name_fkey";
            columns: ["team_name"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["team_name"];
          },
          {
            foreignKeyName: "snippets_user_email_fkey";
            columns: ["user_email"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["email"];
          },
        ];
      };
      teams: {
        Row: {
          created_at: string;
          emails: string[] | null;
          team_alias: string[] | null;
          team_name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          emails?: string[] | null;
          team_alias?: string[] | null;
          team_name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          emails?: string[] | null;
          team_alias?: string[] | null;
          team_name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "users_email_fkey";
            columns: ["email"];
            isOneToOne: true;
            referencedRelation: "allowed_emails";
            referencedColumns: ["email"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Type helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Insertable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type Updateable<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Table-specific types
export type AllowedEmail = Tables<"allowed_emails">;
export type AllowedEmailInsert = Insertable<"allowed_emails">;
export type AllowedEmailUpdate = Updateable<"allowed_emails">;

export type Snippet = Tables<"snippets">;
export type SnippetInsert = Insertable<"snippets">;
export type SnippetUpdate = Updateable<"snippets">;

export type Team = Tables<"teams">;
export type TeamInsert = Insertable<"teams">;
export type TeamUpdate = Updateable<"teams">;

export type User = Tables<"users">;
export type UserInsert = Insertable<"users">;
export type UserUpdate = Updateable<"users">;

export type UserAchievement = Tables<"user_achievements">;
export type UserAchievementInsert = Insertable<"user_achievements">;
export type UserAchievementUpdate = Updateable<"user_achievements">;
