class AddLastViewedPostsAtToOrganizationMemberships < ActiveRecord::Migration[7.1]
  def change
    add_column :organization_memberships, :last_viewed_posts_at, :datetime
  end
end
