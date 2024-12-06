class CreateCallRecordingChatLinks < ActiveRecord::Migration[7.2]
  def change
    create_table :call_recording_chat_links, id: { type: :bigint, unsigned: true } do |t|
      t.references :call_recording, null: false, unsigned: true
      t.text :url, null: false
      t.string :sender_remote_peer_id, null: false
      t.string :sender_name, null: false
      t.datetime :sent_at, null: false
      t.text :message, null: false
      t.string :remote_message_id, null: false

      t.timestamps
    end
  end
end
