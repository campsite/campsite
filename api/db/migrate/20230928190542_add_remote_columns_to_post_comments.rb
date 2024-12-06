class AddRemoteColumnsToPostComments < ActiveRecord::Migration[7.0]
  def change
    add_column :post_comments, :remote_comment_id, :string
    add_column :post_comments, :remote_comment_synced_at, :datetime
    add_column :post_comments, :remote_user_id, :string
    add_column :post_comments, :remote_user_name, :string
    add_column :post_comments, :remote_service, :integer
    add_column :post_comments, :origin, :integer, default: 0, null: false

    add_index :post_comments, [:remote_comment_id, :remote_service]
    add_index :post_comments, [:remote_user_id, :remote_service]
  end
end
