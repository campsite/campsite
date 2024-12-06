class AddUniqueIndexToCallsRemoteSessionId < ActiveRecord::Migration[7.1]
  def change
    remove_index :calls, :remote_session_id
    add_index :calls, :remote_session_id, unique: true
  end
end
