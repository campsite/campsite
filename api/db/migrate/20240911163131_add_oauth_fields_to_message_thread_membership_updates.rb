class AddOauthFieldsToMessageThreadMembershipUpdates < ActiveRecord::Migration[7.2]
  def change
    add_column :message_thread_membership_updates, :added_oauth_application_ids, :json, null: true
    add_column :message_thread_membership_updates, :removed_oauth_application_ids, :json, null: true
  end
end
