class AddIndexToCallsStartedAt < ActiveRecord::Migration[7.1]
  def change
    add_index :calls, :started_at
  end
end
