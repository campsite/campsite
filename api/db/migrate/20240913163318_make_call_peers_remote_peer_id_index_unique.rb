class MakeCallPeersRemotePeerIdIndexUnique < ActiveRecord::Migration[7.2]
  def change
    remove_index :call_peers, :remote_peer_id
    add_index :call_peers, :remote_peer_id, unique: true
  end
end
