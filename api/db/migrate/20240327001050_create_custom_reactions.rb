class CreateCustomReactions < ActiveRecord::Migration[7.1]
  def change
    create_table :custom_reactions, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.string :name, null: false
      t.text :file_path, null: false
      t.string :file_type, null: false
      t.references :organization, null: false, unsigned: true
      t.references :organization_membership, unsigned: true, null: false

      t.timestamps
    end

    add_index :custom_reactions, [:organization_id, :name], unique: true
  end
end
