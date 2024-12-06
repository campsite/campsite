class MakeMessagesSenderIdNullable < ActiveRecord::Migration[7.1]
  def up
    change_column :messages, :sender_id, :bigint, unsigned: true, null: true
  end

  def down
    change_column :messages, :sender_id, :bigint, unsigned: true, null: false
  end
end
