class AddCallIndexIndexes < ActiveRecord::Migration[7.1]
  def change
    add_index :call_peers, [:call_id, :organization_membership_id]
  end
end
