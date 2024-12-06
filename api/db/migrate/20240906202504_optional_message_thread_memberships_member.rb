class OptionalMessageThreadMembershipsMember < ActiveRecord::Migration[7.2]
  def change
    change_column_null :message_thread_memberships, :organization_membership_id, true
    add_reference :message_thread_memberships, :oauth_application, type: :bigint, unsigned: true
    add_index :message_thread_memberships, [:oauth_application_id, :message_thread_id]
  end
end
