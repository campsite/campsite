class AddChatToPostColumns < ActiveRecord::Migration[7.1]
  def change
    add_column :posts, :from_message_id, :bigint, unsigned: true
    add_column :messages, :system_shared_post_id, :bigint, unsigned: true
  end
end
