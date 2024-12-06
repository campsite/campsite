class CreateOrganizationSettings < ActiveRecord::Migration[7.0]
  def change
    create_table :organization_settings, id: { type: :bigint, unsigned: true } do |t|
      t.string :key, null: false
      t.string :value, null: false
      t.references :organization, null: false, unsigned: true

      t.timestamps
    end

    add_index :organization_settings, [:organization_id, :key], unique: true
  end
end
