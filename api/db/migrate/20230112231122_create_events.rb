class CreateEvents < ActiveRecord::Migration[7.0]
  def change
    create_table :events, id: { type: :bigint, unsigned: true }  do |t|
      t.references :actor, polymorphic: true, null: false, unsigned: true
      t.references :subject, polymorphic: true, null: false, unsigned: true
      t.references :organization, null: false, unsigned: true
      t.integer :action, null: false

      t.timestamps
    end
  end
end
