class CreateOrganizationFigmaTeams < ActiveRecord::Migration[7.0]
  def change
    create_table :organization_figma_teams, id: { type: :bigint, unsigned: true } do |t|
      t.bigint :organization_id, unsigned: true, null: false, index: true
      t.bigint :figma_team_id, unsigned: true, null: false, index: true

      t.timestamps
    end

    add_index :organization_figma_teams, %i[organization_id figma_team_id], unique: true, name: "idx_organization_figma_teams_on_organization_and_figma_team"
  end
end
