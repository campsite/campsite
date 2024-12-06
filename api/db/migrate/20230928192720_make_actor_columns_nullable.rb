class MakeActorColumnsNullable < ActiveRecord::Migration[7.0]
  def up
    change_column :events, :actor_id, :bigint, null: true, unsigned: true
    change_column :events, :actor_type, :string, null: true
  end

  def down
    change_column :events, :actor_id, :bigint, null: false, unsigned: true
    change_column :events, :actor_type, :string, null: false
  end
end
