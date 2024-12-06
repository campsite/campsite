class IndexStatusMessages < ActiveRecord::Migration[7.1]
  def change
    add_index :organization_membership_statuses, [:organization_membership_id, :message]
  end
end
