class AddOrganizationIdToFeedbacks < ActiveRecord::Migration[7.0]
  def change
    add_column :feedbacks, :organization_id, :bigint, unsigned: true, null: true
    add_index :feedbacks, :organization_id
  end
end
