class AddGoogleCalendarOrganizationIdToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :google_calendar_organization_id, :bigint, unsigned: true
    add_index :users, :google_calendar_organization_id
  end
end
