class MakeCallPeersOrganizationMembershipIdNullable < ActiveRecord::Migration[7.1]
  def up
    add_column :call_peers, :name, :string
    change_column :call_peers, :organization_membership_id, :bigint, unsigned: true, null: true
  end

  def down
    remove_column :call_peers, :name, :string
    change_column :call_peers, :organization_membership_id, :bigint, unsigned: true, null: false
  end
end
