class AddDefaultValueToCallRecordingSummarySectionStatus < ActiveRecord::Migration[7.1]
  def change
    change_column_default :call_recording_summary_sections, :status, from: nil, to: 0
  end
end
