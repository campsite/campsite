class DropPostComments < ActiveRecord::Migration[7.1]
  def change
    drop_table :post_comments
  end
end
