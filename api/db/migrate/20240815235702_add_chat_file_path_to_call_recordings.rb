class AddChatFilePathToCallRecordings < ActiveRecord::Migration[7.2]
  def change
    add_column :call_recordings, :chat_file_path, :text
  end
end
