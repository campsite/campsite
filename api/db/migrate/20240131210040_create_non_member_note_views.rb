class CreateNonMemberNoteViews < ActiveRecord::Migration[7.1]
  def change
    create_table :non_member_note_views, id: { type: :bigint, unsigned: true } do |t|
      t.references :note, unsigned: true, null: false
      t.references :user, unsigned: true, null: true
      t.string :anonymized_ip, null: false
      t.string :user_agent, null: true

      t.timestamps
    end

    add_index :non_member_note_views, [:note_id, :user_id]
    add_index :non_member_note_views, [:note_id, :anonymized_ip, :user_agent], name: "idx_non_member_note_views_on_note_ip_and_user_agent"
    add_column :notes, :non_member_views_count, :integer, null: false, default: 0
  end
end
