class CreateFigmaKeyPairs < ActiveRecord::Migration[7.0]
  def change
    create_table :figma_key_pairs do |t|
      t.string :read_key, null: false, index: true
      t.string :write_key, null: false, index: true

      t.timestamps
    end
  end
end
