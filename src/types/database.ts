export type SeatStatus = 'available' | 'held' | 'booked';

export type Movie = {
  id: string;
  title: string;
  synopsis: string;
  poster_url: string;
  backdrop_url: string | null;
  rating: string;
  duration_minutes: number;
  genre: string;
  release_date: string;
  created_at: string;
};

export type Cinema = {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  premium_label: string | null;
  created_at: string;
};

export type Showtime = {
  id: string;
  movie_id: string;
  cinema_id: string;
  starts_at: string;
  auditorium: string;
  base_price: number;
  created_at: string;
  cinemas?: Cinema;
  movies?: Movie;
};

export type Seat = {
  id: string;
  showtime_id: string;
  row_label: string;
  seat_number: number;
  label: string;
  status: SeatStatus;
  price_modifier: number;
  booking_id: string | null;
  updated_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  showtime_id: string;
  seat_ids: string[];
  seat_labels: string[];
  total_price: number;
  status: 'confirmed' | 'cancelled';
  created_at: string;
  showtimes?: Showtime;
};

export type NearbyCinema = Cinema & {
  distanceKm: number | null;
};
