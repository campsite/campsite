class AddActiveMemberCountToOrganizations < ActiveRecord::Migration[7.0]
  def self.up
    add_column :organizations, :active_member_count, :integer, null: false, default: 0
  end

  def self.down
    remove_column :organizations, :active_member_count
  end
end
