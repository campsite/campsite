class AddCoverPhotoPathToProjects < ActiveRecord::Migration[7.0]
  def change
    add_column :projects, :cover_photo_path, :string, index: false
  end
end
