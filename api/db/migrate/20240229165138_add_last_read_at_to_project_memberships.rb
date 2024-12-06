class AddLastReadAtToProjectMemberships < ActiveRecord::Migration[7.1]
  def change
    add_column :project_memberships, :last_read_at, :datetime
  end
end
