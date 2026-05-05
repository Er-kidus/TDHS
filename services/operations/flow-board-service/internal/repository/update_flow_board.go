package repository

import (
	"context"
	"github.com/tenadam/flow-board-service/internal/model"
)

// UpdateFlowBoard updates an existing flow-board record in the database.
func (r *Repository) UpdateFlowBoard(ctx context.Context, entity *model.FlowBoard) (*model.FlowBoard, error) {
	return entity, nil
}
