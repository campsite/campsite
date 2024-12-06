class AddResolveToPostComments < ActiveRecord::Migration[7.0]
  def change
    add_column :post_comments, :resolved_at, :datetime
    add_reference :post_comments, :resolved_by, references: :organization_memberships
  end
end
