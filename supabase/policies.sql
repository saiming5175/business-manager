-- Enable RLS on all app tables
alter table expenses enable row level security;
alter table expense_attachments enable row level security;
alter table sales enable row level security;
alter table withdrawals enable row level security;

-- Owner-only access (auth.uid() must equal user_id)
create policy "own_rows" on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on expense_attachments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on sales
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on withdrawals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private storage bucket for receipts
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Storage access: only files under a folder named after the user's id
create policy "own_files_select" on storage.objects
  for select using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_files_insert" on storage.objects
  for insert with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_files_delete" on storage.objects
  for delete using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
