class UpdatePermissionsIndex < ActiveRecord::Migration[7.0]
  def change
    remove_index :permissions, ["user_id", "subject_id", "subject_type", "action"], name: "index_permissions_on_user_subject_and_action", unique: true
    add_index :permissions, ["user_id", "subject_id", "subject_type", "action", "discarded_at"], name: "index_permissions_on_user_subject_action_and_discarded_at", unique: true
  end
end
