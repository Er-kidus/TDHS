# Demo Credentials & Seed Data Reference

This document defines all demo credentials seeded by the database seed scripts.

## Execution Order

Database seeds execute in this order:
1. `00_reset_and_demo_seed.sql` - Tenant, organizations (all tiers), base roles, superadmin user
2. `001_staff_roles_and_templates.sql` - Comprehensive role taxonomy and staff templates
3. `002_org_admins_and_demo_patients.sql` - Organization admins and 50 demo patients
4. `003_advanced_demo_data.sql` - Telemedicine, chronic care, pharmacy, AI data

## Superadmin Account

| Account | Email | Password |
| --- | --- | --- |
| System Super Admin | superadmin@tenadam.local | SuperAdmin123! |

## Organization Admin Accounts

Each organization has one admin user. All are seeded as `admin` role users.

### Health Posts (Tier 1)
| Organization | Email | Password |
| --- | --- | --- |
| Green Valley Health Post 01 | admin.hp01@tenadam.local | OrgHp01! |
| Green Valley Health Post 02 | admin.hp02@tenadam.local | OrgHp02! |

### Health Centers (Tier 2)
| Organization | Email | Password |
| --- | --- | --- |
| Community Health Center 01 | admin.hc01@tenadam.local | OrgHc01! |
| Community Health Center 02 | admin.hc02@tenadam.local | OrgHc02! |

### Primary Hospitals (Tier 3)
| Organization | Email | Password |
| --- | --- | --- |
| Primary Hospital 01 | admin.ph01@tenadam.local | OrgPh01! |
| Primary Hospital 02 | admin.ph02@tenadam.local | OrgPh02! |

### General Specialized Hospitals (Tier 4)
| Organization | Email | Password |
| --- | --- | --- |
| General Specialized Hospital 01 | admin.gs01@tenadam.local | OrgGs01! |
| General Specialized Hospital 02 | admin.gs02@tenadam.local | OrgGs02! |

### National Health System Nodes (Tier 5)
| Organization | Email | Password |
| --- | --- | --- |
| National Health System Node 01 | admin.nh01@tenadam.local | OrgNh01! |
| National Health System Node 02 | admin.nh02@tenadam.local | OrgNh02! |

## Demo Patient Accounts

**Total: 50 patients** (10 per tier, across 5 organizational tiers)

Password pattern: `Patient{TIER}{NUMBER}!`
Email pattern: `patient-{tier}-{number:02d}@tenadam.local`

### Health Post Patients (Tier 1)
| Patient | Email | Password |
| --- | --- | --- |
| Patient HP-01 | patient-hp-01@tenadam.local | PatientHP01! |
| Patient HP-02 | patient-hp-02@tenadam.local | PatientHP02! |
| Patient HP-03 | patient-hp-03@tenadam.local | PatientHP03! |
| Patient HP-04 | patient-hp-04@tenadam.local | PatientHP04! |
| Patient HP-05 | patient-hp-05@tenadam.local | PatientHP05! |
| Patient HP-06 | patient-hp-06@tenadam.local | PatientHP06! |
| Patient HP-07 | patient-hp-07@tenadam.local | PatientHP07! |
| Patient HP-08 | patient-hp-08@tenadam.local | PatientHP08! |
| Patient HP-09 | patient-hp-09@tenadam.local | PatientHP09! |
| Patient HP-10 | patient-hp-10@tenadam.local | PatientHP10! |

### Health Center Patients (Tier 2)
| Patient | Email | Password |
| --- | --- | --- |
| Patient HC-01 | patient-hc-01@tenadam.local | PatientHC01! |
| Patient HC-02 | patient-hc-02@tenadam.local | PatientHC02! |
| Patient HC-03 | patient-hc-03@tenadam.local | PatientHC03! |
| Patient HC-04 | patient-hc-04@tenadam.local | PatientHC04! |
| Patient HC-05 | patient-hc-05@tenadam.local | PatientHC05! |
| Patient HC-06 | patient-hc-06@tenadam.local | PatientHC06! |
| Patient HC-07 | patient-hc-07@tenadam.local | PatientHC07! |
| Patient HC-08 | patient-hc-08@tenadam.local | PatientHC08! |
| Patient HC-09 | patient-hc-09@tenadam.local | PatientHC09! |
| Patient HC-10 | patient-hc-10@tenadam.local | PatientHC10! |

### Primary Hospital Patients (Tier 3)
| Patient | Email | Password |
| --- | --- | --- |
| Patient PH-01 | patient-ph-01@tenadam.local | PatientPH01! |
| Patient PH-02 | patient-ph-02@tenadam.local | PatientPH02! |
| Patient PH-03 | patient-ph-03@tenadam.local | PatientPH03! |
| Patient PH-04 | patient-ph-04@tenadam.local | PatientPH04! |
| Patient PH-05 | patient-ph-05@tenadam.local | PatientPH05! |
| Patient PH-06 | patient-ph-06@tenadam.local | PatientPH06! |
| Patient PH-07 | patient-ph-07@tenadam.local | PatientPH07! |
| Patient PH-08 | patient-ph-08@tenadam.local | PatientPH08! |
| Patient PH-09 | patient-ph-09@tenadam.local | PatientPH09! |
| Patient PH-10 | patient-ph-10@tenadam.local | PatientPH10! |

### General Specialized Hospital Patients (Tier 4)
| Patient | Email | Password |
| --- | --- | --- |
| Patient GS-01 | patient-gs-01@tenadam.local | PatientGS01! |
| Patient GS-02 | patient-gs-02@tenadam.local | PatientGS02! |
| Patient GS-03 | patient-gs-03@tenadam.local | PatientGS03! |
| Patient GS-04 | patient-gs-04@tenadam.local | PatientGS04! |
| Patient GS-05 | patient-gs-05@tenadam.local | PatientGS05! |
| Patient GS-06 | patient-gs-06@tenadam.local | PatientGS06! |
| Patient GS-07 | patient-gs-07@tenadam.local | PatientGS07! |
| Patient GS-08 | patient-gs-08@tenadam.local | PatientGS08! |
| Patient GS-09 | patient-gs-09@tenadam.local | PatientGS09! |
| Patient GS-10 | patient-gs-10@tenadam.local | PatientGS10! |

### National Health System Patients (Tier 5)
| Patient | Email | Password |
| --- | --- | --- |
| Patient NH-01 | patient-nh-01@tenadam.local | PatientNH01! |
| Patient NH-02 | patient-nh-02@tenadam.local | PatientNH02! |
| Patient NH-03 | patient-nh-03@tenadam.local | PatientNH03! |
| Patient NH-04 | patient-nh-04@tenadam.local | PatientNH04! |
| Patient NH-05 | patient-nh-05@tenadam.local | PatientNH05! |
| Patient NH-06 | patient-nh-06@tenadam.local | PatientNH06! |
| Patient NH-07 | patient-nh-07@tenadam.local | PatientNH07! |
| Patient NH-08 | patient-nh-08@tenadam.local | PatientNH08! |
| Patient NH-09 | patient-nh-09@tenadam.local | PatientNH09! |
| Patient NH-10 | patient-nh-10@tenadam.local | PatientNH10! |

## Demo Healthcare Providers

The following providers are seeded and available for telemedicine and appointments:

| Name | Email | Specialty | Organization | License |
| --- | --- | --- | --- | --- |
| Dr. Hana Tesfaye | hana.tesfaye@tenadam.local | Internal Medicine | Primary Hospital 01 | MD-ET-2025-001 |
| Dr. Alemayehu Bekele | alemayehu.bekele@tenadam.local | Pediatrics | Primary Hospital 01 | MD-ET-2025-002 |
| Dr. Fatima Mohamed | fatima.mohamed@tenadam.local | Obstetrics & Gynecology | General Specialized Hospital 01 | MD-ET-2025-003 |

## Demo Data Features

The seed scripts include:

- **Telemedicine Sessions**: Patient HP-01 has a scheduled telemedicine session with Dr. Hana Tesfaye
- **Chronic Care Plans**: Patient HP-01 has a Type 2 Diabetes care plan
- **Pregnancy Care**: Patient HP-02 has a pregnancy care plan (Trimester 2)
- **Recurrent Medications**: Patient HP-01 takes Metformin 500mg daily
- **Pharmacy Data**: 5 medications seeded across 3 pharmacies
- **Pharmacy Orders**: Patient HP-01 has an Atorvastatin order in processing; Patient HC-01 has a Lisinopril order ready for pickup
- **AI Consent**: Patients have AI learning consent configured
- **Appointments**: Demo appointment created from telemedicine workflow

## Organizational Structure

Organizations are seeded across **5 healthcare tiers**:

1. **Health Post (Tier 1)** - Basic primary care
   - Green Valley Health Post 01
   - Green Valley Health Post 02

2. **Health Center (Tier 2)** - Community health services
   - Community Health Center 01
   - Community Health Center 02

3. **Primary Hospital (Tier 3)** - District-level hospital
   - Primary Hospital 01
   - Primary Hospital 02

4. **General Specialized Hospital (Tier 4)** - Regional/tertiary care
   - General Specialized Hospital 01
   - General Specialized Hospital 02

5. **National Health System (Tier 5)** - National-level facility
   - National Health System Node 01
   - National Health System Node 02

## Role Categories

The seed includes a comprehensive role taxonomy covering:

- **Executive/Governance**: Admin Executive, CEO, CMO, CNO
- **Medical Staff**: GP, Registrar, Resident, Intern, Specialists, Surgeons, Radiologists, Pathologists
- **Nursing Staff**: Directors, Managers, RN, Enrolled Nurses, Specialized Nurses, Midwives, Nurse Practitioners
- **Diagnostic Staff**: Lab Scientists, Technicians, Phlebotomists, Radiographers, Imaging Technicians
- **Pharmacy**: Chief Pharmacists, Dispensing Pharmacists, Technicians
- **Allied Health**: Physiotherapists, Dietitians, Psychologists
- **Administration**: Hospital Admins, HR, Finance, Records, Billing
- **IT**: System Admins, EMR Admins, Cybersecurity, Data Analysts
- **Support Staff**: Housekeeping, Security, Logistics, Paramedics
- **Community Health**: Health Workers, Extension Workers

## Notes

- All credentials are deterministic and can be regenerated by re-running the seed scripts
- Passwords are designed to be memorable for testing but should NEVER be used in production
- All demo accounts use the `@tenadam.local` email domain for isolation
- Patient data includes realistic healthcare scenarios for testing workflows
- Telemedicine and pharmacy demos are ready for end-to-end testing
