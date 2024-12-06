class AddCoverPhotoToUsers < ActiveRecord::Migration[7.0]
  def change
    add_column :users, :cover_photo_path, :string
  end
end
