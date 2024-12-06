class AddNoVideoTrackToAttachment < ActiveRecord::Migration[7.1]
  def change
    add_column :attachments, :no_video_track, :boolean, default: false, null: false
  end
end
