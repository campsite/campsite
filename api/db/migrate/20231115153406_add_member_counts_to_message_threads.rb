class AddMemberCountsToMessageThreads < ActiveRecord::Migration[7.1]
  def change
    add_column :message_threads, :members_count, :integer, null: false, default: 0
  end
end
