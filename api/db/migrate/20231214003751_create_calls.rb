class CreateCalls < ActiveRecord::Migration[7.1]
  def change
    create_table :calls, id: { type: :bigint, unsigned: true } do |t|
      t.datetime :started_at, null: false
      t.datetime :stopped_at
      t.string :remote_session_id, index: true, null: false
      t.references :call_room, null: false, unsigned: true

      t.timestamps
    end
  end
end
