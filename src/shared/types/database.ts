// Tipos manuais que espelham supabase/migrations/*.sql.
// Substituir por `supabase gen types typescript` após conectar ao projeto remoto.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type CampaignStatus = 'preparation' | 'active' | 'paused' | 'ended' | 'archived';
export type MemberRole = 'master' | 'player';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';
export type CharacterStatus = 'active' | 'dead';
export type CharacterSex = 'female' | 'male' | 'other';
export type ClassSlot = '1' | '2';
export type SkillOrigin = 'racial' | 'classe' | 'criacao' | 'evolucao' | 'mestre';
export type HistoryEventType =
  | 'campaign_created'
  | 'campaign_archived'
  | 'campaign_reopened'
  | 'invite_sent'
  | 'invite_accepted'
  | 'invite_declined'
  | 'invite_cancelled'
  | 'member_removed'
  | 'character_created'
  | 'character_updated'
  | 'character_sheet_locked'
  | 'character_sheet_unlocked'
  | 'character_status_changed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          email: string;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          status: CampaignStatus;
          archived_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          status?: CampaignStatus;
        };
        Update: {
          name?: string;
          description?: string | null;
          image_url?: string | null;
          status?: CampaignStatus;
          archived_at?: string | null;
        };
        Relationships: [];
      };
      campaign_members: {
        Row: {
          id: string;
          campaign_id: string;
          user_id: string;
          role: MemberRole;
          joined_at: string;
          removed_at: string | null;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          user_id: string;
          role?: MemberRole;
        };
        Update: {
          removed_at?: string | null;
        };
        Relationships: [];
      };
      invites: {
        Row: {
          id: string;
          campaign_id: string;
          inviter_id: string;
          invitee_id: string;
          status: InviteStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          inviter_id: string;
          invitee_id: string;
          status?: InviteStatus;
        };
        Update: {
          status?: InviteStatus;
        };
        Relationships: [];
      };
      characters: {
        Row: {
          id: string;
          campaign_id: string;
          owner_id: string;
          name: string;
          image_url: string | null;
          sex: CharacterSex;
          age: number | null;
          race_id: string;
          region: string | null;
          visual_description: string | null;
          background: string | null;
          status: CharacterStatus;
          sheet_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          owner_id: string;
          name: string;
          image_url?: string | null;
          sex: CharacterSex;
          age?: number | null;
          race_id: string;
          region?: string | null;
          visual_description?: string | null;
          background?: string | null;
          status?: CharacterStatus;
          sheet_locked?: boolean;
        };
        Update: {
          name?: string;
          image_url?: string | null;
          sex?: CharacterSex;
          age?: number | null;
          race_id?: string;
          region?: string | null;
          visual_description?: string | null;
          background?: string | null;
          status?: CharacterStatus;
          sheet_locked?: boolean;
        };
        Relationships: [];
      };
      character_classes: {
        Row: {
          id: string;
          character_id: string;
          slot: ClassSlot;
          class_id: string;
          specialization_id: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          slot: ClassSlot;
          class_id: string;
          specialization_id: string;
        };
        Update: {
          class_id?: string;
          specialization_id?: string;
        };
        Relationships: [];
      };
      character_attributes: {
        Row: {
          id: string;
          character_id: string;
          strength: number;
          dexterity: number;
          constitution: number;
          intelligence: number;
          mind: number;
          charisma: number;
          updated_at: string;
        };
        Insert: {
          character_id: string;
          strength?: number;
          dexterity?: number;
          constitution?: number;
          intelligence?: number;
          mind?: number;
          charisma?: number;
        };
        Update: {
          strength?: number;
          dexterity?: number;
          constitution?: number;
          intelligence?: number;
          mind?: number;
          charisma?: number;
        };
        Relationships: [];
      };
      races: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          active: boolean;
          attribute_points: number;
          attribute_modifiers: Record<string, number>;
          created_at: string;
        };
        Insert: {
          name: string;
          description?: string | null;
          active?: boolean;
          attribute_points?: number;
          attribute_modifiers?: Record<string, number>;
        };
        Update: {
          name?: string;
          description?: string | null;
          active?: boolean;
          attribute_points?: number;
          attribute_modifiers?: Record<string, number>;
        };
        Relationships: [];
      };
      classes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: { name: string; description?: string | null; active?: boolean };
        Update: { name?: string; description?: string | null; active?: boolean };
        Relationships: [];
      };
      specializations: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          description: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          class_id: string;
          name: string;
          description?: string | null;
          active?: boolean;
        };
        Update: { name?: string; description?: string | null; active?: boolean };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          name: string;
          attribute: string | null;
          requirement_value: number | null;
          description: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          attribute?: string | null;
          requirement_value?: number | null;
          description?: string | null;
          active?: boolean;
        };
        Update: {
          name?: string;
          attribute?: string | null;
          requirement_value?: number | null;
          description?: string | null;
          active?: boolean;
        };
        Relationships: [];
      };
      character_skills: {
        Row: {
          id: string;
          character_id: string;
          skill_id: string;
          origin: SkillOrigin;
          created_at: string;
        };
        Insert: {
          id?: string;
          character_id: string;
          skill_id: string;
          origin?: SkillOrigin;
        };
        Update: { origin?: SkillOrigin };
        Relationships: [];
      };
      history_log: {
        Row: {
          id: string;
          campaign_id: string;
          actor_id: string | null;
          event_type: HistoryEventType;
          metadata: Json;
          occurred_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          actor_id?: string | null;
          event_type: HistoryEventType;
          metadata?: Json;
        };
        Update: Record<never, never>;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      campaign_status: CampaignStatus;
      member_role: MemberRole;
      invite_status: InviteStatus;
      character_status: CharacterStatus;
      character_sex: CharacterSex;
      class_slot: ClassSlot;
      history_event_type: HistoryEventType;
      skill_origin: SkillOrigin;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
