# Browser QA Checklist: Patient + Org Portals

## Preconditions

1. Start local stack and ensure gateway is healthy.
2. Confirm DB migrations include `007_appointment_nearby_hospital.sql`.
3. Use two browser sessions (or one normal + one incognito):
   - Session A: patient portal
   - Session B: org portal

## Patient Portal Click Path (Exact)

1. Open `http://localhost:3000/login`.
2. Login as patient.
3. Sidebar -> `Appointments`.
4. Click `+ Book Appointment`.
5. In booking panel:
   - Select service.
   - Select facility.
   - In `Nearby hospitals`, click one hospital card.
   - Verify selected card is highlighted.
6. Click `Confirm + Submit`.
7. In appointment list:
   - Click `View Details` on the new appointment.
   - Verify `Nearby hospital:` appears in the Location section.
8. In the same modal:
   - Set a new datetime under `Reschedule`.
   - Click `Save New Time`.
   - Re-open details and verify start time changed.
9. In list view:
   - Click `Cancel` on that appointment.
   - Verify status becomes `cancelled`.

## Org Portal Click Path (Exact)

1. Open org portal login page.
2. Login as org admin/receptionist.
3. Sidebar -> `Appointments`.
4. Go to `queue` tab.
5. Set queue date to today (or appointment date).
6. On a booked appointment in queue:
   - Click `Reception Check-in`.
   - Verify status updates to `arrived`.
7. Click `Call Next`.
8. Verify first waiting/arrived patient transitions to `in-progress`.
9. For active row:
   - Click `Assign Resource`.
   - Verify assigned fields populate.
10. Click `Complete`; verify status updates to `fulfilled`.

## Visual/UI Parity Checks

1. Compare patient and org appointments pages:
   - Card borders/background tones
   - Button sizing and rounded styles
   - Detail modal style and typography
2. Confirm org page uses card + filter + list styling consistent with patient page.

## Pass Criteria

1. Cancel works for patient-owned appointments.
2. Nearby hospital selection persists as structured appointment fields.
3. Reception flow works in org queue: check-in -> call next -> in-progress -> complete.
4. No console errors for appointment actions.
