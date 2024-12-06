class CreateProductLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :product_logs, id: { type: :bigint, unsigned: true } do |t|
      t.references :subject, polymorphic: true, unsigned: true
      t.datetime :log_ts, null: false
      t.string :name, null: false
      t.json :data
      t.string :session_id

      t.timestamps
    end

    add_index :product_logs, [:subject_type, :subject_id, :name]
  end
end
