class DropFigmaTeamTables < ActiveRecord::Migration[7.1]
  def change
    drop_table :figma_teams, id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
      t.string "public_id", limit: 12, null: false
      t.string "remote_team_id", null: false
      t.string "name", null: false
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["public_id"], name: "index_figma_teams_on_public_id", unique: true
      t.index ["remote_team_id"], name: "index_figma_teams_on_remote_team_id", unique: true
    end

    drop_table :organization_figma_teams, id: { type: :bigint, unsigned: true }, charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
      t.bigint "organization_id", null: false, unsigned: true
      t.bigint "figma_team_id", null: false, unsigned: true
      t.datetime "created_at", null: false
      t.datetime "updated_at", null: false
      t.index ["figma_team_id"], name: "index_organization_figma_teams_on_figma_team_id"
      t.index ["organization_id", "figma_team_id"], name: "idx_organization_figma_teams_on_organization_and_figma_team", unique: true
      t.index ["organization_id"], name: "index_organization_figma_teams_on_organization_id"
    end
  end
end
