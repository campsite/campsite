class CreateProjectDisplayPreferences < ActiveRecord::Migration[7.2]
  def change
    create_table :project_display_preferences, id: { type: :bigint, unsigned: true } do |t|
      t.references :project, unsigned: true, null: false, index: true
      t.references :organization_membership, unsigned: true, null: false, index: true
      t.boolean :display_reactions, null: false, default: true
      t.boolean :display_attachments, null: false, default: true
      t.boolean :display_comments, null: false, default: true
      t.timestamps
    end

    add_index :project_display_preferences, [:project_id, :organization_membership_id], unique: true
  end
end
