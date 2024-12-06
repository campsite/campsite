class ChangeTableIdsToBigintUnsigned < ActiveRecord::Migration[7.0]
  def change
    change_column :feedbacks, :id, :bigint, unsigned: true
    change_column :console1984_sessions, :id, :bigint, unsigned: true
    change_column :console1984_users, :id, :bigint, unsigned: true
    change_column :console1984_commands, :id, :bigint, unsigned: true
    change_column :console1984_sensitive_accesses, :id, :bigint, unsigned: true
    change_column :flipper_features, :id, :bigint, unsigned: true
    change_column :flipper_gates, :id, :bigint, unsigned: true
    change_column :user_preferences, :id, :bigint, unsigned: true
  end
end
