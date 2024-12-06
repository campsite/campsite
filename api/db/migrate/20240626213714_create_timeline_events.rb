class CreateTimelineEvents < ActiveRecord::Migration[7.1]
  def change
    create_table :timeline_events, id: { type: :bigint, unsigned: true } do |t|
      t.references :actor, polymorphic: true, null: false, unsigned: true
      t.references :subject, polymorphic: true, null: false, unsigned: true
      t.references :reference, polymorphic: true, null: true, unsigned: true
      t.integer :action, null: false
      t.json :metadata

      t.timestamps
    end
  end
end
