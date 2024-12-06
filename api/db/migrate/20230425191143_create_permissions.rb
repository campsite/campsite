class CreatePermissions < ActiveRecord::Migration[7.0]
  def change
    create_table :permissions do |t|
      t.references :user, null: false, unsigned: true
      t.references :subject, null: false, unsigned: true, polymorphic: true
      t.integer :action, null: false, unsigned: true
      t.timestamps
    end

    add_index :permissions, [:user_id, :subject_id, :subject_type, :action], unique: true, name: "index_permissions_on_user_subject_and_action"
  end
end
