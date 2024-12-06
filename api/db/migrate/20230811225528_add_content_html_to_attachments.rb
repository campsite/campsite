class AddContentHtmlToAttachments < ActiveRecord::Migration[7.0]
  def up
    add_column :attachments, :content_html, :text
    change_column :attachments, :file_path, :text, null: true
  end

  def down
    remove_column :attachments, :content_html
    change_column :attachments, :file_path, :text, null: false
  end
end
