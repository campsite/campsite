class MakeFigmaTeamsOrganizationIdNullable < ActiveRecord::Migration[7.0]
  def up
    change_column :figma_teams, :organization_id, :bigint, unsigned: true, null: true
    remove_index :figma_teams, :remote_team_id
    add_index :figma_teams, :remote_team_id, unique: true
  end

  def down
    change_column :figma_teams, :organization_id, :bigint, unsigned: true, null: false
    remove_index :figma_teams, :remote_team_id, unique: true
    add_index :figma_teams, :remote_team_id
  end
end
