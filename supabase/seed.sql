create extension if not exists "pgcrypto";

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  synopsis text not null,
  poster_url text not null,
  backdrop_url text,
  rating text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  genre text not null,
  release_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cinemas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  latitude double precision not null,
  longitude double precision not null,
  premium_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.showtimes (
  id uuid primary key default gen_random_uuid(),
  movie_id uuid not null references public.movies(id) on delete cascade,
  cinema_id uuid not null references public.cinemas(id) on delete cascade,
  starts_at timestamptz not null,
  auditorium text not null,
  base_price numeric(10, 2) not null check (base_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  showtime_id uuid not null references public.showtimes(id) on delete cascade,
  seat_ids uuid[] not null,
  seat_labels text[] not null,
  total_price numeric(10, 2) not null check (total_price >= 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  showtime_id uuid not null references public.showtimes(id) on delete cascade,
  row_label text not null,
  seat_number integer not null check (seat_number > 0),
  label text not null,
  status text not null default 'available' check (status in ('available', 'held', 'booked')),
  price_modifier numeric(10, 2) not null default 0,
  booking_id uuid references public.bookings(id) on delete set null,
  updated_at timestamptz not null default now(),
  unique (showtime_id, label)
);

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'showtimes' and column_name = 'hall'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'showtimes' and column_name = 'auditorium'
  ) then
    alter table public.showtimes rename column hall to auditorium;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'showtimes' and column_name = 'price'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'showtimes' and column_name = 'base_price'
  ) then
    alter table public.showtimes rename column price to base_price;
  end if;
end;
$$;

alter table public.movies add column if not exists synopsis text;
alter table public.movies add column if not exists poster_url text;
alter table public.movies add column if not exists backdrop_url text;
alter table public.movies add column if not exists rating text;
alter table public.movies add column if not exists duration_minutes integer;
alter table public.movies add column if not exists genre text;
alter table public.movies add column if not exists release_date date;
alter table public.movies add column if not exists created_at timestamptz default now();

alter table public.cinemas add column if not exists address text;
alter table public.cinemas add column if not exists city text;
alter table public.cinemas add column if not exists latitude double precision;
alter table public.cinemas add column if not exists longitude double precision;
alter table public.cinemas add column if not exists premium_label text;
alter table public.cinemas add column if not exists created_at timestamptz default now();

alter table public.showtimes add column if not exists starts_at timestamptz;
alter table public.showtimes add column if not exists auditorium text;
alter table public.showtimes add column if not exists base_price numeric(10, 2);
alter table public.showtimes add column if not exists created_at timestamptz default now();

alter table public.bookings add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.bookings add column if not exists showtime_id uuid references public.showtimes(id) on delete cascade;
alter table public.bookings add column if not exists seat_ids uuid[] default '{}';
alter table public.bookings add column if not exists seat_labels text[] default '{}';
alter table public.bookings add column if not exists total_price numeric(10, 2) default 0;
alter table public.bookings add column if not exists status text default 'confirmed';
alter table public.bookings add column if not exists created_at timestamptz default now();

alter table public.seats add column if not exists showtime_id uuid references public.showtimes(id) on delete cascade;
alter table public.seats add column if not exists row_label text;
alter table public.seats add column if not exists seat_number integer;
alter table public.seats add column if not exists label text;
alter table public.seats add column if not exists status text default 'available';
alter table public.seats add column if not exists price_modifier numeric(10, 2) default 0;
alter table public.seats add column if not exists booking_id uuid references public.bookings(id) on delete set null;
alter table public.seats add column if not exists updated_at timestamptz default now();

update public.movies
set
  synopsis = coalesce(synopsis, ''),
  poster_url = coalesce(poster_url, ''),
  rating = coalesce(rating, 'PG'),
  duration_minutes = coalesce(duration_minutes, 90),
  genre = coalesce(genre, 'Drama'),
  release_date = coalesce(release_date, current_date),
  created_at = coalesce(created_at, now());

update public.cinemas
set
  address = coalesce(address, ''),
  city = coalesce(city, 'Bangkok'),
  latitude = coalesce(latitude, 13.7563),
  longitude = coalesce(longitude, 100.5018),
  created_at = coalesce(created_at, now());

update public.showtimes
set
  starts_at = coalesce(starts_at, now() + interval '3 hours'),
  auditorium = coalesce(auditorium, 'Salon A'),
  base_price = coalesce(base_price, 450),
  created_at = coalesce(created_at, now());

update public.bookings
set
  seat_ids = coalesce(seat_ids, '{}'),
  seat_labels = coalesce(seat_labels, '{}'),
  total_price = coalesce(total_price, 0),
  status = coalesce(status, 'confirmed'),
  created_at = coalesce(created_at, now());

update public.seats
set
  row_label = coalesce(row_label, 'A'),
  seat_number = coalesce(seat_number, 1),
  label = coalesce(label, coalesce(row_label, 'A') || coalesce(seat_number, 1)::text),
  status = coalesce(status, 'available'),
  price_modifier = coalesce(price_modifier, 0),
  updated_at = coalesce(updated_at, now());

create index if not exists movies_release_date_idx on public.movies (release_date desc);
create index if not exists cinemas_city_idx on public.cinemas (city);
create unique index if not exists users_email_key on public.users (lower(email));
create index if not exists showtimes_movie_starts_idx on public.showtimes (movie_id, starts_at);
create index if not exists showtimes_cinema_starts_idx on public.showtimes (cinema_id, starts_at);
create index if not exists seats_showtime_status_idx on public.seats (showtime_id, status);
create index if not exists bookings_user_created_idx on public.bookings (user_id, created_at desc);
create index if not exists seats_booked_idx on public.seats (showtime_id, label) where status = 'booked';

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists seats_touch_updated_at on public.seats;
create trigger seats_touch_updated_at
before update on public.seats
for each row execute function public.touch_updated_at();

drop trigger if exists users_touch_updated_at on public.users;
create trigger users_touch_updated_at
before update on public.users
for each row execute function public.touch_updated_at();

create or replace function public.create_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.users.display_name, excluded.display_name),
    avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists auth_users_create_profile on auth.users;
create trigger auth_users_create_profile
after insert on auth.users
for each row execute function public.create_user_profile();

alter table public.movies enable row level security;
alter table public.cinemas enable row level security;
alter table public.users enable row level security;
alter table public.showtimes enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Movies are readable" on public.movies;
create policy "Movies are readable" on public.movies for select using (true);

drop policy if exists "Cinemas are readable" on public.cinemas;
create policy "Cinemas are readable" on public.cinemas for select using (true);

drop policy if exists "Users read own profile" on public.users;
create policy "Users read own profile"
on public.users for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile"
on public.users for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users create own profile" on public.users;
create policy "Users create own profile"
on public.users for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Showtimes are readable" on public.showtimes;
create policy "Showtimes are readable" on public.showtimes for select using (true);

drop policy if exists "Seats are readable" on public.seats;
create policy "Seats are readable" on public.seats for select using (true);

drop policy if exists "Authenticated users can book available seats" on public.seats;
create policy "Authenticated users can book available seats"
on public.seats for update
to authenticated
using (status = 'available')
with check (status in ('booked', 'held'));

drop policy if exists "Users read own bookings" on public.bookings;
create policy "Users read own bookings"
on public.bookings for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users create own bookings" on public.bookings;
create policy "Users create own bookings"
on public.bookings for insert
to authenticated
with check ((select auth.uid()) = user_id);

do $$
begin
  alter publication supabase_realtime add table public.seats;
exception
  when duplicate_object then null;
  when undefined_object then null;
end;
$$;

truncate table public.seats, public.bookings, public.showtimes, public.cinemas, public.movies restart identity cascade;

insert into public.users (id, email, display_name, avatar_url, created_at, updated_at)
select id, coalesce(email, ''), raw_user_meta_data ->> 'display_name', raw_user_meta_data ->> 'avatar_url', created_at, now()
from auth.users
on conflict (id) do update
set
  email = excluded.email,
  display_name = coalesce(public.users.display_name, excluded.display_name),
  avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
  updated_at = now();

insert into public.movies (id, title, synopsis, poster_url, backdrop_url, rating, duration_minutes, genre, release_date) values
('11111111-1111-1111-1111-111111111111', 'Midnight Gilded', 'A jewel thief and a concert pianist cross paths inside a private Bangkok screening room where every clue is hidden in the film itself.', 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=900', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600', 'PG-13', 124, 'Mystery / Thriller', current_date - interval '12 days'),
('22222222-2222-2222-2222-222222222222', 'Velvet After Dark', 'An heiress returns to a shuttered cinema and discovers a final premiere meant only for people with unfinished business.', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900', 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=1600', 'R', 108, 'Drama / Noir', current_date - interval '5 days'),
('33333333-3333-3333-3333-333333333333', 'The Golden Balcony', 'Two rival chefs compete for the city''s most exclusive cinema menu while a lost silent film changes the night.', 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=900', 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1600', 'G', 96, 'Romance / Comedy', current_date - interval '2 days');

insert into public.cinemas (id, name, address, city, latitude, longitude, premium_label) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Major Cineplex Central Udon', 'Central Udon, Prajaksillapakhom Road, Mueang Udon Thani', 'Udon Thani', 17.4075, 102.8002, 'Major Cineplex'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'SF Cinema Central Khonkaen', 'Central Khonkaen, Srichan Road, Mueang Khon Kaen', 'Khon Kaen', 16.4322, 102.8252, 'SF Cinema'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'SF World Cinema CentralWorld', 'CentralWorld, Rama I Road, Pathum Wan', 'Bangkok', 13.7469, 100.5397, 'SF Cinema'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Major Cineplex Ratchayothin', 'Phahonyothin Road, Lat Yao, Chatuchak', 'Bangkok', 13.8283, 100.5687, 'Major Cineplex'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'SFX Cinema Central Ladprao', 'Central Ladprao, Phahonyothin Road, Chatuchak', 'Bangkok', 13.8163, 100.5616, 'SFX Cinema'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Major Cineplex Central Chiangmai', 'Central Chiangmai, Fa Ham, Mueang Chiang Mai', 'Chiang Mai', 18.8063, 99.0175, 'Major Cineplex'),
('abababab-abab-abab-abab-abababababab', 'Major Cineplex Central Pinklao', 'Central Pinklao, Borommaratchachonnani Road', 'Bangkok', 13.7782, 100.4762, 'Major Cineplex'),
('bcbcbcbc-bcbc-bcbc-bcbc-bcbcbcbcbcbc', 'SF Cinema Terminal 21 Korat', 'Terminal 21 Korat, Mittraphap Road, Mueang Nakhon Ratchasima', 'Nakhon Ratchasima', 14.9799, 102.0977, 'SF Cinema');

insert into public.showtimes (id, movie_id, cinema_id, starts_at, auditorium, base_price) values
('90000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() + interval '3 hours', 'Salon A', 520),
('90000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() + interval '1 day 2 hours', 'Riverside 1', 480),
('90000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() + interval '5 hours', 'Ari Private', 450),
('90000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', now() + interval '1 day 5 hours', 'IMAX Laser', 590),
('90000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', now() + interval '1 day 7 hours', 'SFX Hall 7', 520),
('90000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'ffffffff-ffff-ffff-ffff-ffffffffffff', now() + interval '2 days 2 hours', 'Chiangmai 4DX', 490),
('90000000-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'abababab-abab-abab-abab-abababababab', now() + interval '2 days 4 hours', 'Pinklao VIP', 560),
('90000000-0000-0000-0000-000000000008', '33333333-3333-3333-3333-333333333333', 'bcbcbcbc-bcbc-bcbc-bcbc-bcbcbcbcbcbc', now() + interval '2 days 6 hours', 'Korat Premier', 430);

insert into public.seats (showtime_id, row_label, seat_number, label, price_modifier)
select
  showtimes.id,
  row_specs.row_label,
  seat_numbers.seat_number,
  row_specs.row_label || seat_numbers.seat_number::text,
  case
    when row_specs.row_label in ('A', 'B', 'C') then 140
    when row_specs.row_label in ('G', 'H') then 90
    else 0
  end
from public.showtimes
cross join (
  values
    ('A', 5, 24),
    ('B', 4, 25),
    ('C', 3, 26),
    ('D', 1, 28),
    ('E', 1, 28),
    ('F', 1, 28),
    ('G', 1, 28),
    ('H', 1, 28),
    ('I', 1, 28),
    ('J', 1, 28),
    ('K', 1, 28),
    ('L', 1, 28),
    ('M', 1, 28),
    ('N', 1, 28),
    ('O', 1, 28)
) as row_specs(row_label, first_seat, last_seat)
cross join lateral generate_series(row_specs.first_seat, row_specs.last_seat) as seat_numbers(seat_number);

update public.seats
set status = 'booked'
where showtime_id = '90000000-0000-0000-0000-000000000001'
and label in ('A12', 'A13', 'G8', 'G9', 'H8', 'H9', 'E22', 'E23');

-- Booking flow test:
-- 1. Create a user through Supabase Auth or the app register screen.
-- 2. Login, open "Midnight Gilded", choose showtime Salon A, select available seats, and confirm.
-- 3. Verify public.bookings receives the row and public.seats changes selected seats to booked in realtime.
