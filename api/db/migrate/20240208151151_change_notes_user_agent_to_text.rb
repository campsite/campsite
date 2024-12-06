class ChangeNotesUserAgentToText < ActiveRecord::Migration[7.1]
  def up
    remove_index :non_member_note_views, name: "idx_non_member_note_views_on_note_ip_and_user_agent"
    change_column :non_member_note_views, :user_agent, :text, null: true
    add_index :non_member_note_views, [:note_id, :anonymized_ip, :user_agent], name: "idx_non_member_note_views_on_note_ip_and_user_agent", length: { user_agent: 320 }
  end

  def down
    remove_index :non_member_note_views, name: "idx_non_member_note_views_on_note_ip_and_user_agent"
    change_column :non_member_note_views, :user_agent, :string, null: true
    add_index :non_member_note_views, [:note_id, :anonymized_ip, :user_agent], name: "idx_non_member_note_views_on_note_ip_and_user_agent"
  end
end
