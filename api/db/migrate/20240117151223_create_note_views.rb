class CreateNoteViews < ActiveRecord::Migration[7.1]
  def change
    create_table :note_views, id: { type: :bigint, unsigned: true } do |t|
      t.references :note, null: false, unsigned: true, index: true
      t.references :organization_membership, null: false, unsigned: true, index: true

      t.timestamps
    end

    add_index :note_views, [:note_id, :organization_membership_id], unique: true
  end
end
