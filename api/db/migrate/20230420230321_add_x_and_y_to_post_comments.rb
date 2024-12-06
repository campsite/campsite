class AddXAndYToPostComments < ActiveRecord::Migration[7.0]
  def change
    add_column :post_comments, :x, :integer
    add_column :post_comments, :y, :integer
  end
end
