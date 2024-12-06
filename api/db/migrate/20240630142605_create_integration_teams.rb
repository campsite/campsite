class CreateIntegrationTeams < ActiveRecord::Migration[7.1]
  def change
    create_table(:integration_teams, id: { type: :bigint, unsigned: true }) do |t|
      t.string :name, null: false
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :provider_team_id, null: false
      t.boolean :private, null: false, default: false
      t.references :integration, null: false, unsigned: true

      t.timestamps

      t.index [:integration_id, :provider_team_id], unique: true
      t.index :name
    end
  end
end
