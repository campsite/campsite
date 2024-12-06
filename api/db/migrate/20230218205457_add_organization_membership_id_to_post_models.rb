class AddOrganizationMembershipIdToPostModels < ActiveRecord::Migration[7.0]
  def change
    add_reference :poll_votes, :organization_membership, type: :bigint, unsigned: true
    add_reference :post_comments, :organization_membership, type: :bigint, unsigned: true
    add_reference :post_reactions, :organization_membership, type: :bigint, unsigned: true
    add_reference :post_views, :organization_membership, type: :bigint, unsigned: true
    add_reference :posts, :organization_membership, type: :bigint, unsigned: true
    add_column    :project_memberships, :member_id, :bigint, unsigned: true
    add_index     :project_memberships, :member_id
    add_index     :project_memberships, [:remindable, :member_id]
    add_column    :projects, :member_id, :bigint, unsigned: true
    add_reference :reactions, :organization_membership, type: :bigint, unsigned: true
    add_index :reactions, [:subject_id, :subject_type, :organization_membership_id, :content], unique: true,
      name: :idx_reactions_on_subject_id_type_and_member_id_and_content
  end
end
