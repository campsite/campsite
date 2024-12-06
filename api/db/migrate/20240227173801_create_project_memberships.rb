class CreateProjectMemberships < ActiveRecord::Migration[7.1]
  def change
    create_table :project_memberships, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.integer :position
      t.references :project, null: false, unsigned: true
      t.references :organization_membership, null: false, unsigned: true

      t.timestamps
    end
  end
end
