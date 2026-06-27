-- Prevent two non-cancelled bookings for the same staff member from overlapping
-- in time, enforced at the database level via a GiST exclusion constraint.
-- btree_gist provides GiST support for the scalar equality on "staffId".

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_no_overlap"
  EXCLUDE USING gist (
    "staffId" WITH =,
    tsrange("startAt", "endAt") WITH &&
  )
  WHERE (status <> 'CANCELLED'::"BookingStatus");
