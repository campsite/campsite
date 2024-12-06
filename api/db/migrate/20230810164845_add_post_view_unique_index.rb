class AddPostViewUniqueIndex < ActiveRecord::Migration[7.0]
  def change
    add_index :post_views, [:post_id, :organization_membership_id], unique: true
  end
end
