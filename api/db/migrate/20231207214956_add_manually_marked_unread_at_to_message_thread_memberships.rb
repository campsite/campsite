class AddManuallyMarkedUnreadAtToMessageThreadMemberships < ActiveRecord::Migration[7.1]
  def change
    add_column :message_thread_memberships, :manually_marked_unread_at, :datetime
    add_index :message_thread_memberships, :manually_marked_unread_at
  end
end
