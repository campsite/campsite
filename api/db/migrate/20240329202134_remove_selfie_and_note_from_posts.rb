class RemoveSelfieAndNoteFromPosts < ActiveRecord::Migration[7.1]
  def change
    remove_column :posts, :selfie_file_path
    remove_column :posts, :selfie_file_type
    remove_column :posts, :note
  end
end
