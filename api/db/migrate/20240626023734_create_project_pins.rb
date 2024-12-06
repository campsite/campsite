class CreateProjectPins < ActiveRecord::Migration[7.1]
  def change
    create_table :project_pins, id: { type: :bigint, unsigned: true } do |t|
      t.references :project, null: false, unsigned: true, index: true
      t.references :organization_membership, null: false, unsigned: true, index: true
      t.references :subject, polymorphic: true, null: false, unsigned: true, index: true
      t.string :public_id, null: false, limit: 12
      t.integer :position, null: false, unsigned: true

      t.timestamps
    end

    add_index :project_pins, :public_id, unique: true
    add_index :project_pins, [:project_id, :subject_id, :subject_type], unique: true
  end
end
