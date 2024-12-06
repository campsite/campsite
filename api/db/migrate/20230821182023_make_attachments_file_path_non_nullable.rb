class MakeAttachmentsFilePathNonNullable < ActiveRecord::Migration[7.0]
  def up
    change_column :attachments, :file_path, :text, null: false
  end

  def down
    change_column :attachments, :file_path, :text, null: true
  end
end
