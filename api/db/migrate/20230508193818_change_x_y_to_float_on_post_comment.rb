class ChangeXYToFloatOnPostComment < ActiveRecord::Migration[7.0]
  def up
    change_column :post_comments, :x, :float
    change_column :post_comments, :y, :float
  end

  def down
    change_column :post_comments, :x, :integer
    change_column :post_comments, :y, :integer
  end
end
