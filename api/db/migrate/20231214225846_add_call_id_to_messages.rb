class AddCallIdToMessages < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :call_id, :bigint, unsigned: true
    add_index :messages, :call_id
  end
end
