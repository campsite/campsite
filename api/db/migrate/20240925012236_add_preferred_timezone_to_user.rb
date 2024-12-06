class AddPreferredTimezoneToUser < ActiveRecord::Migration[7.2]
  def change
    add_column :users, :preferred_timezone, :string
  end
end
