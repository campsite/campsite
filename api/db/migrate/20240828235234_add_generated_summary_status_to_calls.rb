class AddGeneratedSummaryStatusToCalls < ActiveRecord::Migration[7.2]
  def change
    add_column :calls, :generated_summary_status, :integer, default: 0, null: false
    Call.update_all(generated_summary_status: 1) if Rails.env.development? && !ENV['ENABLE_PSDB']
  end
end
