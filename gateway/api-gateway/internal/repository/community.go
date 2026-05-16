package repository

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/tenadam/api-gateway/internal/model"
)

func (r *Repository) OrgCreateCommunityArea(ctx context.Context, orgID, name, desc, region string) (*model.CommunityArea, error) {
	qry := `INSERT INTO community_areas (tenant_id, organization_id, name, description, region_code)
			VALUES ((SELECT id FROM tenants WHERE slug='default'), $1::uuid, $2, $3, $4)
			RETURNING id, COALESCE(organization_id::text,''), name, COALESCE(description,''), COALESCE(region_code,''), created_at, updated_at`
	var it model.CommunityArea
	err := r.db.QueryRowContext(ctx, qry, orgID, name, desc, region).Scan(
		&it.ID, &it.OrganizationID, &it.Name, &it.Description, &it.RegionCode, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *Repository) OrgListCommunityAreas(ctx context.Context, orgID string, limit int) ([]*model.CommunityArea, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	qry := `SELECT id, COALESCE(organization_id::text,''), name, COALESCE(description,''), COALESCE(region_code,''), created_at, updated_at
			FROM community_areas WHERE organization_id=$1::uuid ORDER BY name ASC LIMIT $2`
	rows, err := r.db.QueryContext(ctx, qry, orgID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]*model.CommunityArea, 0)
	for rows.Next() {
		var it model.CommunityArea
		if err := rows.Scan(&it.ID, &it.OrganizationID, &it.Name, &it.Description, &it.RegionCode, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) OrgCreateHousehold(ctx context.Context, orgID string, params map[string]any) (*model.Household, error) {
	qry := `INSERT INTO households (tenant_id, organization_id, area_id, head_name, contact_number, address, gps_coordinates, risk_level)
			VALUES ((SELECT id FROM tenants WHERE slug='default'), $1::uuid, $2::uuid, $3, $4, $5, $6::jsonb, $7)
			RETURNING id, COALESCE(organization_id::text,''), area_id, head_name, COALESCE(contact_number,''), COALESCE(address,''), COALESCE(gps_coordinates,'{}'), risk_level, created_at, updated_at`
	
	gpsJSON, _ := json.Marshal(params["gps_coordinates"])
	var it model.Household
	var areaID sql.NullString
	var gpsRaw []byte

	err := r.db.QueryRowContext(ctx, qry,
		orgID, params["area_id"], params["head_name"], params["contact_number"], params["address"], string(gpsJSON), params["risk_level"],
	).Scan(
		&it.ID, &it.OrganizationID, &areaID, &it.HeadName, &it.ContactNumber, &it.Address, &gpsRaw, &it.RiskLevel, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if areaID.Valid {
		it.AreaID = &areaID.String
	}
	if len(gpsRaw) > 0 {
		_ = json.Unmarshal(gpsRaw, &it.GPSCoordinates)
	}
	return &it, nil
}

func (r *Repository) OrgListHouseholds(ctx context.Context, orgID string, areaID string, limit int) ([]*model.Household, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	var rows *sql.Rows
	var err error

	if areaID != "" {
		qry := `SELECT id, COALESCE(organization_id::text,''), area_id, head_name, COALESCE(contact_number,''), COALESCE(address,''), COALESCE(gps_coordinates,'{}'), risk_level, created_at, updated_at
				FROM households WHERE organization_id=$1::uuid AND area_id=$2::uuid ORDER BY created_at DESC LIMIT $3`
		rows, err = r.db.QueryContext(ctx, qry, orgID, areaID, limit)
	} else {
		qry := `SELECT id, COALESCE(organization_id::text,''), area_id, head_name, COALESCE(contact_number,''), COALESCE(address,''), COALESCE(gps_coordinates,'{}'), risk_level, created_at, updated_at
				FROM households WHERE organization_id=$1::uuid ORDER BY created_at DESC LIMIT $2`
		rows, err = r.db.QueryContext(ctx, qry, orgID, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.Household, 0)
	for rows.Next() {
		var it model.Household
		var dbAreaID sql.NullString
		var gpsRaw []byte
		if err := rows.Scan(&it.ID, &it.OrganizationID, &dbAreaID, &it.HeadName, &it.ContactNumber, &it.Address, &gpsRaw, &it.RiskLevel, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if dbAreaID.Valid {
			it.AreaID = &dbAreaID.String
		}
		if len(gpsRaw) > 0 {
			_ = json.Unmarshal(gpsRaw, &it.GPSCoordinates)
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) OrgAddHouseholdMember(ctx context.Context, hhID string, params map[string]any) (*model.HouseholdMember, error) {
	qry := `INSERT INTO household_members (household_id, patient_id, full_name, date_of_birth, gender, relationship, is_pregnant, has_chronic, risk_level)
			VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9)
			RETURNING id, COALESCE(household_id::text,''), patient_id, full_name, date_of_birth, COALESCE(gender,''), COALESCE(relationship,''), is_pregnant, has_chronic, risk_level, created_at, updated_at`
	
	var it model.HouseholdMember
	var patID sql.NullString
	var dob sql.NullTime

	err := r.db.QueryRowContext(ctx, qry,
		hhID, params["patient_id"], params["full_name"], params["date_of_birth"], params["gender"], params["relationship"], params["is_pregnant"], params["has_chronic"], params["risk_level"],
	).Scan(
		&it.ID, &it.HouseholdID, &patID, &it.FullName, &dob, &it.Gender, &it.Relationship, &it.IsPregnant, &it.HasChronic, &it.RiskLevel, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if patID.Valid {
		it.PatientID = &patID.String
	}
	if dob.Valid {
		t := dob.Time
		it.DateOfBirth = &t
	}
	return &it, nil
}

func (r *Repository) OrgListHouseholdMembers(ctx context.Context, hhID string) ([]*model.HouseholdMember, error) {
	qry := `SELECT id, COALESCE(household_id::text,''), patient_id, full_name, date_of_birth, COALESCE(gender,''), COALESCE(relationship,''), is_pregnant, has_chronic, risk_level, created_at, updated_at
			FROM household_members WHERE household_id=$1::uuid ORDER BY created_at ASC`
	rows, err := r.db.QueryContext(ctx, qry, hhID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.HouseholdMember, 0)
	for rows.Next() {
		var it model.HouseholdMember
		var patID sql.NullString
		var dob sql.NullTime
		if err := rows.Scan(&it.ID, &it.HouseholdID, &patID, &it.FullName, &dob, &it.Gender, &it.Relationship, &it.IsPregnant, &it.HasChronic, &it.RiskLevel, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if patID.Valid {
			it.PatientID = &patID.String
		}
		if dob.Valid {
			t := dob.Time
			it.DateOfBirth = &t
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) OrgLogCommunityVisit(ctx context.Context, orgID, agentID string, params map[string]any) (*model.CommunityVisit, error) {
	qry := `INSERT INTO community_visits (tenant_id, organization_id, agent_id, household_id, member_id, visit_type, vitals_logged, symptoms, notes, triage_escalated, triage_reason)
			VALUES ((SELECT id FROM tenants WHERE slug='default'), $1::uuid, $2::uuid, $3::uuid, $4, $5, $6::jsonb, $7::jsonb, $8, $9, $10)
			RETURNING id, COALESCE(organization_id::text,''), COALESCE(agent_id::text,''), COALESCE(household_id::text,''), member_id, visit_date, visit_type, COALESCE(vitals_logged,'{}'), COALESCE(symptoms,'[]'), COALESCE(notes,''), triage_escalated, COALESCE(triage_reason,''), created_at, updated_at`

	vitalsJSON, _ := json.Marshal(params["vitals_logged"])
	sympJSON, _ := json.Marshal(params["symptoms"])

	var it model.CommunityVisit
	var memID sql.NullString
	var vRaw, sRaw []byte

	err := r.db.QueryRowContext(ctx, qry,
		orgID, agentID, params["household_id"], params["member_id"], params["visit_type"], string(vitalsJSON), string(sympJSON), params["notes"], params["triage_escalated"], params["triage_reason"],
	).Scan(
		&it.ID, &it.OrganizationID, &it.AgentID, &it.HouseholdID, &memID, &it.VisitDate, &it.VisitType, &vRaw, &sRaw, &it.Notes, &it.TriageEscalated, &it.TriageReason, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if memID.Valid {
		it.MemberID = &memID.String
	}
	if len(vRaw) > 0 {
		_ = json.Unmarshal(vRaw, &it.VitalsLogged)
	}
	if len(sRaw) > 0 {
		_ = json.Unmarshal(sRaw, &it.Symptoms)
	}
	return &it, nil
}

func (r *Repository) OrgListCommunityVisits(ctx context.Context, orgID string, hhID string, limit int) ([]*model.CommunityVisit, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	var rows *sql.Rows
	var err error

	if hhID != "" {
		qry := `SELECT id, COALESCE(organization_id::text,''), COALESCE(agent_id::text,''), COALESCE(household_id::text,''), member_id, visit_date, visit_type, COALESCE(vitals_logged,'{}'), COALESCE(symptoms,'[]'), COALESCE(notes,''), triage_escalated, COALESCE(triage_reason,''), created_at, updated_at
				FROM community_visits WHERE organization_id=$1::uuid AND household_id=$2::uuid ORDER BY visit_date DESC LIMIT $3`
		rows, err = r.db.QueryContext(ctx, qry, orgID, hhID, limit)
	} else {
		qry := `SELECT id, COALESCE(organization_id::text,''), COALESCE(agent_id::text,''), COALESCE(household_id::text,''), member_id, visit_date, visit_type, COALESCE(vitals_logged,'{}'), COALESCE(symptoms,'[]'), COALESCE(notes,''), triage_escalated, COALESCE(triage_reason,''), created_at, updated_at
				FROM community_visits WHERE organization_id=$1::uuid ORDER BY visit_date DESC LIMIT $2`
		rows, err = r.db.QueryContext(ctx, qry, orgID, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.CommunityVisit, 0)
	for rows.Next() {
		var it model.CommunityVisit
		var memID sql.NullString
		var vRaw, sRaw []byte
		if err := rows.Scan(&it.ID, &it.OrganizationID, &it.AgentID, &it.HouseholdID, &memID, &it.VisitDate, &it.VisitType, &vRaw, &sRaw, &it.Notes, &it.TriageEscalated, &it.TriageReason, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		if memID.Valid {
			it.MemberID = &memID.String
		}
		if len(vRaw) > 0 {
			_ = json.Unmarshal(vRaw, &it.VitalsLogged)
		}
		if len(sRaw) > 0 {
			_ = json.Unmarshal(sRaw, &it.Symptoms)
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}
