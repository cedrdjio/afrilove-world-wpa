drop policy "Users can upload their own profile photos" on storage.objects;
drop policy "Users can update their own profile photos" on storage.objects;
drop policy "Users can delete their own profile photos" on storage.objects;

create policy "Authenticated users can upload profile photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'profile-photos');

create policy "Authenticated users can update profile photos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'profile-photos');

create policy "Authenticated users can delete profile photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'profile-photos');
;
