class RemoveNotNullFromPostCommentsBody < ActiveRecord::Migration[7.0]
  def change
    change_column_null(:post_comments, :body, true)
  end
end
