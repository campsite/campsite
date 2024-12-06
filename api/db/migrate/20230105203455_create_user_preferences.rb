class CreateUserPreferences < ActiveRecord::Migration[7.0]
  def change
    create_table :user_preferences do |t|
      t.integer :user_id, null: false
      t.string :key, null: false
      t.string :value, null: false

      t.timestamps
    end
    add_index :user_preferences, :user_id
    add_index :user_preferences, :key
  end
end
