class AddParentIdToExternalRecords < ActiveRecord::Migration[7.1]
  def change
    add_column :external_records, :parent_id, :bigint, unsigned: true, null: true
    add_index :external_records, :parent_id
  end
end
