class CreateCallPeers < ActiveRecord::Migration[7.1]
  def change
    create_table :call_peers, id: { type: :bigint, unsigned: true } do |t|
      t.references :call, null: false, unsigned: true
      t.references :organization_membership, null: false, unsigned: true
      t.datetime :joined_at, index: true, null: false
      t.datetime :left_at, index: true
      t.string :remote_peer_id, index: true, null: false

      t.timestamps
    end
  end
end
