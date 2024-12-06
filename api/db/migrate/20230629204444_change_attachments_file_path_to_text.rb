class ChangeAttachmentsFilePathToText < ActiveRecord::Migration[7.0]
  def change
    change_column(:attachments, :file_path, :text)
  end
end
