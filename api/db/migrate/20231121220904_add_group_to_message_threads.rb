class AddGroupToMessageThreads < ActiveRecord::Migration[7.1]
  def change
    add_column :message_threads, :group, :boolean, default: false, null: false
  end
end
