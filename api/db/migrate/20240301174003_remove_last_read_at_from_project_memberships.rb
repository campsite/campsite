class RemoveLastReadAtFromProjectMemberships < ActiveRecord::Migration[7.1]
  def change
    remove_column :project_memberships, :last_read_at, :datetime
  end
end
