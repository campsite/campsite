class AddResolveFilterPreferences < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :display_resolved, :boolean, null: false, default: true
    add_column :project_display_preferences, :display_resolved, :boolean, null: false, default: true
  end
end
