class AddInviteTokenToProjects < ActiveRecord::Migration[7.2]
  def change
    add_column :projects, :invite_token, :string
    add_index :projects, :invite_token, unique: true
  end
end
