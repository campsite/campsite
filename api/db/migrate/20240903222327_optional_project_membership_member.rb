class OptionalProjectMembershipMember < ActiveRecord::Migration[7.2]
  def change
    change_column_null :project_memberships, :organization_membership_id, true
    add_reference :project_memberships, :oauth_application, type: :bigint, unsigned: true
    add_index :project_memberships, [:oauth_application_id, :project_id, :discarded_at]
  end
end
