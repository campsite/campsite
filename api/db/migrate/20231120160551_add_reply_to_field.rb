class AddReplyToField < ActiveRecord::Migration[7.1]
  def change
    add_column :messages, :reply_to_id, :bigint
  end
end
