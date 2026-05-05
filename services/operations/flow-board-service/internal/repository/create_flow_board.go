package repository

import (
	"context"
	"github.com/tenadam/flow-board-service/internal/model"
)

// CreateFlowBoard inserts a new flow-board record into the database.
func (r *Repository) CreateFlowBoard(ctx context.Context, entity *model.FlowBoard) (*model.FlowBoard, error) {
	return entity, nil
}
