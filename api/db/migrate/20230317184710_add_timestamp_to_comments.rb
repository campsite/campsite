class AddTimestampToComments < ActiveRecord::Migration[7.0]
  def change
    add_column :post_comments, :timestamp, :integer
  end
end
