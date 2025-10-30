-- Indexes to optimize common queries
create index if not exists idx_students_name on students(lower(name));
create index if not exists idx_students_email on students(lower(email));
create index if not exists idx_companies_name on companies(lower(name));
create index if not exists idx_offers_company on offers("companyId");
create index if not exists idx_deals_company on deals("companyId");
create index if not exists idx_deals_status on deals(status);
create index if not exists idx_tasks_duedate on tasks(dueDate);
create index if not exists idx_interactions_date on interactions(date);
