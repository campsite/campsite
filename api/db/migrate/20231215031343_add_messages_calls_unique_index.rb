class AddMessagesCallsUniqueIndex < ActiveRecord::Migration[7.1]
  def change
    add_index :messages, [:call_id, :message_thread_id], unique: true
  end
end
