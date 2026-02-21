-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Org members (links users to orgs)
create table org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  user_id text not null,
  user_email text not null,
  user_name text,
  role text default 'member',
  joined_at timestamptz default now()
);

-- Conversations (AI support runs)
create table conversations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  user_id text not null,
  title text not null,
  ticket_text text not null,
  reply text not null,
  sources text[] default '{}',
  status text default 'resolved',
  created_at timestamptz default now()
);

-- Tickets (escalated issues)
create table tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete cascade,
  user_id text not null,
  title text not null,
  status text default 'open',
  priority text default 'medium',
  created_at timestamptz default now()
);
