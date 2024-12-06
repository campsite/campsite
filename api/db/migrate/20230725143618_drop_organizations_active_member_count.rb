class DropOrganizationsActiveMemberCount < ActiveRecord::Migration[7.0]
  def change
    remove_column :organizations, :active_member_count, :integer, default: 0, null: false
  end
end
