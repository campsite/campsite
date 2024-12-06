class AddIndexChatToPostColumns < ActiveRecord::Migration[7.1]
  def change
    add_index :posts, :from_message_id
    add_index :messages, :system_shared_post_id
  end
end
