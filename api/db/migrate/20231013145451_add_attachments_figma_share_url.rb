class AddAttachmentsFigmaShareUrl < ActiveRecord::Migration[7.0]
  def change
    add_column :attachments, :figma_share_url, :text
  end
end
