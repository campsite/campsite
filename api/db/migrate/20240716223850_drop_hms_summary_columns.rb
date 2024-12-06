class DropHmsSummaryColumns < ActiveRecord::Migration[7.1]
  def change
    remove_column :call_recordings, :summary_json_file_path, :text
    remove_column :call_recordings, :summary_json, :json
  end
end
