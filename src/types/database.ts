export type OrganizationType = "school" | "nonprofit" | "business";
export type MemberStatus = "invited" | "active";
export type MemberRole = "member" | "manager";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          type: OrganizationType;
          created_by: string;
          created_at: string;
          school_district: string | null;
          tax_id: string | null;
          business_domain: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          type: OrganizationType;
          created_by?: string;
          created_at?: string;
          school_district?: string | null;
          tax_id?: string | null;
          business_domain?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["organizations"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          email: string;
          status: MemberStatus;
          role: MemberRole;
          invited_at: string;
          joined_at: string | null;
          invitation_token: string;
          invitation_expires_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          email: string;
          status?: MemberStatus;
          role?: MemberRole;
          invited_at?: string;
          joined_at?: string | null;
          invitation_token?: string;
          invitation_expires_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["organization_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      activity_log: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          action: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          action: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_log"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "activity_log_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activity_log_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      organization_directory: {
        Row: Database["public"]["Tables"]["organizations"]["Row"] & {
          member_count: number;
        };
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      accept_invitation: {
        Args: { p_token: string };
        Returns: { organization_id: string }[];
      };
      get_invitation_by_token: {
        Args: { p_token: string };
        Returns: {
          id: string;
          organization_id: string;
          organization_name: string;
          email: string;
          role: MemberRole;
          status: MemberStatus;
          invited_at: string;
          invitation_expires_at: string;
        }[];
      };
    };
    Enums: {
      organization_type: OrganizationType;
      member_status: MemberStatus;
      member_role: MemberRole;
    };
    CompositeTypes: Record<string, never>;
  };
}
