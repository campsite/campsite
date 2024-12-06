class AddVideoPreviewToPostFiles < ActiveRecord::Migration[7.0]
  def change
    add_column :post_files, :preview_file_path, :string, index: false
  end
end
