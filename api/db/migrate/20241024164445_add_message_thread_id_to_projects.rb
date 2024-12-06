class AddMessageThreadIdToProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :message_thread_id, :bigint, unsigned: true
    add_index :projects, :message_thread_id
  end
end
