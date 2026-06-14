-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum: estado da campanha
CREATE TYPE campaign_status AS ENUM (
  'preparation',
  'active',
  'paused',
  'ended',
  'archived'
);

-- Enum: papel do participante
CREATE TYPE member_role AS ENUM (
  'master',
  'player'
);

-- Enum: estado do convite
CREATE TYPE invite_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'cancelled'
);

-- Enum: estado do personagem
CREATE TYPE character_status AS ENUM (
  'active',
  'dead'
);

-- Enum: slot de multiclasse (nível 1)
CREATE TYPE class_slot AS ENUM ('1', '2');

-- Enum: sexo do personagem
CREATE TYPE character_sex AS ENUM ('female', 'male', 'other');

-- Enum: tipo do evento de histórico
CREATE TYPE history_event_type AS ENUM (
  'campaign_created',
  'campaign_archived',
  'campaign_reopened',
  'invite_sent',
  'invite_accepted',
  'invite_declined',
  'invite_cancelled',
  'member_removed',
  'character_created',
  'character_updated',
  'character_sheet_locked',
  'character_sheet_unlocked',
  'character_status_changed'
);
