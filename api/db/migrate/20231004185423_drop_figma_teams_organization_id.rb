class DropFigmaTeamsOrganizationId < ActiveRecord::Migration[7.0]
  def change
    remove_column :figma_teams, :organization_id, :bigint, unsigned: true
  end
end
