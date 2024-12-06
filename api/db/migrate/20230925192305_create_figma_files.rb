class CreateFigmaFiles < ActiveRecord::Migration[7.0]
  def change
    create_table :figma_files, id: { type: :bigint, unsigned: true } do |t|
      t.string :remote_file_key, null: false
      t.string :name, null: false

      t.timestamps

      t.index :remote_file_key, unique: true
    end
  end
end
