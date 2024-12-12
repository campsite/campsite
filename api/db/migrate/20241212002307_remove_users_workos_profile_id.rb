class RemoveUsersWorkosProfileId < ActiveRecord::Migration[7.2]
  def change
    remove_column :users, :workos_profile_id, :string
  end
end
