class AddPublicIdToCalls < ActiveRecord::Migration[7.1]
  def change
    add_column :calls, :public_id, :string, limit: 12
    add_index :calls, :public_id, unique: true
  end
end
