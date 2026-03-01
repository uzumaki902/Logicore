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
  priority text default 'medium',
  category text default 'general',
  confidence real,
  used_kb boolean default false,
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

-- Feedback (AI response ratings)
create table feedback (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  user_id text not null,
  rating smallint not null check (rating in (1, -1)),
  created_at timestamptz default now(),
  unique (conversation_id, user_id)
);

-- Enable vector extension for knowledge base
create extension if not exists vector;

-- Knowledge base documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  filename text not null,
  file_size integer,
  chunk_count integer default 0,
  status text default 'processing',
  created_at timestamptz default now()
);

-- Document chunks with embeddings
create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  org_id uuid references organizations(id) on delete cascade,
  chunk_text text not null,
  embedding vector(768),
  chunk_index integer not null,
  created_at timestamptz default now()
);

-- Vector similarity search function
create or replace function match_document_chunks(
  query_embedding vector(768),
  match_org_id uuid,
  match_count int default 3,
  match_threshold float default 0.3
)
returns table (
  id uuid,
  chunk_text text,
  filename text,
  similarity float
)
language sql stable
as $$
  select
    dc.id,
    dc.chunk_text,
    d.filename,
    1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where dc.org_id = match_org_id
    and 1 - (dc.embedding <=> query_embedding) > match_threshold
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;
