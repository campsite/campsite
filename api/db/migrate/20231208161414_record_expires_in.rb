class RecordExpiresIn < ActiveRecord::Migration[7.1]
  def change
    add_column :organization_membership_statuses, :expiration_setting, :string, null: false, default: "forever"
  end
end
