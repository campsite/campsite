class AddSelfieToPost < ActiveRecord::Migration[7.0]
  def change
    add_column :posts, :selfie_file_path, :string
    add_column :posts, :selfie_file_type, :string
  end
end
