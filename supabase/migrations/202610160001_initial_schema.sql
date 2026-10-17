create extension if not exists pgcrypto;
create table public.institutions (
 id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null, city text not null, state text not null,
 website_url text, data_status text not null default 'unverified' check (data_status in ('unverified','demonstration','imported','verified')),
 created_at timestamptz not null default now()
);
create table public.courses (id uuid primary key default gen_random_uuid(), name text not null, category text not null, unique(name,category));
create table public.institution_courses (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references institutions on delete cascade, course_id uuid not null references courses,
 annual_fee_inr integer check (annual_fee_inr >= 0), unique(institution_id,course_id)
);
create table public.data_sources (id uuid primary key default gen_random_uuid(), name text not null, url text not null, authority text, created_at timestamptz not null default now());
create table public.historical_cutoffs (
 id uuid primary key default gen_random_uuid(), institution_course_id uuid not null references institution_courses on delete cascade,
 exam text not null, academic_year integer not null, quota text not null, category text not null, counselling_round integer not null check(counselling_round > 0),
 closing_rank integer not null check(closing_rank > 0), source_id uuid references data_sources, data_status text not null default 'unverified' check(data_status in ('demonstration','imported','verified')),
 unique(institution_course_id,exam,academic_year,quota,category,counselling_round)
);
create table public.profiles (
 id uuid primary key references auth.users on delete cascade, first_name text, last_name text, consent_sensitive boolean not null default false, created_at timestamptz not null default now()
);
create table public.student_preferences (
 user_id uuid primary key references profiles on delete cascade, preferred_state text, preferred_city text, annual_budget_inr integer check(annual_budget_inr >= 0), hostel_preference boolean
);
create table public.student_academic_profiles (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles on delete cascade, exam text not null, exam_year integer not null, rank integer check(rank > 0), score numeric check(score >= 0), category text, quota text, created_at timestamptz not null default now(), unique(user_id,exam,exam_year)
);
create table public.saved_colleges (user_id uuid not null references profiles on delete cascade, institution_id uuid not null references institutions on delete cascade, created_at timestamptz not null default now(), primary key(user_id,institution_id));
create table public.applications (id uuid primary key default gen_random_uuid(), user_id uuid not null references profiles on delete cascade, institution_id uuid references institutions, course_id uuid references courses, status text not null default 'planning', notes text, deadline date, created_at timestamptz not null default now());
create index historical_cutoffs_lookup on historical_cutoffs(exam,academic_year,category,quota,counselling_round);
alter table profiles enable row level security;
alter table student_preferences enable row level security;
alter table student_academic_profiles enable row level security;
alter table saved_colleges enable row level security;
alter table applications enable row level security;
create policy "profile owner access" on profiles for all using(auth.uid()=id) with check(auth.uid()=id);
create policy "preferences owner access" on student_preferences for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "academic owner access" on student_academic_profiles for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "saved colleges owner access" on saved_colleges for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "applications owner access" on applications for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
