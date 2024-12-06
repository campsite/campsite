class AddPostCountToColumn < ActiveRecord::Migration[7.0]
  def change
    add_column :organization_memberships, :posts_count, :integer, null: false, default: 0
    add_column :projects, :posts_count, :integer, null: false, default: 0
    add_column :tags, :posts_count, :integer, null: false, default: 0
  end
end
