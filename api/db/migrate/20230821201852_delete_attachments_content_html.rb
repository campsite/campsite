class DeleteAttachmentsContentHtml < ActiveRecord::Migration[7.0]
  def change
    remove_column :attachments, :content_html, :text
  end
end
