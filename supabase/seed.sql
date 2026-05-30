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

create index if not exists movies_release_date_idx on public.movies (release_date desc);
create index if not exists cinemas_city_idx on public.cinemas (city);
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

alter table public.movies enable row level security;
alter table public.cinemas enable row level security;
alter table public.showtimes enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Movies are readable" on public.movies;
create policy "Movies are readable" on public.movies for select using (true);

drop policy if exists "Cinemas are readable" on public.cinemas;
create policy "Cinemas are readable" on public.cinemas for select using (true);

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

insert into public.movies (id, title, synopsis, poster_url, backdrop_url, rating, duration_minutes, genre, release_date) values
('11111111-1111-1111-1111-111111111111', 'Midnight Gilded', 'A jewel thief and a concert pianist cross paths inside a private Bangkok screening room where every clue is hidden in the film itself.', 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=900', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600', 'PG-13', 124, 'Mystery / Thriller', current_date - interval '12 days'),
('22222222-2222-2222-2222-222222222222', 'Velvet After Dark', 'An heiress returns to a shuttered cinema and discovers a final premiere meant only for people with unfinished business.', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900', 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?w=1600', 'R', 108, 'Drama / Noir', current_date - interval '5 days'),
('33333333-3333-3333-3333-333333333333', 'The Golden Balcony', 'Two rival chefs compete for the city''s most exclusive cinema menu while a lost silent film changes the night.', 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=900', 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=1600', 'G', 96, 'Romance / Comedy', current_date - interval '2 days');

insert into public.cinemas (id, name, address, city, latitude, longitude, premium_label) values
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Noir Embassy Screens', '1031 Ploenchit Road, Pathum Wan', 'Bangkok', 13.7449, 100.5450, 'Champagne Lounge'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Noir Riverside Atelier', 'Charoen Nakhon Road, Khlong San', 'Bangkok', 13.7262, 100.5105, 'Private Balcony'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Noir Ari House', 'Phahon Yothin Road, Phaya Thai', 'Bangkok', 13.7798, 100.5448, 'Gold Class');

insert into public.showtimes (id, movie_id, cinema_id, starts_at, auditorium, base_price) values
('90000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() + interval '3 hours', 'Salon A', 520),
('90000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', now() + interval '1 day 2 hours', 'Riverside 1', 480),
('90000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', now() + interval '5 hours', 'Ari Private', 450),
('90000000-0000-0000-0000-000000000004', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', now() + interval '1 day 5 hours', 'Salon B', 390);

insert into public.seats (showtime_id, row_label, seat_number, label, price_modifier)
select
  showtimes.id,
  rows.row_label,
  seats.seat_number,
  rows.row_label || seats.seat_number::text,
  case when rows.row_label in ('A', 'B') then 120 else 0 end
from public.showtimes
cross join (values ('A'), ('B'), ('C'), ('D'), ('E')) as rows(row_label)
cross join generate_series(1, 8) as seats(seat_number);

update public.seats
set status = 'booked'
where showtime_id = '90000000-0000-0000-0000-000000000001'
and label in ('A1', 'A2', 'C4');

-- Booking flow test:
-- 1. Create a user through Supabase Auth or the app register screen.
-- 2. Login, open "Midnight Gilded", choose showtime Salon A, select available seats, and confirm.
-- 3. Verify public.bookings receives the row and public.seats changes selected seats to booked in realtime.
