class CreateFavorites < ActiveRecord::Migration[7.0]
  def change
    create_table :favorites, id: { type: :bigint, unsigned: true } do |t|
      t.string :public_id, limit: 12, null: false, index: { unique: true }
      t.references :favoritable, polymorphic: true, null: false, unsigned: true
      t.references :organization_membership, null: false, unsigned: true
      t.integer :position

      t.timestamps
    end
  end
end
