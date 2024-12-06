class AddIndexOnProductLogsSubjectIdSubjectTypeLogTs < ActiveRecord::Migration[7.1]
  def change
    add_index :product_logs, [:subject_id, :subject_type, :log_ts]
    add_index :comments, [:organization_membership_id, :discarded_at]
  end
end
