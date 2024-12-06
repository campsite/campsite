class AddDurationToCallRecordings < ActiveRecord::Migration[7.1]
  def change
    add_column :call_recordings, :duration, :integer
  end
end
