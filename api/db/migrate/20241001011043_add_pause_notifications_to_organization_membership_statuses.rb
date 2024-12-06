class AddPauseNotificationsToOrganizationMembershipStatuses < ActiveRecord::Migration[7.2]
  def change
    add_column :organization_membership_statuses, :pause_notifications, :boolean, default: false, null: false
  end
end
