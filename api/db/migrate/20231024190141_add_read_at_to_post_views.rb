class AddReadAtToPostViews < ActiveRecord::Migration[7.0]
  def change
    add_column :post_views, :read_at, :datetime

    add_index :post_views, :read_at
  end
end
