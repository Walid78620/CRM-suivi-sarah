create extension if not exists pgcrypto;

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  coaching jsonb default '{
    "cv":{"status":"À commencer","progress":0,"notes":""},
    "linkedin":{"status":"À commencer","progress":0,"notes":""},
    "interview":{"status":"À commencer","progress":0,"notes":""},
    "lastUpdate": null
  }'::jsonb,
  created_at timestamptz default now()
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  size text,
  address text,
  website text,
  status text,
  relationLevel text,
  conventionSigned boolean default false,
  conventionDate date,
  partnerSince date,
  capacity int default 0,
  placedStudents int default 0,
  lastContactDate date,
  notes text,
  created_at timestamptz default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  companyId uuid references companies(id) on delete cascade,
  title text not null,
  type text,
  domain text,
  duration text,
  spots int default 1,
  startDate date,
  status text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists placements (
  id uuid primary key default gen_random_uuid(),
  studentId uuid references students(id) on delete cascade,
  companyId uuid references companies(id) on delete cascade,
  position text,
  contractType text,
  startDate date,
  endDate date,
  created_at timestamptz default now()
);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  companyId uuid references companies(id) on delete cascade,
  contactName text,
  contactPosition text,
  email text,
  phone text,
  source text,
  status text,
  priority text,
  dealValue numeric,
  probability int,
  expectedCloseDate date,
  notes text,
  lastContactDate date,
  created_at timestamptz default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  dueDate date,
  completed boolean default false,
  assignedTo text,
  priority text,
  companyId uuid references companies(id) on delete set null,
  dealId uuid references deals(id) on delete set null,
  studentId uuid references students(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists interactions (
  id uuid primary key default gen_random_uuid(),
  date date,
  type text,
  companyId uuid references companies(id) on delete set null,
  dealId uuid references deals(id) on delete set null,
  studentId uuid references students(id) on delete set null,
  content text,
  created_at timestamptz default now()
);
