package model

import "time"

type CommunityArea struct {
	Base
	OrganizationID string `json:"organization_id"`
	Name           string `json:"name"`
	Description    string `json:"description"`
	RegionCode     string `json:"region_code"`
}

type HealthAgent struct {
	Base
	UserID         string         `json:"user_id"`
	OrganizationID string         `json:"organization_id"`
	AreaID         *string        `json:"area_id,omitempty"`
	IsActive       bool           `json:"is_active"`
	User           *User          `json:"user,omitempty"`
	Area           *CommunityArea `json:"area,omitempty"`
}

type Household struct {
	Base
	OrganizationID string         `json:"organization_id"`
	AreaID         *string        `json:"area_id,omitempty"`
	HeadName       string         `json:"head_name"`
	ContactNumber  string         `json:"contact_number"`
	Address        string         `json:"address"`
	GPSCoordinates map[string]any `json:"gps_coordinates"`
	RiskLevel      string         `json:"risk_level"`
	Area           *CommunityArea `json:"area,omitempty"`
	Members        []*HouseholdMember `json:"members,omitempty"`
}

type HouseholdMember struct {
	Base
	HouseholdID  string     `json:"household_id"`
	PatientID    *string    `json:"patient_id,omitempty"`
	FullName     string     `json:"full_name"`
	DateOfBirth  *time.Time `json:"date_of_birth,omitempty"`
	Gender       string     `json:"gender"`
	Relationship string     `json:"relationship"`
	IsPregnant   bool       `json:"is_pregnant"`
	HasChronic   bool       `json:"has_chronic"`
	RiskLevel    string     `json:"risk_level"`
}

type CommunityVisit struct {
	Base
	OrganizationID string         `json:"organization_id"`
	AgentID        string         `json:"agent_id"`
	HouseholdID    string         `json:"household_id"`
	MemberID       *string        `json:"member_id,omitempty"`
	VisitDate      time.Time      `json:"visit_date"`
	VisitType      string         `json:"visit_type"`
	VitalsLogged   map[string]any `json:"vitals_logged"`
	Symptoms       []string       `json:"symptoms"`
	Notes          string         `json:"notes"`
	TriageEscalated bool          `json:"triage_escalated"`
	TriageReason    string        `json:"triage_reason"`

	Agent     *HealthAgent     `json:"agent,omitempty"`
	Household *Household       `json:"household,omitempty"`
	Member    *HouseholdMember `json:"member,omitempty"`
}
