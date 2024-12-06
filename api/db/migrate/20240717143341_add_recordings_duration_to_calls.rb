class AddRecordingsDurationToCalls < ActiveRecord::Migration[7.1]
  def change
    add_column :calls, :recordings_duration, :integer, null: false, default: 0
  end
end
