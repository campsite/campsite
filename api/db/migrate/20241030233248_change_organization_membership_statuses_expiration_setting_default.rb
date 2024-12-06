class ChangeOrganizationMembershipStatusesExpirationSettingDefault < ActiveRecord::Migration[7.2]
  def up
    change_column :organization_membership_statuses, :expiration_setting, :string, default: "custom", null: false
  end

  def down
    change_column :organization_membership_statuses, :expiration_setting, :string, default: "forever", null: false
  end
end
