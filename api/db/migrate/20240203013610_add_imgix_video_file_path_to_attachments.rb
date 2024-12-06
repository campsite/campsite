class AddImgixVideoFilePathToAttachments < ActiveRecord::Migration[7.1]
  def change
    add_column :attachments, :imgix_video_file_path, :text
  end
end
