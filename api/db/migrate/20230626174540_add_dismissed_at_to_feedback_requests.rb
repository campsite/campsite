class AddDismissedAtToFeedbackRequests < ActiveRecord::Migration[7.0]
  def change
    add_column :post_feedback_requests, :dismissed_at, :datetime
    add_index :post_feedback_requests, :dismissed_at
  end
end
