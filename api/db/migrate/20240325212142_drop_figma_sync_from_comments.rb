class DropFigmaSyncFromComments < ActiveRecord::Migration[7.1]
  def change
    remove_column :comments, :remote_comment_id
    remove_column :comments, :remote_comment_synced_at
    remove_column :comments, :remote_user_id
    remove_column :comments, :remote_user_name
    remove_column :comments, :remote_service
    remove_column :comments, :origin
  end
end
