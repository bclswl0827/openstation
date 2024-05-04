package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.
// Code generated by github.com/99designs/gqlgen version v0.17.45

import (
	"context"
	"fmt"

	"github.com/bclswl0827/openstation/graph/model"
)

// UpdateTle is the resolver for the UpdateTLE field.
func (r *mutationResolver) UpdateTle(ctx context.Context, satelliteName string, tleLine1 string, tleLine2 string) (*bool, error) {
	panic(fmt.Errorf("not implemented: UpdateTle - UpdateTLE"))
}

// QueryTle is the resolver for the QueryTLE field.
func (r *queryResolver) QueryTle(ctx context.Context, id int) (*model.TLEData, error) {
	panic(fmt.Errorf("not implemented: QueryTle - QueryTLE"))
}

// Mutation returns MutationResolver implementation.
func (r *Resolver) Mutation() MutationResolver { return &mutationResolver{r} }

// Query returns QueryResolver implementation.
func (r *Resolver) Query() QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
