class AddDisplayPreferencesToProject < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :display_reactions, :boolean, null: false, default: true
    add_column :projects, :display_attachments, :boolean, null: false, default: true
    add_column :projects, :display_comments, :boolean, null: false, default: true
  end
end
