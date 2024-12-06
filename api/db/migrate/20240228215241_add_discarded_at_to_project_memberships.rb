class AddDiscardedAtToProjectMemberships < ActiveRecord::Migration[7.1]
  def change
    add_column :project_memberships, :discarded_at, :datetime
    add_index :project_memberships, :discarded_at
  end
end
