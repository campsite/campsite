class AddStaffToUser < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :staff, :boolean, default: false, null: false
  end
end
