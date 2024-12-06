class AddCascadeToUserSubscriptions < ActiveRecord::Migration[7.2]
  def change
    add_column :user_subscriptions, :cascade, :boolean, default: false, null: false
  end
end
