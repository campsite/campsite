class AddIndexesToProductLogs < ActiveRecord::Migration[7.1]
  def change
    add_index :product_logs, :name
    add_index :product_logs, :session_id
  end
end
