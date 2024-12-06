class CreateProjectViews < ActiveRecord::Migration[7.1]
  def change
    create_table :project_views, id: { type: :bigint, unsigned: true } do |t|
      t.references :organization_membership, unsigned: true, null: false
      t.references :project, unsigned: true, null: false
      t.timestamp :last_viewed_at, null: false
      t.timestamps
      t.index [:organization_membership_id, :project_id], unique: true
    end
  end
end
