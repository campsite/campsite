class DropPreviousBodyFromPostComments < ActiveRecord::Migration[7.1]
  def change
    remove_column :post_comments, :previous_body, :text
  end
end
