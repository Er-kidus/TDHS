# Demo Credentials

These credentials match `database/seeds/00_reset_and_demo_seed.sql`.

## Super Admin

| Account | Email | Password |
| --- | --- | --- |
| Super Admin | superadmin@tenadam.local | SuperAdmin123! |

## Organization Admin Accounts

| Organization | Email | Password |
| --- | --- | --- |
| Green Valley Health Post 01 | admin.hp01@tenadam.local | OrgHp01! |
| Green Valley Health Post 02 | admin.hp02@tenadam.local | OrgHp02! |
| Community Health Center 01 | admin.hc01@tenadam.local | OrgHc01! |
| Community Health Center 02 | admin.hc02@tenadam.local | OrgHc02! |
| Primary Hospital 01 | admin.ph01@tenadam.local | OrgPh01! |
| Primary Hospital 02 | admin.ph02@tenadam.local | OrgPh02! |
| General Specialized Hospital 01 | admin.gs01@tenadam.local | OrgGs01! |
| General Specialized Hospital 02 | admin.gs02@tenadam.local | OrgGs02! |
| National Health System Node 01 | admin.nh01@tenadam.local | OrgNh01! |
| National Health System Node 02 | admin.nh02@tenadam.local | OrgNh02! |

## Patient Account Patterns

Each tier has 10 patients. The password pattern matches the email prefix.

| Tier | Email Pattern | Password Pattern | Count |
| --- | --- | --- | --- |
| Health Post | patient-hp-01@tenadam.local ... patient-hp-10@tenadam.local | PatientHP01! ... PatientHP10! | 10 |
| Health Center | patient-hc-01@tenadam.local ... patient-hc-10@tenadam.local | PatientHC01! ... PatientHC10! | 10 |
| Primary Hospital | patient-ph-01@tenadam.local ... patient-ph-10@tenadam.local | PatientPH01! ... PatientPH10! | 10 |
| General Specialized Hospital | patient-gs-01@tenadam.local ... patient-gs-10@tenadam.local | PatientGS01! ... PatientGS10! | 10 |
| National Health System | patient-nh-01@tenadam.local ... patient-nh-10@tenadam.local | PatientNH01! ... PatientNH10! | 10 |

## Notes

- All demo organization accounts are seeded as `admin` users.
- All patient accounts are deterministic and can be regenerated from the seed script.
- The seed script also creates organization applications and organization configuration rows for each demo organization.
