class CreateFigmaTeams < ActiveRecord::Migration[7.0]
  def change
    create_table :figma_teams, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.bigint :organization_id, unsigned: true, null: false, index: true
      t.string :remote_team_id, null: false, index: true
      t.string :name, null: false

      t.timestamps
    end
  end
end
