class AddTargetScopeToNotifications < ActiveRecord::Migration[7.0]
  def change
    add_column(:notifications, :target_scope, :integer)
    add_column(:post_feedback_requests, :discarded_at, :datetime)
    add_index(:post_feedback_requests, :discarded_at)
  end
end
