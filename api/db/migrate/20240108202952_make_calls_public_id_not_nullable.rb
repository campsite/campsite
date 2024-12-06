class MakeCallsPublicIdNotNullable < ActiveRecord::Migration[7.1]
  def up
    change_column :calls, :public_id, :string, limit: 12, null: false
  end

  def down
    change_column :calls, :public_id, :string, limit: 12, null: true
  end
end
