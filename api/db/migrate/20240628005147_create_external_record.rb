class CreateExternalRecord < ActiveRecord::Migration[7.1]
  def change
    create_table :external_records, id: { type: :bigint, unsigned: true } do |t|
      t.string :remote_record_id, null: false
      t.string :remote_record_title, null: false
      t.integer :service, null: false
      t.json :metadata
      
      t.timestamps

      t.index [:service, :remote_record_id], unique: true
    end
  end
end
