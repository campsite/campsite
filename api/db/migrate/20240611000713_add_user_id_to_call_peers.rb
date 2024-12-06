class AddUserIdToCallPeers < ActiveRecord::Migration[7.1]
  def change
    add_column :call_peers, :user_id, :bigint, unsigned: true
    add_index :call_peers, :user_id
  end
end
