class AddWidthHeightToPostFiles < ActiveRecord::Migration[7.0]
  def change
    add_column :post_files, :width, :integer
    add_column :post_files, :height, :integer
  end
end
