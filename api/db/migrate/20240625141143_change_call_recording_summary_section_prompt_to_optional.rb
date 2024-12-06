class ChangeCallRecordingSummarySectionPromptToOptional < ActiveRecord::Migration[7.1]
  def change
    change_column_null :call_recording_summary_sections, :prompt, true
  end
end
