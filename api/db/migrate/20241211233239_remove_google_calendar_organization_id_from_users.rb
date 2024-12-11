class RemoveGoogleCalendarOrganizationIdFromUsers < ActiveRecord::Migration[7.2]
  def change
    remove_column :users, :google_calendar_organization_id, :bigint, unsigned: true
  end
end
