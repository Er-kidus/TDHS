package service

import (
	"context"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
)

type CommunityService struct {
	repo *repository.Repository
}

func NewCommunityService(repo *repository.Repository) *CommunityService {
	return &CommunityService{repo: repo}
}

func (s *CommunityService) OrgCreateCommunityArea(ctx context.Context, orgID, name, desc, region string) (*model.CommunityArea, error) {
	return s.repo.OrgCreateCommunityArea(ctx, orgID, name, desc, region)
}

func (s *CommunityService) OrgListCommunityAreas(ctx context.Context, orgID string, limit int) ([]*model.CommunityArea, error) {
	return s.repo.OrgListCommunityAreas(ctx, orgID, limit)
}

func (s *CommunityService) OrgCreateHousehold(ctx context.Context, orgID string, params map[string]any) (*model.Household, error) {
	return s.repo.OrgCreateHousehold(ctx, orgID, params)
}

func (s *CommunityService) OrgListHouseholds(ctx context.Context, orgID string, areaID string, limit int) ([]*model.Household, error) {
	return s.repo.OrgListHouseholds(ctx, orgID, areaID, limit)
}

func (s *CommunityService) OrgAddHouseholdMember(ctx context.Context, hhID string, params map[string]any) (*model.HouseholdMember, error) {
	return s.repo.OrgAddHouseholdMember(ctx, hhID, params)
}

func (s *CommunityService) OrgListHouseholdMembers(ctx context.Context, hhID string) ([]*model.HouseholdMember, error) {
	return s.repo.OrgListHouseholdMembers(ctx, hhID)
}

func (s *CommunityService) OrgLogCommunityVisit(ctx context.Context, orgID, agentID string, params map[string]any) (*model.CommunityVisit, error) {
	return s.repo.OrgLogCommunityVisit(ctx, orgID, agentID, params)
}

func (s *CommunityService) OrgListCommunityVisits(ctx context.Context, orgID string, hhID string, limit int) ([]*model.CommunityVisit, error) {
	return s.repo.OrgListCommunityVisits(ctx, orgID, hhID, limit)
}
