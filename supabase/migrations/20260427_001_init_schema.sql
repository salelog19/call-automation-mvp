create extension if not exists pgcrypto;

create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    domain text not null unique,
    default_phone text not null,
    created_at timestamptz not null default now()
);

create table if not exists tracking_numbers (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    phone_number text not null,
    status text not null default 'active' check (status in ('active', 'disabled')),
    last_assigned_at timestamptz,
    created_at timestamptz not null default now(),
    unique (project_id, phone_number)
);

create table if not exists visits (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    tracking_number_id uuid not null references tracking_numbers(id) on delete restrict,
    session_id text not null,
    ym_uid text,
    landing_url text,
    referrer text,
    utm_source text,
    utm_medium text,
    utm_campaign text,
    utm_term text,
    utm_content text,
    shown_phone_number text not null,
    visited_at timestamptz not null default now(),
    assignment_expires_at timestamptz not null,
    created_at timestamptz not null default now(),
    check (assignment_expires_at >= visited_at)
);

create table if not exists calls (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    visit_id uuid references visits(id) on delete set null,
    tracking_number_id uuid references tracking_numbers(id) on delete set null,
    provider_call_id text,
    called_at timestamptz not null,
    client_phone text not null,
    dialed_phone_number text not null,
    call_status text,
    duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
    created_at timestamptz not null default now()
);

create unique index if not exists calls_provider_call_id_uidx
    on calls (provider_call_id)
    where provider_call_id is not null;

create index if not exists tracking_numbers_project_status_idx
    on tracking_numbers (project_id, status);

create index if not exists tracking_numbers_project_last_assigned_idx
    on tracking_numbers (project_id, last_assigned_at);

create index if not exists visits_project_visited_at_idx
    on visits (project_id, visited_at desc);

create index if not exists visits_tracking_assignment_idx
    on visits (tracking_number_id, assignment_expires_at desc, visited_at desc);

create index if not exists visits_session_id_idx
    on visits (session_id);

create index if not exists calls_project_called_at_idx
    on calls (project_id, called_at desc);

create index if not exists calls_tracking_called_at_idx
    on calls (tracking_number_id, called_at desc);
