class AddGalleryIdToAttachments < ActiveRecord::Migration[7.1]
  def change
    add_column :attachments, :gallery_id, :string
  end
end
