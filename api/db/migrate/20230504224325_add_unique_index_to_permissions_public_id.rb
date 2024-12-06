class AddUniqueIndexToPermissionsPublicId < ActiveRecord::Migration[7.0]
  def up
    change_column :permissions, :public_id, :string, limit: 12, null: false
    add_index :permissions, :public_id, unique: true
  end

  def down
    change_column :permissions, :public_id, :string, limit: 12, null: true
    remove_index :permissions, :public_id, if_exists: true
  end
end
