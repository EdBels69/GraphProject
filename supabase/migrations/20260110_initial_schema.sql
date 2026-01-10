-- Migration: Initial Schema for Supabase
-- Based on Prisma schema.prisma
-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";
-- 2. Create ResearchJobs table
create table if not exists public.research_jobs (
    id text primary key,
    user_id uuid references auth.users(id) not null,
    topic text not null,
    mode text not null,
    status text not null,
    progress integer not null default 0,
    error text,
    queries jsonb not null default '[]',
    articles_found integer not null default 0,
    articles_processed integer not null default 0,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    included_ids jsonb default '[]',
    excluded_ids jsonb default '[]',
    exclusion_reasons jsonb default '{}',
    review_text text,
    graph_id text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
-- 3. Create Articles table
create table if not exists public.articles (
    id text primary key,
    user_id uuid references auth.users(id) not null,
    job_id text references public.research_jobs(id) on delete cascade,
    doi text,
    title text not null,
    authors jsonb not null default '[]',
    year integer,
    abstract text,
    url text,
    pdf_url text,
    source text not null,
    status text not null,
    screening_status text,
    extracted_data jsonb default '{}',
    entities jsonb default '{}',
    relations jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
-- 4. Create Graphs table
create table if not exists public.graphs (
    id text primary key,
    user_id uuid references auth.users(id) not null,
    name text not null,
    description text,
    version text default '2.0',
    directed boolean default false,
    nodes jsonb not null default '[]',
    edges jsonb not null default '[]',
    metrics jsonb default '{}',
    sources jsonb default '[]',
    metadata jsonb default '{}',
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
-- 5. Create Detailed Graph Items (for optimized queries)
create table if not exists public.graph_nodes (
    id uuid primary key default uuid_generate_v4(),
    graph_id text references public.graphs(id) on delete cascade,
    label text not null,
    name text not null,
    data jsonb not null default '{}',
    created_at timestamp with time zone default now()
);
create table if not exists public.graph_edges (
    id uuid primary key default uuid_generate_v4(),
    graph_id text references public.graphs(id) on delete cascade,
    source text not null,
    target text not null,
    relation text not null,
    data jsonb not null default '{}',
    created_at timestamp with time zone default now()
);
-- 6. RLS Policies (Row Level Security)
alter table public.research_jobs enable row level security;
alter table public.articles enable row level security;
alter table public.graphs enable row level security;
alter table public.graph_nodes enable row level security;
alter table public.graph_edges enable row level security;
-- Policies for ResearchJobs
create policy "Users can only see their own jobs" on public.research_jobs for all using (auth.uid() = user_id);
-- Policies for Articles
create policy "Users can only see their own articles" on public.articles for all using (auth.uid() = user_id);
-- Policies for Graphs
create policy "Users can only see their own graphs" on public.graphs for all using (auth.uid() = user_id);
-- Policies for Detailed Items
create policy "Users can see nodes of their graphs" on public.graph_nodes for all using (
    exists (
        select 1
        from public.graphs
        where graphs.id = graph_nodes.graph_id
            and graphs.user_id = auth.uid()
    )
);
create policy "Users can see edges of their graphs" on public.graph_edges for all using (
    exists (
        select 1
        from public.graphs
        where graphs.id = graph_edges.graph_id
            and graphs.user_id = auth.uid()
    )
);