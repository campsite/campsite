class AddIndexToProductLogs < ActiveRecord::Migration[7.1]
  def change
    add_index :product_logs, [:subject_id, :subject_type, :log_ts, :name]
  end
end
