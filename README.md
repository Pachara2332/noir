# Noir

Luxury noir cinema booking app built with Expo, React Native, Expo Router, TypeScript, and Supabase.

## Features

- Supabase Auth login/register with persisted sessions
- Protected app routes with Expo Router
- Now Playing movie feed with premium noir editorial UI
- Movie detail pages with synopsis, venue, dates, showtimes, and reserve action
- Cinema seat map with realtime seat updates
- Booking flow that writes bookings and marks seats as booked
- My Tickets pass-style booking history
- Nearby cinemas with GPS distance sorting
- Map support with MapTiler when a key is provided, plus a web fallback
- Profile page with display name and avatar URL editing

## Tech Stack

- Expo SDK 56
- React Native
- Expo Router
- TypeScript
- Supabase Auth, Database, and Realtime
- AsyncStorage
- Expo Location
- React Native Maps
- Expo Image
- Lucide React Native

## Getting Started

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
EXPO_PUBLIC_MAPTILER_KEY=your_maptiler_key_optional
```

Start the app:

```bash
npm run start
```

Run on web:

```bash
npm run web
```

## Supabase Setup

1. Create a Supabase project.
2. Go to `Authentication -> Sign In / Providers`.
3. Enable email signups.
4. For local testing, disable email confirmation if you want users to login immediately after register.
5. Open `SQL Editor`.
6. Run `supabase/seed.sql`.

The seed creates:

- `public.users`
- `movies`
- `cinemas`
- `showtimes`
- `seats`
- `bookings`
- RLS policies
- user profile trigger
- realtime publication for seats
- sample Major/SF cinema data in Thailand

Note: `supabase/seed.sql` truncates movie, cinema, showtime, seat, and booking data before reseeding.

After reseeding, verify the seat mock layout:

```sql
select row_label, min(seat_number), max(seat_number), count(*), min(price_modifier), max(price_modifier)
from public.seats
where showtime_id = '90000000-0000-0000-0000-000000000001'
group by row_label
order by row_label;
```

Rows `A-C` should be narrower premium rows, rows `G-H` should be comfort rows, and the remaining rows should be standard rows. Legacy `row` and `number` columns are removed by the seed.

## Project Structure

```text
src/
  app/                  Expo Router route entries
    auth/               Login and register routes
    (protected)/        Auth-protected routes
  assets/               App icons and images
  api/                  Supabase client and data hooks
  core/                 Auth, app config, and theme tokens
  navigation/           Root, protected stack, and tab navigators
  screens/              Screen implementations grouped by feature
  types/                App data types
  ui/                   Reusable visual components
supabase/
  seed.sql              Schema, RLS, trigger, and seed data
```

## Important Notes

- Passwords are managed by Supabase Auth, not `public.users`.
- `public.users` stores profile data only.
- Booking currently happens from the client with availability checks. For production, move booking into a Postgres RPC transaction to prevent race conditions.
- React Native Maps is native-only, so web uses a platform-specific fallback component.

## Recommended Next Steps

- Add a `book_seats` Supabase RPC transaction
- Add timed seat holds
- Add QR code ticket detail pages
- Add profile avatar upload with Supabase Storage
- Add admin tools for movies, cinemas, showtimes, and seats
- Add payment integration or a payment mock flow
